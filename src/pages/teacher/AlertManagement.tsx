import React, { useState, useEffect } from 'react';
import { Form, Select, Table, Spin, message } from 'antd';
import { studentManagementApi, rankingApi, violationApi, classApi } from '../../services/api';
import { Student, ExamRanking, Violation, Alert } from '../../types';

const { Option } = Select;

const AlertManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rankings, setRankings] = useState<ExamRanking[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 获取学生信息
  const fetchStudents = async () => {
    try {
      const response = await studentManagementApi.getAll();
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      message.error('获取学生信息失败');
    }
  };

  // 获取考试排名
  const fetchRankings = async () => {
    try {
      const response = await rankingApi.getAll();
      if (response.success) {
        setRankings(response.data);
      }
    } catch (error) {
      message.error('获取考试排名失败');
    }
  };

  // 获取违规记录
  const fetchViolations = async () => {
    try {
      const response = await violationApi.getAll();
      if (response.success) {
        setViolations(response.data);
      }
    } catch (error) {
      message.error('获取违规记录失败');
    }
  };

  // 获取班级列表
  const fetchClasses = async () => {
    try {
      const response = await classApi.getAll();
      if (response.success) {
        // 提取班级名称数组
        setClasses(response.data.map(cls => cls.name));
      }
    } catch (error) {
      message.error('获取班级列表失败');
    }
  };

  // 计算连续退步预警
  const calculateContinuousDeclining = (studentId: string): boolean => {
    const studentRankings = rankings
      .filter(r => r.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // 按时间降序排序（最新的在前）
    
    console.log(`学生 ${studentId} 的排名数据:`, studentRankings.map(r => ({exam: r.examName, ranking: r.ranking, date: r.createdAt})));
    
    if (studentRankings.length >= 3) {
      const latestThree = studentRankings.slice(0, 3); // 取前三个（最新的三次考试）
      console.log(`最近三次考试:`, latestThree.map(r => ({exam: r.examName, ranking: r.ranking})));
      
      // 排名数值越大表示成绩越差，连续退步应该是排名数值连续增大
      // 检查：最新排名 > 上一次排名 > 上上次排名
      const result = latestThree[0].ranking > latestThree[1].ranking && latestThree[1].ranking > latestThree[2].ranking;
      console.log(`连续退步检测结果: ${result}`);
      return result;
    }
    console.log(`学生 ${studentId} 的考试次数不足3次，无法检测连续退步`);
    return false;
  };

  // 计算累计违规预警
  const calculateMultipleViolations = (studentId: string): boolean => {
    const studentViolations = violations.filter(v => v.studentId === studentId);
    return studentViolations.length >= 2;
  };

  // 计算一次退步+一次违规预警
  const calculateDecliningAndViolation = (studentId: string): boolean => {
    const studentRankings = rankings
      .filter(r => r.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // 按时间降序排序（最新的在前）
    
    // 排名数值越大表示成绩越差，一次退步应该是最新排名比上一次排名数值大
    const hasDecline = studentRankings.length >= 2 && 
      studentRankings[0].ranking > studentRankings[1].ranking;
    
    const hasViolation = violations.some(v => v.studentId === studentId);
    
    return hasDecline && hasViolation;
  };

  // 生成预警信息
  const generateAlerts = () => {
    const generatedAlerts: Alert[] = [];
    let alertId = 1;

    console.log('开始生成预警信息...');
    console.log('学生数量:', students.length);
    console.log('排名数据数量:', rankings.length);
    console.log('违规记录数量:', violations.length);

    students.forEach(student => {
      const studentId = student.id;
      
      console.log(`检查学生 ${student.name} (ID: ${studentId}) 的预警条件:`);
      
      // 连续退步预警
      const continuousDeclining = calculateContinuousDeclining(studentId);
      console.log(`  - 连续退步: ${continuousDeclining}`);
      
      if (continuousDeclining) {
        generatedAlerts.push({
          id: `alert-${alertId++}`,
          studentId,
          type: 'continuous_declining',
          typeText: '连续退步',
          reason: '最近三次考试排名依次退步',
          createdAt: new Date().toISOString()
        });
      }
      
      // 累计违规预警
      const multipleViolations = calculateMultipleViolations(studentId);
      console.log(`  - 累计违规2次以上: ${multipleViolations}`);
      
      if (multipleViolations) {
        generatedAlerts.push({
          id: `alert-${alertId++}`,
          studentId,
          type: 'multiple_violations',
          typeText: '累计违规2次以上',
          reason: `累计违规${violations.filter(v => v.studentId === studentId).length}次`,
          createdAt: new Date().toISOString()
        });
      }
      
      // 一次退步+一次违规预警
      const decliningAndViolation = calculateDecliningAndViolation(studentId);
      console.log(`  - 一次退步+一次违规: ${decliningAndViolation}`);
      
      if (decliningAndViolation) {
        generatedAlerts.push({
          id: `alert-${alertId++}`,
          studentId,
          type: 'declining_and_violation',
          typeText: '一次退步+一次违规',
          reason: '存在排名退步且存在违规记录',
          createdAt: new Date().toISOString()
        });
      }
    });

    console.log('生成的预警信息数量:', generatedAlerts.length);
    console.log('预警信息:', generatedAlerts);

    return generatedAlerts;
  };

  // 初始加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('开始加载数据...');
        await Promise.all([
          fetchStudents(),
          fetchRankings(),
          fetchViolations(),
          fetchClasses()
        ]);
      } catch (error) {
        message.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 当数据加载完成后生成预警信息
  useEffect(() => {
    if (students.length > 0 && rankings.length > 0 && violations.length > 0) {
      console.log('数据加载完成，开始生成预警信息:');
      console.log('学生数据:', students);
      console.log('排名数据:', rankings);
      console.log('违规数据:', violations);
      
      const generatedAlerts = generateAlerts();
      console.log('生成的预警信息:', generatedAlerts);
      setAlerts(generatedAlerts);
    }
  }, [students, rankings, violations]);

  // 根据学生ID获取学生信息
  const getStudentInfo = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  // 处理筛选
  const handleFilter = (values: any) => {
    const { alertType, class: selectedClass } = values;
    
    let filtered = [...alerts];
    
    // 按预警类型筛选
    if (alertType) {
      filtered = filtered.filter(a => a.type === alertType);
    }
    
    // 按班级筛选
    if (selectedClass) {
      filtered = filtered.filter(a => {
        const student = getStudentInfo(a.studentId);
        return student && student.class === selectedClass;
      });
    }
    
    setAlerts(filtered);
  };

  // 重置筛选
  const handleReset = async () => {
    form.resetFields();
    // 重新生成预警信息
    const generatedAlerts = generateAlerts();
    setAlerts(generatedAlerts);
  };

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 80
    },
    {
      title: '学生姓名',
      dataIndex: 'studentId',
      key: 'studentName',
      render: (studentId: string) => {
        const student = getStudentInfo(studentId);
        return student ? student.name : '-';
      },
      width: 120
    },
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (studentId: string) => {
        const student = getStudentInfo(studentId);
        return student ? student.studentId : '-';
      },
      width: 120
    },
    {
      title: '班级',
      dataIndex: 'studentId',
      key: 'class',
      render: (studentId: string) => {
        const student = getStudentInfo(studentId);
        return student ? student.class : '-';
      },
      width: 120
    },
    {
      title: '预警类型',
      dataIndex: 'typeText',
      key: 'typeText',
      width: 150
    },
    {
      title: '预警原因',
      dataIndex: 'reason',
      key: 'reason'
    },
    {
      title: '生成时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => {
        return new Date(date).toLocaleString();
      },
      width: 150
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>学生预警信息管理</h1>
      
      {/* 筛选表单 */}
      <Form
        form={form}
        layout="inline"
        onFinish={handleFilter}
        style={{ marginBottom: '20px' }}
      >
        <Form.Item
          name="alertType"
          label="预警类型"
        >
          <Select placeholder="选择预警类型" style={{ width: 150 }} allowClear>
            <Option value="continuous_declining">连续退步</Option>
            <Option value="multiple_violations">累计违规2次以上</Option>
            <Option value="declining_and_violation">一次退步+一次违规</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="class"
          label="班级"
        >
          <Select placeholder="选择班级" style={{ width: 150 }} allowClear>
            {classes.map((cls) => (
              <Option key={cls} value={cls}>{cls}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item>
          <button type="submit" style={{ marginRight: '8px', padding: '0 16px', height: '32px', borderRadius: '4px', border: '1px solid #1890ff', backgroundColor: '#1890ff', color: 'white', cursor: 'pointer' }}>
            筛选
          </button>
          <button type="button" onClick={handleReset} style={{ padding: '0 16px', height: '32px', borderRadius: '4px', border: '1px solid #d9d9d9', backgroundColor: 'white', color: '#333', cursor: 'pointer' }}>
            重置
          </button>
        </Form.Item>
      </Form>
      
      {/* 预警信息列表 */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={alerts.map((alert, index) => ({
            ...alert,
            key: alert.id,
            index
          }))}
          pagination={false}
          rowKey="id"
          locale={{
            emptyText: '暂无预警信息'
          }}
        />
      </Spin>
    </div>
  );
};

export default AlertManagement;
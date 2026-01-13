import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Table, Spin, message } from 'antd';
import { violationApi, studentManagementApi, classApi } from '../../services/api';
import { Violation, Student } from '../../types';

const { Option } = Select;

const ViolationManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [violationTypes, setViolationTypes] = useState<string[]>([]);

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

  // 获取违规记录
  const fetchViolations = async () => {
    try {
      setLoading(true);
      const response = await violationApi.getAll();
      if (response.success) {
        // 按时间倒序排序
        const sortedViolations = response.data.sort((a, b) => 
          new Date(b.violationDate).getTime() - new Date(a.violationDate).getTime()
        );
        setViolations(sortedViolations);
        
        // 提取违规类型
        const types = [...new Set(sortedViolations.map(v => v.type))];
        setViolationTypes(types);
      }
    } catch (error) {
      message.error('获取违规记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchStudents(),
        fetchClasses(),
        fetchViolations()
      ]);
    };
    loadData();
  }, []);

  // 根据学生ID获取学生信息
  const getStudentInfo = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  // 处理筛选
  const handleFilter = (values: any) => {
    const { searchText, class: selectedClass, violationType } = values;
    
    let filtered = [...violations];
    
    // 按学生姓名或学号筛选
    if (searchText) {
      filtered = filtered.filter(v => {
        const student = getStudentInfo(v.studentId);
        if (student) {
          return student.name.includes(searchText) || student.studentId.includes(searchText);
        }
        return false;
      });
    }
    
    // 按班级筛选
    if (selectedClass) {
      filtered = filtered.filter(v => {
        const student = getStudentInfo(v.studentId);
        return student && student.class === selectedClass;
      });
    }
    
    // 按违规类型筛选（支持模糊匹配）
    if (violationType) {
      filtered = filtered.filter(v => v.type.includes(violationType));
    }
    
    setViolations(filtered);
  };

  // 重置筛选
  const handleReset = async () => {
    form.resetFields();
    await fetchViolations();
  };

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1,
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
      title: '违规类型',
      dataIndex: 'type',
      key: 'type',
      width: 150
    },
    {
      title: '违规日期',
      dataIndex: 'violationDate',
      key: 'violationDate',
      render: (date: string) => {
        return new Date(date).toLocaleDateString();
      },
      width: 120
    },
    {
      title: '记录时间',
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
      <h1 style={{ marginBottom: '20px' }}>学生违规情况管理</h1>
      
      {/* 筛选表单 */}
      <Form
        form={form}
        layout="inline"
        onFinish={handleFilter}
        style={{ marginBottom: '20px' }}
      >
        <Form.Item
          name="searchText"
          label="搜索"
        >
          <Input placeholder="学生姓名/学号" style={{ width: 200 }} />
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
        
        <Form.Item
          name="violationType"
          label="违规类型"
        >
          <Select placeholder="选择违规类型" style={{ width: 150 }} allowClear>
            {violationTypes.map((type) => (
              <Option key={type} value={type}>{type}</Option>
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
      
      {/* 违规记录列表 */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={violations.map((violation, index) => ({
            ...violation,
            key: violation.id,
            index
          }))}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50']
          }}
          rowKey="id"
        />
      </Spin>
    </div>
  );
};

export default ViolationManagement;
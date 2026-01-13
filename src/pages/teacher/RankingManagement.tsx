import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Upload, 
  message, 
  Spin, 
  Typography, 
  Alert,
  Space,
  Tag,
  Select,
  Input,
  Row,
  Col,
  Divider,
  Modal,
  Form
} from 'antd';
import { 
  UploadOutlined, 
  DownloadOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  MinusOutlined 
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { rankingApi, studentManagementApi } from '../../services/api';
import { ExamRanking, Student } from '../../types';

const { Title, Text } = Typography;

const RankingManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [rankings, setRankings] = useState<ExamRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选状态
  const [filters, setFilters] = useState({
    examName: 'all',
    className: 'all',
    progress: 'all',
    topTen: false
  });
  
  // Excel导入状态
  const [importState, setImportState] = useState({
    showImportModal: false,
    examName: '',
    className: '',
    fullData: [], // 保存完整解析数据
    previewData: [],
    importError: ''
  });
  
  // 批量操作状态
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  // 获取学生和排名数据
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, rankingsRes] = await Promise.all([
        studentManagementApi.getAll(),
        rankingApi.getAll()
      ]);
      
      if (studentsRes.success && rankingsRes.success) {
        setStudents(studentsRes.data);
        setRankings(rankingsRes.data);
      } else {
        setError('获取数据失败');
      }
    } catch (err) {
      setError('获取数据时发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 处理Excel文件导入
  const handleImport = async (file: File) => {
    setImportLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // 预览数据（只显示前5条）
          const previewData = jsonData.slice(0, 5);
          
          // 显示导入模态框
          setImportState({
            showImportModal: true,
            examName: '',
            className: '',
            fullData: jsonData, // 保存完整解析数据
            previewData,
            importError: ''
          });
          
        } catch (err) {
          setError('Excel解析失败: ' + (err instanceof Error ? err.message : String(err)));
          message.error('Excel解析失败');
        } finally {
          setImportLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setError('导入失败: ' + (err instanceof Error ? err.message : String(err)));
      message.error('导入失败');
      setImportLoading(false);
    }
  };

  // 确认导入
  const confirmImport = async () => {
    if (!importState.examName) {
      setImportState(prev => ({
        ...prev,
        importError: '请输入考试名称'
      }));
      return;
    }
    
    if (!importState.className) {
      setImportState(prev => ({
        ...prev,
        importError: '请输入班级'
      }));
      return;
    }
    
    if (importState.fullData.length === 0) {
      setImportState(prev => ({
        ...prev,
        importError: '没有可导入的数据'
      }));
      return;
    }
    
    setImportLoading(true);
    try {
      // 处理导入数据，根据学生班级和姓名查找对应的学生ID
      let ignoredCount = 0;
      const processedData = importState.fullData
        .map((item: any) => {
          // 查找对应的学生 - 匹配班级和姓名
          const student = students.find(s => 
            s.class === importState.className && 
            s.name === String(item.name || item.姓名 || item['student_name'] || item['学生姓名'])
          );
          
          if (!student) {
            ignoredCount++;
            return null;
          }
          
          return {
            studentId: student.id,
            examName: importState.examName,
            ranking: parseInt(item.ranking || item.排名 || item['rank'] || item['学生排名'], 10)
          };
        })
        .filter((item): item is ExamRanking => item !== null);
      
      // 调用后端API批量导入
      const response = await rankingApi.batchCreate(processedData);
      
      if (response.success) {
        let successMessage = `导入成功，共导入 ${response.data.totalImported} 条记录`;
        if (ignoredCount > 0) {
          successMessage += `，忽略了 ${ignoredCount} 条不存在的学生记录`;
        }
        message.success(successMessage);
        setImportState(prev => ({
          ...prev,
          showImportModal: false
        }));
        // 重新获取数据
        fetchData();
      } else {
        setImportState(prev => ({
          ...prev,
          importError: '导入失败: ' + response.message
        }));
      }
    } catch (err) {
      setImportState(prev => ({
        ...prev,
        importError: '导入失败: ' + (err instanceof Error ? err.message : String(err))
      }));
    } finally {
      setImportLoading(false);
    }
  };

  // 获取所有考试名称
  const getExamNames = () => {
    const examNames = new Set(rankings.map(r => r.examName));
    return Array.from(examNames).sort((a, b) => {
      // 按考试时间排序（假设考试名称包含时间信息）
      return a.localeCompare(b);
    });
  };

  // 获取所有班级名称
  const getClassNames = () => {
    const classNames = new Set(students.map(s => s.class));
    return Array.from(classNames).sort();
  };

  // 处理筛选条件变化
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 计算排名进步情况
  const calculateProgress = (studentId: string) => {
    const studentRankings = rankings
      .filter(r => r.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (studentRankings.length < 2) {
      return { status: 'insufficient', message: '数据不足' };
    }
    
    const latestRanking = studentRankings[0];
    const previousRanking = studentRankings[1];
    const progress = previousRanking.ranking - latestRanking.ranking;
    
    if (progress > 0) {
      return { status: 'improved', message: `进步 ${progress} 名`, value: progress };
    } else if (progress < 0) {
      return { status: 'declined', message: `退步 ${Math.abs(progress)} 名`, value: progress };
    } else {
      return { status: 'stable', message: '保持不变', value: 0 };
    }
  };

  // 获取学生在特定考试中的排名
  const getStudentRanking = (studentId: string, examName: string) => {
    const ranking = rankings.find(r => r.studentId === studentId && r.examName === examName);
    return ranking ? ranking.ranking : '-';
  };

  // 生成表格列
  const generateColumns = () => {
    const examNames = getExamNames();
    
    const columns = [
      {
        title: '班级',
        dataIndex: 'class',
        key: 'class',
        width: 100
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: 100
      },
      {
        title: '学号',
        dataIndex: 'studentId',
        key: 'studentId',
        width: 120
      },
      ...examNames.map(examName => ({
        title: examName,
        key: examName,
        width: 120,
        render: (_: any, record: Student) => {
          const ranking = getStudentRanking(record.id, examName);
          return ranking;
        }
      })),
      {
        title: '进步情况',
        key: 'progress',
        width: 150,
        render: (_: any, record: Student) => {
          const progress = calculateProgress(record.id);
          
          switch (progress.status) {
            case 'improved':
              return (
                <Tag color="green" icon={<ArrowUpOutlined />}>
                  {progress.message}
                </Tag>
              );
            case 'declined':
              return (
                <Tag color="red" icon={<ArrowDownOutlined />}>
                  {progress.message}
                </Tag>
              );
            default:
              return (
                <Tag color="gray" icon={<MinusOutlined />}>
                  {progress.message}
                </Tag>
              );
          }
        }
      }
    ];
    
    return columns;
  };

  // 生成表格数据
  const generateTableData = () => {
    return students
      .filter(student => {
        // 按班级筛选
        if (filters.className !== 'all' && student.class !== filters.className) {
          return false;
        }
        
        // 按进步情况筛选
        if (filters.progress !== 'all') {
          const progress = calculateProgress(student.id);
          if (filters.progress === 'improved' && progress.status !== 'improved') {
            return false;
          }
          if (filters.progress === 'declined' && progress.status !== 'declined') {
            return false;
          }
          if (filters.progress === 'stable' && progress.status !== 'stable') {
            return false;
          }
        }
        
        // 按前十名筛选
        if (filters.topTen && filters.examName !== 'all') {
          const ranking = getStudentRanking(student.id, filters.examName);
          if (ranking === '-' || typeof ranking !== 'number' || ranking > 10) {
            return false;
          }
        }
        
        return true;
      })
      .map(student => ({
        key: student.id,
        ...student
      }));
  };

  // 处理Excel导出
  const handleExport = () => {
    try {
      const exportExamNames = getExamNames();
      const exportFilteredData = generateTableData();
      
      // 准备导出数据
      const exportData = exportFilteredData.map(student => {
        const studentData: any = {
          class: student.class,
          name: student.name,
          studentId: student.studentId,
          progress: calculateProgress(student.id).message
        };
        
        // 添加各考试排名
        exportExamNames.forEach(examName => {
          studentData[examName] = getStudentRanking(student.id, examName);
        });
        
        return studentData;
      });
      
      // 创建工作簿
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, '考试排名');
      
      // 导出文件
      XLSX.writeFile(workbook, `考试排名_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      message.success('Excel导出成功');
    } catch (err) {
      setError('Excel导出失败: ' + (err instanceof Error ? err.message : String(err)));
      message.error('Excel导出失败');
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedExams.length === 0) {
      message.warning('请选择要删除的考试');
      return;
    }
    
    setLoading(true);
    try {
      // 这里应该是实际的删除逻辑
      // 由于我们没有后端API，这里只是模拟删除
      const updatedRankings = rankings.filter(r => !selectedExams.includes(r.examName));
      setRankings(updatedRankings);
      setSelectedExams([]);
      message.success(`成功删除 ${selectedExams.length} 个考试的排名记录`);
    } catch (err) {
      setError('删除失败: ' + (err instanceof Error ? err.message : String(err)));
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const examNames = getExamNames();
  const classNames = getClassNames();
  const filteredData = generateTableData();



  return (
    <Card
      title={
        <Space>
          <Title level={4}>考试排名管理</Title>
          <Upload
            name="file"
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={(file) => {
              handleImport(file);
              return false;
            }}
          >
            <Button 
              icon={<UploadOutlined />} 
              loading={importLoading}
              disabled={loading}
            >
              导入Excel
            </Button>
          </Upload>
          <Button 
            icon={<DownloadOutlined />} 
            disabled={loading || filteredData.length === 0}
            onClick={handleExport}
          >
            导出Excel
          </Button>
        </Space>
      }
      extra={
        <Text type="secondary">
          共 {filteredData.length} 名学生，{examNames.length} 次考试
        </Text>
      }
    >
      {error && (
        <Alert 
          message="错误" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }} 
        />
      )}

      {/* 筛选区域 */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Text style={{ marginRight: 8 }}>考试名称:</Text>
            <Select
              style={{ width: '80%' }}
              value={filters.examName}
              onChange={(value) => handleFilterChange('examName', value)}
              options={[
                { value: 'all', label: '全部考试' },
                ...examNames.map(name => ({ value: name, label: name }))
              ]}
            />
          </Col>
          <Col span={6}>
            <Text style={{ marginRight: 8 }}>班级:</Text>
            <Select
              style={{ width: '80%' }}
              value={filters.className}
              onChange={(value) => handleFilterChange('className', value)}
              options={[
                { value: 'all', label: '全部班级' },
                ...classNames.map(name => ({ value: name, label: name }))
              ]}
            />
          </Col>
          <Col span={6}>
            <Text style={{ marginRight: 8 }}>进步情况:</Text>
            <Select
              style={{ width: '80%' }}
              value={filters.progress}
              onChange={(value) => handleFilterChange('progress', value)}
              options={[
                { value: 'all', label: '全部情况' },
                { value: 'improved', label: '进步' },
                { value: 'declined', label: '退步' },
                { value: 'stable', label: '保持不变' }
              ]}
            />
          </Col>
          <Col span={6}>
            <Text style={{ marginRight: 8 }}>前十名:</Text>
            <Select
              style={{ width: '80%' }}
              value={filters.topTen}
              onChange={(value) => handleFilterChange('topTen', value)}
              options={[
                { value: false, label: '全部学生' },
                { value: true, label: '仅显示前十名' }
              ]}
            />
          </Col>
        </Row>
      </div>

      {/* 批量操作区域 */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>批量操作:</Text>
            <Select
              mode="multiple"
              style={{ width: '60%', marginLeft: 16 }}
              placeholder="请选择要删除的考试"
              value={selectedExams}
              onChange={setSelectedExams}
              options={examNames.map(name => ({ value: name, label: name }))}
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button
              danger
              disabled={selectedExams.length === 0 || loading}
              onClick={handleBatchDelete}
            >
              批量删除选中考试的排名记录
            </Button>
          </Col>
        </Row>
      </div>



      <Divider />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: 16 }}>加载数据中...</Text>
        </div>
      ) : (
        <>
          {students.length === 0 ? (
            <Alert 
              message="提示" 
              description="暂无学生数据" 
              type="info" 
              showIcon 
            />
          ) : examNames.length === 0 ? (
            <Alert 
              message="提示" 
              description="暂无考试排名数据" 
              type="info" 
              showIcon 
            />
          ) : (
            <Table
              columns={generateColumns()}
              dataSource={filteredData}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50']
              }}
              scroll={{ x: 800 }}
            />
          )}
        </>

      )}

      {/* 导入模态框 */}
      <Modal
        title="导入Excel数据"
        open={importState.showImportModal}
        onCancel={() => setImportState(prev => ({ ...prev, showImportModal: false }))}
        onOk={confirmImport}
        okText="确认导入"
        cancelText="取消"
        loading={importLoading}
      >
        {importState.importError && (
          <Alert 
            message="错误" 
            description={importState.importError} 
            type="error" 
            showIcon 
            style={{ marginBottom: 16 }} 
          />
        )}
        
        <Form layout="vertical">
          <Form.Item
            label="考试名称"
            required
          >
            <Input
              value={importState.examName}
              onChange={(e) => setImportState(prev => ({ ...prev, examName: e.target.value }))}
              placeholder="请输入考试名称"
            />
          </Form.Item>
          
          <Form.Item
            label="班级"
            required
          >
            <Input
              value={importState.className}
              onChange={(e) => setImportState(prev => ({ ...prev, className: e.target.value }))}
              placeholder="请输入班级"
            />
          </Form.Item>
        </Form>
        
        <div style={{ marginTop: 20 }}>
          <Text strong>数据预览（前5条）：</Text>
          <div style={{ marginTop: 10, maxHeight: 200, overflowY: 'auto' }}>
            {importState.previewData.length > 0 ? (
              <Table
                columns={Object.keys(importState.previewData[0] || {}).map(key => ({
                  title: key,
                  dataIndex: key,
                  key
                }))}
                dataSource={importState.previewData.map((item, index) => ({
                  ...item,
                  key: index
                }))}
                pagination={false}
              />
            ) : (
              <Text type="secondary">暂无预览数据</Text>
            )}
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default RankingManagement;

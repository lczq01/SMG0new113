import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Typography, Space, Upload, Card, Tag, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { InboxOutlined, SearchOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { studentManagementApi, classApi, rankingApi, violationApi } from '../../services/api';
import { Student, ExamRanking, Violation } from '../../types';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [rankings, setRankings] = useState<ExamRanking[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [importData, setImportData] = useState<any[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 并行获取所有数据
        const [studentResponse, classResponse, rankingResponse, violationResponse] = await Promise.all([
          studentManagementApi.getAll(),
          classApi.getAll(),
          rankingApi.getAll(),
          violationApi.getAll()
        ]);
        
        if (studentResponse.success) {
          // 确保students始终是数组
          const studentsData = Array.isArray(studentResponse.data) ? studentResponse.data : [];
          setStudents(studentsData);
          setFilteredStudents(studentsData);
        } else {
          // API调用失败时，确保students是数组
          setStudents([]);
          setFilteredStudents([]);
        }

        if (classResponse.success) {
          // 提取班级名称数组
          setClasses(classResponse.data.map(cls => cls.name));
        }

        if (rankingResponse.success) {
          setRankings(rankingResponse.data);
        }

        if (violationResponse.success) {
          setViolations(violationResponse.data);
        }
      } catch (error) {
        message.error('获取数据失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 筛选学生数据
  useEffect(() => {
    let result = students;
    
    // 按班级筛选
    if (selectedClass) {
      result = result.filter(student => student.class === selectedClass);
    }
    
    // 按姓名或学号搜索
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(student => 
        student.name.toLowerCase().includes(searchLower) || 
        student.studentId.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredStudents(result);
  }, [students, selectedClass, searchText]);



  // 打开添加学生模态框
  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  // 打开编辑学生模态框
  const showEditModal = (student: Student) => {
    form.setFieldsValue({
      class: student.class,
      name: student.name,
      studentId: student.studentId,
    });
    setEditingStudent(student);
    setIsEditModalVisible(true);
  };

  // 处理添加学生
  const handleAddStudent = async (values: { class: string; name: string; studentId: string }) => {
    try {
      // 检查学号是否已存在
      const existingStudent = students.find(s => s.studentId === values.studentId);
      if (existingStudent) {
        message.error('学号已存在');
        return;
      }

      setLoading(true);
      const response = await studentManagementApi.create(values);
      setLoading(false);

      if (response.success && response.data) {
        setStudents([...students, response.data]);
        message.success('添加学生成功');
        setIsAddModalVisible(false);
      } else {
        message.error(response.message || '添加学生失败');
      }
    } catch (error) {
      setLoading(false);
      message.error('添加学生失败');
      console.error(error);
    }
  };

  // 处理编辑学生
  const handleEditStudent = async (values: { class: string; name: string; studentId: string }) => {
    try {
      if (!editingStudent) return;

      // 检查学号是否已被其他学生使用
      const existingStudent = students.find(s => s.studentId === values.studentId && s.id !== editingStudent.id);
      if (existingStudent) {
        message.error('学号已被其他学生使用');
        return;
      }

      setLoading(true);
      const response = await studentManagementApi.update(editingStudent.id, values);
      setLoading(false);

      if (response.success && response.data) {
        setStudents(students.map(s => s.id === editingStudent.id ? response.data : s));
        message.success('更新学生成功');
        setIsEditModalVisible(false);
      } else {
        message.error(response.message || '更新学生失败');
      }
    } catch (error) {
      setLoading(false);
      message.error('更新学生失败');
      console.error(error);
    }
  };

  // 处理删除学生
  const handleDeleteStudent = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await studentManagementApi.delete(studentId);
      setLoading(false);

      if (response.success) {
        setStudents(students.filter(s => s.id !== studentId));
        setSelectedRowKeys(selectedRowKeys.filter(key => key !== studentId));
        message.success('删除学生成功');
      } else {
        message.error(response.message || '删除学生失败');
      }
    } catch (error) {
      setLoading(false);
      message.error('删除学生失败');
      console.error(error);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的学生');
      return;
    }

    try {
      setLoading(true);
      // 逐个删除学生（目前API不支持批量删除）
      let deletedCount = 0;
      for (const studentId of selectedRowKeys) {
        const response = await studentManagementApi.delete(studentId as string);
        if (response.success) {
          deletedCount++;
        }
      }
      setLoading(false);

      // 重新获取最新学生数据
      const fetchResponse = await studentManagementApi.getAll();
      if (fetchResponse.success && Array.isArray(fetchResponse.data)) {
        setStudents(fetchResponse.data);
      }

      setSelectedRowKeys([]);
      message.success(`成功删除 ${deletedCount} 名学生`);
    } catch (error) {
      setLoading(false);
      message.error('批量删除失败');
      console.error(error);
    }
  };

  // 处理Excel导入
  const handleExcelImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellText: true, cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 配置sheet_to_json以确保解析所有行数据
        const importedData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // 以数组形式返回原始数据
          blankRows: true // 包含空白行，后续再处理
        });
        
        // 处理表头和数据行
        const headers = importedData[0] || [];
        const dataRows = importedData.slice(1);
        
        // 映射表头索引
        const headerMap: {[key: string]: number} = {};
        headers.forEach((header, index) => {
          if (typeof header === 'string') {
            const lowerHeader = header.toLowerCase().trim();
            if (lowerHeader.includes('班级')) headerMap['class'] = index;
            if (lowerHeader.includes('姓名')) headerMap['name'] = index;
            if (lowerHeader.includes('学号')) headerMap['studentId'] = index;
          }
        });
        
        // 处理数据行，过滤掉无效行
        const processedData = dataRows.map((row: any[]) => {
          if (!Array.isArray(row) || row.length === 0) return null;
          
          return {
            studentId: headerMap['studentId'] !== undefined ? String(row[headerMap['studentId']] || '').trim() : '',
            name: headerMap['name'] !== undefined ? String(row[headerMap['name']] || '').trim() : '',
            class: headerMap['class'] !== undefined ? String(row[headerMap['class']] || '').trim() : '',
          };
        }).filter((item): item is any => item !== null && item.studentId && item.name && item.class);
        
        console.log('Excel解析结果:', { totalRows: importedData.length, processedRows: processedData.length, headers: headers });

        setImportData(processedData);
        setIsImportModalVisible(true);
      } catch (error) {
        message.error('导入失败，请检查Excel文件格式');
        console.error('Excel解析错误:', error);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 确认导入
  const confirmImport = async () => {
    try {
      // 处理导入的数据
      const studentsToImport = importData.map((item: any) => ({
        studentId: item.studentId || item.学号 || item.id || '',
        name: item.name || item.姓名 || '',
        class: item.class || item.班级 || '',
      }));

      // 调用后端批量创建API
      setLoading(true);
      const response = await studentManagementApi.batchCreate(studentsToImport);
      setLoading(false);

      if (response.success) {
        // 重新获取最新的学生数据
        const fetchResponse = await studentManagementApi.getAll();
        if (fetchResponse.success) {
          setStudents(fetchResponse.data || []);
        }

        message.success(`导入成功 ${response.data?.success?.length || 0} 条记录`);
      } else {
        message.error(`导入失败: ${response.message}`);
      }

      setIsImportModalVisible(false);
      setImportData([]);
    } catch (error) {
      setLoading(false);
      message.error('导入失败，请重试');
      console.error(error);
    }
  };

  // 处理文件上传
  const handleUpload = (info: any) => {
    const { file } = info;
    if (file.status === 'error') {
      message.error('文件上传失败');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file: File) => {
      const isExcel = file.type === 'application/vnd.ms-excel' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isExcel) {
        message.error('只能上传Excel文件');
        return false;
      }
      handleExcelImport(file);
      return false; // 阻止自动上传
    },
    onChange: handleUpload,
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns = [
    {
      title: '班级',
      dataIndex: 'class',
      key: 'class',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: Student) => (
        <Space size="middle">
          <Button type="primary" onClick={() => showEditModal(record)}>
            编辑
          </Button>
          <Button danger onClick={() => handleDeleteStudent(record.id)}>
            删除
          </Button>
          <Button onClick={() => navigate(`/teacher/student/${record.id}`)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={4} style={{ margin: 0 }}>学生信息管理</Title>
          <Space>
            <Select
              placeholder="按班级筛选"
              style={{ width: 150 }}
              value={selectedClass}
              onChange={setSelectedClass}
              allowClear
            >
              {classes.map(className => (
                <Option key={className} value={className}>
                  {className}
                </Option>
              ))}
            </Select>
            <Input
              placeholder="按姓名或学号搜索"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Space>
        </Space>
      }
      extra={
        <Space>
          <Text>已选择 {selectedRowKeys.length} 名学生</Text>
          <Button 
            danger 
            icon={<UserDeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>
        </Space>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={showAddModal}>
          添加学生
        </Button>
        <Dragger {...uploadProps} style={{ width: 'auto' }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持上传Excel文件，包含班级、姓名、学号列
          </p>
        </Dragger>
      </Space>

      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        columns={columns}
        dataSource={filteredStudents}
        loading={loading}
        rowKey="id"
        pagination={false} // 禁用分页功能
        locale={{
          emptyText: '暂无学生数据',
        }}
      />

      {/* 添加学生模态框 */}
      <Modal
        title="添加学生"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddStudent}
          layout="vertical"
        >
          <Form.Item
            name="class"
            label="班级"
            rules={[{ required: true, message: '请选择班级' }]}
          >
            <Select placeholder="请选择班级">
              {classes.map(className => (
                <Option key={className} value={className}>
                  {className}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="studentId"
            label="学号"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input placeholder="请输入学号" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsAddModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑学生模态框 */}
      <Modal
        title="编辑学生"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleEditStudent}
          layout="vertical"
        >
          <Form.Item
            name="class"
            label="班级"
            rules={[{ required: true, message: '请选择班级' }]}
          >
            <Select placeholder="请选择班级">
              {classes.map(className => (
                <Option key={className} value={className}>
                  {className}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="studentId"
            label="学号"
            rules={[{ required: true, message: '请输入学号' }]}
          >
            <Input placeholder="请输入学号" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsEditModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 导入预览模态框 */}
      <Modal
        title="Excel导入预览"
        open={isImportModalVisible}
        onCancel={() => {
          setIsImportModalVisible(false);
          setImportData([]);
        }}
        onOk={confirmImport}
        okText="确认导入"
        cancelText="取消"
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {importData.length > 0 ? (
            <Table
              columns={[
                { title: '班级', dataIndex: 'class' },
                { title: '姓名', dataIndex: 'name' },
                { title: '学号', dataIndex: 'studentId' },
              ]}
              dataSource={importData.slice(0, 5)} // 只显示前5条数据
              pagination={false}
              size="small"
            />
          ) : (
            <Alert message="暂无导入数据" type="info" />
          )}
        </div>
        <div style={{ marginTop: 16 }}>
          <Text>预览前5条数据，共 {importData.length} 条记录</Text>
        </div>
      </Modal>
    </Card>
  );
};

export default StudentManagement;
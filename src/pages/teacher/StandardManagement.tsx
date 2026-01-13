import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Modal,
  message,
  Typography,
  Alert,
  Space,
  Tag,
  Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { standardApi, studentManagementApi } from '../../services/api';
import { Standard } from '../../types';

const { Title, Text } = Typography;

const StandardManagement: React.FC = () => {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  // 获取所有标准和学生数据
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('开始获取数据...');
      const [standardsRes, studentsRes] = await Promise.all([
        standardApi.getAll(),
        studentManagementApi.getAll()
      ]);
      
      console.log('获取数据成功:', { standardsRes, studentsRes });
      
      if (standardsRes.success && studentsRes.success) {
        // 获取所有唯一的标准名称
        const standardNames = new Set(standardsRes.data.map((s: Standard) => s.name));
        const uniqueStandards = Array.from(standardNames).map(name => {
          const firstStandard = standardsRes.data.find((s: Standard) => s.name === name);
          return firstStandard || { id: '', name: name, studentId: '', value: 3 };
        });
        
        console.log('处理后的数据:', { uniqueStandards, students: studentsRes.data });
        
        setStandards(uniqueStandards);
        setStudents(studentsRes.data);
      } else {
        setError('获取数据失败');
        console.error('获取数据失败:', { standardsRes, studentsRes });
      }
    } catch (err) {
      setError('获取数据时发生错误');
      console.error('获取数据时发生错误:', err);
    } finally {
      setLoading(false);
      console.log('数据获取完成');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 添加新标准
  const handleAddStandard = async (values: { name: string }) => {
    setConfirmLoading(true);
    try {
      const newStandardName = values.name.trim();
      
      // 检查标准名称是否已存在
      if (standards.some(s => s.name === newStandardName)) {
        message.error('标准名称已存在');
        return;
      }
      
      // 为所有学生创建新标准记录
      const standardPromises = students.map(student => 
        standardApi.create({
          studentId: student.id,
          name: newStandardName,
          value: 3
        })
      );
      
      const results = await Promise.all(standardPromises);
      const allSuccess = results.every(result => result.success);
      
      if (allSuccess) {
        message.success(`成功添加标准 "${newStandardName}"，并为 ${students.length} 名学生创建了记录`);
        form.resetFields();
        fetchData();
      } else {
        message.error('添加标准失败');
      }
    } catch (err) {
      message.error('添加标准时发生错误');
      console.error(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  // 开始编辑标准名称
  const startEditing = (standard: Standard) => {
    setEditingId(standard.id);
    setEditingName(standard.name);
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  // 保存编辑
  const saveEditing = async (standard: Standard) => {
    if (!editingName.trim()) {
      message.error('标准名称不能为空');
      return;
    }
    
    if (editingName === standard.name) {
      cancelEditing();
      return;
    }
    
    // 检查新名称是否已存在
    if (standards.some(s => s.name === editingName && s.id !== standard.id)) {
      message.error('标准名称已存在');
      return;
    }
    
    setLoading(true);
    try {
      // 获取所有使用该标准名称的记录
      const allStandardsRes = await standardApi.getAll();
      if (!allStandardsRes.success) {
        message.error('获取标准数据失败');
        return;
      }
      
      const standardsToUpdate = allStandardsRes.data.filter((s: Standard) => s.name === standard.name);
      
      // 批量更新所有学生的对应标准记录
      const updatePromises = standardsToUpdate.map(s => 
        standardApi.update(s.id, { name: editingName })
      );
      
      const results = await Promise.all(updatePromises);
      const allSuccess = results.every(result => result.success);
      
      if (allSuccess) {
        message.success(`成功修改标准名称为 "${editingName}"`);
        // 先重置编辑状态，再刷新数据
        setEditingId(null);
        setEditingName('');
        fetchData();
      } else {
        message.error('修改标准名称失败');
      }
    } catch (err) {
      message.error('修改标准名称时发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 删除标准
  const handleDeleteStandard = async (standard: Standard) => {
    setLoading(true);
    try {
      // 获取所有使用该标准名称的记录
      const allStandardsRes = await standardApi.getAll();
      if (!allStandardsRes.success) {
        message.error('获取标准数据失败');
        return;
      }
      
      const standardsToDelete = allStandardsRes.data.filter((s: Standard) => s.name === standard.name);
      
      // 批量删除所有学生的对应标准记录
      const deletePromises = standardsToDelete.map(s => 
        standardApi.delete(s.id)
      );
      
      const results = await Promise.all(deletePromises);
      const allSuccess = results.every(result => result.success);
      
      if (allSuccess) {
        message.success(`成功删除标准 "${standard.name}"，并删除了 ${standardsToDelete.length} 条相关记录`);
        fetchData();
      } else {
        message.error('删除标准失败');
      }
    } catch (err) {
      message.error('删除标准时发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 生成表格列
  const columns = [
    {
      title: '标准名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Standard) => {
        if (editingId === record.id) {
          return (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onPressEnter={() => saveEditing(record)}
              onBlur={cancelEditing}
              autoFocus
            />
          );
        }
        return text;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Standard) => {
        return (
          <Space size="middle">
            {editingId === record.id ? (
              <Space size="small">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  onClick={() => saveEditing(record)}
                >
                  保存
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={cancelEditing}
                >
                  取消
                </Button>
              </Space>
            ) : (
              <Space size="small">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => startEditing(record)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title={`确定要删除标准 "${record.name}" 吗？`}
                  description="删除后将同时删除所有学生的该标准记录"
                  onConfirm={() => handleDeleteStandard(record)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <Card
      title={
        <Title level={4}>学生标准管理</Title>
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

      <Form
        form={form}
        onFinish={handleAddStandard}
        layout="inline"
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          name="name"
          rules={[
            { required: true, message: '请输入标准名称' },
            { min: 1, message: '标准名称不能为空' }
          ]}
        >
          <Input placeholder="请输入标准名称" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={confirmLoading}>
            添加标准
          </Button>
        </Form.Item>
      </Form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">加载中...</Text>
        </div>
      ) : standards.length === 0 ? (
        <Alert
          message="提示"
          description="暂无标准数据，请添加新标准"
          type="info"
          showIcon
        />
      ) : (
        <Table
          columns={columns}
          dataSource={standards.map((standard, index) => ({
            key: standard.id || `standard-${index}`,
            ...standard
          }))}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50']
          }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell>
                <Text strong>总计</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <Text strong>{standards.length} 个标准</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      )}
    </Card>
  );
};

export default StandardManagement;
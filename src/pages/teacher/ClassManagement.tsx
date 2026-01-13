import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Typography, Space } from 'antd';

import { classApi } from '../../services/api';


// 班级数据类型定义
interface ClassData {
  name: string;
  studentCount: number;
}

const { Title } = Typography;

const ClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取班级列表
        const classResponse = await classApi.getAll();
        if (classResponse.success) {
          setClasses(classResponse.data);
        }
      } catch (error) {
        message.error('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 打开添加班级模态框
  const showAddModal = () => {
    form.resetFields();
    setIsAddModalVisible(true);
  };

  // 打开编辑班级模态框
  const showEditModal = (className: string) => {
    form.setFieldsValue({ className });
    setEditingClass(className);
    setIsEditModalVisible(true);
  };

  // 处理添加班级
  const handleAddClass = async (values: { className: string }) => {
    try {
      const className = values.className;
      
      // 检查班级名称是否已存在
      if (classes.some(cls => cls.name === className)) {
        message.error('班级已存在');
        return;
      }
      
      // 调用API添加班级
      const response = await classApi.create(className);
      
      if (response.success) {
        // 重新获取班级列表以确保数据一致性
        const classResponse = await classApi.getAll();
        if (classResponse.success) {
          setClasses(classResponse.data);
        }
        message.success('添加班级成功');
      } else {
        message.error(response.message || '添加班级失败');
      }
      
      setIsAddModalVisible(false);
    } catch (error) {
      message.error('添加班级失败');
      console.error('添加班级错误:', error);
    }
  };

  // 处理编辑班级
  const handleEditClass = async (values: { className: string }) => {
    try {
      const newClassName = values.className;
      
      // 检查班级名称是否已存在（排除当前正在编辑的班级）
      if (classes.some(cls => cls.name === newClassName && cls.name !== editingClass)) {
        message.error('班级名称已存在');
        return;
      }
      
      // 调用API更新班级
      const response = await classApi.update(editingClass, newClassName);
      
      if (response.success) {
        // 重新获取班级列表以确保数据一致性
        const classResponse = await classApi.getAll();
        if (classResponse.success) {
          setClasses(classResponse.data);
        }
        message.success('更新班级成功');
      } else {
        message.error(response.message || '更新班级失败');
      }
      
      setIsEditModalVisible(false);
    } catch (error) {
      message.error('更新班级失败');
      console.error('编辑班级错误:', error);
    }
  };

  // 处理删除班级
  const handleDeleteClass = async (className: string) => {
    // 检查班级是否有学生
    const classData = classes.find(cls => cls.name === className);
    if (classData && classData.studentCount > 0) {
      message.error(`班级 ${className} 还有 ${classData.studentCount} 名学生，无法删除`);
      return;
    }

    try {
      // 调用API删除班级
      const response = await classApi.delete(className);
      
      if (response.success) {
        // 重新获取班级列表以确保数据一致性
        const classResponse = await classApi.getAll();
        if (classResponse.success) {
          setClasses(classResponse.data);
        }
        message.success('删除班级成功');
      } else {
        message.error(response.message || '删除班级失败');
      }
    } catch (error) {
      message.error('删除班级失败');
      console.error('删除班级错误:', error);
    }
  };

  const columns = [
    {
      title: '班级名称',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: '学生数量',
      dataIndex: 'studentCount',
      key: 'studentCount',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: { className: string }) => (
        <Space size="middle">
          <Button type="primary" onClick={() => showEditModal(record.className)}>
            编辑
          </Button>
          <Button danger onClick={() => handleDeleteClass(record.className)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 转换班级列表为表格数据
  const tableData = classes.map(cls => ({
    key: cls.name,
    className: cls.name,
    studentCount: cls.studentCount,
  }));

  return (
    <div>
      <Title level={4}>班级管理</Title>
      <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>
        添加班级
      </Button>
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        locale={{
          emptyText: '暂无班级数据',
        }}
      />

      {/* 添加班级模态框 */}
      <Modal
        title="添加班级"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleAddClass}
          layout="vertical"
        >
          <Form.Item
            name="className"
            label="班级名称"
            rules={[{ required: true, message: '请输入班级名称' }]}
          >
            <Input placeholder="例如：高一(1)班" />
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

      {/* 编辑班级模态框 */}
      <Modal
        title="编辑班级"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleEditClass}
          layout="vertical"
        >
          <Form.Item
            name="className"
            label="班级名称"
            rules={[{ required: true, message: '请输入班级名称' }]}
          >
            <Input placeholder="例如：高一(1)班" />
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
    </div>
  );
};

export default ClassManagement;
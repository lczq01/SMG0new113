
import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../services/api';
import type { StudentLogin as StudentLoginType } from '../types';

const StudentLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: StudentLoginType) => {
    setLoading(true);
    try {
      const response = await studentApi.login(values);
      if (response.success && response.data) {
        // 保存登录状态到localStorage
        localStorage.setItem('studentId', response.data.id);
        localStorage.setItem('userType', 'student');
        message.success('登录成功');
        navigate('/student/profile');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Col xs={24} sm={16} md={12} lg={8}>
        <Card title="学生登录" variant="outlined" style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Form
            name="studentLogin"
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="class"
              label="班级"
              rules={[{ required: true, message: '请输入班级' }]}
            >
              <Input placeholder="请输入班级，如：高一(1)班" />
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
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                登录
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <p style={{ color: '#666' }}>测试账号：</p>
              <p style={{ color: '#666' }}>班级：高一(1)班</p>
              <p style={{ color: '#666' }}>姓名：张三</p>
              <p style={{ color: '#666' }}>学号：2024001</p>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default StudentLogin;

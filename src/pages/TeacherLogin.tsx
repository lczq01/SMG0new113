import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { teacherApi } from '../services/api';
import { TeacherLogin } from '../types';

const TeacherLoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: TeacherLogin) => {
    setLoading(true);
    try {
      const response = await teacherApi.login(values);
      if (response.success) {
        // 保存登录状态到localStorage
        localStorage.setItem('userType', 'teacher');
        message.success('登录成功');
        navigate('/teacher/classes');
      } else {
        message.error(response.message);
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
        <Card title="教师登录" variant="outlined" style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Form
            name="teacherLogin"
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
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
              <p style={{ color: '#666' }}>用户名：teacher</p>
              <p style={{ color: '#666' }}>密码：teacher123</p>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default TeacherLoginPage;
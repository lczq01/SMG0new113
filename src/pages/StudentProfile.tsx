import React, { useState, useEffect } from 'react';
import { Card, Table, message, Button, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentApi, studentStandardApi } from '../services/api';
import { Student, Standard } from '../types';

const StudentProfile: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentId = localStorage.getItem('studentId');
        if (!studentId) {
          message.error('请先登录');
          navigate('/student/login');
          return;
        }

        // 获取学生信息
        const studentResponse = await studentApi.getById(studentId);
        if (studentResponse.success && studentResponse.data) {
          setStudent(studentResponse.data);
        }

        // 获取学生标准
        const standardsResponse = await studentStandardApi.getByStudentId(studentId);
        if (standardsResponse.success) {
          setStandards(standardsResponse.data);
        }
      } catch (error) {
        message.error('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('userType');
    message.success('退出登录成功');
    navigate('/student/login');
  };

  const standardColumns = [
    {
      title: '标准名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '标准值',
      dataIndex: 'value',
      key: 'value',
    },
  ];

  const navigateTo = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        title="学生端系统"
        extra={
          <Button type="primary" danger onClick={handleLogout}>
            退出登录
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Menu
          mode="horizontal"
          defaultSelectedKeys={[location.pathname]}
          style={{ marginBottom: 24 }}
        >
          <Menu.Item key="/student/profile" onClick={() => navigateTo('/student/profile')}>
            个人信息
          </Menu.Item>
          <Menu.Item key="/student/violations" onClick={() => navigateTo('/student/violations')}>
            违规情况
          </Menu.Item>
          <Menu.Item key="/student/rankings" onClick={() => navigateTo('/student/rankings')}>
            考试排名
          </Menu.Item>
        </Menu>

        <h2>个人信息</h2>
        {student ? (
          <div>
            <p><strong>班级：</strong>{student.class}</p>
            <p><strong>姓名：</strong>{student.name}</p>
            <p><strong>学号：</strong>{student.studentId}</p>
          </div>
        ) : (
          <p>未找到学生信息</p>
        )}

        <h2 style={{ marginTop: 24 }}>个人标准</h2>
        <Table
          dataSource={standards}
          columns={standardColumns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default StudentProfile;
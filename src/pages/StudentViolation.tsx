import React, { useState, useEffect } from 'react';
import { Card, Table, message, Button, Tag, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { violationApi } from '../services/api';
import { Violation } from '../types';

const StudentViolation: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
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

        // 获取学生违规记录
        const response = await violationApi.getByStudentId(studentId);
        if (response.success) {
          // 按时间倒序排列
          const sortedViolations = response.data.sort((a, b) => {
            return new Date(b.violationDate).getTime() - new Date(a.violationDate).getTime();
          });
          setViolations(sortedViolations);
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

  const navigateTo = (path: string) => {
    navigate(path);
  };

  const violationColumns = [
    {
      title: '违规类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="red">{type}</Tag>
      ),
    },
    {
      title: '违规日期',
      dataIndex: 'violationDate',
      key: 'violationDate',
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString('zh-CN');
        return formattedDate;
      },
    },
    {
      title: '记录时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleString('zh-CN');
        return formattedDate;
      },
    },
  ];

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

        <h2>违规情况记录</h2>
        <Table
          dataSource={violations}
          columns={violationColumns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          locale={{
            emptyText: '暂无违规记录',
          }}
        />
      </Card>
    </div>
  );
};

export default StudentViolation;
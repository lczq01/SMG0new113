import React from 'react';
import { Layout, Menu, Button, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  SettingOutlined, 
  ExclamationCircleOutlined, 
  ExportOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // 清除登录状态
    localStorage.removeItem('userType');
    message.success('退出登录成功');
    navigate('/teacher/login');
  };

  const menuItems = [
    {
      key: '/teacher/classes',
      icon: <HomeOutlined />,
      label: '班级管理',
    },
    {
      key: '/teacher/students',
      icon: <UserOutlined />,
      label: '学生信息管理',
    },
    {
      key: '/teacher/rankings',
      icon: <TeamOutlined />,
      label: '考试排名管理',
    },
    {
      key: '/teacher/standards/view',
      icon: <FileTextOutlined />,
      label: '学生标准查看',
    },
    {
      key: '/teacher/standards/manage',
      icon: <SettingOutlined />,
      label: '学生标准管理',
    },
    {
      key: '/teacher/violations',
      icon: <ExclamationCircleOutlined />,
      label: '学生违规情况管理',
    },
    {
      key: '/teacher/alerts',
      icon: <ExclamationCircleOutlined />,
      label: '预警管理',
    },
    {
      key: '/teacher/export',
      icon: <ExportOutlined />,
      label: '数据导出',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
          学生管理系统 - 教师端
        </div>
        <Button 
          type="text" 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff', boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => {
              navigate(key);
            }}
          />
        </Sider>
        <Content style={{ margin: '24px', background: '#f0f2f5', padding: 24, borderRadius: 8, minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherLayout;
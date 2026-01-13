import React, { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import 'antd/dist/reset.css';

// 全局样式
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f0f2f5;
  }

  #root {
    min-height: 100vh;
  }

  .app-container {
    min-height: 100vh;
  }

  /* 登录页面样式 */
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f2f5;
  }

  /* 卡片样式 */
  .card-shadow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* 按钮样式 */
  .btn-primary {
    background-color: #1890ff;
    border-color: #1890ff;
  }

  /* 加载动画 */
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
`;

// 错误边界组件
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('应用错误:', error);
    console.error('错误信息:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <h1 style={{ color: '#ff4d4f', marginBottom: '20px' }}>应用发生错误</h1>
          <p style={{ marginBottom: '30px' }}>很抱歉，应用遇到了一些问题，请刷新页面重试。</p>
          <button 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#1890ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 学生端页面
import StudentLogin from './pages/StudentLogin';
import StudentProfile from './pages/StudentProfile';
import StudentViolation from './pages/StudentViolation';
import StudentRanking from './pages/StudentRanking';

// 教师端页面
import TeacherLogin from './pages/TeacherLogin';
import TeacherLayout from './layouts/TeacherLayout';
import ClassManagement from './pages/teacher/ClassManagement';
import StudentManagement from './pages/teacher/StudentManagement';
import RankingManagement from './pages/teacher/RankingManagement';
import StandardView from './pages/teacher/StandardView';
import StandardManagement from './pages/teacher/StandardManagement';
import ViolationManagement from './pages/teacher/ViolationManagement';
import AlertManagement from './pages/teacher/AlertManagement';
import DataExport from './pages/teacher/DataExport';
import StudentDetail from './pages/teacher/StudentDetail';

// 权限检查组件
const PrivateRoute: React.FC<{ children: React.ReactNode; role: string }> = ({ children, role }) => {
  const userType = localStorage.getItem('userType');
  if (!userType || userType !== role) {
    return <Navigate to={role === 'student' ? '/student/login' : '/teacher/login'} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  // Ant Design主题配置
  const { token } = theme.useToken();
  
  return (
    <>
      {/* 全局样式 */}
      <style>{globalStyles}</style>
      
      <ErrorBoundary>
        <ConfigProvider 
          locale={zhCN}
          theme={{
            token: {
              colorPrimary: '#1890ff',
              colorSuccess: '#52c41a',
              colorWarning: '#faad14',
              colorError: '#ff4d4f',
              colorInfo: '#1890ff',
              fontSize: 14,
              borderRadius: 4,
            },
            algorithm: theme.defaultAlgorithm,
          }}
        >
          <Router>
            <div className="app-container">
              <Routes>
                {/* 学生端路由 */}
                <Route path="/student/login" element={<StudentLogin />} />
                <Route
                  path="/student/profile"
                  element={
                    <PrivateRoute role="student">
                      <StudentProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/student/violations"
                  element={
                    <PrivateRoute role="student">
                      <StudentViolation />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/student/rankings"
                  element={
                    <PrivateRoute role="student">
                      <StudentRanking />
                    </PrivateRoute>
                  }
                />

                {/* 教师端路由 */}
                <Route path="/teacher/login" element={<TeacherLogin />} />
                <Route
                  path="/teacher/classes"
                  element={
                    <PrivateRoute role="teacher">
                      <TeacherLayout>
                        <ClassManagement />
                      </TeacherLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/teacher/students"
                  element={
                    <PrivateRoute role="teacher">
                      <TeacherLayout>
                        <StudentManagement />
                      </TeacherLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/teacher/rankings"
                  element={
                    <PrivateRoute role="teacher">
                      <TeacherLayout>
                        <RankingManagement />
                      </TeacherLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/teacher/standards/view"
                  element={
                    <PrivateRoute role="teacher">
                      <TeacherLayout>
                        <StandardView />
                      </TeacherLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/teacher/standards/manage"
                  element={
                    <PrivateRoute role="teacher">
                      <TeacherLayout>
                        <StandardManagement />
                      </TeacherLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/teacher/violations"
                  element={
                    <PrivateRoute role="teacher">
                      <TeacherLayout>
                        <ViolationManagement />
                      </TeacherLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/teacher/alerts"
                  element={
                    <PrivateRoute role="teacher">
                      <TeacherLayout>
                        <AlertManagement />
                      </TeacherLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/teacher/export"
                  element={
                    <PrivateRoute role="teacher">
                      <TeacherLayout>
                        <DataExport />
                      </TeacherLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/teacher/student/:id"
                  element={
                    <PrivateRoute role="teacher">
                      <TeacherLayout>
                        <StudentDetail />
                      </TeacherLayout>
                    </PrivateRoute>
                  }
                />

                {/* 默认路由 */}
                <Route path="/" element={<Navigate to="/student/login" replace />} />
                <Route path="*" element={<Navigate to="/student/login" replace />} />
              </Routes>
            </div>
          </Router>
        </ConfigProvider>
      </ErrorBoundary>
    </>
  );
};

export default App;
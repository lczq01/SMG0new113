import React, { useState, useEffect } from 'react';
import { Card, Table, message, Button, Tag, Typography, Row, Col, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { rankingApi } from '../services/api';
import { ExamRanking } from '../types';

const { Title, Text } = Typography;

const StudentRanking: React.FC = () => {
  const [rankings, setRankings] = useState<ExamRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<{
    latestExam: string;
    latestRanking: number;
    comparisonRanking: number;
    progressValue: number;
    isImproved: boolean;
    isContinuousDecline: boolean;
  } | null>(null);
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

        // 获取学生排名记录
        const response = await rankingApi.getByStudentId(studentId);
        if (response.success) {
          // 按创建时间倒序排列（最新考试在前）
          const sortedRankings = response.data.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRankings(sortedRankings);

          // 计算排名进步情况
          if (sortedRankings.length >= 3) {
            // 最新排名
            const latestRanking = sortedRankings[0];
            // 前两次排名
            const previousRankings = sortedRankings.slice(1, 3);
            // 前两次中的最佳排名（排名数字越小越好）
            const comparisonRanking = Math.min(...previousRankings.map(r => r.ranking));
            
            const progressValue = comparisonRanking - latestRanking.ranking;
            const isImproved = progressValue > 0;
            
            // 检查是否连续退步（最近三次排名依次退步）
            const isContinuousDecline = 
              sortedRankings[0].ranking > sortedRankings[1].ranking && 
              sortedRankings[1].ranking > sortedRankings[2].ranking;

            setProgress({
              latestExam: latestRanking.examName,
              latestRanking: latestRanking.ranking,
              comparisonRanking,
              progressValue,
              isImproved,
              isContinuousDecline
            });
          } else if (sortedRankings.length > 0) {
            // 考试次数不足3次
            setProgress({
              latestExam: sortedRankings[0].examName,
              latestRanking: sortedRankings[0].ranking,
              comparisonRanking: sortedRankings[0].ranking,
              progressValue: 0,
              isImproved: false,
              isContinuousDecline: false
            });
          }
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

  const rankingColumns = [
    {
      title: '考试名称',
      dataIndex: 'examName',
      key: 'examName',
    },
    {
      title: '考试日期',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
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

        <h2>考试排名</h2>
        {progress && (
          <Card style={{ marginBottom: 24 }}>
            <Title level={5}>排名进步情况</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>最新考试：</Text>
                <Text>{progress.latestExam}</Text>
              </Col>
              <Col span={8}>
                <Text strong>最新排名：</Text>
                <Text>{progress.latestRanking}</Text>
              </Col>
              <Col span={8}>
                <Text strong>与前两次最佳排名比较：</Text>
                <Text>{progress.comparisonRanking}</Text>
              </Col>
            </Row>
            <Row style={{ marginTop: 16 }}>
              <Col span={12}>
                <Text strong>进步情况：</Text>
                {progress.isImproved ? (
                  <Tag color="green">{`进步了${progress.progressValue}名`}</Tag>
                ) : progress.progressValue < 0 ? (
                  <Tag color="red">{`退步了${Math.abs(progress.progressValue)}名`}</Tag>
                ) : (
                  <Tag color="blue">排名不变</Tag>
                )}
              </Col>
              <Col span={12}>
                <Text strong>连续退步：</Text>
                {progress.isContinuousDecline ? (
                  <Tag color="red">是</Tag>
                ) : (
                  <Tag color="green">否</Tag>
                )}
              </Col>
            </Row>
            {rankings.length < 3 && (
              <Text type="warning" style={{ display: 'block', marginTop: 16 }}>
                考试次数不足3次，无法进行完整的进步情况分析
              </Text>
            )}
          </Card>
        )}

        <Table
          dataSource={rankings}
          columns={rankingColumns}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: '暂无考试排名记录',
          }}
        />
      </Card>
    </div>
  );
};

export default StudentRanking;
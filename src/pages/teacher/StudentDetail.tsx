import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Descriptions, Table, Tag, message, Tabs, Space, Divider, Input, Modal, Form, Select } from 'antd';
import { LeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { studentApi, rankingApi, standardApi, violationApi } from '../../services/api';
import { Student, ExamRanking, Standard, Violation } from '../../types';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [rankings, setRankings] = useState<ExamRanking[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingViolationModalVisible, setAddingViolationModalVisible] = useState(false);
  const [violationForm] = Form.useForm();
  const [rankingAnalysis, setRankingAnalysis] = useState<{
    comparisonResult: string;
    continuousDecline: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // 获取学生基本信息
        const studentResponse = await studentApi.getById(id);
        if (studentResponse.success) {
          setStudent(studentResponse.data);
        } else {
          message.error('获取学生信息失败');
        }

        // 获取学生的考试排名
        const rankingResponse = await rankingApi.getByStudentId(id);
        if (rankingResponse.success) {
          setRankings(rankingResponse.data);
        }

        // 获取学生的标准设置
        const standardResponse = await standardApi.getByStudentId(id);
        if (standardResponse.success) {
          setStandards(standardResponse.data);
        }

        // 获取学生的违规记录
        const violationResponse = await violationApi.getByStudentId(id);
        if (violationResponse.success) {
          setViolations(violationResponse.data);
        }

        // 分析排名进步情况
    if (rankingResponse.success && rankingResponse.data.length >= 3) {
      const sortedRankings = [...rankingResponse.data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      analyzeRankingProgress(sortedRankings);
    }
      } catch (error) {
        message.error('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 处理返回按钮点击
  const handleBack = () => {
    navigate('/teacher/students');
  };

  // 分析排名进步情况
  const analyzeRankingProgress = (sortedRankings: ExamRanking[]) => {
    if (sortedRankings.length < 3) {
      setRankingAnalysis(null);
      return;
    }

    const latestRanking = sortedRankings[0];
    const previousRankings = sortedRankings.slice(1, 3);
    const bestPreviousRanking = Math.min(...previousRankings.map(r => r.ranking));

    const difference = bestPreviousRanking - latestRanking.ranking;
    let comparisonResult: string;

    if (difference > 0) {
      comparisonResult = `进步了${difference}名`;
    } else if (difference < 0) {
      comparisonResult = `退步了${Math.abs(difference)}名`;
    } else {
      comparisonResult = '排名不变';
    }

    // 检查是否连续退步三次
    // 按时间顺序检查：最早的排名在前，最新的排名在后
    const timeOrderedRankings = [...sortedRankings].reverse();
    const continuousDecline = timeOrderedRankings.slice(0, 3).every((ranking, index, array) => {
      if (index === 0) return true;
      return ranking.ranking > array[index - 1].ranking;
    });

    setRankingAnalysis({
      comparisonResult,
      continuousDecline
    });
  };

  // 防抖函数
  const debounce = (func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // 处理标准值实时保存
  const handleStandardChange = useCallback(debounce(async (standardId: string, field: string, value: any) => {
    try {
      const response = await standardApi.update(standardId, { [field]: value });
      if (response.success) {
        message.success('标准更新成功');
        setStandards(prevStandards => 
          prevStandards.map(s => 
            s.id === standardId ? response.data : s
          )
        );
      } else {
        message.error('标准更新失败');
      }
    } catch (error) {
      message.error('更新失败：' + (error as Error).message);
    }
  }, 500), []);


  // 处理添加违规记录
  const handleAddViolation = async () => {
    if (!id) return;

    try {
      const values = await violationForm.validateFields();
      const response = await violationApi.create({
        studentId: id,
        type: values.type,
        violationDate: values.violationDate
      });
      if (response.success) {
        message.success('违规记录添加成功');
        setAddingViolationModalVisible(false);
        violationForm.resetFields();
        // 重新获取违规记录
        if (id) {
          const violationResponse = await violationApi.getByStudentId(id);
          if (violationResponse.success) {
            setViolations(violationResponse.data);
          }
        }
      } else {
        message.error('违规记录添加失败');
      }
    } catch (error) {
      message.error('表单验证失败');
    }
  };

  // 处理删除违规记录
  const handleDeleteViolation = async (violationId: string) => {
    try {
      const response = await violationApi.delete(violationId);
      if (response.success) {
        message.success('违规记录删除成功');
        setViolations(prevViolations => 
          prevViolations.filter(v => v.id !== violationId)
        );
      } else {
        message.error('违规记录删除失败');
      }
    } catch (error) {
      message.error('删除违规记录时出错');
    }
  };

  // 考试排名表格列
  const rankingColumns = [
    {
      title: '考试名称',
      dataIndex: 'examName',
      key: 'examName',
    },
    {
      title: '排名',
      dataIndex: 'ranking',
      key: 'ranking',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  // 标准设置表格列
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
      render: (_: any, record: Standard) => (
        <Input
          type="number"
          value={record.value}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            // 先更新本地状态，提供即时反馈
            setStandards(prevStandards => 
              prevStandards.map(s => 
                s.id === record.id ? { ...s, value } : s
              )
            );
            // 延迟保存到服务器
            handleStandardChange(record.id, 'value', value);
          }}
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },

  ];

  // 违规记录表格列
  const violationColumns = [
    {
      title: '违规类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '违规日期',
      dataIndex: 'violationDate',
      key: 'violationDate',
    },
    {
      title: '记录时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Violation) => (
        <Space size="middle">
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteViolation(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<LeftOutlined />} onClick={handleBack}>
          返回学生列表
        </Button>
        <Title level={4}>学生详情</Title>
      </Space>

      {loading ? (
        <div>加载中...</div>
      ) : student ? (
        <div>
          {/* 学生基本信息 */}
          <Card style={{ marginBottom: 16 }}>
            <Descriptions title="基本信息" column={2}>
              <Descriptions.Item label="班级">{student.class}</Descriptions.Item>
              <Descriptions.Item label="姓名">{student.name}</Descriptions.Item>
              <Descriptions.Item label="学号">{student.studentId}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(student.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(student.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 详细信息标签页 */}
          <Tabs defaultActiveKey="rankings">
            {/* 考试排名 */}
            <TabPane tab="考试排名" key="rankings">
              {/* 排名进步情况分析 */}
              {rankingAnalysis && (
                <Card style={{ marginBottom: 16 }}>
                  <Descriptions title="排名进步情况分析" column={1}>
                    <Descriptions.Item label="分析结果">
                      <span>{rankingAnalysis.comparisonResult}</span>
                      {rankingAnalysis.continuousDecline && (
                        <Tag color="error" style={{ marginLeft: 8 }}>
                          连续退步
                        </Tag>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
              <Table
                columns={rankingColumns}
                dataSource={rankings}
                rowKey="id"
                locale={{
                  emptyText: '暂无考试排名数据',
                }}
              />
            </TabPane>

            {/* 标准设置 */}
            <TabPane tab="标准设置" key="standards">
              <Table
                columns={standardColumns}
                dataSource={standards}
                rowKey="id"
                locale={{
                  emptyText: '暂无标准设置数据',
                }}
              />
            </TabPane>

            {/* 违规记录 */}
            <TabPane tab="违规记录" key="violations">
              <Space style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={() => setAddingViolationModalVisible(true)}
                >
                  新增违规记录
                </Button>
              </Space>
              <Table
                columns={violationColumns}
                dataSource={violations}
                rowKey="id"
                locale={{
                  emptyText: '暂无违规记录数据',
                }}
              />
            </TabPane>
          </Tabs>



          {/* 添加违规记录模态框 */}
          <Modal
            title="新增违规记录"
            open={addingViolationModalVisible}
            onCancel={() => {
              setAddingViolationModalVisible(false);
              violationForm.resetFields();
            }}
            footer={[
              <Button key="cancel" onClick={() => {
                setAddingViolationModalVisible(false);
                violationForm.resetFields();
              }}>
                取消
              </Button>,
              <Button 
                key="save" 
                type="primary" 
                onClick={handleAddViolation}
              >
                保存
              </Button>,
            ]}
          >
            <Form
              form={violationForm}
              layout="vertical"
            >
              <Form.Item
                name="type"
                label="违规类型"
                rules={[{ required: true, message: '请输入违规类型' }]}
              >
                <Input placeholder="请输入违规类型" />
              </Form.Item>
              <Form.Item
                name="violationDate"
                label="违规日期"
                rules={[{ required: true, message: '请选择违规日期' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      ) : (
        <div>
          <Paragraph>未找到学生信息</Paragraph>
          <Button type="primary" icon={<LeftOutlined />} onClick={handleBack}>
            返回学生列表
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
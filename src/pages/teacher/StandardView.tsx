import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Table, 
  Select, 
  Input, 
  Space, 
  Typography, 
  Spin, 
  Alert,
  Tag,
  Button,
  message,
  Checkbox,
  Modal,
  InputNumber,
  Popconfirm
} from 'antd';
import { SearchOutlined, EditOutlined, SaveOutlined, UndoOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { studentManagementApi, standardApi, classApi } from '../../services/api';
import { Student, Standard } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const StandardView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [editingStandards, setEditingStandards] = useState<Record<string, number>>({});
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [batchStandardType, setBatchStandardType] = useState<string>('');
  const [batchStandardValue, setBatchStandardValue] = useState<number>(3);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isClassSelected, setIsClassSelected] = useState(false);

  // 获取班级列表
  const fetchClasses = async () => {
    try {
      const response = await classApi.getAll();
      if (response.success) {
        // 提取班级名称数组
        setClasses(response.data.map(cls => cls.name));
      }
    } catch (err) {
      console.error('获取班级列表失败:', err);
    }
  };

  // 获取学生和标准数据
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, standardsRes] = await Promise.all([
        studentManagementApi.getAll(),
        standardApi.getAll()
      ]);
      
      if (studentsRes.success && standardsRes.success) {
        setStudents(studentsRes.data);
        setStandards(standardsRes.data);
        // 重置选择状态
        setSelectedStudents([]);
        setIsAllSelected(false);
        setIsClassSelected(false);
      } else {
        setError('获取数据失败');
      }
    } catch (err) {
      setError('获取数据时发生错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchData();
  }, []);

  // 筛选学生
  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchClass = selectedClass ? student.class === selectedClass : true;
      const matchSearch = searchText ? 
        student.name.includes(searchText) || 
        student.studentId.includes(searchText) : 
        true;
      return matchClass && matchSearch;
    });
  };

  // 获取所有标准名称
  const getStandardNames = useMemo(() => {
    const standardNames = new Set(standards.map(standard => standard.name));
    return Array.from(standardNames);
  }, [standards]);

  // 获取学生的标准
  const getStudentStandards = (studentId: string) => {
    return standards.filter(standard => standard.studentId === studentId);
  };

  // 获取学生特定标准的值
  const getStudentStandardValue = (studentId: string, standardName: string) => {
    const standard = standards.find(s => s.studentId === studentId && s.name === standardName);
    return standard ? standard.value : null;
  };

  // 生成表格数据
  const generateTableData = () => {
    const filteredStudents = getFilteredStudents();
    return filteredStudents.map(student => {
      const studentStandards = getStudentStandards(student.id);
      const standardValues: Record<string, number | null> = {};
      
      getStandardNames.forEach(name => {
        standardValues[name] = getStudentStandardValue(student.id, name);
      });
      
      return {
        key: student.id,
        class: student.class,
        name: student.name,
        studentId: student.studentId,
        standards: studentStandards,
        standardValues
      };
    });
  };

  // 处理班级筛选变化
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setIsClassSelected(false);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // 重置筛选
  const handleReset = () => {
    setSelectedClass('');
    setSearchText('');
    setIsAllSelected(false);
    setIsClassSelected(false);
    setSelectedStudents([]);
  };

  // 处理单个学生选择
  const handleStudentSelect = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    const filteredStudents = getFilteredStudents();
    if (checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
      setIsAllSelected(true);
      setIsClassSelected(false);
    } else {
      setSelectedStudents([]);
      setIsAllSelected(false);
      setIsClassSelected(false);
    }
  };

  // 处理按班级选择
  const handleSelectByClass = (checked: boolean) => {
    if (!selectedClass) {
      message.warning('请先选择班级');
      return;
    }
    
    const filteredStudents = getFilteredStudents();
    if (checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
      setIsClassSelected(true);
      setIsAllSelected(false);
    } else {
      setSelectedStudents([]);
      setIsClassSelected(false);
      setIsAllSelected(false);
    }
  };

  // 处理标准值编辑
  const handleStandardEdit = (studentId: string, standardName: string, value: number) => {
    // 这里应该调用API更新标准值
    // 暂时只更新本地状态
    setEditingStandards(prev => ({
      ...prev,
      [`${studentId}-${standardName}`]: value
    }));
    
    // 模拟API调用
    setTimeout(() => {
      const updatedStandards = standards.map(standard => {
        if (standard.studentId === studentId && standard.name === standardName) {
          return { ...standard, value };
        }
        return standard;
      });
      setStandards(updatedStandards);
      message.success('标准值已更新');
    }, 300);
  };

  // 处理批量修改
  const handleBatchModify = () => {
    if (selectedStudents.length === 0) {
      message.warning('请先选择学生');
      return;
    }
    
    if (!batchStandardType) {
      message.warning('请选择标准类型');
      return;
    }
    
    // 这里应该调用API批量更新标准值
    // 暂时只更新本地状态
    const updatedStandards = [...standards];
    
    selectedStudents.forEach(studentId => {
      const standardIndex = updatedStandards.findIndex(
        s => s.studentId === studentId && s.name === batchStandardType
      );
      
      if (standardIndex >= 0) {
        updatedStandards[standardIndex] = {
          ...updatedStandards[standardIndex],
          value: batchStandardValue
        };
      }
    });
    
    setStandards(updatedStandards);
    setBatchModalVisible(false);
    message.success(`已批量更新 ${selectedStudents.length} 名学生的标准值`);
  };

  // 生成表格列
  const generateColumns = () => {
    const columns = [
      {
        title: (
          <Checkbox 
            checked={isAllSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            选择
          </Checkbox>
        ),
        key: 'selection',
        width: 60,
        render: (_: any, record: any) => (
          <Checkbox
            checked={selectedStudents.includes(record.key)}
            onChange={(e) => handleStudentSelect(record.key, e.target.checked)}
          />
        )
      },
      {
        title: '班级',
        dataIndex: 'class',
        key: 'class',
        width: 100
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: 100
      },
      {
        title: '学号',
        dataIndex: 'studentId',
        key: 'studentId',
        width: 120
      }
    ];
    
    // 动态生成标准名称列
    getStandardNames.forEach(standardName => {
      columns.push({
        title: standardName,
        key: standardName,
        width: 120,
        render: (_: any, record: any) => {
          const value = record.standardValues[standardName];
          if (value === null) {
            return <Text type="secondary">无</Text>;
          }
          return (
            <InputNumber
              min={1}
              max={5}
              value={value}
              onChange={(newValue) => {
                if (newValue !== null) {
                  handleStandardEdit(record.key, standardName, newValue);
                }
              }}
              style={{ width: 80 }}
            />
          );
        }
      });
    });
    
    return columns;
  };

  const filteredStudents = getFilteredStudents();

  return (
    <Card
      title={
        <Space size="middle">
          <Title level={4}>学生标准查看</Title>
          <Space size="middle">
            <Select
              placeholder="选择班级"
              style={{ width: 150 }}
              value={selectedClass}
              onChange={handleClassChange}
            >
              <Option value="">全部班级</Option>
              {classes.map(className => (
                <Option key={className} value={className}>
                  {className}
                </Option>
              ))}
            </Select>
            <Search
              placeholder="搜索学生姓名或学号"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: 250 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button onClick={handleReset}>重置</Button>
            {selectedClass && (
              <Checkbox
                checked={isClassSelected}
                onChange={(e) => handleSelectByClass(e.target.checked)}
              >
                选择当前班级
              </Checkbox>
            )}
            {selectedStudents.length > 0 && (
              <Button 
                type="primary" 
                onClick={() => setBatchModalVisible(true)}
              >
                批量修改
              </Button>
            )}
          </Space>
        </Space>
      }
      extra={
        <Text type="secondary">
          共 {filteredStudents.length} 名学生，已选择 {selectedStudents.length} 名
        </Text>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: 16 }}>加载数据中...</Text>
        </div>
      ) : (
        <>
          {filteredStudents.length === 0 ? (
            <Alert 
              message="提示" 
              description="暂无学生数据" 
              type="info" 
              showIcon 
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={generateColumns()}
                dataSource={generateTableData()}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50']
                }}
                scroll={{ x: 1000 }}
              />
            </div>
          )}
        </>
      )}

      {/* 批量修改弹窗 */}
      <Modal
        title="批量修改标准值"
        open={batchModalVisible}
        onOk={handleBatchModify}
        onCancel={() => setBatchModalVisible(false)}
      >
        <div style={{ marginBottom: 16 }}>
          <Text style={{ display: 'block', marginBottom: 8 }}>选择标准类型：</Text>
          <Select
            placeholder="选择标准类型"
            style={{ width: '100%' }}
            value={batchStandardType}
            onChange={setBatchStandardType}
          >
            {getStandardNames.map(name => (
              <Option key={name} value={name}>
                {name}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text style={{ display: 'block', marginBottom: 8 }}>设置标准值（1-5）：</Text>
          <InputNumber
            min={1}
            max={5}
            value={batchStandardValue}
            onChange={setBatchStandardValue}
            style={{ width: '100%' }}
          />
        </div>
        <Text type="secondary">
          将为 {selectedStudents.length} 名选中的学生设置标准值
        </Text>
      </Modal>
    </Card>
  );
};

export default StandardView;
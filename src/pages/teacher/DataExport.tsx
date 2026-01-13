import React, { useState } from 'react';
import { Button, Card, Spin, message, Alert } from 'antd';
import { DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { exportApi } from '../../services/api';

const DataExport: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  // 导出完整数据包
  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await exportApi.exportData();
      
      if (response.success) {
        const data = response.data;
        
        // 将数据转换为JSON字符串
        const jsonString = JSON.stringify(data, null, 2);
        
        // 创建Blob对象
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `student-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        
        // 触发下载
        link.click();
        
        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        message.success('数据导出成功');
      } else {
        message.error('数据导出失败：' + response.message);
      }
    } catch (error) {
      message.error('数据导出失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>数据导出</h1>
      
      <Card title="导出完整数据包" style={{ marginBottom: '20px' }}>
        <Alert
          message="导出说明"
          description="点击下方按钮导出完整的学生数据数据包，包括学生信息、考试排名、标准设置和违规记录。导出的JSON文件可用于学生端静态网站的数据展示。"
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        
        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          onClick={handleExportData}
          loading={loading}
          style={{ width: '200px' }}
        >
          一键导出数据
        </Button>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <InfoCircleOutlined style={{ marginRight: '5px' }} />
          导出的数据格式为JSON，包含以下内容：
          <ul style={{ marginTop: '10px', marginLeft: '24px' }}>
            <li>学生基本信息</li>
            <li>考试排名记录</li>
            <li>标准设置数据</li>
            <li>违规记录信息</li>
          </ul>
        </div>
      </Card>
      
      <Card title="使用说明" style={{ marginTop: '20px' }}>
        <h3>数据导出后使用方法：</h3>
        <ol style={{ marginTop: '10px', marginLeft: '24px' }}>
          <li>将导出的JSON文件重命名为<code>data.json</code></li>
          <li>将该文件放置在学生端静态网站的根目录下</li>
          <li>学生端网站将自动加载该数据文件并展示相关信息</li>
        </ol>
      </Card>
    </div>
  );
};

export default DataExport;
/**
 * 渠道列表页面
 */
import { useState, useCallback } from 'react';
import { Card, Button, Space, Modal, message, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ChannelTable } from '../components/ChannelTable';
import { ChannelFilters, type FilterValues } from '../components/ChannelFilters';
import type { Channel, ChannelListResponse } from '../types/channel';

// 模拟数据
const mockChannels: Channel[] = [
  {
    id: '1',
    code: 'WECHAT_PAY',
    name: '微信支付',
    providerId: 'p1',
    providerName: '财付通',
    type: 'payment',
    status: 'active',
    healthStatus: 'healthy',
    priority: 100,
    config: { app_id: 'wx123456', mch_id: '1234567890' },
    limits: { minAmount: 0.01, maxAmount: 50000, dailyLimit: 1000000 },
    stats: { successRate24h: 0.985, avgResponseMs: 120, transactionCount24h: 5230 },
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
  },
  {
    id: '2',
    code: 'ALIPAY',
    name: '支付宝',
    providerId: 'p2',
    providerName: '支付宝',
    type: 'payment',
    status: 'active',
    healthStatus: 'healthy',
    priority: 90,
    config: { app_id: '2024xxx', alipay_public_key: 'xxx' },
    limits: { minAmount: 0.01, maxAmount: 100000, dailyLimit: 2000000 },
    stats: { successRate24h: 0.992, avgResponseMs: 95, transactionCount24h: 8156 },
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-03T09:30:00Z',
  },
  {
    id: '3',
    code: 'UNION_PAY',
    name: '银联快捷',
    providerId: 'p3',
    providerName: '中国银联',
    type: 'combined',
    status: 'maintenance',
    healthStatus: 'degraded',
    priority: 80,
    config: { merchant_id: '777xxx', secure_key: 'xxx' },
    limits: { minAmount: 1, maxAmount: 500000 },
    stats: { successRate24h: 0.0, avgResponseMs: 0, transactionCount24h: 0 },
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-02-03T08:00:00Z',
  },
];

const mockProviders = [
  { id: 'p1', name: '财付通' },
  { id: 'p2', name: '支付宝' },
  { id: 'p3', name: '中国银联' },
];

interface ChannelListPageProps {
  onCreate?: () => void;
  onView?: (channel: Channel) => void;
  onEdit?: (channel: Channel) => void;
}

export function ChannelListPage({ onCreate, onView, onEdit }: ChannelListPageProps) {
  const [loading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Channel[]>([]);
  const [filters, setFilters] = useState<FilterValues>({});

  // 筛选数据
  const filteredData = mockChannels.filter(channel => {
    if (filters.keyword && !channel.code.toLowerCase().includes(filters.keyword.toLowerCase()) && 
        !channel.name.toLowerCase().includes(filters.keyword.toLowerCase())) {
      return false;
    }
    if (filters.status && channel.status !== filters.status) {
      return false;
    }
    if (filters.providerId && channel.providerId !== filters.providerId) {
      return false;
    }
    if (filters.type && channel.type !== filters.type) {
      return false;
    }
    return true;
  });

  const handleSearch = useCallback((values: FilterValues) => {
    setFilters(values);
  }, []);

  const handleReset = useCallback(() => {
    setFilters({});
  }, []);

  const handleDelete = useCallback((channel: Channel) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除渠道 "${channel.name}" 吗？此操作不可恢复。`,
      onOk() {
        message.success('删除成功');
      },
    });
  }, []);

  const handleToggleStatus = useCallback((channel: Channel) => {
    const newStatus = channel.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? '启用' : '禁用';
    
    Modal.confirm({
      title: `确认${actionText}`,
      content: `确定要${actionText}渠道 "${channel.name}" 吗？`,
      onOk() {
        message.success(`${actionText}成功`);
      },
    });
  }, []);

  const handleBatchDelete = useCallback(() => {
    if (selectedRows.length === 0) return;
    
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRows.length} 个渠道吗？`,
      onOk() {
        message.success('批量删除成功');
        setSelectedRows([]);
      },
    });
  }, [selectedRows]);

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 筛选栏 */}
        <ChannelFilters
          providers={mockProviders}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        {/* 批量操作栏 */}
        {selectedRows.length > 0 && (
          <Alert
            message={`已选择 ${selectedRows.length} 项`}
            type="info"
            action={
              <Space>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDelete}
                >
                  批量删除
                </Button>
              </Space>
            }
          />
        )}

        {/* 工具栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            创建渠道
          </Button>
        </div>

        {/* 表格 */}
        <ChannelTable
          data={filteredData}
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onView={onView}
          onEdit={onEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onRowSelectionChange={(keys, rows) => setSelectedRows(rows)}
        />
      </Space>
    </Card>
  );
}

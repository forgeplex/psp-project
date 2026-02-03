/**
 * 路由策略列表页
 * 支持拖拽排序 (v1.0: POST /:id/move)
 */
import { useState, useCallback } from 'react';
import { Card, Button, Space, Modal, message, Alert, Typography } from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { RoutingStrategyTable } from '../components/routing/RoutingStrategyTable';
import type { RoutingStrategy, Channel } from '../types/channel';

const { Text } = Typography;

// 模拟数据
const mockStrategies: RoutingStrategy[] = [
  {
    id: 's1',
    name: '中国地区小额支付',
    priority: 1,
    conditions: {
      amountMin: 0.01,
      amountMax: 1000,
      countries: ['CN'],
    },
    targetChannelIds: ['1', '2'],
    channelWeights: { '1': 60, '2': 40 },
    isActive: true,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-03T10:00:00Z',
  },
  {
    id: 's2',
    name: '巴西 PIX 支付',
    priority: 2,
    conditions: {
      currencies: ['BRL'],
      countries: ['BR'],
    },
    targetChannelIds: ['4'],
    channelWeights: { '4': 100 },
    isActive: true,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-02-03T09:00:00Z',
  },
  {
    id: 's3',
    name: '大额支付兜底',
    priority: 3,
    conditions: {
      amountMin: 50000,
    },
    targetChannelIds: ['2'],
    channelWeights: { '2': 100 },
    isActive: false,
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-02-03T08:00:00Z',
  },
];

interface RoutingStrategyListPageProps {
  channels: Channel[];
  onCreate?: () => void;
  onEdit?: (strategy: RoutingStrategy) => void;
}

export function RoutingStrategyListPage({
  channels,
  onCreate,
  onEdit,
}: RoutingStrategyListPageProps) {
  const [loading] = useState(false);
  const [strategies, setStrategies] = useState<RoutingStrategy[]>(mockStrategies);

  const handleDelete = useCallback((strategy: RoutingStrategy) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除策略 "${strategy.name}" 吗？`,
      onOk() {
        setStrategies(prev => prev.filter(s => s.id !== strategy.id));
        message.success('删除成功');
      },
    });
  }, []);

  const handleToggleActive = useCallback((strategy: RoutingStrategy, active: boolean) => {
    setStrategies(prev =>
      prev.map(s =>
        s.id === strategy.id ? { ...s, isActive: active } : s
      )
    );
    message.success(active ? '已启用' : '已禁用');
  }, []);

  // v1.0: 拖拽后调用 POST /:id/move 交换优先级
  const handleMove = useCallback((dragId: string, targetId: string) => {
    // 这里应该调用 API: POST /routing-strategies/${dragId}/move
    // body: { targetId }
    console.log('Move', dragId, 'to', targetId);
    
    // 本地模拟交换
    setStrategies(prev => {
      const dragIndex = prev.findIndex(s => s.id === dragId);
      const targetIndex = prev.findIndex(s => s.id === targetId);
      if (dragIndex === -1 || targetIndex === -1) return prev;
      
      const newStrategies = [...prev];
      const dragItem = newStrategies[dragIndex];
      const targetItem = newStrategies[targetIndex];
      
      // 交换优先级
      const tempPriority = dragItem.priority;
      dragItem.priority = targetItem.priority;
      targetItem.priority = tempPriority;
      
      // 重新排序
      return newStrategies.sort((a, b) => a.priority - b.priority);
    });
    
    message.success('排序已更新');
  }, []);

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 说明提示 */}
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message="路由策略说明"
          description={
            <>
              <Text>策略按优先级顺序匹配，第一个满足条件的策略将被使用。</Text>
              <br />
              <Text>拖拽行可调整优先级（数值越小优先级越高）。</Text>
            </>
          }
        />

        {/* 工具栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div />
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
            创建策略
          </Button>
        </div>

        {/* 策略表格 */}
        <RoutingStrategyTable
          data={strategies}
          loading={loading}
          onEdit={onEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onMove={handleMove}
        />
      </Space>
    </Card>
  );
}

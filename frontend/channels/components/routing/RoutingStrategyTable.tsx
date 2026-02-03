/**
 * 路由策略表格组件
 * 支持拖拽排序 (v1.0: POST /:id/move)
 */
import { Table, Space, Button, Switch, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { RoutingStrategy } from '../../types/channel';

interface RoutingStrategyTableProps {
  data: RoutingStrategy[];
  loading?: boolean;
  onEdit?: (strategy: RoutingStrategy) => void;
  onDelete?: (strategy: RoutingStrategy) => void;
  onToggleActive?: (strategy: RoutingStrategy, active: boolean) => void;
  onMove?: (dragId: string, targetId: string) => void; // v1.0 move API
}

export function RoutingStrategyTable({
  data,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
}: RoutingStrategyTableProps) {
  const columns: TableProps<RoutingStrategy>['columns'] = [
    {
      title: '',
      key: 'drag',
      width: 40,
      render: () => <HolderOutlined style={{ cursor: 'grab', color: '#999' }} />,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
    },
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '匹配条件',
      key: 'conditions',
      render: (_, record) => {
        const conditions = record.conditions;
        const items: string[] = [];
        if (conditions.amountMin !== undefined || conditions.amountMax !== undefined) {
          const min = conditions.amountMin !== undefined ? `≥${conditions.amountMin}` : '';
          const max = conditions.amountMax !== undefined ? `≤${conditions.amountMax}` : '';
          items.push(`金额 ${min}${min && max ? '且' : ''}${max}`);
        }
        if (conditions.currencies?.length) {
          items.push(`币种: ${conditions.currencies.join(', ')}`);
        }
        if (conditions.countries?.length) {
          items.push(`国家: ${conditions.countries.join(', ')}`);
        }
        if (conditions.merchantIds?.length) {
          items.push(`商户: ${conditions.merchantIds.length}个`);
        }
        return (
          <Space size={[4, 4]} wrap>
            {items.length === 0 ? <Tag>无限制</Tag> : items.map((item, i) => (
              <Tag key={i} size="small">{item}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '目标渠道',
      key: 'targetChannels',
      render: (_, record) => (
        <Space size={[4, 4]} wrap>
          {record.targetChannelIds.length > 0 ? (
            record.targetChannelIds.map((id, i) => (
              <Tag key={i} size="small" color="blue">{id}</Tag>
            ))
          ) : (
            <Tag size="small">未配置</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => onToggleActive?.(record, checked)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
            title="编辑"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete?.(record)}
            title="删除"
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={false} // 策略列表通常不分页
      scroll={{ x: 1000 }}
      rowClassName={() => 'drag-handle'}
    />
  );
}

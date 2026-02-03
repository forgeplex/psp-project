/**
 * 渠道表格组件
 */
import { Table, Space, Button, Dropdown, Progress } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { Channel } from '../types/channel';
import { ChannelStatusBadge } from './ChannelStatusBadge';
import { HealthIndicator } from './HealthIndicator';
import { ChannelTypeTag } from './ChannelTypeTag';

interface ChannelTableProps {
  data: Channel[];
  loading?: boolean;
  pagination?: TableProps<Channel>['pagination'];
  onView?: (channel: Channel) => void;
  onEdit?: (channel: Channel) => void;
  onDelete?: (channel: Channel) => void;
  onToggleStatus?: (channel: Channel) => void;
  onRowSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: Channel[]) => void;
}

export function ChannelTable({
  data,
  loading,
  pagination,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onRowSelectionChange,
}: ChannelTableProps) {
  const columns: TableProps<Channel>['columns'] = [
    {
      title: '状态',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
      width: 100,
      render: (_, record) => (
        <HealthIndicator status={record.healthStatus} lastCheckedAt={record.updatedAt} />
      ),
    },
    {
      title: '渠道编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code, record) => (
        <Button type="link" onClick={() => onView?.(record)}>
          {code}
        </Button>
      ),
    },
    {
      title: '渠道名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '提供商',
      dataIndex: 'providerName',
      key: 'providerName',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <ChannelTypeTag type={type} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <ChannelStatusBadge status={status} />,
    },
    {
      title: '24h成功率',
      dataIndex: ['stats', 'successRate24h'],
      key: 'successRate24h',
      width: 120,
      render: (rate) => (
        <Progress
          percent={Math.round((rate || 0) * 100)}
          size="small"
          status={rate && rate < 0.9 ? 'exception' : 'success'}
        />
      ),
    },
    {
      title: '响应时间',
      dataIndex: ['stats', 'avgResponseMs'],
      key: 'avgResponseMs',
      width: 100,
      render: (ms) => (ms ? `${ms}ms` : '-'),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      sorter: (a, b) => a.priority - b.priority,
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
            icon={<EyeOutlined />}
            onClick={() => onView?.(record)}
            title="查看"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
            title="编辑"
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'toggle',
                  label: record.status === 'active' ? '禁用' : '启用',
                  onClick: () => onToggleStatus?.(record),
                },
                {
                  key: 'delete',
                  label: '删除',
                  danger: true,
                  icon: <DeleteOutlined />,
                  onClick: () => onDelete?.(record),
                },
              ],
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const rowSelection: TableProps<Channel>['rowSelection'] = onRowSelectionChange
    ? {
        type: 'checkbox',
        onChange: onRowSelectionChange,
      }
    : undefined;

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      rowSelection={rowSelection}
      scroll={{ x: 1200 }}
    />
  );
}

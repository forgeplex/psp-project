'use client';

import React, { useState } from 'react';
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Badge,
  Slider,
  Row,
  Col,
  Tooltip,
  Dropdown,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  SettingOutlined,
  MoreOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

// Types based on API Spec v0.9
type ChannelStatus = 'active' | 'inactive' | 'error' | 'maintenance';
type HealthStatus = 'healthy' | 'warning' | 'critical' | 'offline';
type ProviderType = 'stripe' | 'adyen' | 'pix' | 'spei' | 'upi';

interface Channel {
  id: string;
  name: string;
  provider: ProviderType;
  status: ChannelStatus;
  healthStatus: HealthStatus;
  weight: number;
  successRate: number;
  avgResponseMs: number;
  amountMin: number;
  amountMax: number;
  currency: string[];
  createdAt: string;
}

// Mock data
const mockChannels: Channel[] = [
  {
    id: 'ch-001',
    name: 'Stripe Global',
    provider: 'stripe',
    status: 'active',
    healthStatus: 'healthy',
    weight: 80,
    successRate: 98.5,
    avgResponseMs: 245,
    amountMin: 100,
    amountMax: 1000000,
    currency: ['USD', 'EUR', 'GBP'],
    createdAt: '2024-01-15T08:30:00Z',
  },
  {
    id: 'ch-002',
    name: 'Adyen Europe',
    provider: 'adyen',
    status: 'active',
    healthStatus: 'healthy',
    weight: 60,
    successRate: 99.2,
    avgResponseMs: 189,
    amountMin: 500,
    amountMax: 500000,
    currency: ['EUR', 'GBP', 'CHF'],
    createdAt: '2024-01-20T10:15:00Z',
  },
  {
    id: 'ch-003',
    name: 'Pix Brazil',
    provider: 'pix',
    status: 'maintenance',
    healthStatus: 'warning',
    weight: 40,
    successRate: 85.3,
    avgResponseMs: 567,
    amountMin: 1000,
    amountMax: 100000,
    currency: ['BRL'],
    createdAt: '2024-02-01T14:20:00Z',
  },
  {
    id: 'ch-004',
    name: 'SPEI Mexico',
    provider: 'spei',
    status: 'inactive',
    healthStatus: 'offline',
    weight: 0,
    successRate: 0,
    avgResponseMs: 0,
    amountMin: 100,
    amountMax: 50000,
    currency: ['MXN'],
    createdAt: '2024-02-10T09:45:00Z',
  },
  {
    id: 'ch-005',
    name: 'UPI India',
    provider: 'upi',
    status: 'error',
    healthStatus: 'critical',
    weight: 20,
    successRate: 45.7,
    avgResponseMs: 1200,
    amountMin: 100,
    amountMax: 200000,
    currency: ['INR'],
    createdAt: '2024-02-15T16:30:00Z',
  },
];

const providerOptions = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'adyen', label: 'Adyen' },
  { value: 'pix', label: 'Pix' },
  { value: 'spei', label: 'SPEI' },
  { value: 'upi', label: 'UPI' },
];

const statusOptions = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
  { value: 'maintenance', label: 'Maintenance', color: 'warning' },
  { value: 'error', label: 'Error', color: 'error' },
];

const healthStatusMap: Record<HealthStatus, { color: string; text: string }> = {
  healthy: { color: 'success', text: 'Healthy' },
  warning: { color: 'warning', text: 'Warning' },
  critical: { color: 'error', text: 'Critical' },
  offline: { color: 'default', text: 'Offline' },
};

export default function ChannelsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 1000000]);
  const [inputRange, setInputRange] = useState<[number, number]>([0, 1000000]);

  // Quick filter handlers
  const toggleProvider = (provider: string) => {
    setSelectedProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleSliderChange = (value: [number, number]) => {
    setAmountRange(value);
    setInputRange(value);
  };

  const handleInputChange = (index: 0 | 1, value: number | null) => {
    const newRange: [number, number] = [...inputRange] as [number, number];
    newRange[index] = value || 0;
    setInputRange(newRange);
    setAmountRange(newRange);
  };

  const columns: ColumnsType<Channel> = [
    {
      title: 'Channel',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Channel) => (
        <Space direction="vertical" size={0}>
          <a onClick={() => router.push(`/admin/channels/${record.id}`)}>
            {text}
          </a>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.provider.toUpperCase()} · {record.id}
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ChannelStatus) => {
        const option = statusOptions.find((o) => o.value === status);
        return <Badge status={option?.color as any} text={option?.label} />;
      },
    },
    {
      title: 'Health',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
      width: 120,
      render: (health: HealthStatus) => {
        const { color, text } = healthStatusMap[health];
        return <Badge status={color as any} text={text} />;
      },
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      render: (weight: number) => <Tag>{weight}%</Tag>,
    },
    {
      title: 'Success Rate',
      dataIndex: 'successRate',
      key: 'successRate',
      width: 120,
      render: (rate: number) => (
        <span style={{ color: rate >= 95 ? '#52c41a' : rate >= 80 ? '#faad14' : '#f5222d' }}>
          {rate.toFixed(1)}%
        </span>
      ),
    },
    {
      title: 'Avg Response',
      dataIndex: 'avgResponseMs',
      key: 'avgResponseMs',
      width: 130,
      render: (ms: number) => (ms > 0 ? `${ms}ms` : '-'),
    },
    {
      title: 'Amount Range',
      key: 'amountRange',
      width: 180,
      render: (_: any, record: Channel) => (
        <span>
          ${record.amountMin.toLocaleString()} - ${record.amountMax.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Currencies',
      dataIndex: 'currency',
      key: 'currency',
      width: 150,
      render: (currencies: string[]) => (
        <Space size={4}>
          {currencies.map((c) => (
            <Tag key={c} size="small">
              {c}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: any, record: Channel) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<LineChartOutlined />}
              onClick={() => router.push(`/admin/channels/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Settings">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => router.push(`/admin/channels/${record.id}/config`)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: '1', label: 'Test Connection' },
                { key: '2', label: record.status === 'active' ? 'Disable' : 'Enable' },
                { key: '3', label: 'View Logs' },
              ],
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Filter data
  const filteredData = mockChannels.filter((channel) => {
    if (searchText && !channel.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    if (selectedProviders.length > 0 && !selectedProviders.includes(channel.provider)) {
      return false;
    }
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(channel.status)) {
      return false;
    }
    if (
      channel.amountMin > amountRange[1] ||
      channel.amountMax < amountRange[0]
    ) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Channels</h2>
          <p style={{ color: '#8c8c8c', margin: 0 }}>
            Manage payment channels and their configurations
          </p>
        </div>

        {/* Quick Filter Bar - Providers */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>Provider:</span>
          <Space wrap>
            {providerOptions.map((opt) => (
              <Tag
                key={opt.value}
                color={selectedProviders.includes(opt.value) ? 'blue' : undefined}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleProvider(opt.value)}
              >
                {opt.label}
              </Tag>
            ))}
          </Space>
        </div>

        {/* Quick Filter Bar - Status */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>Status:</span>
          <Space wrap>
            {statusOptions.map((opt) => (
              <Tag
                key={opt.value}
                color={selectedStatuses.includes(opt.value) ? opt.color : undefined}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleStatus(opt.value)}
              >
                {opt.label}
              </Tag>
            ))}
          </Space>
        </div>

        {/* Search and Filter Row */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8} lg={6}>
            <Input
              placeholder="Search channels..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Select
              mode="multiple"
              placeholder="Filter by provider"
              style={{ width: '100%' }}
              options={providerOptions}
              value={selectedProviders}
              onChange={setSelectedProviders}
              allowClear
            />
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Select
              mode="multiple"
              placeholder="Filter by status"
              style={{ width: '100%' }}
              options={statusOptions}
              value={selectedStatuses}
              onChange={setSelectedStatuses}
              allowClear
            />
          </Col>
        </Row>

        {/* Amount Range Filter - Dual Slider + Input */}
        <Card
          size="small"
          title="Amount Range Filter"
          style={{ marginBottom: 24, background: '#fafafa' }}
        >
          <Row gutter={24} align="middle">
            <Col xs={24} md={6}>
              <Input.Number
                style={{ width: '100%' }}
                placeholder="Min Amount"
                value={inputRange[0]}
                onChange={(val) => handleInputChange(0, val)}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Col>
            <Col xs={24} md={12}>
              <Slider
                range
                min={0}
                max={1000000}
                step={1000}
                value={amountRange}
                onChange={handleSliderChange}
                tooltip={{ formatter: (val) => `$${val?.toLocaleString()}` }}
              />
            </Col>
            <Col xs={24} md={6}>
              <Input.Number
                style={{ width: '100%' }}
                placeholder="Max Amount"
                value={inputRange[1]}
                onChange={(val) => handleInputChange(1, val)}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Col>
          </Row>
        </Card>

        {/* Actions */}
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#8c8c8c' }}>
            Showing {filteredData.length} of {mockChannels.length} channels
          </span>
          <Space>
            <Button icon={<ReloadOutlined />}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              Add Channel
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} channels`,
          }}
        />
      </Card>
    </div>
  );
}

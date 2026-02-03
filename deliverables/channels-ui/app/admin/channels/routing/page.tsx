'use client';

import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Switch,
  Input,
  Modal,
  Form,
  Select,
  InputNumber,
  Tooltip,
  Alert,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SaveOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

// Types based on API Spec v0.9
interface RoutingStrategy {
  id: string;
  name: string;
  priority: number;
  conditions: RoutingConditions;
  targetChannels: string[];
  channelWeights: Record<string, number>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoutingConditions {
  amountMin?: number;
  amountMax?: number;
  currency?: string[];
  merchantId?: string[];
  country?: string[];
}

// Mock data
const mockStrategies: RoutingStrategy[] = [
  {
    id: 'rs-001',
    name: 'High Value - Stripe Priority',
    priority: 1,
    conditions: {
      amountMin: 10000,
      currency: ['USD', 'EUR'],
    },
    targetChannels: ['ch-001', 'ch-002'],
    channelWeights: { 'ch-001': 70, 'ch-002': 30 },
    isActive: true,
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-02-01T10:20:00Z',
  },
  {
    id: 'rs-002',
    name: 'Brazil Local - Pix Only',
    priority: 2,
    conditions: {
      country: ['BR'],
      currency: ['BRL'],
    },
    targetChannels: ['ch-003'],
    channelWeights: { 'ch-003': 100 },
    isActive: true,
    createdAt: '2024-01-20T14:15:00Z',
    updatedAt: '2024-01-25T09:45:00Z',
  },
  {
    id: 'rs-003',
    name: 'Mexico - SPEI Primary',
    priority: 3,
    conditions: {
      country: ['MX'],
      currency: ['MXN'],
    },
    targetChannels: ['ch-004'],
    channelWeights: { 'ch-004': 100 },
    isActive: false,
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-02T16:30:00Z',
  },
  {
    id: 'rs-004',
    name: 'India UPI - Low Amount',
    priority: 4,
    conditions: {
      country: ['IN'],
      currency: ['INR'],
      amountMax: 50000,
    },
    targetChannels: ['ch-005'],
    channelWeights: { 'ch-005': 100 },
    isActive: true,
    createdAt: '2024-02-05T09:20:00Z',
    updatedAt: '2024-02-05T09:20:00Z',
  },
  {
    id: 'rs-005',
    name: 'Default - All Regions',
    priority: 5,
    conditions: {},
    targetChannels: ['ch-001', 'ch-002', 'ch-003'],
    channelWeights: { 'ch-001': 50, 'ch-002': 30, 'ch-003': 20 },
    isActive: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-02-03T14:10:00Z',
  },
];

const channelMap: Record<string, string> = {
  'ch-001': 'Stripe Global',
  'ch-002': 'Adyen Europe',
  'ch-003': 'Pix Brazil',
  'ch-004': 'SPEI Mexico',
  'ch-005': 'UPI India',
};

export default function RoutingStrategiesPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<RoutingStrategy[]>(mockStrategies);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedStrategies, setEditedStrategies] = useState<RoutingStrategy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<RoutingStrategy | null>(null);
  const [form] = Form.useForm();

  const handleEditModeToggle = () => {
    if (isEditMode) {
      // Save changes
      setStrategies(editedStrategies);
      setIsEditMode(false);
      // TODO: Call API POST /routing-strategies/reorder
      console.log('Saving new order:', editedStrategies.map((s) => ({ id: s.id, priority: s.priority })));
    } else {
      // Enter edit mode
      setEditedStrategies([...strategies]);
      setIsEditMode(true);
    }
  };

  const moveStrategy = (index: number, direction: 'up' | 'down') => {
    const newStrategies = [...editedStrategies];
    if (direction === 'up' && index > 0) {
      [newStrategies[index], newStrategies[index - 1]] = [newStrategies[index - 1], newStrategies[index]];
    } else if (direction === 'down' && index < newStrategies.length - 1) {
      [newStrategies[index], newStrategies[index + 1]] = [newStrategies[index + 1], newStrategies[index]];
    }
    // Recalculate priorities
    const updated = newStrategies.map((s, i) => ({ ...s, priority: i + 1 }));
    setEditedStrategies(updated);
  };

  const handleToggleActive = (id: string) => {
    if (isEditMode) {
      setEditedStrategies((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
      );
    } else {
      setStrategies((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
      );
      // TODO: Call API to update status
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Strategy',
      content: 'Are you sure you want to delete this routing strategy?',
      onOk: () => {
        if (isEditMode) {
          setEditedStrategies((prev) => prev.filter((s) => s.id !== id));
        } else {
          setStrategies((prev) => prev.filter((s) => s.id !== id));
        }
      },
    });
  };

  const handleEdit = (strategy: RoutingStrategy) => {
    setEditingStrategy(strategy);
    form.setFieldsValue({
      name: strategy.name,
      amountMin: strategy.conditions.amountMin,
      amountMax: strategy.conditions.amountMax,
      currency: strategy.conditions.currency,
      country: strategy.conditions.country,
      targetChannels: strategy.targetChannels,
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingStrategy(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleSave = (values: any) => {
    console.log('Saving strategy:', values);
    setIsModalOpen(false);
    // TODO: Call API to create/update
  };

  const formatConditions = (conditions: RoutingConditions) => {
    const parts: string[] = [];
    if (conditions.amountMin !== undefined || conditions.amountMax !== undefined) {
      const min = conditions.amountMin || 0;
      const max = conditions.amountMax || '∞';
      parts.push(`Amount: $${min.toLocaleString()} - ${max === '∞' ? max : '$' + Number(max).toLocaleString()}`);
    }
    if (conditions.currency?.length) {
      parts.push(`Currency: ${conditions.currency.join(', ')}`);
    }
    if (conditions.country?.length) {
      parts.push(`Country: ${conditions.country.join(', ')}`);
    }
    return parts.length ? parts.join(' | ') : 'No conditions (matches all)';
  };

  const displayStrategies = isEditMode ? editedStrategies : strategies;

  const columns: ColumnsType<RoutingStrategy> = [
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: number) => <Badge count={priority} style={{ backgroundColor: '#1890ff' }} />,
    },
    {
      title: 'Strategy Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: RoutingStrategy) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.id}</div>
        </div>
      ),
    },
    {
      title: 'Conditions',
      key: 'conditions',
      render: (_: any, record: RoutingStrategy) => (
        <Tooltip title={formatConditions(record.conditions)}>
          <span
            style={{
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            {formatConditions(record.conditions)}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Target Channels',
      key: 'targetChannels',
      render: (_: any, record: RoutingStrategy) => (
        <Space wrap>
          {record.targetChannels.map((chId) => (
            <Tag key={chId} color="blue">
              {channelMap[chId] || chId}
              {record.channelWeights[chId] && ` (${record.channelWeights[chId]}%)`}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: RoutingStrategy) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: isEditMode ? 180 : 120,
      fixed: 'right',
      render: (_: any, record: RoutingStrategy, index: number) => (
        <Space>
          {isEditMode ? (
            <>
              <Tooltip title="Move Up">
                <Button
                  type="text"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  onClick={() => moveStrategy(index, 'up')}
                />
              </Tooltip>
              <Tooltip title="Move Down">
                <Button
                  type="text"
                  icon={<ArrowDownOutlined />}
                  disabled={index === displayStrategies.length - 1}
                  onClick={() => moveStrategy(index, 'down')}
                />
              </Tooltip>
              <Tooltip title="Drag to reorder">
                <Button type="text" icon={<DragOutlined />} style={{ cursor: 'grab' }} />
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Edit">
                <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
              </Tooltip>
              <Tooltip title="Delete">
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Routing Strategies</h2>
          <p style={{ color: '#8c8c8c', margin: 0 }}>
            Configure payment routing rules and priorities
          </p>
        </div>

        {/* Info Alert */}
        <Alert
          message="Routing Priority"
          description="Rules are evaluated in priority order (1 = highest). The first matching rule determines the channel selection."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
        />

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
            {isEditMode ? 'Reorder mode: Use arrows to adjust priority' : `${displayStrategies.length} strategies`}
          </span>
          <Space>
            <Button
              type={isEditMode ? 'primary' : 'default'}
              icon={isEditMode ? <SaveOutlined /> : <DragOutlined />}
              onClick={handleEditModeToggle}
            >
              {isEditMode ? 'Save Order' : 'Reorder'}
            </Button>
            {!isEditMode && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                New Strategy
              </Button>
            )}
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={displayStrategies}
          rowKey="id"
          pagination={false}
          rowClassName={(record) => (record.isActive ? '' : 'ant-table-row-inactive')}
        />
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        title={editingStrategy ? 'Edit Strategy' : 'New Strategy'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Strategy Name"
            rules={[{ required: true, message: 'Please enter strategy name' }]}
          >
            <Input placeholder="e.g., High Value - Stripe Priority" />
          </Form.Item>

          <div style={{ fontWeight: 500, marginBottom: 16 }}>Conditions</div>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="amountMin" label="Min Amount">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="No minimum"
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="amountMax" label="Max Amount">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="No maximum"
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="currency" label="Currency">
            <Select
              mode="multiple"
              placeholder="Select currencies"
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'GBP', label: 'GBP' },
                { value: 'BRL', label: 'BRL' },
                { value: 'MXN', label: 'MXN' },
                { value: 'INR', label: 'INR' },
              ]}
            />
          </Form.Item>

          <Form.Item name="country" label="Country">
            <Select
              mode="multiple"
              placeholder="Select countries"
              options={[
                { value: 'US', label: 'United States' },
                { value: 'CA', label: 'Canada' },
                { value: 'GB', label: 'United Kingdom' },
                { value: 'DE', label: 'Germany' },
                { value: 'BR', label: 'Brazil' },
                { value: 'MX', label: 'Mexico' },
                { value: 'IN', label: 'India' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="targetChannels"
            label="Target Channels"
            rules={[{ required: true, message: 'Please select at least one channel' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select target channels"
              options={Object.entries(channelMap).map(([id, name]) => ({
                value: id,
                label: `${name} (${id})`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

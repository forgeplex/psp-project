/**
 * 渠道筛选栏组件
 */
import { useState } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ChannelStatus, ChannelType } from '../types/channel';

interface ChannelFiltersProps {
  providers?: { id: string; name: string }[];
  onSearch?: (values: FilterValues) => void;
  onReset?: () => void;
}

export interface FilterValues {
  keyword?: string;
  status?: ChannelStatus;
  providerId?: string;
  type?: ChannelType;
}

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
  { label: '维护中', value: 'maintenance' },
];

const typeOptions = [
  { label: '全部类型', value: '' },
  { label: '支付', value: 'payment' },
  { label: '代付', value: 'payout' },
  { label: '综合', value: 'combined' },
];

export function ChannelFilters({ providers = [], onSearch, onReset }: ChannelFiltersProps) {
  const [form] = Form.useForm();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    onSearch?.(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  return (
    <Form form={form} layout="inline" className="channel-filters">
      <Form.Item name="keyword">
        <Input
          placeholder="搜索渠道编码/名称"
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 200 }}
        />
      </Form.Item>

      <Form.Item name="status" initialValue="">
        <Select options={statusOptions} style={{ width: 120 }} />
      </Form.Item>

      <Form.Item name="providerId" initialValue="">
        <Select
          placeholder="选择提供商"
          options={[{ label: '全部提供商', value: '' }, ...providers.map(p => ({ label: p.name, value: p.id }))]}
          style={{ width: 150 }}
        />
      </Form.Item>

      <Form.Item name="type" initialValue="">
        <Select options={typeOptions} style={{ width: 120 }} />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

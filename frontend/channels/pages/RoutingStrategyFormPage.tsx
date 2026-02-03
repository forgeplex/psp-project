/**
 * 路由策略创建/编辑页
 */
import { useState } from 'react';
import { Card, Button, Space, Form, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { RoutingStrategyForm } from '../components/routing/RoutingStrategyForm';
import type { RoutingStrategy, Channel, CreateRoutingStrategyRequest } from '../types/channel';

interface RoutingStrategyFormPageProps {
  strategy?: RoutingStrategy; // 有值表示编辑模式
  channels: Channel[];
  onBack?: () => void;
  onSubmit?: (values: CreateRoutingStrategyRequest) => void;
}

// 扩展类型定义（添加到 channel.ts）
export interface CreateRoutingStrategyRequest {
  name: string;
  conditions: {
    amountMin?: number;
    amountMax?: number;
    currencies?: string[];
    countries?: string[];
    merchantIds?: string[];
  };
  targetChannelIds: string[];
  channelWeights: Record<string, number>;
  isActive: boolean;
}

export function RoutingStrategyFormPage({
  strategy,
  channels,
  onBack,
  onSubmit,
}: RoutingStrategyFormPageProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEdit = !!strategy;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 构造请求体
      const request: CreateRoutingStrategyRequest = {
        name: values.name,
        conditions: {
          amountMin: values.conditions?.amountMin,
          amountMax: values.conditions?.amountMax,
          currencies: values.conditions?.currencies,
          countries: values.conditions?.countries,
          merchantIds: values.conditions?.merchantIds,
        },
        targetChannelIds: values.targetChannelIds,
        channelWeights: values.channelWeights || {},
        isActive: values.isActive ?? true,
      };

      // 验证权重总和
      const weights = Object.values(request.channelWeights);
      if (weights.length > 0) {
        const total = weights.reduce((sum, w) => sum + (w || 0), 0);
        if (total !== 100) {
          message.warning(`权重总和为 ${total}%，建议调整为 100%`);
        }
      }

      onSubmit?.(request);
      message.success(isEdit ? '保存成功' : '创建成功');
    } catch (error) {
      // 表单验证失败
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 顶部工具栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              返回
            </Button>
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {isEdit ? '编辑路由策略' : '创建路由策略'}
            </span>
          </Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSubmit}
          >
            {isEdit ? '保存' : '创建'}
          </Button>
        </div>

        {/* 表单 */}
        <Form form={form} layout="vertical">
          <RoutingStrategyForm
            initialValues={strategy}
            channels={channels}
            form={form}
          />
        </Form>
      </Space>
    </Card>
  );
}

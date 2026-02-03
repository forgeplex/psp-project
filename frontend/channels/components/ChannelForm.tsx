/**
 * 渠道表单组件（创建/编辑）
 * Step 1: 基本信息
 * Step 2: 渠道配置（动态表单）
 * Step 3: 交易限额
 */
import { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, Steps, Card, Space, Button } from 'antd';
import type { Provider, Channel, CreateChannelRequest } from '../types/channel';
import { DynamicConfigForm } from './DynamicConfigForm';

interface ChannelFormProps {
  initialValues?: Partial<Channel>;
  providers: Provider[];
  loading?: boolean;
  onSubmit?: (values: CreateChannelRequest) => void;
  onCancel?: () => void;
}

const typeOptions = [
  { label: '支付', value: 'payment' },
  { label: '代付', value: 'payout' },
  { label: '综合', value: 'combined' },
];

export function ChannelForm({
  initialValues,
  providers,
  loading,
  onSubmit,
  onCancel,
}: ChannelFormProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // 编辑模式下设置初始值
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        code: initialValues.code,
        name: initialValues.name,
        providerId: initialValues.providerId,
        type: initialValues.type,
        priority: initialValues.priority,
        config: initialValues.config,
        limits: initialValues.limits,
      });

      const provider = providers.find(p => p.id === initialValues.providerId);
      setSelectedProvider(provider || null);
    }
  }, [initialValues, providers, form]);

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    setSelectedProvider(provider || null);
    form.setFieldsValue({ config: {} });
  };

  const handleNext = async () => {
    try {
      await form.validateFields(getStepFields(currentStep));
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // 验证失败
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit?.(values as CreateChannelRequest);
    } catch (error) {
      // 验证失败
    }
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0:
        return ['code', 'name', 'providerId', 'type', 'priority'];
      case 1:
        return selectedProvider ? Object.keys(selectedProvider.configSchema).map(k => `config.${k}`) : [];
      case 2:
        return ['limits.minAmount', 'limits.maxAmount', 'limits.dailyLimit', 'limits.monthlyLimit'];
      default:
        return [];
    }
  };

  const steps = [
    {
      title: '基本信息',
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Form.Item
            name="code"
            label="渠道编码"
            rules={[
              { required: true, message: '请输入渠道编码' },
              { pattern: /^[A-Z0-9_]+$/, message: '只能包含大写字母、数字和下划线' },
            ]}
          >
            <Input placeholder="如: WECHAT_PAY" disabled={!!initialValues} />
          </Form.Item>

          <Form.Item
            name="name"
            label="渠道名称"
            rules={[{ required: true, message: '请输入渠道名称' }]}
          >
            <Input placeholder="如: 微信支付" />
          </Form.Item>

          <Form.Item
            name="providerId"
            label="所属提供商"
            rules={[{ required: true, message: '请选择提供商' }]}
          >
            <Select
              placeholder="选择提供商"
              options={providers.map(p => ({ label: p.name, value: p.id }))}
              onChange={handleProviderChange}
              disabled={!!initialValues}
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="渠道类型"
            rules={[{ required: true, message: '请选择渠道类型' }]}
          >
            <Select options={typeOptions} disabled={!!initialValues} />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请输入优先级' }]}
            initialValue={100}
          >
            <InputNumber min={1} max={9999} style={{ width: '100%' }} />
          </Form.Item>
        </Space>
      ),
    },
    {
      title: '渠道配置',
      content: selectedProvider ? (
        <DynamicConfigForm schema={selectedProvider.configSchema} form={form} />
      ) : (
        <Card>请先选择提供商</Card>
      ),
    },
    {
      title: '交易限额',
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Form.Item
            name={['limits', 'minAmount']}
            label="单笔最小金额"
            rules={[{ required: true, message: '请输入最小金额' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="0.01"
            />
          </Form.Item>

          <Form.Item
            name={['limits', 'maxAmount']}
            label="单笔最大金额"
            rules={[{ required: true, message: '请输入最大金额' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="50000"
            />
          </Form.Item>

          <Form.Item
            name={['limits', 'dailyLimit']}
            label="日限额（可选）"
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="不填表示无限制"
            />
          </Form.Item>

          <Form.Item
            name={['limits', 'monthlyLimit']}
            label="月限额（可选）"
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="不填表示无限制"
            />
          </Form.Item>
        </Space>
      ),
    },
  ];

  return (
    <Form form={form} layout="vertical">
      <Steps current={currentStep} items={steps.map(s => ({ title: s.title }))} style={{ marginBottom: 24 }} />

      <div style={{ minHeight: 300 }}>{steps[currentStep].content}</div>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>取消</Button>
          {currentStep > 0 && <Button onClick={handlePrev}>上一步</Button>}
          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          ) : (
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              {initialValues ? '保存' : '创建'}
            </Button>
          )}
        </Space>
      </div>
    </Form>
  );
}

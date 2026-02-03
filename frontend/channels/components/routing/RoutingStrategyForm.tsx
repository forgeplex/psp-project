/**
 * 路由策略表单组件
 * Sprint 2: 单层 AND 条件
 * v1.0 API
 */
import { useEffect } from 'react';
import { Form, Input, InputNumber, Select, Card, Space, Divider, Typography, Tag } from 'antd';
import type { RoutingStrategy, RoutingConditions, Channel } from '../../types/channel';

const { Text } = Typography;

interface RoutingStrategyFormProps {
  initialValues?: Partial<RoutingStrategy>;
  channels: Channel[];
  form: any; // FormInstance
}

const currencyOptions = [
  { label: 'CNY - 人民币', value: 'CNY' },
  { label: 'USD - 美元', value: 'USD' },
  { label: 'EUR - 欧元', value: 'EUR' },
  { label: 'BRL - 巴西雷亚尔', value: 'BRL' },
  { label: 'MXN - 墨西哥比索', value: 'MXN' },
  { label: 'INR - 印度卢比', value: 'INR' },
];

const countryOptions = [
  { label: 'CN - 中国', value: 'CN' },
  { label: 'US - 美国', value: 'US' },
  { label: 'BR - 巴西', value: 'BR' },
  { label: 'MX - 墨西哥', value: 'MX' },
  { label: 'IN - 印度', value: 'IN' },
];

export function RoutingStrategyForm({
  initialValues,
  channels,
  form,
}: RoutingStrategyFormProps) {
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        conditions: initialValues.conditions || {},
        targetChannelIds: initialValues.targetChannelIds || [],
        channelWeights: initialValues.channelWeights || {},
        isActive: initialValues.isActive ?? true,
      });
    }
  }, [initialValues, form]);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* 基本信息 */}
      <Card title="基本信息" size="small">
        <Form.Item
          name="name"
          label="策略名称"
          rules={[{ required: true, message: '请输入策略名称' }]}
        >
          <Input placeholder="如: 中国地区大额支付" />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="状态"
          valuePropName="checked"
          initialValue={true}
        >
          <Select
            options={[
              { label: '启用', value: true },
              { label: '禁用', value: false },
            ]}
          />
        </Form.Item>
      </Card>

      {/* 匹配条件 - 单层 AND */}
      <Card title="匹配条件（单层 AND）" size="small">
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          所有条件必须同时满足才会匹配此策略
        </Text>

        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 金额范围 */}
          <Form.Item label="交易金额范围">
            <Space>
              <Form.Item name={['conditions', 'amountMin']} noStyle>
                <InputNumber
                  min={0}
                  precision={2}
                  placeholder="最小金额"
                  style={{ width: 140 }}
                />
              </Form.Item>
              <Text>至</Text>
              <Form.Item name={['conditions', 'amountMax']} noStyle>
                <InputNumber
                  min={0}
                  precision={2}
                  placeholder="最大金额"
                  style={{ width: 140 }}
                />
              </Form.Item>
            </Space>
          </Form.Item>

          {/* 币种 */}
          <Form.Item
            name={['conditions', 'currencies']}
            label="币种"
          >
            <Select
              mode="multiple"
              placeholder="选择币种（不选表示全部）"
              options={currencyOptions}
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* 国家 */}
          <Form.Item
            name={['conditions', 'countries']}
            label="国家/地区"
          >
            <Select
              mode="multiple"
              placeholder="选择国家（不选表示全部）"
              options={countryOptions}
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* 商户 ID */}
          <Form.Item
            name={['conditions', 'merchantIds']}
            label="指定商户"
          >
            <Select
              mode="tags"
              placeholder="输入商户ID（不填表示全部）"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Space>
      </Card>

      {/* 目标渠道 */}
      <Card title="目标渠道" size="small">
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          选择要路由到的支付渠道，可设置权重分配
        </Text>

        <Form.Item
          name="targetChannelIds"
          label="渠道"
          rules={[{ required: true, message: '请至少选择一个目标渠道', type: 'array', min: 1 }]}
        >
          <Select
            mode="multiple"
            placeholder="选择渠道"
            options={channels.map(c => ({
              label: `${c.name} (${c.code})`,
              value: c.id,
              disabled: c.status !== 'active',
            }))}
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* 权重分配 */}
        <Form.Item shouldUpdate={(prev, curr) => prev.targetChannelIds !== curr.targetChannelIds}>
          {({ getFieldValue }) => {
            const selectedIds: string[] = getFieldValue('targetChannelIds') || [];
            if (selectedIds.length <= 1) return null;

            return (
              <Card title="权重分配" size="small" type="inner">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {selectedIds.map((id) => {
                    const channel = channels.find(c => c.id === id);
                    return (
                      <Space key={id} style={{ width: '100%' }}>
                        <Tag color="blue">{channel?.name || id}</Tag>
                        <Form.Item
                          name={['channelWeights', id]}
                          noStyle
                          initialValue={Math.floor(100 / selectedIds.length)}
                        >
                          <InputNumber min={1} max={100} suffix="%" />
                        </Form.Item>
                      </Space>
                    );
                  })}
                </Space>
                <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                  权重总和应为 100%
                </Text>
              </Card>
            );
          }}
        </Form.Item>
      </Card>
    </Space>
  );
}

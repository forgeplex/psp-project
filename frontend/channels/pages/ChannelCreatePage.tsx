/**
 * 渠道创建页面
 */
import { Card, message } from 'antd';
import { ChannelForm } from '../components/ChannelForm';
import type { CreateChannelRequest, Provider } from '../types/channel';

// 模拟提供商数据
const mockProviders: Provider[] = [
  {
    id: 'p1',
    code: 'wechat',
    name: '财付通',
    supportedTypes: ['payment'],
    configSchema: {
      app_id: {
        type: 'string',
        label: '应用ID',
        required: true,
        placeholder: '如: wx123456789',
      },
      mch_id: {
        type: 'string',
        label: '商户号',
        required: true,
        placeholder: '如: 1234567890',
      },
      api_key: {
        type: 'secret',
        label: 'API密钥',
        required: true,
        placeholder: '32位密钥',
      },
      sandbox: {
        type: 'boolean',
        label: '沙箱模式',
        helpText: '开启后使用测试环境',
      },
    },
    channelCount: 2,
  },
  {
    id: 'p2',
    code: 'alipay',
    name: '支付宝',
    supportedTypes: ['payment'],
    configSchema: {
      app_id: {
        type: 'string',
        label: '应用ID',
        required: true,
      },
      private_key: {
        type: 'secret',
        label: '应用私钥',
        required: true,
      },
      alipay_public_key: {
        type: 'secret',
        label: '支付宝公钥',
        required: true,
      },
      sign_type: {
        type: 'enum',
        label: '签名类型',
        required: true,
        validation: {
          options: [
            { label: 'RSA2', value: 'RSA2' },
            { label: 'RSA', value: 'RSA' },
          ],
        },
      },
    },
    channelCount: 1,
  },
];

interface ChannelCreatePageProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ChannelCreatePage({ onSuccess, onCancel }: ChannelCreatePageProps) {
  const handleSubmit = (values: CreateChannelRequest) => {
    console.log('创建渠道:', values);
    message.success('渠道创建成功');
    onSuccess?.();
  };

  return (
    <Card title="创建渠道">
      <ChannelForm
        providers={mockProviders}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </Card>
  );
}

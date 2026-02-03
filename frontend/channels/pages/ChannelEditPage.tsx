/**
 * 渠道编辑页面
 */
import { Card, message } from 'antd';
import { ChannelForm } from '../components/ChannelForm';
import type { Channel, CreateChannelRequest, Provider } from '../types/channel';

const mockProviders: Provider[] = [
  {
    id: 'p1',
    code: 'wechat',
    name: '财付通',
    supportedTypes: ['payment'],
    configSchema: {
      app_id: { type: 'string', label: '应用ID', required: true },
      mch_id: { type: 'string', label: '商户号', required: true },
      api_key: { type: 'secret', label: 'API密钥', required: true },
      sandbox: { type: 'boolean', label: '沙箱模式', helpText: '开启后使用测试环境' },
    },
    channelCount: 2,
  },
];

interface ChannelEditPageProps {
  channel: Channel;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ChannelEditPage({ channel, onSuccess, onCancel }: ChannelEditPageProps) {
  const handleSubmit = (values: CreateChannelRequest) => {
    console.log('更新渠道:', values);
    message.success('渠道更新成功');
    onSuccess?.();
  };

  return (
    <Card title={`编辑渠道: ${channel.name}`}>
      <ChannelForm
        initialValues={channel}
        providers={mockProviders}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </Card>
  );
}

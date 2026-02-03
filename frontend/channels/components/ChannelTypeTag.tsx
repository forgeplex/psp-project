/**
 * 渠道类型标签组件
 */
import { Tag } from 'antd';
import type { ChannelType } from '../types/channel';

interface ChannelTypeTagProps {
  type: ChannelType;
}

const typeConfig: Record<ChannelType, { color: string; text: string }> = {
  payment: { color: 'blue', text: '支付' },
  payout: { color: 'purple', text: '代付' },
  combined: { color: 'cyan', text: '综合' },
};

export function ChannelTypeTag({ type }: ChannelTypeTagProps) {
  const config = typeConfig[type];
  return <Tag color={config.color}>{config.text}</Tag>;
}

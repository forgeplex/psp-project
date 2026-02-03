/**
 * 渠道状态 Badge 组件
 */
import { Badge } from 'antd';
import type { ChannelStatus } from '../types/channel';

interface ChannelStatusBadgeProps {
  status: ChannelStatus;
}

const statusConfig: Record<ChannelStatus, { color: string; text: string }> = {
  active: { color: 'success', text: '启用' },
  inactive: { color: 'default', text: '禁用' },
  maintenance: { color: 'warning', text: '维护中' },
};

export function ChannelStatusBadge({ status }: ChannelStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge status={config.color as any} text={config.text} />;
}

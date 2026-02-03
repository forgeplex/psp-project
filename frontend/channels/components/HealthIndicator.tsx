/**
 * 健康状态指示器组件
 * API v1.0: unknown/healthy/degraded/failed
 */
import { Badge, Tooltip } from 'antd';
import type { ChannelHealthStatus } from '../types/channel';

interface HealthIndicatorProps {
  status: ChannelHealthStatus;
  lastCheckedAt?: string;
}

const healthConfig: Record<ChannelHealthStatus, { color: string; text: string }> = {
  unknown: { color: 'default', text: '未知' },
  healthy: { color: 'success', text: '健康' },
  degraded: { color: 'warning', text: '降级' },
  failed: { color: 'error', text: '失败' },
};

export function HealthIndicator({ status, lastCheckedAt }: HealthIndicatorProps) {
  const config = healthConfig[status];
  const tooltipText = lastCheckedAt
    ? `${config.text} · 上次检查: ${new Date(lastCheckedAt).toLocaleString()}`
    : config.text;

  return (
    <Tooltip title={tooltipText}>
      <Badge status={config.color as any} text={config.text} />
    </Tooltip>
  );
}

import React from 'react';
import { Badge, Tag } from 'antd';

type ChannelStatus = 'active' | 'inactive' | 'error' | 'maintenance';
type HealthStatus = 'healthy' | 'warning' | 'critical' | 'offline';

interface ChannelStatusBadgeProps {
  status: ChannelStatus;
}

interface HealthStatusBadgeProps {
  status: HealthStatus;
}

const statusConfig: Record<ChannelStatus, { color: string; label: string }> = {
  active: { color: 'success', label: 'Active' },
  inactive: { color: 'default', label: 'Inactive' },
  maintenance: { color: 'warning', label: 'Maintenance' },
  error: { color: 'error', label: 'Error' },
};

const healthConfig: Record<HealthStatus, { color: string; label: string }> = {
  healthy: { color: 'success', label: 'Healthy' },
  warning: { color: 'warning', label: 'Warning' },
  critical: { color: 'error', label: 'Critical' },
  offline: { color: 'default', label: 'Offline' },
};

export const ChannelStatusBadge: React.FC<ChannelStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  return <Badge status={config.color as any} text={config.label} />;
};

export const HealthStatusBadge: React.FC<HealthStatusBadgeProps> = ({ status }) => {
  const config = healthConfig[status];
  return <Badge status={config.color as any} text={config.label} />;
};

export const ChannelStatusTag: React.FC<ChannelStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  const tagColor = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    default: 'default',
  }[config.color];
  return <Tag color={tagColor}>{config.label}</Tag>;
};

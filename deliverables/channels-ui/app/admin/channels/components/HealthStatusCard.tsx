import React from 'react';
import { Card, Statistic, Row, Col, Badge, Timeline, Button, Alert } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

type HealthStatus = 'healthy' | 'warning' | 'critical' | 'offline';

interface HealthStatusCardProps {
  status: HealthStatus;
  lastCheck: string;
  nextCheck: string;
  uptime24h: number;
  avgResponseMs: number;
  checkInterval: number;
  history?: Array<{
    timestamp: string;
    status: HealthStatus;
    responseTime: number;
    message?: string;
  }>;
}

const healthConfig: Record<HealthStatus, { color: string; icon: React.ReactNode; label: string }> = {
  healthy: { color: '#52c41a', icon: <CheckCircleOutlined />, label: 'Healthy' },
  warning: { color: '#faad14', icon: <ExclamationCircleOutlined />, label: 'Warning' },
  critical: { color: '#f5222d', icon: <CloseCircleOutlined />, label: 'Critical' },
  offline: { color: '#d9d9d9', icon: <CloseCircleOutlined />, label: 'Offline' },
};

export const HealthStatusCard: React.FC<HealthStatusCardProps> = ({
  status,
  lastCheck,
  nextCheck,
  uptime24h,
  avgResponseMs,
  checkInterval,
  history = [],
}) => {
  const health = healthConfig[status];

  return (
    <Card
      title={
        <span>
          <SyncOutlined spin style={{ marginRight: 8 }} />
          Health Monitor
        </span>
      }
      extra={<Button type="link">Configure</Button>}
    >
      {/* Status Summary */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px 0',
          borderRadius: 8,
          background: `linear-gradient(135deg, ${health.color}10, ${health.color}20)`,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: health.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 40,
            color: '#fff',
          }}
        >
          {health.icon}
        </div>
        <h2 style={{ margin: 0, color: health.color }}>{health.label}</h2>
        <p style={{ margin: '8px 0 0', color: '#8c8c8c' }}>
          Last check: {new Date(lastCheck).toLocaleTimeString()}
        </p>
      </div>

      {/* Stats Grid */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Statistic title="Uptime (24h)" value={uptime24h} suffix="%" />
        </Col>
        <Col span={12}>
          <Statistic title="Avg Response" value={avgResponseMs} suffix="ms" />
        </Col>
      </Row>

      {/* Check Schedule */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#8c8c8c' }}>Next Check: </span>
          <span>{new Date(nextCheck).toLocaleTimeString()}</span>
        </div>
        <div>
          <span style={{ color: '#8c8c8c' }}>Interval: </span>
          <span>{checkInterval} minutes</span>
        </div>
      </div>

      {/* Alert Placeholder */}
      <Alert
        message="Monitoring Features"
        description={
          <div style={{ fontSize: 12 }}>
            <p>• Real-time health alerts</p>
            <p>• Automated failover</p>
            <p>• Performance analytics</p>
            <p>• Custom thresholds</p>
          </div>
        }
        type="info"
        showIcon
      />
    </Card>
  );
};

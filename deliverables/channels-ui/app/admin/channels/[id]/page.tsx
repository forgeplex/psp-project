'use client';

import React from 'react';
import {
  Card,
  Descriptions,
  Badge,
  Tag,
  Space,
  Button,
  Row,
  Col,
  Statistic,
  Divider,
  Timeline,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';

// Types
type ChannelStatus = 'active' | 'inactive' | 'error' | 'maintenance';
type HealthStatus = 'healthy' | 'warning' | 'critical' | 'offline';
type ProviderType = 'stripe' | 'adyen' | 'pix' | 'spei' | 'upi';

interface Channel {
  id: string;
  name: string;
  provider: ProviderType;
  status: ChannelStatus;
  healthStatus: HealthStatus;
  weight: number;
  config: Record<string, any>;
  successRate: number;
  avgResponseMs: number;
  errorRate: number;
  totalTransactions: number;
  amountMin: number;
  amountMax: number;
  currency: string[];
  supportedCountries: string[];
  apiEndpoint: string;
  timeoutSeconds: number;
  retryAttempts: number;
  lastHealthCheck: string;
  nextHealthCheck: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface HealthCheckLog {
  id: string;
  timestamp: string;
  status: HealthStatus;
  responseTime: number;
  message?: string;
}

// Mock data
const mockChannel: Channel = {
  id: 'ch-001',
  name: 'Stripe Global',
  provider: 'stripe',
  status: 'active',
  healthStatus: 'healthy',
  weight: 80,
  config: {
    apiKey: 'sk_live_•••••••••••••••••••••••••',
    webhookSecret: 'whsec_•••••••••••••••••••••••••',
  },
  successRate: 98.5,
  avgResponseMs: 245,
  errorRate: 1.5,
  totalTransactions: 152847,
  amountMin: 100,
  amountMax: 1000000,
  currency: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  supportedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
  apiEndpoint: 'https://api.stripe.com/v1',
  timeoutSeconds: 30,
  retryAttempts: 3,
  lastHealthCheck: '2024-02-03T13:30:00Z',
  nextHealthCheck: '2024-02-03T14:00:00Z',
  createdAt: '2024-01-15T08:30:00Z',
  updatedAt: '2024-02-01T10:20:00Z',
  createdBy: 'admin@forgeplex.com',
};

const mockHealthLogs: HealthCheckLog[] = [
  { id: '1', timestamp: '2024-02-03T13:30:00Z', status: 'healthy', responseTime: 245 },
  { id: '2', timestamp: '2024-02-03T13:00:00Z', status: 'healthy', responseTime: 238 },
  { id: '3', timestamp: '2024-02-03T12:30:00Z', status: 'healthy', responseTime: 252 },
  { id: '4', timestamp: '2024-02-03T12:00:00Z', status: 'warning', responseTime: 1205, message: 'High latency detected' },
  { id: '5', timestamp: '2024-02-03T11:30:00Z', status: 'healthy', responseTime: 241 },
];

const statusConfig: Record<ChannelStatus, { color: string; label: string }> = {
  active: { color: 'success', label: 'Active' },
  inactive: { color: 'default', label: 'Inactive' },
  maintenance: { color: 'warning', label: 'Maintenance' },
  error: { color: 'error', label: 'Error' },
};

const healthConfig: Record<HealthStatus, { color: string; icon: React.ReactNode; label: string }> = {
  healthy: { color: '#52c41a', icon: <CheckCircleOutlined />, label: 'Healthy' },
  warning: { color: '#faad14', icon: <ExclamationCircleOutlined />, label: 'Warning' },
  critical: { color: '#f5222d', icon: <CloseCircleOutlined />, label: 'Critical' },
  offline: { color: '#d9d9d9', icon: <CloseCircleOutlined />, label: 'Offline' },
};

export default function ChannelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const channelId = params.id as string;

  const channel = mockChannel; // In real app, fetch by channelId
  const health = healthConfig[channel.healthStatus];
  const status = statusConfig[channel.status];

  const isActive = channel.status === 'active';

  return (
    <div style={{ padding: 24 }}>
      {/* Back Button & Actions */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/admin/channels')}>
          Back to List
        </Button>
        <Space>
          <Button icon={<SyncOutlined />}>Test Connection</Button>
          <Button icon={isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}>
            {isActive ? 'Disable' : 'Enable'}
          </Button>
          <Button type="primary" icon={<EditOutlined />}>
            Edit Channel
          </Button>
        </Space>
      </div>

      {/* Channel Header */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${health.color}20, ${health.color}40)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: health.color,
            }}
          >
            {health.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, marginBottom: 8 }}>{channel.name}</h1>
            <Space>
              <Badge status={status.color as any} text={status.label} />
              <Tag color="blue">{channel.provider.toUpperCase()}</Tag>
              <span style={{ color: '#8c8c8c' }}>ID: {channel.id}</span>
            </Space>
          </div>
        </div>
      </Card>

      <Row gutter={24}>
        {/* Left Column - Stats & Info */}
        <Col xs={24} lg={16}>
          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Success Rate"
                  value={channel.successRate}
                  suffix="%"
                  valueStyle={{ color: channel.successRate >= 95 ? '#52c41a' : '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Avg Response"
                  value={channel.avgResponseMs}
                  suffix="ms"
                  valueStyle={{ color: channel.avgResponseMs < 500 ? '#52c41a' : '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Error Rate"
                  value={channel.errorRate}
                  suffix="%"
                  valueStyle={{ color: channel.errorRate < 5 ? '#52c41a' : '#f5222d' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic
                  title="Transactions"
                  value={channel.totalTransactions}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Channel Configuration */}
          <Card title="Channel Configuration" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Provider">
                <Tag color="blue">{channel.provider.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Weight">{channel.weight}%</Descriptions.Item>
              <Descriptions.Item label="Amount Range">
                ${channel.amountMin.toLocaleString()} - ${channel.amountMax.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Timeout">{channel.timeoutSeconds}s</Descriptions.Item>
              <Descriptions.Item label="Retry Attempts">{channel.retryAttempts}</Descriptions.Item>
              <Descriptions.Item label="API Endpoint">
                <a href={channel.apiEndpoint} target="_blank" rel="noopener noreferrer">
                  {channel.apiEndpoint}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Currencies">
                <Space wrap>
                  {channel.currency.map((c) => (
                    <Tag key={c} size="small">
                      {c}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Countries">
                <Space wrap>
                  {channel.supportedCountries.map((c) => (
                    <Tag key={c} size="small">
                      {c}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Credentials (Masked) */}
          <Card title="API Credentials" style={{ marginBottom: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="API Key">
                <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: 4 }}>
                  {channel.config.apiKey}
                </code>
                <Button type="link" size="small">
                  Reveal
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="Webhook Secret">
                <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: 4 }}>
                  {channel.config.webhookSecret}
                </code>
                <Button type="link" size="small">
                  Reveal
                </Button>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Right Column - Health Status */}
        <Col xs={24} lg={8}>
          {/* Health Status Card - Placeholder for monitoring */}
          <Card
            title={
              <Space>
                <SyncOutlined spin />
                Health Monitor
              </Space>
            }
            extra={<Button type="link">Configure</Button>}
            style={{ marginBottom: 24 }}
          >
            {/* Health Status Summary */}
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
                Last check: {new Date(channel.lastHealthCheck).toLocaleTimeString()}
              </p>
            </div>

            {/* Health Stats */}
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Uptime (24h)">99.8%</Descriptions.Item>
              <Descriptions.Item label="Last Response">{channel.avgResponseMs}ms</Descriptions.Item>
              <Descriptions.Item label="Next Check">
                {new Date(channel.nextHealthCheck).toLocaleTimeString()}
              </Descriptions.Item>
              <Descriptions.Item label="Check Interval">30 minutes</Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Alert Placeholder for monitoring */}
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

          {/* Health Check History */}
          <Card
            title={
              <Space>
                <HistoryOutlined />
                Health Check History
              </Space>
            }
          >
            <Timeline
              items={mockHealthLogs.map((log) => ({
                color: log.status === 'healthy' ? 'green' : log.status === 'warning' ? 'orange' : 'red',
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {new Date(log.timestamp).toLocaleTimeString()} · {log.responseTime}ms
                    </div>
                    {log.message && (
                      <div style={{ fontSize: 12, color: '#faad14' }}>{log.message}</div>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

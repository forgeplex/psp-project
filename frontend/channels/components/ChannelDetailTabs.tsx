/**
 * 渠道详情 Tab 组件
 */
import { Tabs, Card, Descriptions, Statistic, Row, Col, Timeline } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { Channel } from '../types/channel';
import { ChannelTypeTag } from './ChannelTypeTag';
import { ChannelStatusBadge } from './ChannelStatusBadge';
import { HealthIndicator } from './HealthIndicator';

interface ChannelDetailTabsProps {
  channel: Channel;
}

export function ChannelDetailTabs({ channel }: ChannelDetailTabsProps) {
  const formatAmount = (amount: number) => `¥${amount.toFixed(2)}`;

  const items = [
    {
      key: 'overview',
      label: '概览',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 关键指标卡片 */}
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="当前状态"
                  value={channel.status === 'active' ? '正常' : channel.status === 'maintenance' ? '维护' : '禁用'}
                  valueStyle={{ color: channel.status === 'active' ? '#52c41a' : '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="24h 成功率"
                  value={Math.round((channel.stats?.successRate24h || 0) * 100)}
                  suffix="%"
                  valueStyle={{ color: channel.stats?.successRate24h && channel.stats.successRate24h >= 0.9 ? '#52c41a' : '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="平均响应"
                  value={channel.stats?.avgResponseMs || 0}
                  suffix="ms"
                />
              </Card>
            </Col>
          </Row>

          {/* 基本信息 */}
          <Card title="基本信息">
            <Descriptions column={2}>
              <Descriptions.Item label="渠道编码">{channel.code}</Descriptions.Item>
              <Descriptions.Item label="渠道名称">{channel.name}</Descriptions.Item>
              <Descriptions.Item label="提供商">{channel.providerName}</Descriptions.Item>
              <Descriptions.Item label="类型"><ChannelTypeTag type={channel.type} /></Descriptions.Item>
              <Descriptions.Item label="状态"><ChannelStatusBadge status={channel.status} /></Descriptions.Item>
              <Descriptions.Item label="优先级">{channel.priority}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(channel.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{new Date(channel.updatedAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 交易限额 */}
          <Card title="交易限额">
            <Descriptions column={2}>
              <Descriptions.Item label="单笔最小">{formatAmount(channel.limits?.minAmount || 0)}</Descriptions.Item>
              <Descriptions.Item label="单笔最大">{formatAmount(channel.limits?.maxAmount || 0)}</Descriptions.Item>
              <Descriptions.Item label="日限额">{channel.limits?.dailyLimit ? formatAmount(channel.limits.dailyLimit) : '无限制'}</Descriptions.Item>
              <Descriptions.Item label="月限额">{channel.limits?.monthlyLimit ? formatAmount(channel.limits.monthlyLimit) : '无限制'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      ),
    },
    {
      key: 'config',
      label: '配置',
      children: (
        <Card title="渠道配置">
          <Descriptions column={1} bordered>
            {Object.entries(channel.config || {}).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'stats',
      label: '统计',
      children: (
        <Card title="交易统计（24h）">
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="交易笔数" value={channel.stats?.transactionCount24h || 0} />
            </Col>
            <Col span={8}>
              <Statistic title="成功笔数" value={Math.round((channel.stats?.transactionCount24h || 0) * (channel.stats?.successRate24h || 0))} />
            </Col>
            <Col span={8}>
              <Statistic title="失败笔数" value={Math.round((channel.stats?.transactionCount24h || 0) * (1 - (channel.stats?.successRate24h || 0)))} />
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'health',
      label: '健康检查',
      children: (
        <Card title="最近健康检查记录">
          <Timeline
            items={[
              {
                dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                children: '2026-02-03 10:00:00 检查通过 - 响应时间 120ms',
              },
              {
                dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                children: '2026-02-03 09:00:00 检查通过 - 响应时间 115ms',
              },
              {
                dot: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
                children: '2026-02-03 08:00:00 响应缓慢 - 响应时间 2500ms',
              },
              {
                dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                children: '2026-02-03 07:00:00 检查通过 - 响应时间 118ms',
              },
            ]}
          />
        </Card>
      ),
    },
  ];

  return <Tabs defaultActiveKey="overview" items={items} />;
}

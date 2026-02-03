/**
 * 渠道详情页面
 */
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { ChannelDetailTabs } from '../components/ChannelDetailTabs';
import type { Channel } from '../types/channel';

interface ChannelDetailPageProps {
  channel: Channel;
  onBack?: () => void;
  onEdit?: (channel: Channel) => void;
}

export function ChannelDetailPage({ channel, onBack, onEdit }: ChannelDetailPageProps) {
  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 顶部工具栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              返回
            </Button>
            <span style={{ fontSize: 16, fontWeight: 500 }}>{channel.name}</span>
          </Space>
          <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit?.(channel)}>
            编辑
          </Button>
        </div>

        {/* Tab 内容 */}
        <ChannelDetailTabs channel={channel} />
      </Space>
    </Card>
  );
}

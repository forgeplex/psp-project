/**
 * Channels 模块常量定义
 * API v1.0 - 状态颜色映射
 */

import type { ChannelStatus, ChannelHealthStatus } from './types/channel';

/** 渠道状态配置 */
export const CHANNEL_STATUS_CONFIG: Record<ChannelStatus, {
  color: 'default' | 'success' | 'warning' | 'error' | 'processing';
  text: string;
  bgColor: string;
  borderColor: string;
}> = {
  inactive: {
    color: 'default',
    text: '未激活',
    bgColor: '#f5f5f5',
    borderColor: '#d9d9d9',
  },
  active: {
    color: 'success',
    text: '激活',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f',
  },
  maintenance: {
    color: 'warning',
    text: '维护中',
    bgColor: '#fff7e6',
    borderColor: '#ffd591',
  },
};

/** 健康状态配置 */
export const HEALTH_STATUS_CONFIG: Record<ChannelHealthStatus, {
  color: 'default' | 'success' | 'warning' | 'error' | 'processing';
  text: string;
  bgColor: string;
  borderColor: string;
  icon: 'check-circle' | 'exclamation-circle' | 'close-circle' | 'question-circle';
}> = {
  unknown: {
    color: 'default',
    text: '未知',
    bgColor: '#f5f5f5',
    borderColor: '#d9d9d9',
    icon: 'question-circle',
  },
  healthy: {
    color: 'success',
    text: '健康',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f',
    icon: 'check-circle',
  },
  degraded: {
    color: 'warning',
    text: '降级',
    bgColor: '#fff7e6',
    borderColor: '#ffd591',
    icon: 'exclamation-circle',
  },
  failed: {
    color: 'error',
    text: '失败',
    bgColor: '#fff2f0',
    borderColor: '#ffccc7',
    icon: 'close-circle',
  },
};

/** 渠道类型配置 */
export const CHANNEL_TYPE_CONFIG = {
  payment: { text: '支付', color: 'blue' },
  payout: { text: '代付', color: 'purple' },
  combined: { text: '综合', color: 'cyan' },
} as const;

/** 拖拽排序提示文本 */
export const DRAG_SORT_MESSAGES = {
  dragHint: '拖拽调整优先级',
  moveSuccess: '排序已更新',
  moveError: '排序更新失败，请重试',
  priorityLabel: (priority: number) => `优先级 ${priority}`,
} as const;

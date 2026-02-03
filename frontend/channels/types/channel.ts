/**
 * Channels 模块类型定义
 * Sprint 2 - Phase 2 (API v1.0)
 */

// ==================== 渠道状态 (v1.0 Final) ====================
export type ChannelStatus = 'inactive' | 'active' | 'maintenance';
export type ChannelHealthStatus = 'unknown' | 'healthy' | 'degraded' | 'failed';
export type ChannelType = 'payment' | 'payout' | 'combined';

// ==================== 配置字段 Schema ====================
export type ConfigFieldType = 'string' | 'number' | 'enum' | 'boolean' | 'secret';

export interface ConfigFieldOption {
  label: string;
  value: string;
}

export interface ConfigFieldSchema {
  type: ConfigFieldType;
  label: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: ConfigFieldOption[];
  };
  placeholder?: string;
  helpText?: string;
}

// ==================== 渠道实体 ====================
export interface Channel {
  id: string;
  code: string;
  name: string;
  providerId: string;
  providerName: string;
  type: ChannelType;
  status: ChannelStatus;
  healthStatus: ChannelHealthStatus;
  priority: number;
  config: Record<string, unknown>;
  limits: ChannelLimits;
  stats: ChannelStats;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface ChannelStats {
  successRate24h: number;
  avgResponseMs: number;
  transactionCount24h: number;
}

// ==================== 列表查询 ====================
export interface ChannelListQuery {
  page?: number;
  pageSize?: number;
  status?: ChannelStatus;
  providerId?: string;
  type?: ChannelType;
  keyword?: string;
}

export interface ChannelListResponse {
  items: Channel[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 创建/编辑 ====================
export interface CreateChannelRequest {
  code: string;
  name: string;
  providerId: string;
  type: ChannelType;
  priority: number;
  config: Record<string, unknown>;
  limits: ChannelLimits;
}

export interface UpdateChannelRequest {
  name?: string;
  priority?: number;
  config?: Record<string, unknown>;
  limits?: ChannelLimits;
  status?: ChannelStatus;
}

// ==================== 提供商 ====================
export interface Provider {
  id: string;
  code: string;
  name: string;
  logoUrl?: string;
  supportedTypes: ChannelType[];
  configSchema: Record<string, ConfigFieldSchema>;
  channelCount: number;
}

// ==================== 路由策略 (v1.0) ====================
export interface RoutingStrategy {
  id: string;
  name: string;
  priority: number;              // 越小越优先，从 1 开始
  conditions: RoutingConditions; // 匹配条件
  targetChannelIds: string[];    // 目标渠道ID列表
  channelWeights: Record<string, number>; // 渠道权重分配
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sprint 2: 简化版单层条件
export interface RoutingConditions {
  amountMin?: number;            // 最小金额（分）
  amountMax?: number;            // 最大金额（分）
  currencies?: string[];         // 币种列表，如 ["BRL", "MXN"]
  merchantIds?: string[];        // 商户ID列表
  countries?: string[];          // 国家代码，如 ["BR", "MX"]
}

// v1.0: 交换优先级请求
export interface MoveStrategyRequest {
  targetId: string;              // 要与谁交换位置
}

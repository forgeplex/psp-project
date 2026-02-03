# Channels API Spec v0.9

> **版本**: 0.9  
> **状态**: Sprint 2 交付版  
> **日期**: 2026-02-03  
> **负责人**: Arch

---

## 1. 设计决策 (Design Decisions)

### 1.1 Sprint 边界说明

| 功能 | Sprint 2 | Sprint 3 |
|------|----------|----------|
| 路由条件 | 单层 AND 条件 | 嵌套 OR/AND、复杂表达式 |
| 策略排序 | 批量提交 reorder | 实时拖拽 PATCH |
| 健康数据 | 轮询接口 | WebSocket 实时推送 |
| 规则编辑器 | 表单化配置 | 可视化流程图/JSON |

### 1.2 技术决策确认

**Q1: 规则引擎复杂度**
- 决策：简化版（单层 AND 条件）
- 实现：表单化配置，支持 amount/currency/country/merchant_id 基础字段
- 限制：不支持 OR 条件、不支持嵌套规则组

**Q2: config_schema 字段类型**
- 决策：5 种基础类型
- 类型：`string` | `number` | `enum` | `boolean` | `secret`
- 说明：secret 类型前端显示为密码框，后端加密存储

**Q3: 拖拽排序方式**
- 决策：列表页直接拖拽 + 批量提交
- 接口：`POST /routing-strategies/reorder`
- 行为：原子性更新所有策略优先级

**Q4: 健康数据实时性**
- 决策：静态 + 手动刷新
- 接口：`GET /channels/:id/health`
- 建议：前端轮询间隔 30s

---

## 2. API 端点清单

### 2.1 渠道管理 (6 端点)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/v1/channels` | 渠道列表 | channels:read |
| GET | `/api/v1/channels/:id` | 渠道详情 | channels:read |
| POST | `/api/v1/channels` | 创建渠道 | channels:create |
| PUT | `/api/v1/channels/:id` | 更新渠道 | channels:update |
| POST | `/api/v1/channels/:id/enable` | 启用渠道 | channels:update |
| POST | `/api/v1/channels/:id/disable` | 禁用渠道 | channels:update |

### 2.2 路由策略 (5 端点)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/v1/routing-strategies` | 策略列表 | routing:read |
| POST | `/api/v1/routing-strategies` | 创建策略 | routing:manage |
| PUT | `/api/v1/routing-strategies/:id` | 更新策略 | routing:manage |
| DELETE | `/api/v1/routing-strategies/:id` | 删除策略 | routing:manage |
| POST | `/api/v1/routing-strategies/reorder` | 批量排序 | routing:manage |

### 2.3 监控与测试 (3 端点)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/v1/channels/:id/health` | 健康状态 | channels:read |
| GET | `/api/v1/channels/:id/stats` | 统计数据 | channels:read |
| POST | `/api/v1/channels/:id/test` | 连通性测试 | channels:test |

### 2.4 提供商 (1 端点)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/v1/providers` | 提供商列表 | providers:read |

---

## 3. 数据模型

### 3.1 Channel (渠道)

```typescript
interface Channel {
  id: string;                    // UUID
  name: string;                  // 渠道名称
  provider: ProviderType;        // 提供商类型
  status: ChannelStatus;         // 状态
  weight: number;                // 权重 1-100
  config: Record<string, any>;   // 渠道配置（加密存储敏感字段）
  success_rate: number;          // 近24小时成功率
  avg_response_ms: number;       // 近24小时平均响应时间
  created_at: string;            // ISO8601
  updated_at: string;            // ISO8601
}

type ProviderType = 'stripe' | 'adyen' | 'pix' | 'spei' | 'upi';
type ChannelStatus = 'active' | 'inactive' | 'error' | 'maintenance';
```

### 3.2 RoutingStrategy (路由策略)

```typescript
interface RoutingStrategy {
  id: string;
  name: string;
  priority: number;              // 越小越优先，从 1 开始
  conditions: RoutingConditions; // 匹配条件
  target_channels: string[];     // 目标渠道ID列表
  channel_weights: Record<string, number>; // 渠道权重分配
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Sprint 2: 简化版单层条件
interface RoutingConditions {
  amount_min?: number;           // 最小金额（分）
  amount_max?: number;           // 最大金额（分）
  currency?: string[];           // 币种列表，如 ["BRL", "MXN"]
  merchant_id?: string[];        // 商户ID列表
  country?: string[];            // 国家代码，如 ["BR", "MX"]
}
```

### 3.3 Config Schema (渠道配置定义)

```typescript
interface ConfigSchema {
  fields: ConfigField[];
}

interface ConfigField {
  key: string;                   // 字段标识
  label: string;                 // 显示名称
  type: ConfigFieldType;         // 字段类型
  required: boolean;             // 是否必填
  default?: any;                 // 默认值
  options?: SelectOption[];      // enum 类型选项
  placeholder?: string;          // 占位提示
  description?: string;          // 字段说明
}

type ConfigFieldType = 'string' | 'number' | 'enum' | 'boolean' | 'secret';

interface SelectOption {
  value: string;
  label: string;
}
```

### 3.4 Health Status (健康状态)

```typescript
interface ChannelHealth {
  channel_id: string;
  status: HealthStatus;          // 健康状态
  success_rate: number;          // 成功率 0-100
  avg_response_ms: number;       // 平均响应时间
  last_check_at: string;         // 最后检查时间
  next_check_at: string;         // 下次检查时间
  error_count: number;           // 连续错误次数
  message?: string;              // 状态说明
}

type HealthStatus = 'healthy' | 'warning' | 'critical' | 'offline';
```

---

## 4. 关键接口详情

### 4.1 批量排序接口

```http
POST /api/v1/routing-strategies/reorder
Authorization: Bearer {token}
Content-Type: application/json

{
  "strategy_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**说明：**
- 数组顺序即为新的优先级顺序（索引 0 = priority 1）
- 后端原子性更新所有策略的 priority 字段
- 不在列表中的策略优先级保持不变

**响应：**
```json
{
  "data": {
    "updated": 3,
    "strategies": [
      {"id": "uuid-1", "priority": 1},
      {"id": "uuid-2", "priority": 2},
      {"id": "uuid-3", "priority": 3}
    ]
  }
}
```

### 4.2 健康状态查询

```http
GET /api/v1/channels/:id/health
Authorization: Bearer {token}
```

**说明：**
- 返回缓存的健康状态（非实时计算）
- 建议前端轮询间隔：30 秒
- Sprint 3 将提供 WebSocket 实时推送

**响应：**
```json
{
  "data": {
    "channel_id": "chan-xxx",
    "status": "healthy",
    "success_rate": 98.5,
    "avg_response_ms": 245,
    "last_check_at": "2026-02-03T13:30:00Z",
    "next_check_at": "2026-02-03T13:35:00Z",
    "error_count": 0
  }
}
```

---

## 5. 枚举值定义

### 5.1 提供商类型

| 值 | 说明 |
|----|------|
| stripe | Stripe |
| adyen | Adyen |
| pix | PIX (巴西) |
| spei | SPEI (墨西哥) |
| upi | UPI (印度) |

### 5.2 渠道状态

| 值 | 说明 | 颜色 |
|----|------|------|
| active | 激活 | 绿色 |
| inactive | 未激活 | 灰色 |
| error | 错误 | 红色 |
| maintenance | 维护中 | 橙色 |

### 5.3 健康状态

| 值 | 条件 | 颜色 |
|----|------|------|
| healthy | 成功率≥95% 且 响应时间<1s | 绿色 |
| warning | 成功率90-95% 或 响应时间1-3s | 黄色 |
| critical | 成功率<90% 或 响应时间>3s | 红色 |
| offline | 健康检查连续失败 | 灰色 |

---

## 6. 错误码

| 错误码 | 描述 | HTTP |
|--------|------|------|
| CHANNEL_001 | 渠道不存在 | 404 |
| CHANNEL_002 | 渠道配置无效 | 400 |
| CHANNEL_003 | 渠道已被禁用 | 409 |
| CHANNEL_004 | 密钥解密失败 | 500 |
| ROUTING_001 | 策略不存在 | 404 |
| ROUTING_002 | 优先级冲突 | 409 |
| ROUTING_003 | 条件格式无效 | 400 |
| HEALTH_001 | 健康检查失败 | 503 |

---

## 7. 变更日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 0.9 | 2026-02-03 | Sprint 2 初始版本，包含 15 个端点 |

---

*文档结束*

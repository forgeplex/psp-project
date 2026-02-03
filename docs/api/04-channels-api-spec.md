# 04-channels-api-spec.md

> **模块**: Channels（渠道管理）  
> **版本**: v1.0  
> **发布日期**: 2026-02-03  
> **作者**: Arch  
> **状态**: 🚧 草案 - 待评审

---

## 目录

1. [变更日志](#变更日志)
2. [接口概览](#接口概览)
3. [接口详情](#接口详情)
4. [数据模型](#数据模型)
5. [路由策略规则引擎](#路由策略规则引擎)
6. [状态机定义](#状态机定义)
7. [健康检查机制](#健康检查机制)

---

## 变更日志

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| 2026-02-03 | v1.0 | 初始版本 - 15个端点 | Arch |

---

## 接口概览

### 基础信息

- **Base URL**: `https://psp-dev.forgeplex.com/api/v1`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`

### 接口列表

| 模块 | 方法 | 路径 | 说明 | 权限码 |
|------|------|------|------|--------|
| **渠道管理** | GET | `/channels` | 渠道列表查询 | `channel:view` |
| | GET | `/channels/{id}` | 渠道详情 | `channel:view` |
| | POST | `/channels` | 创建渠道 | `channel:create` |
| | PATCH | `/channels/{id}` | 更新渠道 | `channel:update` |
| | DELETE | `/channels/{id}` | 删除渠道 | `channel:delete` |
| | POST | `/channels/{id}/toggle` | 启用/禁用渠道 | `channel:toggle` |
| **路由策略** | GET | `/routing-strategies` | 路由策略列表 | `routing:view` |
| | GET | `/routing-strategies/{id}` | 路由策略详情 | `routing:view` |
| | POST | `/routing-strategies` | 创建路由策略 | `routing:create` |
| | PATCH | `/routing-strategies/{id}` | 更新路由策略 | `routing:update` |
| | POST | `/routing-strategies/reorder` | 批量调整优先级 | `routing:reorder` |
| **健康检查** | GET | `/health-checks` | 健康检查记录列表 | `health:view` |
| | GET | `/health-checks/{id}` | 健康检查详情 | `health:view` |
| | POST | `/health-checks` | 手动触发检查 | `health:trigger` |
| | GET | `/channels/{id}/health-status` | 渠道实时健康状态 | `health:view` |
| **提供商管理** | GET | `/providers` | 提供商列表 | `provider:view` |
| | GET | `/providers/{id}` | 提供商详情 | `provider:view` |

---

## 接口详情

---

### 渠道管理

#### 1. 渠道列表查询

```http
GET /channels?page=1&size=20&status=active&provider=wechat_pay
```

**Query Parameters**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| size | integer | 否 | 每页数量，默认 20 |
| status | string | 否 | 状态: `active`, `inactive`, `maintenance` |
| provider | string | 否 | 提供商编码 |
| keyword | string | 否 | 搜索关键词（名称/编码） |
| type | string | 否 | 渠道类型: `payment`, `payout`, `combined` |

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "ch_abc123",
        "code": "WECHAT_PAY",
        "name": "微信支付",
        "provider_id": "prov_wechat",
        "provider_name": "财付通",
        "type": "payment",
        "status": "active",
        "priority": 100,
        "config": {
          "app_id": "wx123456789",
          "mch_id": "1234567890"
        },
        "limits": {
          "min_amount": 0.01,
          "max_amount": 50000.00,
          "daily_limit": 1000000.00
        },
        "health_status": "healthy",
        "last_health_check": "2026-02-03T10:00:00Z",
        "success_rate_24h": 0.998,
        "avg_response_ms": 120,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-02-03T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

---

#### 2. 渠道详情

```http
GET /channels/{id}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "ch_abc123",
    "code": "WECHAT_PAY",
    "name": "微信支付",
    "description": "微信支付 - 移动端",
    "provider_id": "prov_wechat",
    "provider_name": "财付通",
    "provider_code": "WECHAT",
    "type": "payment",
    "status": "active",
    "priority": 100,
    "config": {
      "app_id": "wx123456789",
      "mch_id": "1234567890",
      "api_version": "v3"
    },
    "limits": {
      "min_amount": 0.01,
      "max_amount": 50000.00,
      "daily_limit": 1000000.00,
      "monthly_limit": 10000000.00
    },
    "routing_strategies": [
      {
        "id": "rs_001",
        "name": "默认策略",
        "priority": 1
      }
    ],
    "health_status": "healthy",
    "last_health_check": "2026-02-03T10:00:00Z",
    "success_rate_24h": 0.998,
    "avg_response_ms": 120,
    "error_rate_24h": 0.002,
    "txn_count_24h": 15420,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-02-03T09:00:00Z",
    "created_by": "admin",
    "updated_by": "admin"
  }
}
```

---

#### 3. 创建渠道

```http
POST /channels
Content-Type: application/json
```

**Request Body**:
```json
{
  "code": "ALIPAY_APP",
  "name": "支付宝 - APP支付",
  "description": "支付宝APP端支付渠道",
  "provider_id": "prov_alipay",
  "type": "payment",
  "priority": 90,
  "config": {
    "app_id": "2024XXXXXX",
    "merchant_pid": "2088XXXXXX",
    "sign_type": "RSA2"
  },
  "limits": {
    "min_amount": 0.01,
    "max_amount": 100000.00,
    "daily_limit": 5000000.00
  }
}
```

**字段验证规则**:
| 字段 | 规则 |
|------|------|
| code | 必填，唯一，大写下划线格式，2-50字符 |
| name | 必填，2-100字符 |
| provider_id | 必填，必须是存在的提供商 |
| type | 必填，枚举: `payment`, `payout`, `combined` |
| priority | 必填，整数，范围 1-9999 |
| config | JSON对象，结构由提供商定义 |

**Response 201**:
```json
{
  "code": 0,
  "data": {
    "id": "ch_new123",
    "code": "ALIPAY_APP",
    "name": "支付宝 - APP支付",
    "status": "inactive",
    "created_at": "2026-02-03T11:00:00Z"
  }
}
```

---

#### 4. 更新渠道

```http
PATCH /channels/{id}
Content-Type: application/json
```

**Request Body** (支持部分更新):
```json
{
  "name": "支付宝 - APP支付（新版）",
  "description": "更新描述",
  "priority": 95,
  "config": {
    "app_id": "2024XXXXXX",
    "merchant_pid": "2088XXXXXX",
    "sign_type": "RSA2",
    "new_field": "value"
  },
  "limits": {
    "max_amount": 200000.00
  }
}
```

**约束**:
- `code`, `type`, `provider_id` 不可修改
- 修改 `config` 时会合并而非替换（顶层key级）

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "ch_abc123",
    "updated_at": "2026-02-03T11:05:00Z"
  }
}
```

---

#### 5. 删除渠道

```http
DELETE /channels/{id}
```

**约束**:
- 只能删除 `inactive` 状态的渠道
- 有关联交易记录时禁止删除（标记废弃而非物理删除）

**Response 200**:
```json
{
  "code": 0,
  "message": "渠道已删除"
}
```

**Response 409** (存在依赖):
```json
{
  "code": 409001,
  "message": "渠道存在关联交易，无法删除",
  "data": {
    "transaction_count": 1500
  }
}
```

---

#### 6. 启用/禁用渠道

```http
POST /channels/{id}/toggle
Content-Type: application/json
```

**Request Body**:
```json
{
  "action": "enable"
}
```

**Action 枚举**:
| 值 | 说明 |
|----|----|
| enable | 启用渠道 |
| disable | 禁用渠道 |
| maintenance | 进入维护模式 |

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "ch_abc123",
    "status": "active",
    "previous_status": "inactive",
    "toggled_at": "2026-02-03T11:10:00Z"
  }
}
```

---

### 路由策略

#### 7. 路由策略列表

```http
GET /routing-strategies?page=1&size=20&status=active
```

**Query Parameters**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| size | integer | 否 | 每页数量，默认 20 |
| status | string | 否 | 状态: `active`, `inactive` |
| channel_id | string | 否 | 筛选指定渠道的策略 |

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "rs_001",
        "name": "大额优先 - 支付宝",
        "description": "金额 > 1000 优先使用支付宝",
        "priority": 1,
        "status": "active",
        "rules_count": 2,
        "target_channels": [
          { "id": "ch_alipay", "name": "支付宝", "weight": 80 },
          { "id": "ch_wechat", "name": "微信支付", "weight": 20 }
        ],
        "match_count_24h": 5230,
        "created_at": "2026-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 8,
      "total_pages": 1
    }
  }
}
```

---

#### 8. 路由策略详情

```http
GET /routing-strategies/{id}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "rs_001",
    "name": "大额优先 - 支付宝",
    "description": "金额 > 1000 优先使用支付宝",
    "priority": 1,
    "status": "active",
    "rules": {
      "conditions": [
        {
          "field": "amount",
          "operator": "gt",
          "value": 1000
        },
        {
          "field": "currency",
          "operator": "eq",
          "value": "CNY"
        }
      ],
      "logic": "AND"
    },
    "targets": [
      {
        "channel_id": "ch_alipay",
        "channel_name": "支付宝",
        "channel_code": "ALIPAY_APP",
        "weight": 80,
        "failover_to": "ch_wechat"
      },
      {
        "channel_id": "ch_wechat",
        "channel_name": "微信支付",
        "channel_code": "WECHAT_PAY",
        "weight": 20,
        "failover_to": null
      }
    ],
    "failover_config": {
      "enabled": true,
      "max_retries": 3,
      "retry_interval_ms": 500,
      "fallback_channel_id": "ch_bank_card"
    },
    "match_count_24h": 5230,
    "match_rate_24h": 0.35,
    "created_at": "2026-01-15T00:00:00Z",
    "updated_at": "2026-02-03T09:00:00Z"
  }
}
```

---

#### 9. 创建路由策略

```http
POST /routing-strategies
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "VIP用户 - 快捷支付",
  "description": "VIP等级 >= 3 用户使用快捷支付",
  "priority": 5,
  "rules": {
    "conditions": [
      {
        "field": "user.vip_level",
        "operator": "gte",
        "value": 3
      },
      {
        "field": "payment_method",
        "operator": "in",
        "value": ["QUICK_PAY"]
      }
    ],
    "logic": "AND"
  },
  "targets": [
    {
      "channel_id": "ch_quick_pay",
      "weight": 100,
      "failover_to": null
    }
  ],
  "failover_config": {
    "enabled": true,
    "max_retries": 2,
    "retry_interval_ms": 300,
    "fallback_channel_id": "ch_unionpay"
  }
}
```

**Condition 字段说明**:
| 字段 | 说明 |
|------|------|
| field | 条件字段，支持: `amount`, `currency`, `user_id`, `user.vip_level`, `merchant_id`, `payment_method`, `device_type`, `region` |
| operator | 操作符: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `not_in`, `regex` |
| value | 条件值，类型根据 field 自动推断 |

**Response 201**:
```json
{
  "code": 0,
  "data": {
    "id": "rs_new123",
    "name": "VIP用户 - 快捷支付",
    "priority": 5,
    "status": "active",
    "created_at": "2026-02-03T11:15:00Z"
  }
}
```

---

#### 10. 更新路由策略

```http
PATCH /routing-strategies/{id}
Content-Type: application/json
```

**Request Body** (支持部分更新):
```json
{
  "name": "VIP用户 - 快捷支付（更新）",
  "priority": 4,
  "rules": {
    "conditions": [
      {
        "field": "user.vip_level",
        "operator": "gte",
        "value": 2
      }
    ],
    "logic": "AND"
  },
  "targets": [
    {
      "channel_id": "ch_quick_pay",
      "weight": 70,
      "failover_to": "ch_unionpay"
    },
    {
      "channel_id": "ch_unionpay",
      "weight": 30,
      "failover_to": null
    }
  ]
}
```

**约束**:
- `rules` 和 `targets` 更新时会全量替换（非合并）
- 修改 `priority` 时会自动重新排序其他策略

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "rs_001",
    "updated_at": "2026-02-03T11:20:00Z"
  }
}
```

---

#### 11. 批量调整优先级

```http
POST /routing-strategies/reorder
Content-Type: application/json
```

**Request Body**:
```json
{
  "orders": [
    { "id": "rs_001", "priority": 1 },
    { "id": "rs_003", "priority": 2 },
    { "id": "rs_002", "priority": 3 }
  ]
}
```

**约束**:
- `orders` 数组必须包含所有活跃策略的 ID
- priority 必须唯一且连续（1-N）

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "updated": 3,
    "orders": [
      { "id": "rs_001", "priority": 1 },
      { "id": "rs_003", "priority": 2 },
      { "id": "rs_002", "priority": 3 }
    ]
  }
}
```

---

### 健康检查

#### 12. 健康检查记录列表

```http
GET /health-checks?page=1&size=20&channel_id=ch_abc123&status=failed
```

**Query Parameters**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| size | integer | 否 | 每页数量，默认 20 |
| channel_id | string | 否 | 筛选指定渠道 |
| status | string | 否 | 结果: `healthy`, `degraded`, `failed` |
| start_time | string | 否 | 开始时间 (ISO 8601) |
| end_time | string | 否 | 结束时间 (ISO 8601) |

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "hc_001",
        "channel_id": "ch_abc123",
        "channel_name": "微信支付",
        "channel_code": "WECHAT_PAY",
        "check_type": "scheduled",
        "status": "healthy",
        "response_time_ms": 85,
        "checks": {
          "connectivity": { "passed": true, "response_ms": 45 },
          "auth": { "passed": true, "response_ms": 20 },
          "transaction": { "passed": true, "response_ms": 20 }
        },
        "error_message": null,
        "created_at": "2026-02-03T10:00:00Z"
      },
      {
        "id": "hc_002",
        "channel_id": "ch_abc123",
        "channel_name": "微信支付",
        "channel_code": "WECHAT_PAY",
        "check_type": "scheduled",
        "status": "failed",
        "response_time_ms": 5001,
        "checks": {
          "connectivity": { "passed": true, "response_ms": 50 },
          "auth": { "passed": true, "response_ms": 25 },
          "transaction": { "passed": false, "response_ms": 5001, "error": "timeout" }
        },
        "error_message": "交易测试超时 (>5000ms)",
        "created_at": "2026-02-03T09:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

---

#### 13. 健康检查详情

```http
GET /health-checks/{id}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "hc_001",
    "channel_id": "ch_abc123",
    "channel_name": "微信支付",
    "channel_code": "WECHAT_PAY",
    "check_type": "scheduled",
    "status": "healthy",
    "response_time_ms": 85,
    "checks": {
      "connectivity": {
        "passed": true,
        "response_ms": 45,
        "details": {
          "host": "api.mch.weixin.qq.com",
          "port": 443,
          "tls_version": "TLSv1.2"
        }
      },
      "auth": {
        "passed": true,
        "response_ms": 20,
        "details": {
          "token_valid": true,
          "expires_in": 7200
        }
      },
      "transaction": {
        "passed": true,
        "response_ms": 20,
        "details": {
          "test_txn_id": "test_123",
          "test_amount": 0.01
        }
      }
    },
    "error_message": null,
    "created_at": "2026-02-03T10:00:00Z"
  }
}
```

---

#### 14. 手动触发健康检查

```http
POST /health-checks
Content-Type: application/json
```

**Request Body**:
```json
{
  "channel_ids": ["ch_abc123", "ch_def456"]
}
```

**说明**:
- 如果不传 `channel_ids`，则对所有活跃渠道执行健康检查
- 单次最多支持 20 个渠道

**Response 202**:
```json
{
  "code": 0,
  "data": {
    "job_id": "hc_job_123",
    "status": "pending",
    "channel_count": 2,
    "estimated_duration_ms": 10000,
    "message": "健康检查任务已创建"
  }
}
```

---

#### 15. 渠道实时健康状态

```http
GET /channels/{id}/health-status
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "channel_id": "ch_abc123",
    "channel_name": "微信支付",
    "status": "healthy",
    "last_check": {
      "id": "hc_001",
      "status": "healthy",
      "created_at": "2026-02-03T10:00:00Z"
    },
    "metrics": {
      "success_rate_1h": 0.999,
      "success_rate_24h": 0.998,
      "avg_response_ms_1h": 115,
      "avg_response_ms_24h": 120,
      "error_rate_1h": 0.001,
      "error_rate_24h": 0.002
    },
    "consecutive_failures": 0,
    "degraded_since": null
  }
}
```

**Status 枚举**:
| 状态 | 说明 | 自动切换 |
|------|------|----------|
| healthy | 健康 | - |
| degraded | 降级（响应慢或偶发错误） | 触发降级策略 |
| failed | 故障（连续失败） | 自动切换备用渠道 |
| unknown | 未知（无检查记录） | - |

---

### 提供商管理

#### 16. 提供商列表

```http
GET /providers?page=1&size=20&status=active
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "prov_wechat",
        "code": "WECHAT",
        "name": "财付通",
        "name_en": "WeChat Pay",
        "status": "active",
        "supported_types": ["payment", "payout"],
        "supported_currencies": ["CNY", "HKD"],
        "channel_count": 3,
        "created_at": "2026-01-01T00:00:00Z"
      },
      {
        "id": "prov_alipay",
        "code": "ALIPAY",
        "name": "支付宝",
        "name_en": "Alipay",
        "status": "active",
        "supported_types": ["payment", "payout"],
        "supported_currencies": ["CNY"],
        "channel_count": 2,
        "created_at": "2026-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

---

#### 17. 提供商详情

```http
GET /providers/{id}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "prov_wechat",
    "code": "WECHAT",
    "name": "财付通",
    "name_en": "WeChat Pay",
    "description": "腾讯旗下第三方支付平台",
    "status": "active",
    "supported_types": ["payment", "payout"],
    "supported_currencies": ["CNY", "HKD"],
    "config_schema": {
      "app_id": { "type": "string", "required": true },
      "mch_id": { "type": "string", "required": true },
      "api_key": { "type": "string", "required": true, "secret": true },
      "api_version": { "type": "string", "enum": ["v2", "v3"], "default": "v3" }
    },
    "channels": [
      {
        "id": "ch_abc123",
        "code": "WECHAT_PAY",
        "name": "微信支付",
        "status": "active"
      }
    ],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-15T00:00:00Z"
  }
}
```

---

## 数据模型

### Channel（渠道）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 渠道ID，唯一标识 |
| code | string | 渠道编码，业务唯一 |
| name | string | 渠道名称 |
| description | string | 渠道描述 |
| provider_id | string | 所属提供商ID |
| provider_name | string | 提供商名称（冗余） |
| type | string | 类型: `payment`/`payout`/`combined` |
| status | string | 状态: `active`/`inactive`/`maintenance` |
| priority | integer | 优先级，数值越小越优先 |
| config | object | 渠道配置（JSON，由提供商定义结构） |
| limits | object | 限额配置 |
| health_status | string | 健康状态 |
| last_health_check | datetime | 最后检查时间 |
| success_rate_24h | decimal | 24小时成功率 |
| avg_response_ms | integer | 平均响应时间(ms) |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### RoutingStrategy（路由策略）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 策略ID |
| name | string | 策略名称 |
| description | string | 策略描述 |
| priority | integer | 优先级，1-N，越小越优先匹配 |
| status | string | 状态: `active`/`inactive` |
| rules | object | 匹配规则（条件组合） |
| targets | array | 目标渠道及权重配置 |
| failover_config | object | 故障转移配置 |
| match_count_24h | integer | 24小时匹配次数 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### HealthCheck（健康检查）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 检查记录ID |
| channel_id | string | 渠道ID |
| check_type | string | 类型: `scheduled`/`manual`/`auto_failover` |
| status | string | 结果: `healthy`/`degraded`/`failed` |
| response_time_ms | integer | 总响应时间 |
| checks | object | 各检查项详情 |
| error_message | string | 错误信息 |
| created_at | datetime | 检查时间 |

### Provider（提供商）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 提供商ID |
| code | string | 提供商编码 |
| name | string | 中文名称 |
| name_en | string | 英文名称 |
| description | string | 描述 |
| status | string | 状态: `active`/`inactive` |
| supported_types | array | 支持的渠道类型 |
| supported_currencies | array | 支持的币种 |
| config_schema | object | 配置字段定义 |

---

## 路由策略规则引擎

### 条件字段 (Condition Fields)

| 字段 | 类型 | 示例 |
|------|------|------|
| amount | decimal | 100.50 |
| currency | string | "CNY" |
| merchant_id | string | "mch_123" |
| user_id | string | "user_456" |
| user.vip_level | integer | 3 |
| payment_method | string | "QUICK_PAY" |
| device_type | string | "ios" / "android" / "web" |
| region | string | "CN" / "HK" / "US" |

### 操作符 (Operators)

| 操作符 | 说明 | 适用类型 |
|--------|------|----------|
| eq | 等于 | 所有 |
| ne | 不等于 | 所有 |
| gt | 大于 | number |
| gte | 大于等于 | number |
| lt | 小于 | number |
| lte | 小于等于 | number |
| in | 在列表中 | 所有 |
| not_in | 不在列表中 | 所有 |
| regex | 正则匹配 | string |

### 匹配逻辑

```
// 规则评估顺序（优先级 1-N）
for strategy in strategies order by priority:
    if strategy.status != 'active': continue
    if match(strategy.rules, transaction):
        return select_target(strategy.targets)

// 未匹配到任何策略时，使用默认渠道
default_channel = get_default_channel()
return default_channel

// 目标选择（加权随机）
function select_target(targets):
    total_weight = sum(t.weight for t in targets)
    random = random(0, total_weight)
    for target in targets:
        random -= target.weight
        if random <= 0:
            return target.channel_id
```

---

## 状态机定义

### 渠道状态机

```
         ┌─────────────┐
         │   inactive  │
         │   (初始状态)  │
         └──────┬──────┘
                │ enable
                ▼
         ┌─────────────┐     disable      ┌─────────┐
         │    active   │ ◄──────────────► │ inactive│
         │   (运营中)   │                  └─────────┘
         └──────┬──────┘
                │ maintenance
                ▼
         ┌─────────────┐     restore      ┌─────────┐
         │ maintenance │ ◄──────────────► │  active │
         │   (维护中)   │                  └─────────┘
         └─────────────┘
```

### 健康状态机

```
              ┌─────────┐
    ┌────────►│ unknown │◄────────┐
    │         └────┬────┘         │
    │              │ check        │
    │              ▼              │
    │    ┌───────────────────┐    │
    │    │      healthy      │◄───┤ recovery
    └────┤    (连续成功 3+)   │    │
         └─────────┬─────────┘    │
                   │ failure      │
                   ▼              │
         ┌───────────────────┐    │
         │     degraded      │────┘
         │  (连续失败 1-2次)  │
         │   or 响应超时      │
         └─────────┬─────────┘
                   │ failure
                   ▼
         ┌───────────────────┐
         │      failed       │
         │   (连续失败 3+)   │
         └───────────────────┘
```

---

## 健康检查机制

### 检查类型

| 类型 | 触发方式 | 频率 |
|------|----------|------|
| scheduled | CronJob | 每 5 分钟 |
| manual | API 调用 | 即时 |
| auto_failover | 交易失败后 | 即时 |

### 检查项

| 检查项 | 说明 | 超时 |
|--------|------|------|
| connectivity | TCP/TLS 连接测试 | 5s |
| auth | 认证令牌有效性 | 5s |
| transaction | 小额测试交易 | 10s |

### 状态判定

| 状态 | 条件 |
|------|------|
| healthy | 所有检查项通过 |
| degraded | 任一检查项响应 >2s 或偶发失败 |
| failed | 任一检查项失败或超时 |

---

## 错误码

| 错误码 | 说明 | HTTP |
|--------|------|------|
| 400001 | 参数验证失败 | 400 |
| 400002 | 渠道编码已存在 | 400 |
| 404001 | 渠道不存在 | 404 |
| 404002 | 路由策略不存在 | 404 |
| 404003 | 提供商不存在 | 404 |
| 409001 | 渠道存在关联交易 | 409 |
| 409002 | 渠道处于活跃状态，无法删除 | 409 |
| 409003 | 路由策略优先级冲突 | 409 |
| 422001 | 配置格式无效 | 422 |

---

*文档结束 - v1.0 (草案)*

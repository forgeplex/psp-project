# 03-transactions-api-spec.md

> **模块**: Transactions（交易管理）  
> **版本**: v1.0  
> **发布日期**: 2026-02-03  
> **作者**: Arch  
> **状态**: ✅ 已发布

---

## 目录

1. [变更日志](#变更日志)
2. [BE 业务规则确认](#be-业务规则确认)
3. [FE 澄清回复](#fe-澄清回复)
4. [权限码列表](#权限码列表)
5. [接口概览](#接口概览)
6. [接口详情](#接口详情)
7. [数据模型](#数据模型)
8. [状态机定义](#状态机定义)
9. [WebSocket 事件](#websocket-事件)
10. [导出字段定义](#导出字段定义)

---

## 变更日志

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| 2026-02-03 | v1.0 | 初始版本 | Arch |
| 2026-02-03 | v1.1 | 路径对齐后端实现：Cancel-/transactions/{id}/cancel; Correction-/corrections; 初审-/review; 终审-/approve | Arch |

---


## 参考实现

> **OpenAPI 3.0 Spec**: [forgeplex/psp-docs/docs/api/admin-openapi.yaml](https://github.com/forgeplex/psp-docs/blob/main/docs/api/admin-openapi.yaml)
> 
> 由 BE 维护，包含完整 API 定义（37484 行，~1MB）

## BE 业务规则确认

### 1. Refund 同步还是异步？

| 场景 | 方式 | 说明 |
|------|------|------|
| **单笔退款** | ✅ 同步 | 实时返回结果，HTTP 200 |
| **批量退款 ≤10条** | ✅ 同步 | 实时处理，HTTP 200 + 完整结果 |
| **批量退款 >10条** | ✅ 异步 | 返回 HTTP 202 + `jobId`，通过轮询或 WebSocket 获取结果 |

**异步结果查询**: `GET /api/v1/refunds/batch/jobs/{jobId}`

### 2. 部分退款是否支持？

✅ **支持部分退款**

**规则**:
- 单笔交易可多次退款，累计金额 ≤ 原交易金额
- 每次退款需指定退款金额（`amount`）
- 退款后交易状态变为 `PARTIALLY_REFUNDED`（部分退款）或 `FULLY_REFUNDED`（全额退款）

**校验逻辑**:
```
已退款总额 + 本次退款金额 ≤ 原交易金额
```

**数据模型**:
- `Transaction.refundedAmount`: 累计已退款金额
- `Transaction.refundableAmount`: 剩余可退款金额 = amount - refundedAmount

### 3. Correct 审批流程如何设计？

采用 **两级审批** 机制：

```
申请 → 初审 → 终审 → 执行校正
         ↓      ↓
       驳回   驳回
```

**流程细节**:

| 步骤 | 操作人 | 状态变更 | 说明 |
|------|--------|----------|------|
| 1. 提交申请 | 操作员 | `DRAFT` → `PENDING_REVIEW` | 填写校正原因、凭证 |
| 2. 初审 | 初审人 | `PENDING_REVIEW` → `PENDING_FINAL_REVIEW` | 初审通过/驳回 |
| 3. 终审 | 审核人 | `PENDING_FINAL_REVIEW` → `APPROVED`/`REJECTED` | 终审通过/驳回 |
| 4. 执行 | 系统 | `APPROVED` → `COMPLETED` | 自动执行校正 |

**关键规则**:
- ⚠️ **初审人与审核人不能为同一人**（来自 ADR-024）
- 驳回需填写原因
- 审批时效：初审 24h，终审 24h，超时自动驳回

**权限码**:
- `correct:submit` - 提交校正申请
- `correct:initial_review` - 初审权限
- `correct:final_review` - 终审权限

---

## FE 澄清回复

### 1. API Spec 何时发布？

✅ **已发布** - 本文档即为正式 API Spec，版本 v1.0

### 2. 权限码列表

详见 [权限码列表](#权限码列表) 章节

### 3. WebSocket 是否需要？

✅ **需要**，用于以下场景：

| 场景 | 事件名 | 说明 |
|------|--------|------|
| 批量退款进度 | `batch_refund.progress` | 实时进度推送 |
| 批量退款完成 | `batch_refund.completed` | 完成通知 |
| 交易状态变更 | `transaction.status_changed` | 交易状态实时更新 |
| 审批通知 | `approval.pending` | 新的审批待办 |

**连接地址**: `wss://psp-dev.forgeplex.com/ws/transactions`

**认证方式**: 通过 JWT Token 认证，连接时携带 `?token={jwt}`

### 4. 导出字段定义

详见 [导出字段定义](#导出字段定义) 章节

### 5. 状态机可视化要求

**要求**:
- 交易详情页需展示 **状态流转时间线**（Timeline）
- 每个状态节点显示：状态名、时间、操作人
- 当前状态高亮显示
- 支持查看历史状态变更记录

**时间线数据**: 通过 `GET /api/v1/transactions/{id}/timeline` 获取

---

## 权限码列表

| 权限码 | 说明 | 适用角色 |
|--------|------|----------|
| `transaction:view` | 查看交易列表/详情 | 所有角色 |
| `transaction:export` | 导出交易数据 | 运营、管理员 |
| `transaction:search` | 高级搜索 | 所有角色 |
| `refund:create` | 单笔退款申请 | 运营、管理员 |
| `refund:batch` | 批量退款 | 运营主管、管理员 |
| `refund:approve` | 退款审批 | 风控、管理员 |
| `cancel:create` | 取消交易 | 运营、管理员 |
| `correct:submit` | 提交校正申请 | 财务 |
| `correct:initial_review` | 初审校正申请 | 财务主管 |
| `correct:final_review` | 终审校正申请 | 财务总监 |
| `stats:view` | 查看统计 | 管理员 |

---

## 接口概览

### 基础信息

- **Base URL**: `https://psp-dev.forgeplex.com/api/v1`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`

### 接口列表

| 方法 | 路径 | 说明 | 权限码 |
|------|------|------|--------|
| GET | `/transactions` | 交易列表查询 | `transaction:view` |
| GET | `/transactions/{id}` | 交易详情 | `transaction:view` |
| GET | `/transactions/{id}/history` | 交易历史记录 | `transaction:view` |
| GET | `/transactions/{id}/timeline` | 状态时间线 | `transaction:view` |
| POST | `/transactions/export` | 导出交易 | `transaction:export` |
| GET | `/transactions/stats` | 交易统计 | `stats:view` |
| POST | `/refunds` | 单笔退款 | `refund:create` |
| POST | `/refunds/batch` | 批量退款 | `refund:batch` |
| GET | `/refunds/batch/jobs/{jobId}` | 查询批量任务 | `refund:batch` |
| POST | `/refunds/{id}/approve` | 审批退款 | `refund:approve` |
| POST | `/cancels` | 取消交易 | `cancel:create` |
| POST | `/corrections` | 申请校正 | `correct:submit` |
| POST | `/corrections/{id}/review` | 初审校正 | `correct:initial_review` |
| POST | `/corrections/{id}/approve` | 终审校正 | `correct:final_review` |

---

## 接口详情

### 1. 交易列表查询

```http
GET /transactions?page=1&size=20&status=completed&startDate=2026-01-01
```

**Query 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| size | integer | 否 | 每页条数，默认 20，最大 100 |
| status | string | 否 | 交易状态，支持多选（逗号分隔） |
| type | string | 否 | 交易类型 |
| startDate | string | 否 | 开始日期 (YYYY-MM-DD) |
| endDate | string | 否 | 结束日期 (YYYY-MM-DD) |
| keyword | string | 否 | 关键词搜索（订单号、用户ID等） |
| minAmount | decimal | 否 | 最小金额 |
| maxAmount | decimal | 否 | 最大金额 |
| sortBy | string | 否 | 排序字段，默认 createdAt |
| sortOrder | string | 否 | asc/desc，默认 desc |

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "txn_abc123",
        "orderId": "ORD-2026-001",
        "type": "PAYMENT",
        "status": "COMPLETED",
        "amount": 999.99,
        "currency": "CNY",
        "userId": "user_123",
        "userName": "张三",
        "paymentMethod": "ALIPAY",
        "createdAt": "2026-02-03T10:30:00Z",
        "completedAt": "2026-02-03T10:31:00Z",
        "refundedAmount": 0,
        "refundableAmount": 999.99
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

### 2. 交易详情

```http
GET /transactions/{id}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "txn_abc123",
    "orderId": "ORD-2026-001",
    "type": "PAYMENT",
    "status": "COMPLETED",
    "statusLabel": "已完成",
    "amount": 999.99,
    "currency": "CNY",
    "userId": "user_123",
    "userName": "张三",
    "userEmail": "zhangsan@example.com",
    "paymentMethod": "ALIPAY",
    "paymentMethodLabel": "支付宝",
    "gateway": "ALIPAY_OFFICIAL",
    "gatewayTradeNo": "2026020322001156789012345678",
    "subject": "商品购买",
    "description": "iPhone 16 Pro",
    "createdAt": "2026-02-03T10:30:00Z",
    "paidAt": "2026-02-03T10:31:00Z",
    "completedAt": "2026-02-03T10:31:00Z",
    "expiredAt": "2026-02-03T11:30:00Z",
    "clientIp": "192.168.1.1",
    "deviceInfo": {
      "os": "iOS",
      "version": "17.0",
      "device": "iPhone"
    },
    "refundedAmount": 0,
    "refundableAmount": 999.99,
    "metadata": {
      "source": "mobile_app",
      "campaign": "spring_sale"
    }
  }
}
```

---

### 3. 交易历史记录

```http
GET /transactions/{id}/history
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "hist_001",
        "transactionId": "txn_abc123",
        "action": "CREATE",
        "actionLabel": "创建交易",
        "operatorId": "user_123",
        "operatorName": "张三",
        "beforeState": null,
        "afterState": {"status": "PENDING"},
        "remark": "用户下单",
        "createdAt": "2026-02-03T10:30:00Z"
      },
      {
        "id": "hist_002",
        "transactionId": "txn_abc123",
        "action": "PAY",
        "actionLabel": "支付成功",
        "operatorId": "system",
        "operatorName": "系统",
        "beforeState": {"status": "PENDING"},
        "afterState": {"status": "PAID"},
        "remark": "支付宝支付成功",
        "createdAt": "2026-02-03T10:31:00Z"
      }
    ]
  }
}
```

---

### 4. 状态时间线

```http
GET /transactions/{id}/timeline
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "currentStatus": "COMPLETED",
    "nodes": [
      {
        "status": "PENDING",
        "label": "待支付",
        "completed": true,
        "time": "2026-02-03T10:30:00Z",
        "operator": "张三"
      },
      {
        "status": "PAID",
        "label": "已支付",
        "completed": true,
        "time": "2026-02-03T10:31:00Z",
        "operator": "系统"
      },
      {
        "status": "COMPLETED",
        "label": "已完成",
        "completed": true,
        "time": "2026-02-03T10:31:00Z",
        "operator": "系统"
      }
    ]
  }
}
```

---

### 5. 导出交易

```http
POST /transactions/export
Content-Type: application/json
```

**Request Body**:
```json
{
  "filters": {
    "status": "completed",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  },
  "fields": ["id", "orderId", "amount", "status", "createdAt"],
  "format": "xlsx"
}
```

**Response 200** (同步，数据量小):
```json
{
  "code": 0,
  "data": {
    "downloadUrl": "https://psp-dev.forgeplex.com/exports/transactions_20260203.xlsx",
    "expiresAt": "2026-02-03T12:00:00Z"
  }
}
```

**Response 202** (异步，数据量大):
```json
{
  "code": 0,
  "data": {
    "jobId": "job_export_123",
    "status": "pending",
    "message": "导出任务已创建，请稍后下载"
  }
}
```

---

### 6. 交易统计

```http
GET /transactions/stats?startDate=2026-01-01&endDate=2026-01-31
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "overview": {
      "totalCount": 1000,
      "totalAmount": 999999.99,
      "successCount": 950,
      "successAmount": 950000.00,
      "refundCount": 50,
      "refundAmount": 50000.00,
      "successRate": 0.95
    },
    "byStatus": [
      {"status": "COMPLETED", "count": 900, "amount": 900000.00},
      {"status": "REFUNDED", "count": 50, "amount": 50000.00},
      {"status": "FAILED", "count": 50, "amount": 49999.99}
    ],
    "byPaymentMethod": [
      {"method": "ALIPAY", "count": 600, "amount": 600000.00},
      {"method": "WECHAT", "count": 400, "amount": 399999.99}
    ],
    "trend": [
      {"date": "2026-01-01", "count": 30, "amount": 30000.00},
      {"date": "2026-01-02", "count": 45, "amount": 45000.00}
    ]
  }
}
```

---

### 7. 单笔退款

```http
POST /refunds
Content-Type: application/json
```

**Request Body**:
```json
{
  "transactionId": "txn_abc123",
  "amount": 100.00,
  "reason": "商品质量问题",
  "reasonCode": "QUALITY_ISSUE",
  "notifyUrl": "https://merchant.example.com/callback"
}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "refundId": "ref_001",
    "transactionId": "txn_abc123",
    "amount": 100.00,
    "status": "COMPLETED",
    "refundNo": "REF20260203123456",
    "gatewayRefundNo": "2026020322001156789012345678",
    "completedAt": "2026-02-03T11:00:00Z"
  }
}
```

**错误码**:
- `REFUND_AMOUNT_EXCEED`: 退款金额超过可退金额
- `TRANSACTION_NOT_REFUNDABLE`: 交易不可退款

---

### 8. 批量退款

```http
POST /refunds/batch
Content-Type: application/json
```

**Request Body**:
```json
{
  "items": [
    {
      "transactionId": "txn_abc123",
      "amount": 100.00,
      "reason": "商品质量问题"
    },
    {
      "transactionId": "txn_def456",
      "amount": 200.00,
      "reason": "用户要求退款"
    }
  ],
  "notifyUrl": "https://merchant.example.com/batch-callback"
}
```

**Response 200** (≤10条，同步):
```json
{
  "code": 0,
  "data": {
    "jobId": null,
    "status": "completed",
    "total": 2,
    "success": 2,
    "failed": 0,
    "results": [
      {
        "transactionId": "txn_abc123",
        "success": true,
        "refundId": "ref_001"
      },
      {
        "transactionId": "txn_def456",
        "success": true,
        "refundId": "ref_002"
      }
    ],
    "completedAt": "2026-02-03T11:00:00Z"
  }
}
```

**Response 202** (>10条，异步):
```json
{
  "code": 0,
  "data": {
    "jobId": "job_batch_123",
    "status": "pending",
    "total": 50,
    "progress": 0,
    "message": "批量退款任务已创建"
  }
}
```

---

### 9. 查询批量任务

```http
GET /refunds/batch/jobs/{jobId}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "jobId": "job_batch_123",
    "status": "processing",
    "statusLabel": "处理中",
    "total": 50,
    "processed": 25,
    "success": 23,
    "failed": 2,
    "progress": 50,
    "createdAt": "2026-02-03T10:00:00Z",
    "startedAt": "2026-02-03T10:01:00Z",
    "estimatedCompletedAt": "2026-02-03T10:05:00Z",
    "results": [
      {
        "transactionId": "txn_abc123",
        "success": true,
        "refundId": "ref_001",
        "message": "退款成功"
      },
      {
        "transactionId": "txn_def456",
        "success": false,
        "errorCode": "REFUND_AMOUNT_EXCEED",
        "message": "退款金额超过可退金额"
      }
    ]
  }
}
```

---

### 10. 取消交易

```http
POST /transactions/{id}/cancel
Content-Type: application/json
```

**Request Body**:
```json
{
  "transactionId": "txn_abc123",
  "reason": "用户取消订单",
  "reasonCode": "USER_CANCEL"
}
```

**规则**:
- 只有 `PENDING` 状态的交易可以取消
- 已支付交易需走退款流程

---

### 11. 申请校正

```http
POST /corrections
Content-Type: application/json
```

**Request Body**:
```json
{
  "transactionId": "txn_abc123",
  "correctType": "AMOUNT_ADJUSTMENT",
  "correctTypeLabel": "金额调整",
  "beforeValue": "999.99",
  "afterValue": "899.99",
  "reason": "计算错误，多收100元",
  "attachments": [
    {"name": "计算说明.pdf", "url": "https://..."}
  ]
}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "correctId": "cor_001",
    "transactionId": "txn_abc123",
    "status": "PENDING_REVIEW",
    "submitterId": "user_123",
    "submitterName": "张三",
    "submittedAt": "2026-02-03T10:00:00Z"
  }
}
```

---

### 12. 初审校正

```http
POST /corrections/{id}/review
Content-Type: application/json
```

**Request Body**:
```json
{
  "action": "APPROVE",
  "comment": "核实无误，提交终审"
}
```

**action 枚举**: `APPROVE`, `REJECT`

---

### 13. 终审校正

```http
POST /corrections/{id}/approve
Content-Type: application/json
```

**Request Body**:
```json
{
  "action": "APPROVE",
  "comment": "同意调整"
}
```

**规则**: 终审通过后系统自动执行校正操作

---

## 数据模型

### Transaction（交易）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 交易ID |
| orderId | string | 商户订单号 |
| type | enum | 类型: PAYMENT, REFUND, TRANSFER |
| status | enum | 状态 |
| amount | decimal | 金额 |
| currency | string | 币种 |
| userId | string | 用户ID |
| userName | string | 用户姓名 |
| paymentMethod | string | 支付方式 |
| gateway | string | 支付网关 |
| gatewayTradeNo | string | 网关流水号 |
| subject | string | 订单标题 |
| description | string | 订单描述 |
| createdAt | datetime | 创建时间 |
| paidAt | datetime | 支付时间 |
| completedAt | datetime | 完成时间 |
| refundedAmount | decimal | 已退款金额 |
| refundableAmount | decimal | 可退款金额 |
| metadata | json | 扩展数据 |

### Refund（退款）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 退款ID |
| transactionId | string | 原交易ID |
| amount | decimal | 退款金额 |
| status | enum | 状态 |
| reason | string | 退款原因 |
| reasonCode | string | 原因代码 |
| refundNo | string | 退款单号 |
| gatewayRefundNo | string | 网关退款单号 |
| completedAt | datetime | 完成时间 |

### Correct（校正）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 校正ID |
| transactionId | string | 交易ID |
| correctType | enum | 校正类型 |
| beforeValue | string | 原值 |
| afterValue | string | 新值 |
| status | enum | 状态 |
| submitterId | string | 申请人ID |
| initialApproverId | string | 初审人ID |
| reviewerId | string | 审核人ID |
| submittedAt | datetime | 申请时间 |
| initialApprovedAt | datetime | 初审时间 |
| reviewedAt | datetime | 终审时间 |

---

## 状态机定义

### 交易状态机

```
                    ┌─────────────┐
                    │   PENDING   │
                    │   (待支付)   │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   EXPIRED   │ │    PAID     │ │   CLOSED    │
    │   (已过期)   │ │   (已支付)   │ │   (已关闭)   │
    └─────────────┘ └──────┬──────┘ └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │  COMPLETED  │ │   FAILED    │ │ PARTIALLY   │
       │   (已完成)   │ │   (失败)    │ │ _REFUNDED   │
       └─────────────┘ └─────────────┘ └──────┬──────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │ FULLY       │
                                       │ _REFUNDED   │
                                       │ (全额退款)   │
                                       └─────────────┘
```

### 退款状态机

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PENDING   │────▶│  PROCESSING │────▶│  COMPLETED  │
│   (待处理)   │     │   (处理中)   │     │   (已完成)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                     ▲
       │                                     │
       ▼                                     │
┌─────────────┐                              │
│    FAILED   │──────────────────────────────┘
│   (失败)    │
└─────────────┘
```

### 校正状态机

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    DRAFT    │────▶│  PENDING_REVIEW │────▶│PENDING_FINAL_REVIEW│
│   (草稿)    │     │    (待初审)      │     │     (待终审)      │
└─────────────┘     └────────┬────────┘     └────────┬────────┘
                             │                       │
                    ┌─────────┴─────────┐   ┌───────┴───────┐
                    │                   │   │               │
                    ▼                   │   ▼               │
             ┌─────────────┐            │ ┌─────────────┐   │
             │   REJECTED  │            │ │   REJECTED  │   │
             │   (已驳回)   │            │ │   (已驳回)   │   │
             └─────────────┘            │ └─────────────┘   │
                                        │                   │
                                        ▼                   ▼
                                  ┌─────────────────────────────┐
                                  │           APPROVED          │
                                  │           (已通过)           │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                           ┌─────────────┐
                                           │   COMPLETED │
                                           │   (已执行)   │
                                           └─────────────┘
```

---

## WebSocket 事件

### 连接

```
wss://psp-dev.forgeplex.com/ws/transactions?token={JWT_TOKEN}
```

### 事件类型

#### 1. 批量退款进度

```json
{
  "type": "batch_refund.progress",
  "data": {
    "jobId": "job_batch_123",
    "progress": 50,
    "processed": 25,
    "total": 50,
    "status": "processing"
  }
}
```

#### 2. 批量退款完成

```json
{
  "type": "batch_refund.completed",
  "data": {
    "jobId": "job_batch_123",
    "status": "completed",
    "total": 50,
    "success": 48,
    "failed": 2
  }
}
```

#### 3. 交易状态变更

```json
{
  "type": "transaction.status_changed",
  "data": {
    "transactionId": "txn_abc123",
    "oldStatus": "PAID",
    "newStatus": "COMPLETED",
    "changedAt": "2026-02-03T10:31:00Z"
  }
}
```

#### 4. 审批通知

```json
{
  "type": "approval.pending",
  "data": {
    "type": "correct",
    "id": "cor_001",
    "transactionId": "txn_abc123",
    "submitterName": "张三",
    "submittedAt": "2026-02-03T10:00:00Z"
  }
}
```

---

## 导出字段定义

### 交易导出字段

| 字段名 | 类型 | 说明 | 默认选中 |
|--------|------|------|----------|
| id | string | 交易ID | ✅ |
| orderId | string | 订单号 | ✅ |
| type | string | 交易类型 | ✅ |
| status | string | 状态 | ✅ |
| amount | decimal | 金额 | ✅ |
| currency | string | 币种 | ✅ |
| userId | string | 用户ID | ❌ |
| userName | string | 用户姓名 | ✅ |
| userEmail | string | 用户邮箱 | ❌ |
| paymentMethod | string | 支付方式 | ✅ |
| gateway | string | 支付网关 | ❌ |
| gatewayTradeNo | string | 网关流水号 | ❌ |
| subject | string | 订单标题 | ✅ |
| description | string | 订单描述 | ❌ |
| createdAt | datetime | 创建时间 | ✅ |
| paidAt | datetime | 支付时间 | ❌ |
| completedAt | datetime | 完成时间 | ❌ |
| clientIp | string | 客户端IP | ❌ |
| refundedAmount | decimal | 已退款金额 | ❌ |
| refundableAmount | decimal | 可退款金额 | ❌ |

### 导出格式

- **Excel (.xlsx)**: 默认格式，最大 50,000 条
- **CSV (.csv)**: 大数据量，最大 100,000 条
- **JSON (.json)**: 完整数据，无条数限制

---

## 错误码

| 错误码 | 说明 | HTTP Status |
|--------|------|-------------|
| 0 | 成功 | 200 |
| 400001 | 参数错误 | 400 |
| 400002 | 退款金额超过可退金额 | 400 |
| 400003 | 交易不可退款 | 400 |
| 400004 | 初审人与审核人不能为同一人 | 400 |
| 401001 | 未授权 | 401 |
| 403001 | 权限不足 | 403 |
| 404001 | 交易不存在 | 404 |
| 404002 | 退款不存在 | 404 |
| 409001 | 交易状态冲突 | 409 |
| 500001 | 服务器内部错误 | 500 |

---

## 关联文档

- [04-transactions-business-rules.md](./04-transactions-business-rules.md) 
- [ADR-024: 批量退款技术方案](../adr/ADR-024-batch-refund-technical-spec.md)
- [ADR-023: 风控服务 Fail-Open 策略](../adr/ADR-023-risk-fail-open-strategy.md)
- [BE OpenAPI 3.0 Spec](https://github.com/forgeplex/psp-docs/blob/main/docs/api/admin-openapi.yaml) - 完整 API 定义（由 BE 维护）

---

*文档结束*

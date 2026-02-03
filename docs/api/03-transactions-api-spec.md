# 03-transactions-api-spec.md

> **模块**: Transactions（交易管理）  
> **版本**: v1.1  
> **发布日期**: 2026-02-03  
> **作者**: Arch  
> **状态**: ✅ 已发布 (对齐实现)

---

## 目录

1. [变更日志](#变更日志)
2. [接口概览](#接口概览)
3. [接口详情](#接口详情)
4. [数据模型](#数据模型)
5. [状态机定义](#状态机定义)

---

## 变更日志

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| 2026-02-03 | v1.0 | 初始版本 | Arch |
| 2026-02-03 | v1.1 | **对齐 BE 实现路径** - 更新所有路径以匹配当前后端实现 | Arch |

---

## 接口概览

### 基础信息

- **Base URL**: `https://psp-dev.forgeplex.com/api/v1`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`

### 接口列表

| 方法 | 路径 | 说明 | 权限码 |
|------|------|------|--------|
| POST | `/transactions/search` | 交易列表查询 | `transaction:view` |
| GET | `/transactions/{id}` | 交易详情 | `transaction:view` |
| GET | `/transactions/{id}/history` | 交易历史记录（含时间线） | `transaction:view` |
| POST | `/transactions/export` | 导出交易 | `transaction:export` |
| GET | `/transactions/stats/overview` | 交易统计 | `stats:view` |
| POST | `/transactions/{id}/refund` | 单笔退款 | `refund:create` |
| POST | `/transactions/batch-refund` | 批量退款 | `refund:batch` |
| GET | `/transactions/batch-refund/{id}` | 查询批量退款任务 | `refund:batch` |
| POST | `/transactions/{id}/cancel` | 取消交易 | `cancel:create` |
| POST | `/transactions/{id}/correct` | 申请校正 | `correct:submit` |
| POST | `/corrections/{id}/review` | 初审校正 | `correct:initial_review` |
| POST | `/corrections/{id}/approve` | 终审校正 | `correct:final_review` |

---

## 接口详情

### 1. 交易列表查询

```http
POST /transactions/search
Content-Type: application/json
```

**Request Body**:
```json
{
  "page": 1,
  "size": 20,
  "status": ["completed"],
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "keyword": "ORDER-001",
  "min_amount": 100,
  "max_amount": 1000
}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "txn_abc123",
        "order_id": "ORD-2026-001",
        "type": "PAYMENT",
        "status": "completed",
        "amount": 999.99,
        "currency": "CNY",
        "user_id": "user_123",
        "user_name": "张三",
        "payment_method": "ALIPAY",
        "created_at": "2026-02-03T10:30:00Z",
        "completed_at": "2026-02-03T10:31:00Z",
        "refunded_amount": 0,
        "refundable_amount": 999.99
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "total_pages": 5
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
    "order_id": "ORD-2026-001",
    "type": "PAYMENT",
    "status": "completed",
    "amount": 999.99,
    "currency": "CNY",
    "user_id": "user_123",
    "user_name": "张三",
    "payment_method": "ALIPAY",
    "gateway_trade_no": "2026020322001156789012345678",
    "subject": "商品购买",
    "created_at": "2026-02-03T10:30:00Z",
    "paid_at": "2026-02-03T10:31:00Z",
    "completed_at": "2026-02-03T10:31:00Z",
    "refunded_amount": 0,
    "refundable_amount": 999.99
  }
}
```

---

### 3. 交易历史记录（含时间线）

```http
GET /transactions/{id}/history
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "transaction_id": "txn_abc123",
    "current_status": "completed",
    "histories": [
      {
        "id": "hist_001",
        "status": "pending",
        "label": "待支付",
        "completed": true,
        "time": "2026-02-03T10:30:00Z",
        "operator": "张三",
        "operator_type": "user"
      },
      {
        "id": "hist_002",
        "status": "paid",
        "label": "已支付",
        "completed": true,
        "time": "2026-02-03T10:31:00Z",
        "operator": "系统",
        "operator_type": "system"
      },
      {
        "id": "hist_003",
        "status": "completed",
        "label": "已完成",
        "completed": true,
        "time": "2026-02-03T10:31:00Z",
        "operator": "系统",
        "operator_type": "system"
      }
    ]
  }
}
```

---

### 4. 交易统计

```http
GET /transactions/stats/overview?start_date=2026-01-01&end_date=2026-01-31
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "total_count": 1000,
    "total_amount": 999999.99,
    "success_count": 950,
    "success_amount": 950000.00,
    "refund_count": 50,
    "refund_amount": 50000.00,
    "success_rate": 0.95
  }
}
```

---

### 5. 单笔退款

```http
POST /transactions/{id}/refund
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 100.00,
  "reason": "商品质量问题",
  "reason_code": "QUALITY_ISSUE"
}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "refund_id": "ref_001",
    "transaction_id": "txn_abc123",
    "amount": 100.00,
    "status": "completed",
    "refund_no": "REF20260203123456",
    "completed_at": "2026-02-03T11:00:00Z"
  }
}
```

---

### 6. 批量退款

```http
POST /transactions/batch-refund
Content-Type: application/json
```

**Request Body**:
```json
{
  "items": [
    {
      "transaction_id": "txn_abc123",
      "amount": 100.00,
      "reason": "商品质量问题"
    },
    {
      "transaction_id": "txn_def456",
      "amount": 200.00,
      "reason": "用户要求退款"
    }
  ]
}
```

**Response 200** (≤10条，同步):
```json
{
  "code": 0,
  "data": {
    "status": "completed",
    "total_count": 2,
    "success_count": 2,
    "failed_count": 0,
    "results": [
      {
        "transaction_id": "txn_abc123",
        "success": true,
        "refund_id": "ref_001"
      }
    ]
  }
}
```

**Response 202** (>10条，异步):
```json
{
  "code": 0,
  "data": {
    "job_id": "job_batch_123",
    "status": "pending",
    "total_count": 50,
    "message": "批量退款任务已创建"
  }
}
```

---

### 7. 查询批量退款任务

```http
GET /transactions/batch-refund/{id}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "job_batch_123",
    "status": "processing",
    "total_count": 50,
    "processed_count": 25,
    "success_count": 23,
    "failed_count": 2,
    "created_at": "2026-02-03T10:00:00Z",
    "results": [
      {
        "transaction_id": "txn_abc123",
        "success": true,
        "refund_id": "ref_001"
      }
    ]
  }
}
```

---

### 8. 取消交易

```http
POST /transactions/{id}/cancel
Content-Type: application/json
```

**Request Body**:
```json
{
  "reason": "用户取消订单",
  "reason_code": "USER_CANCEL"
}
```

**规则**:
- 只有 `pending` 状态的交易可以取消

---

### 9. 申请校正

```http
POST /transactions/{id}/correct
Content-Type: application/json
```

**Request Body**:
```json
{
  "correct_type": "AMOUNT_ADJUSTMENT",
  "before_value": "999.99",
  "after_value": "899.99",
  "reason": "计算错误"
}
```

---

## 数据模型

### Transaction（交易）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 交易ID |
| order_id | string | 商户订单号 |
| type | string | 类型: PAYMENT, REFUND |
| status | string | 状态 |
| amount | decimal | 金额 |
| currency | string | 币种 |
| user_id | string | 用户ID |
| user_name | string | 用户姓名 |
| payment_method | string | 支付方式 |
| gateway_trade_no | string | 网关流水号 |
| created_at | datetime | 创建时间 |
| paid_at | datetime | 支付时间 |
| completed_at | datetime | 完成时间 |
| refunded_amount | decimal | 已退款金额 |
| refundable_amount | decimal | 可退款金额 |

### History（历史记录/时间线）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 记录ID |
| status | string | 状态值 |
| label | string | 状态显示名 |
| completed | boolean | 是否已完成 |
| time | datetime | 时间 |
| operator | string | 操作人 |
| operator_type | string | 操作人类型: user, system |

---

## 状态机定义

### 交易状态机

```
    PENDING (待支付)
        │
    ┌───┴───┐
    │       │
    ▼       ▼
  PAID   EXPIRED/CLOSED
    │
    ▼
COMPLETED/REFUNDED
```

### 校正状态机

```
DRAFT → PENDING_REVIEW → PENDING_FINAL_REVIEW → APPROVED → COMPLETED
              │                    │
              ▼                    ▼
           REJECTED            REJECTED
```

---

## 已知差异（技术债）

以下差异已在 v1.1 中对齐实现，但建议后续统一风格：

1. **字段命名**: 当前使用 `snake_case`，Spec 原定义为 `camelCase`
2. **路径风格**: 当前实现使用嵌套资源路径（如 `/transactions/:id/refund`），Spec 原定义为扁平路径（如 `/refunds`）

---

*文档结束 - v1.1 (对齐实现)*

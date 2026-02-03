# ADR-026: 风控 Hook 预埋设计

## 状态

- 状态: 草案 📝 (待 review)
- 日期: 2026-02-03
- 决策人: Arch (架构师)
- Reviewers: PM, BE, DBA

---

## 背景

根据里程碑规划 v2.1 的 M4 风控嵌入策略决策（方案 C），M2/M3/M6 各阶段需预埋风控 Hook 接口，M4 阶段实现具体规则引擎。本 ADR 定义：

1. **Hook 接口设计** - 标准化风控检查点接口
2. **事件契约** - Risk 模块与其他模块的通信协议
3. **预埋点清单** - M2/M3/M6 各阶段的具体 Hook 位置
4. **数据字段预留** - DBA 需提前设计的字段

---

## 1. 设计原则

### 1.1 核心原则

```
┌─────────────────────────────────────────────────────────────┐
│  策略模式 + 事件驱动 + 非阻塞优先                              │
│  Strategy Pattern + Event-Driven + Fail-Open by Default     │
└─────────────────────────────────────────────────────────────┘
```

- **策略模式**: 风控规则作为可插拔策略，核心链路不感知具体实现
- **事件驱动**: 异步风控检查不阻塞主流程，通过事件回调处理结果
- **Fail-Open**: 风控服务异常时默认放行，避免阻断业务（详见 ADR-023）

### 1.2 接口设计原则

| 原则 | 说明 | 约束 |
|------|------|------|
| 单一职责 | 每个 Hook 只负责一类风控检查 | 不混合多种检查逻辑 |
| 幂等性 | 同一请求多次调用结果一致 | 支持重试机制 |
| 可观测 | 所有 Hook 调用需记录审计日志 | 包含输入/输出/耗时 |
| 可降级 | 支持开关控制和兜底策略 | 配置化启停 |

---

## 2. Hook 接口定义

### 2.1 通用接口

```go
// RiskHook 风控检查点通用接口
type RiskHook interface {
    // Name 返回 Hook 名称，用于日志和监控
    Name() string
    
    // Check 执行风控检查
    // ctx: 上下文，包含 trace_id, account_id 等
    // input: 检查输入参数
    // 返回: 检查结果 + 错误（错误仅代表调用失败，不代表检查不通过）
    Check(ctx context.Context, input RiskCheckInput) (RiskCheckResult, error)
    
    // Priority 返回优先级，高优先级先执行
    Priority() int
    
    // Enabled 是否启用
    Enabled(ctx context.Context) bool
}

// RiskCheckInput 风控检查输入
type RiskCheckInput struct {
    TraceID       string                 `json:"trace_id"`
    AccountID     string                 `json:"account_id"`
    MerchantID    string                 `json:"merchant_id"`
    UserID        string                 `json:"user_id"`
    ActionType    RiskActionType         `json:"action_type"`    // 动作类型
    Amount        decimal.Decimal        `json:"amount"`         // 金额
    Currency      string                 `json:"currency"`       // 币种
    ChannelCode   string                 `json:"channel_code"`   // 渠道编码
    Metadata      map[string]interface{} `json:"metadata"`       // 扩展字段
    Timestamp     time.Time              `json:"timestamp"`
}

// RiskCheckResult 风控检查结果
type RiskCheckResult struct {
    Decision      RiskDecision  `json:"decision"`       // 决策结果
    Score         int           `json:"score"`          // 风险评分 0-100
    RuleHits      []RuleHit     `json:"rule_hits"`      // 命中规则列表
    SuggestedAction ActionType  `json:"suggested_action"` // 建议动作
    Reason        string        `json:"reason"`         // 决策原因
    RequestID     string        `json:"request_id"`     // 风控请求ID
}

// RiskDecision 风控决策枚举
type RiskDecision string

const (
    DecisionPass    RiskDecision = "PASS"      // 通过
    DecisionReview  RiskDecision = "REVIEW"    // 人工审核
    DecisionReject  RiskDecision = "REJECT"    // 拒绝
    DecisionChallenge RiskDecision = "CHALLENGE" // 挑战(3DS/验证码)
)

// RiskActionType 风控动作类型
type RiskActionType string

const (
    ActionPaymentCreate  RiskActionType = "PAYMENT_CREATE"   // 创建支付
    ActionPaymentExecute RiskActionType = "PAYMENT_EXECUTE"  // 执行支付
    ActionPaymentComplete RiskActionType = "PAYMENT_COMPLETE" // 支付完成
    ActionLedgerCredit   RiskActionType = "LEDGER_CREDIT"    // 入账
    ActionLedgerDebit    RiskActionType = "LEDGER_DEBIT"     // 出账
    ActionSettlement     RiskActionType = "SETTLEMENT"       // 结算
    ActionWithdrawal     RiskActionType = "WITHDRAWAL"       // 提现
)
```

### 2.2 Hook 管理器

```go
// RiskHookManager Hook 管理器
type RiskHookManager struct {
    hooks    map[RiskActionType][]RiskHook
    executor RiskHookExecutor
}

// Register 注册 Hook
func (m *RiskHookManager) Register(action RiskActionType, hook RiskHook)

// Execute 执行指定动作的所有 Hook
// 执行策略：并行执行同优先级 Hook，顺序执行不同优先级
func (m *RiskHookManager) Execute(ctx context.Context, action RiskActionType, input RiskCheckInput) (*RiskCheckResult, error)

// 默认执行策略（Fail-Open）
// 1. 如果没有注册任何 Hook，直接返回 PASS
// 2. 如果 Hook 执行失败，记录错误但继续执行
// 3. 返回最严格的决策结果（REJECT > CHALLENGE > REVIEW > PASS）
```

---

## 3. 预埋点清单

### 3.1 M2 账务核心 Hook 点

```
┌─────────────────────────────────────────────────────────────┐
│ M2: Ledger 总账系统                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐  │
│  │  交易请求    │ ───► │  pre-credit │ ───► │   入账处理   │  │
│  │             │      │    Hook     │      │             │  │
│  └─────────────┘      └─────────────┘      └─────────────┘  │
│                            │                                │
│                            ▼ (风控检查)                       │
│                     ┌─────────────┐                         │
│                     │  Risk Check │                         │
│                     │  - 限额检查  │                         │
│                     │  - 频率检查  │                         │
│                     │  - 黑名单   │                         │
│                     └─────────────┘                         │
│                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐  │
│  │  出账请求    │ ───► │  pre-debit  │ ───► │   出账处理   │  │
│  │             │      │    Hook     │      │             │  │
│  └─────────────┘      └─────────────┘      └─────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**M2 预埋 Hook 清单：**

| Hook 名称 | 动作类型 | 触发时机 | 预留字段 | 说明 |
|-----------|----------|----------|----------|------|
| `LedgerPreCreditHook` | `LEDGER_CREDIT` | 入账前 | `risk_score`, `risk_decision` | 检查入账限额、频率 |
| `LedgerPreDebitHook` | `LEDGER_DEBIT` | 出账前 | `risk_score`, `risk_decision` | 检查余额充足性、出账限额 |
| `LedgerPostTransactionHook` | - | 账务变更后 | `risk_audit_log` | 记录风控审计日志 |

**DBA 需预留字段（ledger_entries 表）：**

```sql
-- ledger_entries 表新增字段
ALTER TABLE ledger_entries ADD COLUMN risk_score INT DEFAULT NULL;
ALTER TABLE ledger_entries ADD COLUMN risk_decision VARCHAR(20) DEFAULT NULL;
ALTER TABLE ledger_entries ADD COLUMN risk_request_id VARCHAR(64) DEFAULT NULL;
ALTER TABLE ledger_entries ADD COLUMN risk_checked_at TIMESTAMP DEFAULT NULL;
```

### 3.2 M3 支付链路 Hook 点

```
┌─────────────────────────────────────────────────────────────────────┐
│ M3: Payment 支付链路                                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Checkout          Payment Create Hook      Payment 创建           │
│  ┌───────┐         ┌───────────────┐        ┌───────────┐          │
│  │ 用户  │────────►│  pre-payment  │───────►│  PENDING  │          │
│  │ 下单  │         │    Hook       │        │           │          │
│  └───────┘         └───────────────┘        └─────┬─────┘          │
│         │                     ▲                   │                 │
│         │                     │                   │ pay             │
│         │              ┌──────┴──────┐           │                 │
│         │              │  Risk Check │           ▼                 │
│         │              │  - 金额校验  │     ┌───────────┐          │
│         │              │  - 商户风控  │     │ PROCESSING│          │
│         │              │  - 渠道风控  │     └─────┬─────┘          │
│         │              └─────────────┘           │                 │
│         │                                        │ channel invoke   │
│         │         Payment Complete Hook          ▼                 │
│         │        ┌───────────────┐        ┌───────────┐          │
│         └───────►│ post-payment  │◄───────│ COMPLETED │          │
│                  │    Hook       │        │           │          │
│                  └───────────────┘        └───────────┘          │
│                           ▲                                       │
│                           │ 异步风控审计                             │
│                  ┌────────┴────────┐                              │
│                  │  AML 检查 / 上报  │                              │
│                  └─────────────────┘                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**M3 预埋 Hook 清单：**

| Hook 名称 | 动作类型 | 触发时机 | 预留字段 | 说明 |
|-----------|----------|----------|----------|------|
| `PaymentCreateHook` | `PAYMENT_CREATE` | 创建支付时 | `risk_decision`, `risk_score` | 同步检查，可能阻断 |
| `PaymentExecuteHook` | `PAYMENT_EXECUTE` | 执行支付前 | `risk_challenge_id` | 3DS/挑战验证 |
| `PaymentCompleteHook` | `PAYMENT_COMPLETE` | 支付完成后 | `risk_audit_status` | 异步 AML 检查 |

**DBA 需预留字段（payments 表）：**

```sql
-- payments 表新增字段
ALTER TABLE payments ADD COLUMN risk_score INT DEFAULT NULL;
ALTER TABLE payments ADD COLUMN risk_decision VARCHAR(20) DEFAULT NULL;
ALTER TABLE payments ADD COLUMN risk_request_id VARCHAR(64) DEFAULT NULL;
ALTER TABLE payments ADD COLUMN risk_challenge_id VARCHAR(64) DEFAULT NULL;
ALTER TABLE payments ADD COLUMN risk_checked_at TIMESTAMP DEFAULT NULL;
ALTER TABLE payments ADD COLUMN risk_audit_status VARCHAR(20) DEFAULT 'PENDING';
-- 枚举: PENDING, COMPLETED, FLAGGED, REPORTED
```

### 3.3 M6 资金结算 Hook 点

```
┌─────────────────────────────────────────────────────────────────────┐
│ M6: Settlement 资金结算                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Settlement Request      Pre-Settlement Hook    Settlement 审批     │
│  ┌─────────────────┐    ┌───────────────┐       ┌──────────────┐   │
│  │ 商户发起结算     │───►│ pre-settlement│──────►│   PENDING    │   │
│  │                 │    │    Hook       │       │              │   │
│  └─────────────────┘    └───────────────┘       └──────┬───────┘   │
│         │                      ▲                       │            │
│         │                      │                       │ approve    │
│         │               ┌──────┴──────┐               │            │
│         │               │  Risk Check │               ▼            │
│         │               │  - 结算限额  │      ┌──────────────┐     │
│         │               │  - 商户评级  │      │  APPROVED    │     │
│         │               │  - 异常模式  │      └──────┬───────┘     │
│         │               └─────────────┘             │              │
│         │                                           │ execute      │
│         │              Post-Settlement Hook         ▼              │
│         │            ┌───────────────┐      ┌──────────────┐      │
│         └───────────►│post-settlement│◄─────│  COMPLETED   │      │
│                      │    Hook       │      └──────────────┘      │
│                      └───────────────┘                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**M6 预埋 Hook 清单：**

| Hook 名称 | 动作类型 | 触发时机 | 预留字段 | 说明 |
|-----------|----------|----------|----------|------|
| `SettlementPreApproveHook` | `SETTLEMENT` | 结算审批前 | `risk_decision` | 结算风控检查 |
| `SettlementPostExecuteHook` | - | 结算执行后 | `risk_audit_log` | 大额上报 |
| `WithdrawalPreHook` | `WITHDRAWAL` | 提现前 | `risk_decision` | 提现风控检查 |

**DBA 需预留字段（settlements 表）：**

```sql
-- settlements 表新增字段
ALTER TABLE settlements ADD COLUMN risk_score INT DEFAULT NULL;
ALTER TABLE settlements ADD COLUMN risk_decision VARCHAR(20) DEFAULT NULL;
ALTER TABLE settlements ADD COLUMN risk_request_id VARCHAR(64) DEFAULT NULL;
ALTER TABLE settlements ADD COLUMN risk_checked_at TIMESTAMP DEFAULT NULL;
ALTER TABLE settlements ADD COLUMN risk_approval_level INT DEFAULT 0;
-- 0=自动, 1=一级审批, 2=二级审批
```

---

## 4. 事件契约

### 4.1 风控事件定义

```go
// RiskEvent 风控事件（用于异步处理）
type RiskEvent struct {
    EventID      string          `json:"event_id"`
    EventType    RiskEventType   `json:"event_type"`
    Timestamp    time.Time       `json:"timestamp"`
    TraceID      string          `json:"trace_id"`
    AccountID    string          `json:"account_id"`
    MerchantID   string          `json:"merchant_id"`
    ActionType   RiskActionType  `json:"action_type"`
    Amount       decimal.Decimal `json:"amount"`
    Currency     string          `json:"currency"`
    Decision     RiskDecision    `json:"decision"`
    Score        int             `json:"score"`
    RuleHits     []RuleHit       `json:"rule_hits"`
    Metadata     EventMetadata   `json:"metadata"`
}

type RiskEventType string

const (
    EventRiskCheckRequested RiskEventType = "RISK_CHECK_REQUESTED"
    EventRiskCheckCompleted RiskEventType = "RISK_CHECK_COMPLETED"
    EventRiskAlertTriggered RiskEventType = "RISK_ALERT_TRIGGERED"
    EventRiskCaseCreated    RiskEventType = "RISK_CASE_CREATED"
)

// EventMetadata 事件元数据
type EventMetadata struct {
    SourceModule string                 `json:"source_module"` // ledger/payment/settlement
    SourceAction string                 `json:"source_action"` // create/execute/complete
    EntityType   string                 `json:"entity_type"`   // payment/settlement/ledger_entry
    EntityID     string                 `json:"entity_id"`
    Extra        map[string]interface{} `json:"extra"`
}
```

### 4.2 事件流

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Module    │────►│   Hook      │────►│ Risk Engine │────►│   Result    │
│ (M2/M3/M6)  │     │   Point     │     │  (M4实现)   │     │  (Event)    │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                  │
                                                                  ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Downstream │◄────│  Event Bus  │◄────│ Risk Worker │◄────│  Processor  │
│   (Audit)   │     │  (Temporal) │     │   (M4)      │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 4.3 Temporal Workflow 定义（M4 实现）

```go
// RiskCheckWorkflow 风控检查工作流（M4 实现）
type RiskCheckWorkflow interface {
    // Execute 执行风控检查流程
    Execute(ctx workflow.Context, input RiskCheckInput) (RiskCheckResult, error)
}

// 检查步骤（可配置）
// 1. LimitCheckActivity   - 限额检查
// 2. FrequencyCheckActivity - 频率检查  
// 3. BlacklistCheckActivity - 黑名单检查
// 4. VelocityCheckActivity  - 速度检查
// 5. AMLScreeningActivity   - AML 筛查
// 6. RuleEngineActivity     - 规则引擎评分
```

---

## 5. 实现阶段规划

### 5.1 M2/M3/M6 阶段（预埋）

| 任务 | 负责 | 交付物 | 说明 |
|------|------|--------|------|
| Hook 接口定义 | Arch | 本文档 | ✅ 已完成 |
| Hook 管理器框架 | BE | `internal/risk/hook/` | 空实现，只打日志 |
| 数据库字段预留 | DBA | Migration 脚本 | 见第3节字段清单 |
| Hook 埋点植入 | BE | 代码 PR | 在关键点调用 Hook |

### 5.2 M4 阶段（实现）

| 任务 | 负责 | 交付物 | 说明 |
|------|------|--------|------|
| Risk Engine 实现 | BE | `internal/risk/engine/` | 规则引擎 |
| Temporal Workflow | BE | `internal/risk/workflow/` | 异步风控流程 |
| 规则配置界面 | FE | Risk Rule UI | 运营后台功能 |
| AML 集成 | BE | AML Service Adapter | 第三方 AML 服务 |

---

## 6. 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| Hook 预埋遗漏 | 中 | 代码 Review 检查清单 |
| 字段预留不足 | 低 | 预留 JSONB 扩展字段 |
| 性能影响 | 低 | 默认空实现，无实际调用开销 |
| M4 实现不兼容 | 低 | 严格接口契约，M2/M3 只依赖接口 |

---

## 7. 相关文档

| 文档 | 路径 | 说明 |
|------|------|------|
| ADR-023 | `docs/adr/ADR-023-risk-fail-open-strategy.md` | 风控 Fail-Open 策略 |
| ADR-025 | `docs/adr/ADR-025-transaction-core-architecture.md` | 交易核心架构 |
| 里程碑 v2.1 | `psp-docs/docs/milestone-v2.1.md` | 里程碑规划 |

---

## 8. 决策记录

| 日期 | 决策 | 决策人 | 状态 |
|------|------|--------|------|
| 2026-02-03 | 采用方案 C（M4 保留 + 规则提前预埋） | Alex | ✅ 已确认 |
| 2026-02-03 | Hook 采用策略模式 + 事件驱动 | Arch | 📝 待 Review |


# ROADMAP.md - 项目规划

> 🔄 最后更新：2026-02-03 | 维护人：Atath（PM）
> 📋 里程碑映射：已同步里程碑 v2.1 规划 (14 milestones)

---

## 里程碑总览 (v2.1)

```
关键路径: M0 → M0.5 → (M1a ∥ M1b ∥ M1c) → M1d → M2 → M3 → M4 → M6 → (M7 ∥ M8) → M9
```

| 里程碑 | 名称 | 核心交付 | 阻塞风险 | 状态 |
|--------|------|---------|---------|------|
| M0 | 基础设施层 | Gateway/Temporal/Outbox/Analytics/Monitor/Agent | 高 | ⏳ |
| **M0.5** | **Keycloak 基础设施** | Realm配置/OIDC基础能力 | **极高** | ⏳ |
| M1a | Admin 认证 | Keycloak OIDC + RBAC + 审计 | 中 | ⏳ |
| M1b | Merchant Portal | Keycloak Client + 租户隔离 | 高 | ⏳ |
| M1c | Agent Portal | Keycloak Client + 层级代理 | 中 | ⏳ |
| **M1d** | **Gateway API 认证** | API Key + 签名验证 | **极高** | ⏳ |
| M2 | 账务核心 | Ledger/Tokenization | 高 | ⏳ |
| M3 | 核心支付链路 | Channel→Payment→Transaction→Ledger | **极高** | ⏳ |
| M4 | 风控合规 | Risk/AML/Compliance/Sandbox | 高 | ⏳ |
| M5 | 商户接入 | Merchant/KYB/Webhook/Notification | 中 | ⏳ |
| M6 | 资金结算 | Settlement/Treasury/Recon | 高 | ⏳ |
| M7 | 运营支撑 | Ops/Admin/Audit/Report/Scheduler/I18n | 低 | ⏳ |
| M8 | Worker 集群 | 11个 Worker 服务 | 中 | ⏳ |
| M9 | 完善上线 | 性能优化/文档/灾备 | 中 | ⏳ |

> 🔴 **关键阻塞点**: M0.5 (阻塞 M1a/b/c) → M1d (阻塞 M3)

---

## 认证体系与里程碑映射

```
                    ┌─────────────────────────────────────┐
                    │           M0 基础设施层               │
                    │  Gateway/Temporal/Outbox/Monitor    │
                    └─────────────────┬───────────────────┘
                                      ↓
                    ┌─────────────────────────────────────┐
                    │        M0.5 Keycloak 基础设施        │
                    │      (所有 OIDC 的共享基础)            │
                    └─────────────────┬───────────────────┘
                                      ↓
        ┌─────────────────────────────┼─────────────────────────────┐
        ↓                             ↓                             ↓
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   M1a Admin   │           │ M1b Merchant  │           │  M1c Agent    │
│  Keycloak     │           │  Keycloak     │           │  Keycloak     │
│ OIDC + RBAC   │           │ OIDC + 租户   │           │ OIDC + 层级   │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    ↓
                    ┌─────────────────────────────────────┐
                    │     M1d Gateway API 认证            │
                    │      API Key + 签名验证              │
                    └─────────────────┬───────────────────┘
                                      ↓
                    ┌─────────────────────────────────────┐
                    │      M2 账务核心 + M3 支付链路        │
                    │   Ledger/Channel/Payment/Txn        │
                    └─────────────────┬───────────────────┘
                                      ↓
                              后续里程碑 (M4-M9)
```

### 认证方式对照

| 平台 | 端口 | 认证方式 | 隔离机制 | 里程碑 |
|------|------|---------|---------|--------|
| Admin API | 8082 | Keycloak OIDC | RBAC 细粒度 | M1a |
| Merchant Portal | 8081 | Keycloak OIDC | 租户+商户隔离 | M1b |
| Agent Portal | 8083 | Keycloak OIDC | 层级代理体系 | M1c |
| Gateway API | 8080 | API Key + 签名 | 账户级隔离 | M1d |

---

## Sprint 规划（基于 M1a-d 认证体系）

### Sprint 2（Channels Sprint 2）
**目标**：完成 4 平台认证体系端到端  
**周期**：2026-02-06 ~ 2026-02-19

| 任务 | 负责 | 优先级 | 状态 | 依赖 |
|------|------|--------|------|------|
| M0.5 Keycloak 基础设施部署 | Infra | P0 | ⏳ | M0 |
| M1a Admin RBAC 模型设计 | Arch + DBA | P0 | ⏳ | M0.5 |
| M1b Merchant 租户隔离 | Arch + BE | P0 | ⏳ | M0.5, M1a |
| M1c Agent 层级体系 | Arch + BE | P1 | ⏳ | M0.5, M1a |
| M1d Gateway API Key 体系 | Arch + BE | P0 | ⏳ | M1b |
| API 规范更新 (认证相关) | Arch | P0 | ⏳ | - |

### Sprint 3（规划中）
**目标**：M2 账务核心 + M3 支付链路基础  
**周期**：待定

| 任务 | 负责 | 优先级 | 状态 |
|------|------|--------|------|
| M2 Ledger 总账系统 | DBA + BE | P0 | ⏳ |
| M3 Channel/Payment 基础 | BE | P0 | ⏳ |
| 核心链路端到端测试 | QA | P0 | ⏳ |

---

## GitHub Project 看板状态

**当前看板**: 9/14 milestones 已创建
- ✅ M0.5, M1a, M1b, M1c, M1d, M2, M3, M4, M5
- ⏳ M0, M6, M7, M8, M9 (待 Review 后添加)

**阻塞标记**: 🔴 M0.5, M1d

🔗 看板链接: https://github.com/orgs/forgeplex/projects/1

---

## 技术方案关联文档

| 文档 | 位置 | 说明 |
|-----|------|------|
| 里程碑 v2.1 详细规划 | `psp-docs/docs/milestone-v2.1.md` | PM 输出，14 里程碑完整定义 |
| 认证架构分析 | `psp-project/AUTH-ARCHITECTURE.md` | Arch 输出，4 平台认证详情 |
| 模块清单 | `psp-project/MODULES.md` | Arch 输出，42+ 模块分析 |

---

## 关键待确认事项

1. **M6-M9** 是否立即创建 milestones？等待 Plan Review 决定
2. **M4 风控嵌入策略** — 是否应与 M2/M3 并行而非独立里程碑？
3. **M0.5 边界** — Keycloak 部署是否包含在 M1a/b/c 中？
4. **M1d 依赖** — 是否必须等待 M1b 完成？

---

*此文件由 Atath（PM）维护，Arch 负责技术方案映射同步*

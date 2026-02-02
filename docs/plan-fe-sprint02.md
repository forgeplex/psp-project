# FE Plan: Sprint 02 - Transactions 模块

> **Agent**: FE  
> **Sprint**: 02 (2026-02-03 ~ 2026-02-07)  
> **故事点**: 48  
> **状态**: Plan 阶段  
> **创建日期**: 2026-02-03

---

## 1. 任务理解

Sprint 02 交付 Transactions 交易管理模块，FE 负责 11 个前端任务共 48 故事点，涵盖：

- **交易查询**: 列表、详情、导出
- **交易操作**: 退款、取消、风控审批
- **批量退款**: 选择/上传、进度追踪
- **修正管理**: 申请、审核、审批（二级审批流）
- **轮询监控**: 统计仪表盘、人工处理队列

---

## 2. 执行计划

### Phase 1 (02-03 ~ 02-04): P0 核心页面

| 任务 | 用户故事 | 内容 |
|------|----------|------|
| T1 | US-02-01 | 交易列表页 `/transaction/list` - 15+ 筛选条件、分页、排序 |
| T2 | US-02-02 | 交易详情页 `/transaction/:id` - 基本信息 + Tab（商户/渠道/支付/历史）|

### Phase 2 (02-05): 操作功能

| 任务 | 用户故事 | 内容 |
|------|----------|------|
| T3 | US-02-04 | 退款弹窗 - 全额/部分退款、原因必填、二次确认 |
| T4 | US-02-05 | 取消确认弹窗 - pending 状态检查、原因必填 |
| T5 | US-02-03 | 导出功能 - 异步任务、下载组件 |
| T6 | US-02-08 | 修正列表/详情页 `/transaction/correction/*` |

### Phase 3 (02-06): 审批流程

| 任务 | 用户故事 | 内容 |
|------|----------|------|
| T7 | US-02-06 | 风控审批弹窗 - 批准/拒绝、原因记录 |
| T8 | US-02-09 | 修正申请弹窗 - 类型选择、附件上传 |

### Phase 4 (02-07): 批量与监控

| 任务 | 用户故事 | 内容 |
|------|----------|------|
| T9 | US-02-07 | 批量退款 - 多选组件、CSV上传、进度页 |
| T10 | US-02-10/11 | 审核/审批页面 - 待审核/待审批快捷入口 |
| T11 | US-02-12/13 | 轮询监控页 `/polling/*` - 统计卡片、人工处理列表 |

---

## 3. 技术方案

### 3.1 路由结构

```
/transaction
  ├── /list
  ├── /:id
  ├── /batch-refund
  └── /correction
        ├── /list
        ├── /:id
        ├── /pending-review
        └── /pending-approval
/polling
  ├── /stats
  └── /manual-review
```

### 3.2 组件复用

- 复用 Merchants 模块的 `FilterPanel`, `DataTable`, `DetailLayout`
- 新增: `RefundModal`, `CancelModal`, `CorrectionForm`, `BatchUpload`, `ApprovalPanel`

### 3.3 API 集成

- API Spec 已就绪 (`psp-project/docs/api/03-transactions-api-spec.md`)
- 使用 `openapi-typescript` 生成类型
- 按模块拆分 `queries/transaction.ts`, `queries/correction.ts`, `queries/polling.ts`

### 3.4 WebSocket 集成

- 连接: `wss://psp-dev.forgeplex.com/ws/transactions?token={jwt}`
- 监听事件: `batch_refund.progress`, `batch_refund.completed`, `transaction.status_changed`

---

## 4. 预期产出

1. **代码**: 11 个页面/组件完整实现
2. **API 集成**: 14 个 API 端点对接
3. **文档**: 组件使用说明、页面路由表
4. **自测**: 所有 P0/P1 功能通过手动验证

---

## 5. 假设与风险

| 假设 | 风险 | 缓解 |
|------|------|------|
| API Spec 已发布 | API 变更 | 已与 Arch 确认 v1.0 版本 |
| 复用 Merchants 设计 | UI 风格不一致 | 与 UIUX 确认设计规范 |
| DBA 明天完成数据模型 | 字段变更 | 与 Arch 确认核心字段 |

---

## 6. 需要澄清

1. ✅ **API Spec**: Arch 已发布 `03-transactions-api-spec.md`
2. ✅ **权限码**: 已定义 (`transaction:view`, `refund:create`, `correct:submit` 等)
3. ⏳ **设计稿**: UIUX 是否有 Transactions 设计稿？还是沿用 Merchants 风格？
4. ✅ **批量退款 CSV 格式**: 模板已在 API Spec 中定义

---

## 7. 依赖检查

| 依赖项 | 来源 | 状态 | 影响 |
|--------|------|------|------|
| API Spec | Arch | ✅ 已发布 | 无阻塞 |
| 数据库模型 | DBA | ⏳ 待输出 | 字段确认 |
| 设计稿 | UIUX | ⏳ 待确认 | 可用 Merchants 风格替代 |
| 后端 API | BE | ⏳ 开发中 | Mock 数据先行 |

---

## 8. 验收标准

- [ ] 交易列表支持 15+ 筛选条件、分页、排序
- [ ] 交易详情展示完整信息（商户/渠道/支付/历史）
- [ ] 退款支持全额/部分退款，有二次确认
- [ ] 批量退款支持多选 + CSV 上传 + 进度追踪
- [ ] 修正管理完整支持二级审批流程
- [ ] 轮询监控仪表盘展示统计信息
- [ ] 所有 P0 功能通过自测

---

*Plan 版本: 1.0*  
*最后更新: 2026-02-03*

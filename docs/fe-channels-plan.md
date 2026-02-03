# FE Channels Plan - Sprint 2

> **文档状态**: Plan 阶段 - 待评审  
> **创建时间**: 2026-02-03  
> **评审时间**: 2026-02-04 09:00 UTC (Plan Review)

---

## 1. 任务理解

基于 Arch API Spec v1.0，实现 Channels（渠道管理）模块的前端功能，包括：

| 模块 | 核心功能 |
|------|----------|
| 渠道管理 | 渠道 CRUD、启禁用/维护状态切换、实时健康状态展示 |
| 路由策略 | 策略 CRUD、规则引擎配置、优先级排序、故障转移配置 |
| 健康检查 | 检查记录查询、手动触发检查、检查结果详情 |
| 提供商管理 | 提供商列表/详情、关联渠道展示 |

**目标**: 完成所有页面开发，API 集成，通过 QA 验收

---

## 2. 执行计划

### Phase 1: 基础架构 (Day 1-2)
- [ ] API Client 代码生成 (`packages/api`)
- [ ] 类型定义与 domain model 映射
- [ ] TanStack Query hooks 封装

### Phase 2: 渠道管理模块 (Day 3-5)
- [ ] 渠道列表页 (`/channels`) - 分页、筛选、状态展示
- [ ] 渠道创建/编辑表单 - 动态配置项（基于 provider schema）
- [ ] 渠道详情页 (`/channels/$id`) - Tab 布局：概览/配置/统计
- [ ] 启禁用/维护操作确认弹窗

### Phase 3: 路由策略模块 (Day 6-8)
- [ ] 策略列表页 (`/channels/routing-strategies`)
- [ ] 策略创建/编辑 - 规则引擎可视化配置
- [ ] 目标渠道权重配置 UI
- [ ] 优先级拖拽排序

### Phase 4: 健康检查与提供商 (Day 9-10)
- [ ] 健康检查记录列表 (`/channels/health-checks`)
- [ ] 手动触发检查功能
- [ ] 提供商列表/详情 (`/channels/providers`)

### Phase 5: 联调与优化 (Day 11-12)
- [ ] API 联调测试
- [ ] 边界情况处理
- [ ] 性能优化

---

## 3. 路由设计

```
/channels
├── /                        → 渠道列表页 (ChannelListPage)
├── /create                  → 渠道创建页 (ChannelCreatePage)
├── /$channelId              → 渠道详情布局
│   ├── /                    → 概览 Tab (ChannelOverviewTab)
│   ├── /config              → 配置 Tab (ChannelConfigTab)
│   └── /edit                → 编辑页 (ChannelEditPage)
├── /routing-strategies
│   ├── /                    → 策略列表 (RoutingStrategyListPage)
│   ├── /create              → 策略创建 (RoutingStrategyCreatePage)
│   └── /$strategyId
│       ├── /                → 策略详情 (RoutingStrategyDetailPage)
│       └── /edit            → 策略编辑 (RoutingStrategyEditPage)
├── /health-checks
│   ├── /                    → 检查记录列表 (HealthCheckListPage)
│   └── /$checkId            → 检查详情 (HealthCheckDetailPage)
└── /providers
    ├── /                    → 提供商列表 (ProviderListPage)
    └── /$providerId         → 提供商详情 (ProviderDetailPage)
```

---

## 4. 预期产出

| 交付物 | 位置 |
|--------|------|
| 路由文件 | `apps/admin/src/routes/_authenticated/channels/**` |
| 页面组件 | `apps/admin/src/features/channels/pages/**` |
| API Hooks | `apps/admin/src/features/channels/hooks/**` |
| 类型定义 | `packages/api/src/generated/admin.ts` (generated) |
| 单元测试 | `apps/admin/src/features/channels/**/*.test.tsx` |

---

## 5. 依赖项

| 依赖 | 状态 | 备注 |
|------|------|------|
| API Spec v1.0 | ✅ 已就绪 | Arch 已发布 |
| OpenAPI 3.0 Spec | ⏳ 待生成 | BE `make openapi-convert-admin` |
| API Client 生成 | ⏳ 待执行 | 依赖 OpenAPI Spec |
| UIUX 设计稿 | ⏳ 待确认 | 需与 UIUX Agent 对齐 |

---

## 6. 假设与风险

### 假设
- BE API 按 Spec 实现，字段、类型保持一致
- 权限控制由后端主导，前端做 UI 级权限适配
- 动态配置表单基于 provider.config_schema 自动生成

### 风险
| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| OpenAPI Spec 生成延迟 | 中 | 可先基于 Spec 手写类型，后续替换 |
| 规则引擎 UI 复杂度 | 高 | Day 6 前与 Arch 确认规则配置交互方案 |
| 动态配置表单复杂度 | 中 | 复用 Merchants 配置表单经验 |

---

## 7. 待澄清问题

1. **路由策略规则引擎 UI**: 条件配置采用可视化构建器还是 JSON 编辑器？
2. **优先级排序**: 拖拽排序实时保存还是批量提交？
3. **健康检查自动刷新**: 检查记录列表是否需要 WebSocket 实时更新？
4. **Provider Schema 渲染**: 配置表单字段类型映射规则（string/number/enum/password）？

---

## 8. 验收标准

- [ ] 所有 17 个 API 端点完成前端集成
- [ ] 列表页支持分页、排序、筛选
- [ ] 表单验证与错误提示完整
- [ ] 单元测试覆盖率 > 60%
- [ ] QA 验收通过


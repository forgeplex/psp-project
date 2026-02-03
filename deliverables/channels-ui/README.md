# Channels Module - UI Components

Sprint 2 渠道管理模块前端页面代码

## 交付页面

### 1. 渠道列表页 (`app/admin/channels/page.tsx`)

**PM 建议实现:**
- ✅ 金额范围: 双滑块 + 输入框（精确调整）
- ✅ 渠道列表: 快速筛选栏（状态/提供商）
- ✅ 健康监控: 占位组件（时间紧张）

**功能特性:**
- 表格展示所有渠道（名称、状态、健康、权重、成功率等）
- 搜索框支持按名称筛选
- 提供商快速筛选标签栏
- 状态快速筛选标签栏
- 金额范围双滑块 + 数字输入框精确调整
- 多条件组合筛选

**技术确认:**
- `status`: active / inactive / maintenance / error (生命周期状态)
- `healthStatus`: healthy / warning / critical / offline (健康检查)

### 2. 渠道详情页 (`app/admin/channels/[id]/page.tsx`)

**功能特性:**
- 渠道头部信息卡片（状态、提供商、ID）
- 关键统计数据（成功率、响应时间、错误率、交易数）
- 渠道配置详情（金额范围、超时、重试等）
- API 凭证展示（脱敏处理）
- 健康状态监控卡片（占位组件，含时间线历史）

### 3. 路由策略列表页 (`app/admin/channels/routing/page.tsx`)

**技术确认:**
- 排序 API: `POST /routing-strategies/reorder` 
- 请求体: `{ orders: [{id, priority}] }`

**功能特性:**
- 策略列表（优先级、名称、条件、目标渠道）
- Reorder 模式：上下箭头调整优先级
- 批量保存排序（调用 reorder API）
- 启用/禁用开关
- 编辑/删除操作
- 新建策略弹窗

## 组件清单

```
app/admin/channels/
├── page.tsx                    # 渠道列表页
├── [id]/
│   └── page.tsx                # 渠道详情页
├── routing/
│   └── page.tsx                # 路由策略列表页
└── components/
    ├── ChannelStatusBadge.tsx  # 状态标签组件
    └── HealthStatusCard.tsx    # 健康状态卡片组件
```

## 技术栈

- React 19 + TypeScript
- Ant Design v6.2.2
- Next.js App Router

## 集成说明

1. 将 `channels-ui/app/admin/channels/` 目录复制到 `psp-web/app/admin/`
2. 替换 mock 数据为真实 API 调用
3. 更新路由配置

## Mock 数据

当前使用 mock 数据先行开发，API v1.0 定稿后替换为真实 API。

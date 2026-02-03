/**
 * Channels 模块入口
 * Sprint 2 - Phase 2
 */

// 类型定义
export * from './types/channel';

// 页面
export { ChannelListPage } from './pages/ChannelListPage';
export { ChannelDetailPage } from './pages/ChannelDetailPage';
export { ChannelCreatePage } from './pages/ChannelCreatePage';
export { ChannelEditPage } from './pages/ChannelEditPage';
export { RoutingStrategyListPage } from './pages/RoutingStrategyListPage';
export { RoutingStrategyFormPage } from './pages/RoutingStrategyFormPage';

// 组件
export { ChannelTable } from './components/ChannelTable';
export { ChannelFilters } from './components/ChannelFilters';
export { ChannelForm } from './components/ChannelForm';
export { ChannelStatusBadge } from './components/ChannelStatusBadge';
export { HealthIndicator } from './components/HealthIndicator';
export { ChannelTypeTag } from './components/ChannelTypeTag';
export { ChannelDetailTabs } from './components/ChannelDetailTabs';
export { DynamicConfigForm } from './components/DynamicConfigForm';

// 路由策略组件
export { RoutingStrategyTable } from './components/routing/RoutingStrategyTable';
export { RoutingStrategyForm } from './components/routing/RoutingStrategyForm';

# PROJECT.md - PSP 项目总体信息

> 🔄 最后更新：2026-02-02 | 维护人：Alex

## 项目概览

- **项目名称**：PSP（Platform Service Portal）
- **定位**：中后台管理系统
- **团队**：ForgePlex（全 AI Agent 协作团队）
- **GitHub Org**：https://github.com/forgeplex

## 仓库列表

| 仓库 | 用途 | 主要维护 |
|------|------|----------|
| `forgeplex/psp-project` | 项目信息、规划、进度 | Alex, Atath |
| `forgeplex/psp-docs` | PRD、设计文档、技术文档 | PM, UIUX, Arch |
| `forgeplex/psp-web` | 前端代码 | FE |
| `forgeplex/psp` | 后端代码 | BE |
| `forgeplex/psp-infra` | 基础设施配置 | Infra |

## 技术栈

### 前端
- **框架**：React 19 + Ant Design v6（Pro Layout）
- **构建**：Vite
- **包管理**：pnpm
- **语言**：TypeScript

### 后端
- **语言**：Go
- **框架**：Gin
- **ORM**：GORM

### 基础设施
- **认证**：Keycloak（OIDC）
- **数据库**：PostgreSQL
- **部署**：Docker + Nginx

## 环境信息

| 环境 | 域名 | 说明 |
|------|------|------|
| 开发 | https://psp-dev.forgeplex.com | 开发/测试环境 |

### Keycloak
- **地址**：https://keycloak.forgeplex.com
- **Realm**：psp
- **Client ID**：psp-admin

### 数据库
- **Host**：内部 PostgreSQL
- **Database**：psp

## 测试账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 超级管理员 |
| user1 | user123 | 普通用户 |

## Git 分支规范

- **主开发分支**：`dev`（所有日常开发基于 dev）
- **功能分支**：`feature/模块名-描述`（从 dev 切出，完成后 PR 回 dev）
- **发布分支**：`main`（稳定版本）
- **禁止**：直接 push 到 main

## Agent 工作规范

1. 每次新 session 启动 → `git pull` 此仓库 → 读取 `PROJECT.md`
2. 代码变更 → push 到对应仓库 → Slack 通知下游
3. 跨 Agent 交接必须通过 Slack + Git，不走本地路径

# 01-rbac-api-spec.md

> **模块**: RBAC 权限管理 (用户/角色/权限/菜单)  
> **版本**: v1.0  
> **发布日期**: 2026-02-03  
> **作者**: Arch  
> **状态**: 🚧 草案 - 待评审  

---

## 目录

1. [变更日志](#变更日志)
2. [设计原则](#设计原则)
3. [接口概览](#接口概览)
4. [接口详情](#接口详情)
5. [数据模型](#数据模型)
6. [权限码规范](#权限码规范)
7. [前端集成指南](#前端集成指南)

---

## 变更日志

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| 2026-02-03 | v1.0 | 初始版本 - RBAC 核心 API | Arch |

---

## 设计原则

### 1. 基于 Keycloak 的混合模型
- **认证**: 由 Keycloak 统一处理 (OAuth2/OIDC)
- **授权**: 本系统自研 RBAC 模型，与 Keycloak 角色映射

### 2. 权限粒度
- **页面权限**: 菜单/路由级别
- **按钮权限**: 操作级别 (create/update/delete/export)
- **数据权限**: 后续扩展 (行级/列级)

### 3. 前端友好
- 菜单数据支持动态路由生成
- 权限码集中返回，便于前端做按钮显隐控制
- 用户登录后一次性返回完整权限上下文

---

## 接口概览

### 基础信息

- **Base URL**: `https://psp-dev.forgeplex.com/api/v1`
- **认证方式**: Bearer Token (JWT from Keycloak)
- **Content-Type**: `application/json`

### 接口列表

| 模块 | 方法 | 路径 | 说明 | 权限码 |
|------|------|------|------|--------|
| **用户管理** | GET | `/users` | 用户列表 | `user:view` |
| | GET | `/users/{id}` | 用户详情 | `user:view` |
| | POST | `/users` | 创建用户 | `user:create` |
| | PATCH | `/users/{id}` | 更新用户 | `user:update` |
| | DELETE | `/users/{id}` | 删除用户 | `user:delete` |
| | PATCH | `/users/{id}/status` | 启用/禁用用户 | `user:toggle` |
| | GET | `/users/{id}/roles` | 获取用户角色 | `user:view` |
| | PUT | `/users/{id}/roles` | 分配用户角色 | `user:assign_role` |
| | GET | `/users/me` | 当前用户详情 | 登录即可 |
| | GET | `/users/me/permissions` | 当前用户权限 | 登录即可 |
| | GET | `/users/me/menus` | 当前用户菜单 | 登录即可 |
| **角色管理** | GET | `/roles` | 角色列表 | `role:view` |
| | GET | `/roles/{id}` | 角色详情 | `role:view` |
| | POST | `/roles` | 创建角色 | `role:create` |
| | PATCH | `/roles/{id}` | 更新角色 | `role:update` |
| | DELETE | `/roles/{id}` | 删除角色 | `role:delete` |
| | GET | `/roles/{id}/permissions` | 角色权限 | `role:view` |
| | PUT | `/roles/{id}/permissions` | 分配权限 | `role:assign_perm` |
| **权限管理** | GET | `/permissions` | 权限列表 | `perm:view` |
| | GET | `/permissions/tree` | 权限树 | `perm:view` |
| | POST | `/permissions` | 创建权限 | `perm:create` |
| | PATCH | `/permissions/{id}` | 更新权限 | `perm:update` |
| | DELETE | `/permissions/{id}` | 删除权限 | `perm:delete` |
| **菜单管理** | GET | `/menus` | 菜单列表 | `menu:view` |
| | GET | `/menus/tree` | 菜单树 | `menu:view` |
| | POST | `/menus` | 创建菜单 | `menu:create` |
| | PATCH | `/menus/{id}` | 更新菜单 | `menu:update` |
| | DELETE | `/menus/{id}` | 删除菜单 | `menu:delete` |
| | PATCH | `/menus/reorder` | 调整顺序 | `menu:reorder` |

---

## 接口详情

---

### 用户管理

#### 1. 用户列表

```http
GET /users?page=1&size=20&status=active&role=admin&keyword=zhang
```

**Query Parameters**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| size | integer | 否 | 每页数量，默认 20 |
| status | string | 否 | 状态: `active`, `inactive` |
| role_id | string | 否 | 按角色筛选 |
| keyword | string | 否 | 搜索关键词（用户名/邮箱/手机号） |

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "usr_abc123",
        "username": "admin",
        "email": "admin@forgeplex.com",
        "phone": "138****8888",
        "real_name": "管理员",
        "avatar": "https://cdn.forgeplex.com/avatars/default.png",
        "status": "active",
        "roles": [
          { "id": "role_admin", "name": "超级管理员", "code": "SUPER_ADMIN" }
        ],
        "last_login_at": "2026-02-03T10:00:00Z",
        "created_at": "2026-01-01T00:00:00Z"
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

#### 2. 用户详情

```http
GET /users/{id}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "usr_abc123",
    "username": "admin",
    "email": "admin@forgeplex.com",
    "phone": "13800138888",
    "real_name": "系统管理员",
    "avatar": "https://cdn.forgeplex.com/avatars/admin.png",
    "status": "active",
    "department": "技术部",
    "roles": [
      {
        "id": "role_admin",
        "name": "超级管理员",
        "code": "SUPER_ADMIN"
      }
    ],
    "permissions": [
      "user:view", "user:create", "user:update", "user:delete",
      "role:view", "role:create", "role:update", "role:delete"
    ],
    "last_login_at": "2026-02-03T10:00:00Z",
    "last_login_ip": "192.168.1.100",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-02-03T09:00:00Z"
  }
}
```

---

#### 3. 创建用户

```http
POST /users
Content-Type: application/json
```

**Request Body**:
```json
{
  "username": "zhangsan",
  "email": "zhangsan@forgeplex.com",
  "phone": "13800138000",
  "real_name": "张三",
  "password": "TempPass123!",
  "department": "运营部",
  "role_ids": ["role_operator"]
}
```

**字段验证规则**:
| 字段 | 规则 |
|------|------|
| username | 必填，3-32字符，字母开头，只允许字母数字下划线 |
| email | 必填，有效邮箱格式，唯一 |
| phone | 必填，中国大陆手机号格式 |
| password | 必填，8-32字符，必须包含大小写字母和数字 |
| real_name | 必填，2-20字符 |
| role_ids | 可选，角色ID数组 |

**Response 201**:
```json
{
  "code": 0,
  "data": {
    "id": "usr_new123",
    "username": "zhangsan",
    "email": "zhangsan@forgeplex.com",
    "status": "active",
    "created_at": "2026-02-03T11:00:00Z",
    "temp_password": "TempPass123!"
  }
}
```

---

#### 4. 更新用户

```http
PATCH /users/{id}
Content-Type: application/json
```

**Request Body** (支持部分更新):
```json
{
  "email": "newemail@forgeplex.com",
  "phone": "13900139000",
  "real_name": "张三（新）",
  "department": "产品部",
  "avatar": "https://cdn.forgeplex.com/avatars/zhangsan.png"
}
```

**约束**:
- `username` 不可修改
- 管理员不能修改自己的 `status`

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "usr_abc123",
    "updated_at": "2026-02-03T11:05:00Z"
  }
}
```

---

#### 5. 删除用户

```http
DELETE /users/{id}
```

**约束**:
- 不能删除当前登录用户
- 超级管理员不能删除其他超级管理员
- 软删除（标记删除，保留数据）

**Response 200**:
```json
{
  "code": 0,
  "message": "用户已删除"
}
```

---

#### 6. 启用/禁用用户

```http
PATCH /users/{id}/status
Content-Type: application/json
```

**Request Body**:
```json
{
  "status": "inactive",
  "reason": "离职"
}
```

**Status 枚举**:
| 值 | 说明 |
|----|----|
| active | 启用 |
| inactive | 禁用 |

**约束**:
- 不能禁用当前登录用户
- 禁用后用户无法登录，已有 Token 失效

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "usr_abc123",
    "status": "inactive",
    "previous_status": "active",
    "updated_at": "2026-02-03T11:10:00Z"
  }
}
```

---

#### 7. 获取用户角色

```http
GET /users/{id}/roles
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "user_id": "usr_abc123",
    "username": "zhangsan",
    "roles": [
      {
        "id": "role_operator",
        "name": "运营人员",
        "code": "OPERATOR"
      }
    ]
  }
}
```

---

#### 8. 分配用户角色

```http
PUT /users/{id}/roles
Content-Type: application/json
```

**Request Body**:
```json
{
  "role_ids": ["role_operator", "role_viewer"]
}
```

**约束**:
- 全量替换，非追加
- 至少保留一个角色

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "user_id": "usr_abc123",
    "roles": [
      { "id": "role_operator", "name": "运营人员", "code": "OPERATOR" },
      { "id": "role_viewer", "name": "只读用户", "code": "VIEWER" }
    ],
    "updated_at": "2026-02-03T11:15:00Z"
  }
}
```

---

#### 9. 当前用户详情

```http
GET /users/me
```

**说明**: 返回当前登录用户的详细信息

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "usr_abc123",
    "username": "admin",
    "email": "admin@forgeplex.com",
    "real_name": "系统管理员",
    "avatar": "https://cdn.forgeplex.com/avatars/admin.png",
    "roles": [
      { "id": "role_admin", "name": "超级管理员", "code": "SUPER_ADMIN" }
    ],
    "department": "技术部"
  }
}
```

---

#### 10. 当前用户权限

```http
GET /users/me/permissions
```

**说明**: 返回当前用户的所有权限码，用于前端按钮显隐控制

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "permissions": [
      "user:view", "user:create", "user:update", "user:delete", "user:toggle", "user:assign_role",
      "role:view", "role:create", "role:update", "role:delete", "role:assign_perm",
      "perm:view", "perm:create", "perm:update", "perm:delete",
      "menu:view", "menu:create", "menu:update", "menu:delete", "menu:reorder",
      "transaction:view", "transaction:export",
      "refund:create", "refund:batch",
      "cancel:create",
      "correct:submit", "correct:initial_review", "correct:final_review"
    ],
    "menus": [
      { "code": "dashboard", "permissions": ["view"] },
      { "code": "user", "permissions": ["view", "create", "update", "delete"] },
      { "code": "transaction", "permissions": ["view", "export", "refund"] }
    ]
  }
}
```

---

#### 11. 当前用户菜单

```http
GET /users/me/menus
```

**说明**: 返回当前用户可见的菜单树，用于动态路由生成

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "menus": [
      {
        "id": "menu_001",
        "code": "dashboard",
        "name": "仪表盘",
        "icon": "DashboardOutlined",
        "path": "/dashboard",
        "component": "Dashboard",
        "type": "menu",
        "sort": 1,
        "children": []
      },
      {
        "id": "menu_002",
        "code": "system",
        "name": "系统管理",
        "icon": "SettingOutlined",
        "path": "/system",
        "type": "directory",
        "sort": 2,
        "children": [
          {
            "id": "menu_003",
            "code": "user",
            "name": "用户管理",
            "icon": "UserOutlined",
            "path": "/system/user",
            "component": "system/User",
            "type": "menu",
            "sort": 1,
            "permissions": ["user:view"],
            "buttons": [
              { "code": "create", "name": "新增", "permission": "user:create" },
              { "code": "update", "name": "编辑", "permission": "user:update" },
              { "code": "delete", "name": "删除", "permission": "user:delete" }
            ]
          },
          {
            "id": "menu_004",
            "code": "role",
            "name": "角色管理",
            "icon": "SafetyOutlined",
            "path": "/system/role",
            "component": "system/Role",
            "type": "menu",
            "sort": 2,
            "permissions": ["role:view"]
          }
        ]
      }
    ]
  }
}
```

---

### 角色管理

#### 12. 角色列表

```http
GET /roles?page=1&size=20&status=active
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "role_admin",
        "code": "SUPER_ADMIN",
        "name": "超级管理员",
        "description": "系统最高权限",
        "status": "active",
        "user_count": 2,
        "permission_count": 50,
        "is_system": true,
        "created_at": "2026-01-01T00:00:00Z"
      },
      {
        "id": "role_operator",
        "code": "OPERATOR",
        "name": "运营人员",
        "description": "日常运营操作权限",
        "status": "active",
        "user_count": 15,
        "permission_count": 20,
        "is_system": false,
        "created_at": "2026-01-15T00:00:00Z"
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

#### 13. 角色详情

```http
GET /roles/{id}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "role_operator",
    "code": "OPERATOR",
    "name": "运营人员",
    "description": "日常运营操作权限",
    "status": "active",
    "is_system": false,
    "permissions": [
      { "id": "perm_001", "code": "transaction:view", "name": "查看交易" },
      { "id": "perm_002", "code": "refund:create", "name": "发起退款" }
    ],
    "users": [
      { "id": "usr_001", "username": "zhangsan", "real_name": "张三" }
    ],
    "created_at": "2026-01-15T00:00:00Z",
    "updated_at": "2026-02-03T09:00:00Z"
  }
}
```

---

#### 14. 创建角色

```http
POST /roles
Content-Type: application/json
```

**Request Body**:
```json
{
  "code": "VIEWER",
  "name": "只读用户",
  "description": "仅可查看数据，不可操作",
  "permission_ids": ["perm_view_001", "perm_view_002"]
}
```

**约束**:
- `code`: 大写下划线格式，唯一
- `is_system`: 自动设为 false，系统角色不可创建

**Response 201**:
```json
{
  "code": 0,
  "data": {
    "id": "role_new123",
    "code": "VIEWER",
    "name": "只读用户",
    "status": "active",
    "is_system": false,
    "created_at": "2026-02-03T11:20:00Z"
  }
}
```

---

#### 15. 更新角色

```http
PATCH /roles/{id}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "运营人员（新）",
  "description": "更新后的描述",
  "status": "active"
}
```

**约束**:
- `code` 不可修改
- 系统角色 (`is_system=true`) 只能修改描述

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "id": "role_operator",
    "updated_at": "2026-02-03T11:25:00Z"
  }
}
```

---

#### 16. 删除角色

```http
DELETE /roles/{id}
```

**约束**:
- 系统角色不可删除
- 有关联用户时禁止删除

**Response 200**:
```json
{
  "code": 0,
  "message": "角色已删除"
}
```

**Response 409**:
```json
{
  "code": 409001,
  "message": "角色存在关联用户，无法删除",
  "data": { "user_count": 15 }
}
```

---

#### 17. 获取角色权限

```http
GET /roles/{id}/permissions
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "role_id": "role_operator",
    "permissions": [
      { "id": "perm_001", "code": "transaction:view", "name": "查看交易", "module": "transaction" },
      { "id": "perm_002", "code": "refund:create", "name": "发起退款", "module": "transaction" }
    ]
  }
}
```

---

#### 18. 分配角色权限

```http
PUT /roles/{id}/permissions
Content-Type: application/json
```

**Request Body**:
```json
{
  "permission_ids": ["perm_001", "perm_002", "perm_003"]
}
```

**约束**:
- 全量替换
- 系统角色权限不可修改

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "role_id": "role_operator",
    "permission_count": 3,
    "updated_at": "2026-02-03T11:30:00Z"
  }
}
```

---

### 权限管理

#### 19. 权限列表

```http
GET /permissions?page=1&size=50&module=transaction
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "perm_001",
        "code": "transaction:view",
        "name": "查看交易",
        "description": "查看交易列表和详情",
        "module": "transaction",
        "type": "page",
        "sort": 1
      },
      {
        "id": "perm_002",
        "code": "refund:create",
        "name": "发起退款",
        "description": "对交易发起退款操作",
        "module": "transaction",
        "type": "button",
        "sort": 2
      }
    ],
    "pagination": { "page": 1, "size": 50, "total": 30, "total_pages": 1 }
  }
}
```

---

#### 20. 权限树

```http
GET /permissions/tree
```

**说明**: 返回按模块分组的权限树，用于角色分配权限时的展示

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "modules": [
      {
        "code": "system",
        "name": "系统管理",
        "permissions": [
          { "id": "perm_010", "code": "user:view", "name": "查看用户" },
          { "id": "perm_011", "code": "user:create", "name": "创建用户" }
        ]
      },
      {
        "code": "transaction",
        "name": "交易管理",
        "permissions": [
          { "id": "perm_001", "code": "transaction:view", "name": "查看交易" },
          { "id": "perm_002", "code": "refund:create", "name": "发起退款" }
        ]
      }
    ]
  }
}
```

---

#### 21. 创建权限

```http
POST /permissions
Content-Type: application/json
```

**Request Body**:
```json
{
  "code": "batch:export",
  "name": "批量导出",
  "description": "批量导出数据",
  "module": "transaction",
  "type": "button",
  "sort": 10
}
```

**Type 枚举**:
| 值 | 说明 |
|----|----|
| page | 页面权限 |
| button | 按钮权限 |
| api | API 权限 |
| data | 数据权限 |

**Response 201**:
```json
{
  "code": 0,
  "data": {
    "id": "perm_new123",
    "code": "batch:export",
    "name": "批量导出",
    "created_at": "2026-02-03T11:35:00Z"
  }
}
```

---

#### 22. 更新权限

```http
PATCH /permissions/{id}
```

**说明**: 仅允许修改 name, description, sort。code 和 module 不可修改。

---

#### 23. 删除权限

```http
DELETE /permissions/{id}
```

**约束**:
- 有关联角色时禁止删除

---

### 菜单管理

#### 24. 菜单列表

```http
GET /menus?type=menu&status=active
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "menu_001",
        "code": "dashboard",
        "name": "仪表盘",
        "icon": "DashboardOutlined",
        "path": "/dashboard",
        "component": "Dashboard",
        "type": "menu",
        "sort": 1,
        "status": "active",
        "permission_code": "dashboard:view"
      }
    ]
  }
}
```

---

#### 25. 菜单树

```http
GET /menus/tree?status=active
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "menus": [
      {
        "id": "menu_001",
        "code": "dashboard",
        "name": "仪表盘",
        "icon": "DashboardOutlined",
        "path": "/dashboard",
        "component": "Dashboard",
        "type": "menu",
        "sort": 1,
        "status": "active",
        "children": []
      },
      {
        "id": "menu_002",
        "code": "system",
        "name": "系统管理",
        "icon": "SettingOutlined",
        "path": "/system",
        "type": "directory",
        "sort": 2,
        "status": "active",
        "children": [
          {
            "id": "menu_003",
            "code": "user",
            "name": "用户管理",
            "path": "/system/user",
            "component": "system/User",
            "type": "menu",
            "sort": 1
          }
        ]
      }
    ]
  }
}
```

---

#### 26. 创建菜单

```http
POST /menus
Content-Type: application/json
```

**Request Body**:
```json
{
  "code": "merchant",
  "name": "商户管理",
  "icon": "ShopOutlined",
  "path": "/merchant",
  "component": "merchant/index",
  "type": "menu",
  "parent_id": null,
  "sort": 3,
  "permission_code": "merchant:view"
}
```

**Type 枚举**:
| 值 | 说明 |
|----|----|
| directory | 目录（仅用于分组，无页面） |
| menu | 菜单（有对应页面） |
| button | 按钮（用于页面内操作） |
| link | 外链 |

**Response 201**:
```json
{
  "code": 0,
  "data": {
    "id": "menu_new123",
    "code": "merchant",
    "name": "商户管理",
    "type": "menu",
    "sort": 3,
    "created_at": "2026-02-03T11:40:00Z"
  }
}
```

---

#### 27. 更新菜单

```http
PATCH /menus/{id}
```

**Request Body**:
```json
{
  "name": "商户管理（新）",
  "icon": "StoreOutlined",
  "sort": 4
}
```

---

#### 28. 删除菜单

```http
DELETE /menus/{id}
```

**约束**:
- 有子菜单时禁止删除
- 有关联权限时禁止删除

---

#### 29. 调整菜单顺序

```http
PATCH /menus/reorder
Content-Type: application/json
```

**Request Body**:
```json
{
  "orders": [
    { "id": "menu_001", "sort": 1 },
    { "id": "menu_002", "sort": 2 },
    { "id": "menu_003", "sort": 3 }
  ]
}
```

**Response 200**:
```json
{
  "code": 0,
  "data": {
    "updated": 3
  }
}
```

---

## 数据模型

### User（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 用户ID |
| username | string | 用户名，唯一 |
| email | string | 邮箱，唯一 |
| phone | string | 手机号，唯一 |
| real_name | string | 真实姓名 |
| avatar | string | 头像URL |
| status | string | 状态: active/inactive |
| department | string | 部门 |
| roles | array | 角色列表 |
| last_login_at | datetime | 最后登录时间 |
| last_login_ip | string | 最后登录IP |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### Role（角色）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 角色ID |
| code | string | 角色编码，唯一 |
| name | string | 角色名称 |
| description | string | 描述 |
| status | string | 状态: active/inactive |
| is_system | boolean | 是否系统角色 |
| user_count | integer | 关联用户数（计算字段） |
| permission_count | integer | 关联权限数（计算字段） |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### Permission（权限）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 权限ID |
| code | string | 权限码，唯一，格式: `module:action` |
| name | string | 权限名称 |
| description | string | 描述 |
| module | string | 所属模块 |
| type | string | 类型: page/button/api/data |
| sort | integer | 排序号 |
| created_at | datetime | 创建时间 |

### Menu（菜单）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 菜单ID |
| code | string | 菜单编码，唯一 |
| name | string | 菜单名称 |
| icon | string | 图标名称（Ant Design 图标） |
| path | string | 路由路径 |
| component | string | 组件路径 |
| type | string | 类型: directory/menu/button/link |
| parent_id | string | 父菜单ID |
| sort | integer | 排序号 |
| status | string | 状态: active/inactive |
| permission_code | string | 关联权限码 |
| children | array | 子菜单 |

---

## 权限码规范

### 格式
```
{module}:{action}
```

### 标准动作
| 动作 | 说明 | 示例 |
|------|------|------|
| view | 查看 | `user:view` |
| create | 创建 | `user:create` |
| update | 更新 | `user:update` |
| delete | 删除 | `user:delete` |
| export | 导出 | `transaction:export` |
| import | 导入 | `merchant:import` |
| toggle | 启用/禁用 | `user:toggle` |
| assign_role | 分配角色 | `user:assign_role` |
| assign_perm | 分配权限 | `role:assign_perm` |

### 模块列表
| 模块 | 说明 |
|------|------|
| user | 用户管理 |
| role | 角色管理 |
| perm | 权限管理 |
| menu | 菜单管理 |
| transaction | 交易管理 |
| channel | 渠道管理 |
| merchant | 商户管理 |
| refund | 退款管理 |

---

## 前端集成指南

### 1. 登录流程

```
1. 用户访问 Keycloak 登录页
2. 登录成功后，Keycloak 返回 JWT Token
3. 前端存储 Token，每次请求携带 `Authorization: Bearer {token}`
4. 调用 `GET /users/me/permissions` 获取权限列表
5. 调用 `GET /users/me/menus` 获取菜单树，生成动态路由
```

### 2. 按钮权限控制

```typescript
// 示例：权限检查工具
const hasPermission = (permissionCode: string): boolean => {
  return userPermissions.includes(permissionCode);
};

// 在组件中使用
{hasPermission('user:create') && (
  <Button type="primary">新增用户</Button>
)}
```

### 3. 菜单与路由映射

```typescript
// 菜单类型定义
interface Menu {
  id: string;
  code: string;
  name: string;
  icon: string;
  path: string;
  component: string;
  type: 'directory' | 'menu' | 'button';
  children?: Menu[];
}

// 生成路由配置
const generateRoutes = (menus: Menu[]): RouteConfig[] => {
  return menus.map(menu => ({
    path: menu.path,
    component: menu.type === 'menu' 
      ? () => import(`@/pages/${menu.component}`)
      : undefined,
    children: menu.children ? generateRoutes(menu.children) : undefined
  }));
};
```

### 4. 权限守卫

```typescript
// 路由守卫示例
router.beforeEach((to, from, next) => {
  const requiredPermission = to.meta.permission;
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return next('/403');
  }
  next();
});
```

---

## 错误码

| 错误码 | 说明 | HTTP |
|--------|------|------|
| 400001 | 参数验证失败 | 400 |
| 400002 | 用户名已存在 | 400 |
| 400003 | 邮箱已存在 | 400 |
| 400004 | 手机号已存在 | 400 |
| 400005 | 角色编码已存在 | 400 |
| 400006 | 权限码已存在 | 400 |
| 400007 | 菜单编码已存在 | 400 |
| 401001 | Token 无效或过期 | 401 |
| 403001 | 权限不足 | 403 |
| 403002 | 不能操作当前登录用户 | 403 |
| 403003 | 不能删除超级管理员 | 403 |
| 404001 | 用户不存在 | 404 |
| 404002 | 角色不存在 | 404 |
| 404003 | 权限不存在 | 404 |
| 404004 | 菜单不存在 | 404 |
| 409001 | 角色存在关联用户 | 409 |
| 409002 | 菜单存在子菜单 | 409 |
| 409003 | 权限存在关联角色 | 409 |
| 422001 | 密码强度不足 | 422 |

---

*文档结束 - v1.0 (草案)*

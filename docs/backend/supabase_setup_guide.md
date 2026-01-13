# Supabase 集成设置指南

为了将 Supabase 集成到 TravelBook 中，您需要按照以下步骤在 Supabase 控制台中创建项目并获取必要的连接信息：

## 1. 创建 Supabase 项目
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/)。
2. 点击 **"New Project"**。
3. 选择一个组织并输入项目名称（例如 `TravelBook`）。
4. 设置一个安全的数据库密码（请妥善保存）。
5. 选择离您最近的服务器区域。
6. 点击 **"Create new project"** 并等待项目初始化完成（约 1-2 分钟）。

## 2. 获取 API 密钥 (重要)
项目准备就绪后：
1. 在左侧菜单栏点击 **"Project Settings"** (齿轮图标)。
2. 点击 **"API"** 选项。
3. 在 **"Project API keys"** 栏位中，您会看到：
    - `Project URL`: 类似于 `https://xxxxxxxxxxxx.supabase.co`
    - `anon public` key: 是一串很长的随机字符。
4. **请将这两个值提供给我**，或者您可以直接在项目根目录下创建一个 `.env.local` 文件并写入：

```bash
NEXT_PUBLIC_SUPABASE_URL=您的Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的anon_public_key
```

## 3. 接下来我会做的事
一旦有了这些密钥，我将协助您：
-   **定义数据库架构**：我会提供 SQL 脚本来创建 `users`, `travel_books`, `scenes`, `pois` 等表格。
-   **设置鉴权**：配置登录注册功能。
-   **代码修改**：修改 `TravelBookStore` 以支持将数据推送到云端并将本地 IndexedDB 作为缓存使用。

---

> [!TIP]
> **本地数据同步**：在正式集成后，我会编写一个迁移脚本，帮助您将目前存储在浏览器本地的数据一次性同步到云端。

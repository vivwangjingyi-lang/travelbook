# 实施计划 - 修复 Scene View 及启用场景管理

## 目标
解决用户报告的 Scene View 界面问题，具体包括：
1.  修复 `layout.tsx` 中的 Hydration Error（已完成）。
2.  解决因 `scenes` 为空导致无法进入 World View 的逻辑死锁问题，启用“添加场景”功能。

## 用户审查
-   **[UI 变更]**: 将强制显示 Canvas 顶部的“世界视图 / 场景视图”切换按钮，即使当前没有场景数据。
-   **[功能新增]**: 在世界视图右下角启用“添加场景”悬浮按钮。

## 拟议变更

### App Layer

#### [MODIFY] [layout.tsx](file:///Users/bytedance/Desktop/travelbook/app/layout.tsx)
-   [x] 在 `<html>` 标签添加 `suppressHydrationWarning` 以修复 Next.js 水合错误。

#### [MODIFY] [canvas/page.tsx](file:///Users/bytedance/Desktop/travelbook/app/canvas/page.tsx)
-   **移除条件渲染**: 移除包裹由于视图切换按钮的 `scenes.length > 0` 判断，使其始终可见。
-   **实现 `handleAddScene`**: 使用 `useTravelBookStore` 的 `addScene` 方法创建新场景。
-   **传递 Props**: 将 `handleAddScene` 传递给 `<WorldView />` 的 `onAddScene` 属性。

## 验证计划

### 自动化测试
-   无（当前环境主要依赖手动验证）。

### 手动验证
1.  **Hydration 修复验证**: 刷新页面，检查控制台是否还有红色 Hydration 错误。
2.  **进入 World View**:
    -   确保当前书本无场景（或使用新书）。
    -   点击顶部的 "🌍 World View" 按钮（此前不可见）。
    -   确认进入 World View 界面，显示空状态提示。
3.  **添加场景**:
    -   点击右下角的 "+" 悬浮按钮。
    -   确认界面上出现一个新的场景节点。
    -   确认场景计数增加。
4.  **交互验证**:
    -   拖拽新创建的场景节点。
    -   双击场景节点进入 Scene View。

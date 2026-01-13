# 实施计划 - TravelBook 功能增强

## 目标
实现和修复以下核心功能：
1.  修复 `layout.tsx` 中的 Hydration Error（已完成）。
2.  解决因 `scenes` 为空导致无法进入 World View 的逻辑死锁问题，启用“添加场景”功能（已完成）。
3.  实现 Canvas 页面的父子 POI 关系支持。
4.  实现 Plot 页面的多场景切换功能。

## 用户审查
-   **[UI 变更]**: 将强制显示 Canvas 顶部的“世界视图 / 场景视图”切换按钮，即使当前没有场景数据。
-   **[功能新增]**: 在世界视图右下角启用“添加场景”悬浮按钮。
-   **[功能新增]**: Canvas 页面支持父子 POI 关系，自动建立连接，不限制添加顺序。
-   **[功能新增]**: Plot 页面支持多场景切换，用户可从不同场景选择 POI。

## 拟议变更

### App Layer

#### [MODIFY] [layout.tsx](file:///Users/bytedance/Desktop/travelbook/app/layout.tsx)
-   [x] 在 `<html>` 标签添加 `suppressHydrationWarning` 以修复 Next.js 水合错误。

#### [MODIFY] [canvas/page.tsx](file:///Users/bytedance/Desktop/travelbook/app/canvas/page.tsx)
-   **移除条件渲染**: 移除包裹由于视图切换按钮的 `scenes.length > 0` 判断，使其始终可见。
-   **实现 `handleAddScene`**: 使用 `useTravelBookStore` 的 `addScene` 方法创建新场景。
-   **传递 Props**: 将 `handleAddScene` 传递给 `<WorldView />` 的 `onAddScene` 属性。

#### [MODIFY] [plot/page.tsx](file:///Users/bytedance/Desktop/travelbook/app/plot/page.tsx)
-   **添加场景切换 UI**: 在 Select Points of Interest 界面添加场景选择器。
-   **实现场景切换逻辑**: 使用 `useState` 管理选中的场景 ID。
-   **更新 POI 获取逻辑**: 根据选中的场景 ID 获取对应的 POI。
-   **修复 POI 显示问题**: 更新 `getCanvasPoi` 函数以从所有场景中查找 POI。

### Store Layer

#### [MODIFY] [travelBookStore.ts](file:///Users/bytedance/Desktop/travelbook/stores/travelBookStore.ts)
-   **改进父子关系处理**: 修改 `addScenePOI` 函数以支持父子 POI 关系。
    -   保留子节点的原始 parentId，以便后续添加父节点时能识别。
    -   当新添加的 POI 是其他已存在 POI 的父节点时，自动更新这些子节点的 parentId。

### Utils Layer

#### [MODIFY] [i18n.ts](file:///Users/bytedance/Desktop/travelbook/utils/i18n.ts)
-   **添加翻译文本**: 为新功能添加中英文翻译支持。

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

5.  **父子 POI 关系验证**:
    -   在 Collection 页面创建一个父 POI 和一个子 POI（设置 parentId）。
    -   先将子 POI 拖入 Canvas 场景。
    -   再将父 POI 拖入 Canvas 场景。
    -   确认父子 POI 之间自动建立了连线。
    -   拖拽父 POI，确认子 POI 不会跟随移动。

6.  **Plot 页面场景切换验证**:
    -   创建两个场景，分别添加一些 POI。
    -   进入 Plot 页面的 Select Points of Interest 界面。
    -   使用场景切换器切换到第一个场景，选择一个 POI。
    -   切换到第二个场景，选择一个 POI。
    -   确认右侧 Selected POIs 列表中同时显示了两个场景中选择的 POI。
    -   点击 "Confirm Selection" 按钮，进入 Ordering Phase。
    -   确认所有选择的 POI 都显示在 Ordering Phase 中。

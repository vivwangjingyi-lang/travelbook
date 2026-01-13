# 任务清单

## 当前任务：文档与规范优化
- [x] **PRD 重构**
    - [x] 重写 PRD 框架，增加版本控制、用户画像、非功能需求等章节
    - [x] 细化 World View 与 Scene 管理的功能定义
- [ ] **Scene View 界面修复**
    - [x] 修复 `layout.tsx` 中的 Hydration Error
    - [x] 解决空场景无法进入 World View 的问题
    - [x] 启用 `WorldView` 中的“添加场景”功能
    - [ ] 验证场景创建与视图切换

## 待办任务：Canvas 侧边栏优化
- [ ] **Canvas 侧边栏改进**
    - [ ] 实现 POI 列表的分组排序 (父节点 + 子节点)
    - [ ] 在侧边栏 POI 卡片上添加父子节点标识 (P/L)
    - [ ] 验证排序和标识的正确性

## 已完成任务
- [x] Collection 页面 UI/UX 优化
    - [x] Modal 表单
    - [x] 响应式网格
    - [x] 视觉增强 (阴影、毛玻璃)
- [x] Canvas 交互优化
    - [x] 解耦父子节点拖拽移动
    - [x] 修复连接线遮挡问题
    - [ ] **Canvas 多选与批量移动**
        - [ ] 实现 Canvas 页面多选状态管理 (Click / Shift+Click)
        - [ ] 优化 TravelCanvas 拖拽逻辑支持多选移动
        - [ ] 批量更新 POI 位置

## 待办事项
- [ ] 验证 `Plot` (路线页) 功能
- [ ] 检查 `RouteList.tsx` 组件集成
- [ ] 测试多语言覆盖率
- [ ] 确认 IndexedDB 存储

# 任务清单

## 当前任务：文档与规范优化
- [x] **PRD 重构**
    - [x] 重写 PRD 框架，增加版本控制、用户画像、非功能需求等章节
    - [x] 细化 World View 与 Scene 管理的功能定义
    - [x] 更新 PRD 以反映最新功能（父子 POI 关系、场景切换）
- [x] **文档更新**
    - [x] 更新 README.md 以反映最新功能
    - [x] 更新 implementation_plan.md 以反映最新功能
    - [x] 更新 task.md 以反映最新任务状态

## 待办任务：功能优化与验证
- [ ] **功能验证**
    - [ ] 验证场景创建与视图切换
    - [ ] 验证父子 POI 关系功能
    - [ ] 验证 Plot 页面场景切换功能

## 已完成任务
- [x] **Scene View 界面修复**
    - [x] 修复 `layout.tsx` 中的 Hydration Error
    - [x] 解决空场景无法进入 World View 的问题
    - [x] 启用 `WorldView` 中的“添加场景”功能
- [x] **Canvas 父子 POI 关系**
    - [x] 改进 `addScenePOI` 函数以支持父子 POI 关系
    - [x] 确保不限制父子节点添加顺序
    - [x] 自动建立父子节点连线
- [x] **Plot 页面场景切换**
    - [x] 在 Select Points of Interest 界面添加场景选择器
    - [x] 实现场景切换逻辑
    - [x] 修复 POI 显示问题（从所有场景中查找 POI）
- [x] Collection 页面 UI/UX 优化
    - [x] Modal 表单
    - [x] 响应式网格
    - [x] 视觉增强 (阴影、毛玻璃)
- [x] Canvas 交互优化
    - [x] 解耦父子节点拖拽移动
    - [x] 修复连接线遮挡问题

## 后续迭代待办
- [ ] **Canvas 侧边栏改进**
    - [ ] 实现 POI 列表的分组排序 (父节点 + 子节点)
    - [ ] 在侧边栏 POI 卡片上添加父子节点标识 (P/L)
    - [ ] 验证排序和标识的正确性
- [ ] **Canvas 多选与批量移动**
    - [ ] 实现 Canvas 页面多选状态管理 (Click / Shift+Click)
    - [ ] 优化 TravelCanvas 拖拽逻辑支持多选移动
    - [ ] 批量更新 POI 位置
- [ ] 验证 `Plot` (路线页) 功能
- [ ] 检查 `RouteList.tsx` 组件集成
- [ ] 测试多语言覆盖率
- [ ] 确认 IndexedDB 存储

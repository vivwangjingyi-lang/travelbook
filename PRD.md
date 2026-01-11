# TravelBook 产品需求文档

## 1. 产品概述

### 1.1 产品定位
TravelBook是一款优雅的旅行规划应用，帮助用户创建、管理和分享完整的旅行故事。用户可以通过分章节的方式规划旅程，包括基本信息、交通安排、兴趣点收集、路线规划等，最终形成一本精美的旅行书籍。

### 1.2 产品愿景
"Every trip is a story. Where will you go next?"

### 1.3 核心价值
- 提供完整的旅行规划工作流程
- 可视化旅程设计与路线规划
- 个人化旅行故事创作
- 简洁优雅的用户体验
- 多语言支持（中英文）

## 2. 用户故事

### 2.1 旅行者角色
- **普通旅行者**：规划个人或家庭旅行
- **旅行爱好者**：记录和分享旅行经历
- **商务旅行者**：组织商务旅行行程
- **国际旅行者**：需要多语言支持的旅行规划

### 2.2 关键用户故事

1. **创建旅行书籍**
   - 作为旅行者，我希望创建一本新的旅行书籍，以便开始规划旅程
   - 作为旅行者，我希望定义旅程的基本信息（名称、目的地、日期等），以便有清晰的旅程概览
   - 作为国际旅行者，我希望在不同语言环境下使用应用，以便获得更好的用户体验

2. **规划旅程信息**
   - 作为旅行者，我希望添加交通信息（机票、火车票等），以便管理旅行交通
   - 作为旅行者，我希望收集和分类兴趣点（景点、餐厅、住宿等），以便全面了解旅行目的地
   - 作为旅行者，我希望搜索和筛选兴趣点，以便快速找到我需要的信息

3. **可视化旅程**
   - 作为旅行者，我希望在画布上可视化兴趣点，以便直观地规划旅行路线
   - 作为旅行者，我希望拖拽兴趣点进行排列，以便创建合理的旅行地图
   - 作为旅行者，我希望规划每日行程，以便合理安排旅行时间

4. **管理旅行书籍**
   - 作为旅行者，我希望保存和编辑旅行书籍，以便随时更新旅行计划
   - 作为旅行者，我希望删除不需要的旅行书籍，以便保持旅行库的整洁
   - 作为旅行者，我希望添加和管理旅行备忘录，以便记录旅行中的重要信息

5. **分享与总结**
   - 作为旅行者，我希望生成旅行总结，以便回顾整个旅程
   - 作为旅行者，我希望分享旅行书籍，以便与他人分享我的旅行计划
   - 作为旅行者，我希望导出旅行书籍为PDF，以便离线查看和打印

## 3. 功能需求

### 3.1 首页（旅行库）
- [x] 显示所有旅行书籍列表
- [x] 旅行书籍卡片显示（封面、标题、日期范围）
- [x] 创建新旅行书籍功能
- [x] 删除旅行书籍功能
- [x] 选择旅行书籍进入编辑模式
- [x] 支持多语言切换

### 3.2 引言页（Introduction）
- [x] 旅程基本信息填写（名称、目的地、日期）
- [x] 可选信息填写（同伴、描述）
- [x] 封面图片上传功能
- [x] 表单验证（名称、目的地、开始日期必填）
- [x] Save Book按钮，保存当前旅程信息
- [x] 只有保存后才能继续到下一章节
- [x] 导航到下一章节
- [x] 支持多语言

### 3.3 出发页（Departure）
- [x] 交通信息管理（机票、火车票等）
- [x] 添加交通信息功能
- [x] 删除交通信息功能
- [x] 导航到下一章节
- [x] 支持多语言

### 3.4 收集页（Collection）
- [x] 兴趣点（POI）管理
- [x] 添加兴趣点功能（名称、分类、访问时间、备注）
- [x] 更新兴趣点功能
- [x] 删除兴趣点功能
- [x] 兴趣点分类（住宿、景点、美食、娱乐、购物、交通）
- [x] 搜索和筛选功能
- [x] 兴趣点排序功能（按名称、添加时间）
- [x] 支持多语言

### 3.5 画布页（Canvas）
- [x] 兴趣点可视化功能
- [x] 兴趣点拖拽功能
- [x] 兴趣点编辑功能
- [x] 兴趣点删除功能
- [x] 导航到下一章节
- [x] 支持多语言

### 3.6 路线页（Plot）
- [x] 每日行程规划
- [x] 兴趣点选择功能
- [x] 兴趣点排序功能
- [x] 路线添加功能（交通方式、时长）
- [x] 路线编辑功能
- [x] 路线删除功能
- [x] 多日行程管理
- [x] 支持多语言

### 3.7 结语页（Epilogue）
- [x] 旅程总结
- [x] 统计信息（天数、兴趣点数量、路线数量等）
- [x] 旅行备忘录管理（添加、编辑、删除、固定）
- [x] 行程概览
- [x] 分享和导出功能（复制链接、导出PDF、分享）
- [x] 个性化旅行摘要
- [x] 支持多语言

### 3.8 通用功能
- [x] 章节导航功能（Floating Capsule Navigation）
- [x] 未保存修改提示（所有页面跳转时）
- [x] 数据本地存储（IndexedDB为主，localStorage为后备）
- [x] 图片压缩功能（避免存储超限）
- [x] 响应式设计
- [x] 保存状态管理（确保数据一致性）
- [x] 多语言支持（中英文）
- [x] 优雅的UI设计（玻璃态效果、平滑动画）

## 4. 技术需求

### 4.1 技术栈
- Next.js 16.1.1
- React 19.2.3
- TypeScript
- Zustand 5.0.9（状态管理）
- Framer Motion（动画）
- Tailwind CSS（样式）
- IndexedDB（主要数据存储，50MB+容量）
- LocalStorage（后备存储，兼容性支持）

### 4.2 数据模型

```typescript
interface TravelBook {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  destination?: string;
  companions?: string;
  coverImage?: string;
  pois: POI[];
  canvasPois: CanvasPOI[];
  dailyItineraries: DailyItinerary[];
  memos: Memo[];
}

interface POI {
  id: string;
  name: string;
  category: 'accommodation' | 'sightseeing' | 'food' | 'entertainment' | 'shopping' | 'transportation';
  visitTime: string;
  notes?: string;
}

interface CanvasPOI extends POI {
  x: number;
  y: number;
}

interface DailyItinerary {
  day: number;
  selectedPoiIds: string[];
  orderedPois: DailyPOI[];
  routes: Route[];
}

interface DailyPOI {
  poiId: string;
  order: number;
}

interface Route {
  id: string;
  fromPoiId: string;
  toPoiId: string;
  transportation: 'walk' | 'bus' | 'taxi' | 'train' | 'car' | 'bike';
  duration: string;
}

interface Memo {
  id: string;
  title: string;
  content: string;
  date: string;
  pinned?: boolean;
}
```

### 4.3 性能要求
- 页面加载时间 < 2秒
- 图片上传和处理流畅
- 本地存储数据优化（避免超限）
- 多语言切换响应迅速

## 5. 用户体验设计

### 5.1 设计风格
- **Ethereal Minimalism**（空灵极简主义）
- 玻璃态效果（Glassmorphism）
- 柔和的渐变背景
- 微妙的动画效果
- 优雅的排版（Playfair Display + Geist）

### 5.2 交互设计
- 卡片式布局
- 平滑的过渡动画
- 直观的拖拽操作
- 明确的视觉反馈
- 简洁的表单设计
- 浮动导航栏，方便章节切换

## 6. 验收标准

### 6.1 功能验收
- 所有页面和功能可正常访问
- 数据可正常保存和加载
- 导航功能正常工作
- 表单验证有效
- 错误处理友好
- 多语言切换功能正常

### 6.2 性能验收
- 页面加载流畅
- 操作响应迅速
- 存储功能稳定

### 6.3 兼容性验收
- 支持主流浏览器
- 响应式设计适配不同屏幕

## 7. 风险与限制

### 7.1 技术限制
- IndexedDB存储容量限制（约50MB，取决于浏览器）
- 不支持离线访问（需浏览器支持IndexedDB或localStorage）
- 图片处理依赖浏览器Canvas API

### 7.2 用户限制
- 单用户系统（不支持多用户）
- 数据仅存储在本地浏览器中

---

*Last Updated: 2026-01-12*
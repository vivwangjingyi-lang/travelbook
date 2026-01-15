'use client';

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore, POI, Scene } from "@/stores/travelBookStore";
import TravelCanvas from "@/components/TravelCanvas";
import WorldView from "@/components/WorldView";
import SceneTemplateManager from "@/components/SceneTemplateManager";
import AddSceneModal from "@/components/AddSceneModal";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";

export default function Canvas() {
  const router = useRouter();
  // 画布引用
  const canvasRef = useRef<HTMLDivElement>(null);

  // 全局状态管理
  const { currentBook, addScenePOI, switchScene, addScene, sceneSwitchNotification, clearSceneSwitchNotification } = useTravelBookStore();
  const { language } = useLanguageStore();

  // 翻译辅助函数
  const t = (key: string) => getTranslation(key, language);

  // 获取当前旅行书的POI数据
  const allPOIs = currentBook?.pois || [];
  const scenes = currentBook?.scenes || [];
  const activeSceneId = currentBook?.activeSceneId || '';

  // 过滤出属于当前场景的POI（使用sceneIds数组）
  const availablePOIs = allPOIs.filter(poi =>
    poi.sceneIds && poi.sceneIds.includes(activeSceneId)
  );

  // 视图模式: 'world' | 'scene'
  const [viewMode, setViewMode] = useState<'world' | 'scene'>(scenes.length > 0 ? 'world' : 'scene');

  // Selected POIs state
  const [selectedPoiIds, setSelectedPoiIds] = useState<string[]>([]);

  // 场景模板管理器状态
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  // 添加场景 Modal 状态
  const [showAddSceneModal, setShowAddSceneModal] = useState(false);

  // Handle POI click for selection
  const handlePoiClick = (poi: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas click

    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      // Multi-select toggle
      setSelectedPoiIds(prev =>
        prev.includes(poi.id)
          ? prev.filter(id => id !== poi.id)
          : [...prev, poi.id]
      );
    } else {
      // Single select
      setSelectedPoiIds([poi.id]);
    }
  };

  // Handle Canvas background click to deselect
  const handleCanvasClick = () => {
    setSelectedPoiIds([]);
  };

  // 处理拖拽结束
  const handleDrop = (event: React.DragEvent, poi: POI) => {
    event.preventDefault();

    if (!currentBook) return;

    // 获取画布位置
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();

    // 计算拖拽位置相对于画布的坐标
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 确保坐标在画布范围内
    const clampedX = Math.max(20, Math.min(x, rect.width - 20));
    const clampedY = Math.max(20, Math.min(y, rect.height - 20));

    // 添加新POI到画布（使用场景感知的方法）
    addScenePOI({
      name: poi.name,
      category: poi.category,
      x: clampedX,
      y: clampedY,
      visitTime: poi.visitTime,
      notes: poi.notes,
      parentId: poi.parentId,
      originalId: poi.id,
      createdAt: new Date().toISOString(),
    });
  };

  // 允许放置
  const allowDrop = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // 拖拽开始
  const handleDragStart = (event: React.DragEvent, poi: POI) => {
    event.dataTransfer.setData("text/plain", JSON.stringify(poi));
  };



  // 处理双击场景进入场景视图
  const handleSceneDoubleClick = (scene: Scene) => {
    setViewMode('scene');
  };

  // 返回世界视图
  const handleBackToWorld = () => {
    setViewMode('world');
  };

  // 处理从 Modal 添加新场景
  const handlePerformAddScene = (name: string, category: string, image?: string) => {
    // 中心位置
    const x = 500 + (Math.random() * 100 - 50);
    const y = 250 + (Math.random() * 60 - 30);
    addScene(name, x, y, category, image);
  };

  // 处理添加新场景按钮点击
  const handleAddSceneClick = () => {
    setShowAddSceneModal(true);
  };

  // 处理场景模板点击
  const handleSceneTemplateClick = () => {
    setShowTemplateManager(true);
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]" onClick={handleCanvasClick}>
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={3} />

      <div className="max-w-6xl mx-auto pt-24">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-slate-800">{t('canvas.title')}</h1>
          <p className="text-lg text-slate-600 leading-relaxed">{t('canvas.subtitle')}</p>

          {/* 视图切换按钮 - 始终显示 */}
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setViewMode('world')}
              className={`px-4 py-2 rounded-full text-sm transition-all ${viewMode === 'world' ? 'bg-slate-800 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'} shadow-lg`}
            >
              🌍 {t('canvas.worldView')}
            </button>
            <button
              onClick={() => setViewMode('scene')}
              className={`px-4 py-2 rounded-full text-sm transition-all ${viewMode === 'scene' ? 'bg-slate-800 text-white' : 'bg-white/80 text-slate-600 hover:bg-white'} shadow-lg`}
            >
              📍 {t('canvas.sceneView')}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8 relative">
          {/* 场景切换通知 */}
          {sceneSwitchNotification && sceneSwitchNotification.show && (
            <motion.div
              className="fixed top-8 right-8 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              onClick={clearSceneSwitchNotification}
            >
              <span className="text-xl">📍</span>
              <span>{sceneSwitchNotification.message}</span>
              <button className="ml-2 text-white hover:text-slate-200">×</button>
            </motion.div>
          )}
          {viewMode === 'world' ? (
            /* 世界视图 */
            <div className="min-h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">{t('canvas.worldView')}</h2>
              </div>
              <WorldView
                onSceneDoubleClick={handleSceneDoubleClick}
                onAddScene={handleAddSceneClick}
                onSceneTemplateClick={handleSceneTemplateClick}
              />
            </div>
          ) : (
            /* 场景视图 - 原有的 POI 画布 */
            <>
              {/* Refined Navigation Bar */}
              {scenes.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <button
                    onClick={handleBackToWorld}
                    className="group flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-slate-600 hover:text-slate-800 rounded-full transition-all shadow-sm hover:shadow-md backdrop-blur-sm border border-transparent hover:border-slate-200"
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    {t('canvas.backToWorld')}
                  </button>

                  {/* Scene Switcher Tabs */}
                  <div className="flex flex-wrap gap-2 bg-slate-100/50 p-1.5 rounded-full overflow-x-auto max-w-full custom-scrollbar">
                    {scenes.map(scene => {
                      const isActive = scene.id === activeSceneId;
                      return (
                        <motion.button
                          key={scene.id}
                          onClick={() => switchScene(scene.id)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${isActive
                            ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-100'
                            : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                            }`}
                          initial={false}
                          animate={{
                            scale: isActive ? 1.05 : 1,
                            opacity: isActive ? 1 : 0.8,
                          }}
                          whileHover={{ scale: 1.05, opacity: 1 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{
                            duration: 0.2,
                            ease: "easeOut"
                          }}
                        >
                          {scene.name}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-6">
                {/* POI List (Sidebar) */}
                <div className="lg:w-1/4 space-y-4">
                  <h2 className="text-2xl font-semibold mb-4 text-slate-800">{t('canvas.yourPoints') || 'Your Points'}</h2>

                  <div className="space-y-3 max-h-[300px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Draggable POI Cards */}
                    {availablePOIs
                      .sort((a, b) => {
                        if (a.id === b.parentId) return -1;
                        if (b.id === a.parentId) return 1;
                        if (a.parentId === b.parentId) return a.name.localeCompare(b.name);
                        if (!a.parentId && !b.parentId) return a.name.localeCompare(b.name);
                        const rootA = a.parentId ? (availablePOIs.find(p => p.id === a.parentId) || a) : a;
                        const rootB = b.parentId ? (availablePOIs.find(p => p.id === b.parentId) || b) : b;
                        if (rootA.id !== rootB.id) return rootA.name.localeCompare(rootB.name);
                        if (a.id === rootA.id) return -1;
                        if (b.id === rootA.id) return 1;
                        return 0;
                      })
                      .map((poi: POI) => {
                        // 使用originalId进行精确匹配，而不是name
                        // 检查POI是否已在当前场景的画布上
                        const isOnCanvas = currentBook?.scenes.some(scene =>
                          scene.id === activeSceneId &&
                          scene.pois.some(canvasPoi => canvasPoi.originalId === poi.id)
                        ) || false;
                        const isParent = availablePOIs.some(p => p.parentId === poi.id);
                        const isChild = !!poi.parentId;

                        return (
                          <div
                            key={poi.id}
                            draggable
                            onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, poi)}
                            className={`bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-move hover:scale-[1.02] active:opacity-50 active:scale-95 flex justify-between items-start relative ${isChild ? 'ml-4 border-l-2 border-slate-300' : ''}`}
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-slate-800">{poi.name}</h4>
                                {isParent && (
                                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm flex items-center justify-center font-bold" title="Parent Node">P</span>
                                )}
                                {isChild && (
                                  <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm flex items-center justify-center font-bold" title="Child Node">L</span>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${poi.category === "accommodation" ? "bg-blue-100 text-blue-700" :
                                poi.category === "sightseeing" ? "bg-green-100 text-green-700" :
                                  poi.category === "food" ? "bg-red-100 text-red-700" :
                                    poi.category === "entertainment" ? "bg-purple-100 text-purple-700" :
                                      "bg-yellow-100 text-yellow-700"}`}>
                                {t(`category.${poi.category}`)}
                              </span>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isOnCanvas ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                              {isOnCanvas && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="lg:flex-1">
                  <h2 className="text-2xl font-semibold mb-4 text-slate-800">{t('canvas.mapCanvas')}</h2>
                  <div
                    ref={canvasRef}
                    id="canvas-area"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCanvasClick();
                    }}
                    onDrop={(e) => {
                      const poiData = e.dataTransfer.getData("text/plain");
                      if (poiData) {
                        try {
                          const parsedPOI = JSON.parse(poiData);
                          handleDrop(e, parsedPOI);
                        } catch (error) {
                          console.error("Failed to parse dropped POI data:", error);
                        }
                      }
                    }}
                    onDragOver={allowDrop}

                    className="relative transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                    tabIndex={0}
                    role="region"
                    aria-label="Map Canvas for dragging and arranging POIs"
                    aria-describedby="canvas-instructions"
                  >
                    <TravelCanvas
                      mode="edit"
                      selectedPoiIds={selectedPoiIds}
                      onPOIClick={(poi, e) => handlePoiClick(poi, e)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Instructions Section */}
          <div id="canvas-instructions" className="mt-6 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <h3 className="font-medium text-slate-800 mb-2">{t('canvas.instructions')}</h3>
            <ul className="text-sm text-slate-600 space-y-1 leading-relaxed">
              <li>• {t('canvas.instruction1')}</li>
              <li>• {t('canvas.instruction2')}</li>
              <li>• {t('canvas.instruction3')}</li>
            </ul>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8">
            <button
              type="button"
              onClick={() => router.push('/collection')}
              className="px-6 py-2 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('canvas.previousChapter')}
            </button>
            <button
              type="button"
              onClick={() => router.push('/plot')}
              className="px-6 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
            >
              {t('canvas.nextChapter')}
            </button>
          </div>
        </main>
      </div>

      {/* 场景模板管理器 */}
      <SceneTemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onTemplateApplied={() => setViewMode('scene')}
      />

      {/* 添加场景 Modal */}
      <AddSceneModal
        isOpen={showAddSceneModal}
        onClose={() => setShowAddSceneModal(false)}
        onAdd={handlePerformAddScene}
      />
    </div>
  );
}

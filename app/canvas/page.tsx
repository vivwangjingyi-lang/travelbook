'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore, POI } from "@/stores/travelBookStore";
import TravelCanvas from "@/components/TravelCanvas";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";

export default function Canvas() {
  const router = useRouter();
  // 画布引用
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // 全局状态管理
  const { currentBook, addCanvasPOI } = useTravelBookStore();
  const { language } = useLanguageStore();
  
  // 翻译辅助函数
  const t = (key: string) => getTranslation(key, language);
  
  // 获取当前旅行书的POI数据
  const availablePOIs = currentBook?.pois || [];
  

  
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
    
    // 添加新POI到画布
    addCanvasPOI({
      name: poi.name,
      category: poi.category,
      x: clampedX,
      y: clampedY,
      visitTime: poi.visitTime,
      notes: poi.notes,
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
  

  
  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={3} />
      
      <div className="max-w-6xl mx-auto pt-24">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-slate-800">{t('canvas.title')}</h1>
          <p className="text-lg text-slate-600 leading-relaxed">{t('canvas.subtitle')}</p>
        </header>

        {/* Main Content */}
        <main className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* POI List (Sidebar) */}
            <div className="lg:w-1/4 space-y-4">
              <h2 className="text-2xl font-semibold mb-4 text-slate-800">{t('canvas.yourPoints')}</h2>
              
              <div className="space-y-3 max-h-[300px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Draggable POI Cards */}
                {availablePOIs.map((poi: POI) => {
                  // Check if POI is already on canvas
                  const isOnCanvas = currentBook?.canvasPois.some(canvasPoi => canvasPoi.name === poi.name) || false;
                  
                  return (
                    <div
                      key={poi.id}
                      draggable
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, poi)}
                      className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-move hover:scale-[1.02] transition-transform active:opacity-50 active:scale-95 flex justify-between items-start"
                    >
                      <div>
                        <h4 className="font-medium text-slate-800">{poi.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${poi.category === "accommodation" ? "bg-blue-100 text-blue-700" : 
                                                                       poi.category === "sightseeing" ? "bg-green-100 text-green-700" : 
                                                                       poi.category === "food" ? "bg-red-100 text-red-700" : 
                                                                       poi.category === "entertainment" ? "bg-purple-100 text-purple-700" : 
                                                                       "bg-yellow-100 text-yellow-700"}`}>
                          {t(`category.${poi.category}`)}
                        </span>
                      </div>
                      {/* Status Marker */}
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
                onDragEnter={(e) => {
                  e.currentTarget.classList.add('ring-2', 'ring-green-500');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('ring-2', 'ring-green-500');
                }}
                className="relative transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                tabIndex={0}
                role="region"
                aria-label="Map Canvas for dragging and arranging POIs"
                aria-describedby="canvas-instructions"
              >
                <TravelCanvas mode="edit" />
              </div>
            </div>
          </div>

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
    </div>
  );
}

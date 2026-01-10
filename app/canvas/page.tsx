'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore, POI } from "@/stores/travelBookStore";
import TravelCanvas from "@/components/TravelCanvas";

export default function Canvas() {
  const router = useRouter();
  // 画布引用
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // 全局状态管理
  const { currentBook, addCanvasPOI } = useTravelBookStore();
  
  // 获取当前旅行书的POI数据
  const availablePOIs = currentBook?.pois || [];
  
  // 获取画布实际尺寸
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 500 });
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const { offsetWidth, offsetHeight } = canvasRef.current;
        setCanvasSize({ width: offsetWidth, height: offsetHeight });
      }
    };
    
    // 初始化尺寸
    updateCanvasSize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);
  
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
    const clampedX = Math.max(20, Math.min(x, canvasSize.width - 20));
    const clampedY = Math.max(20, Math.min(y, canvasSize.height - 20));
    
    // 添加新POI到画布
    addCanvasPOI({
      name: poi.name,
      category: poi.category,
      x: clampedX,
      y: clampedY,
      visitTime: poi.visitTime,
      notes: poi.notes,
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
          <h1 className="text-4xl font-bold mb-2 text-slate-800">Chapter III: The Canvas</h1>
          <p className="text-lg text-slate-600 leading-relaxed">Arrange your points of interest</p>
        </header>

        {/* Main Content */}
        <main className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* POI List (Sidebar) */}
            <div className="lg:w-1/4 space-y-4">
              <h2 className="text-2xl font-semibold mb-4 text-slate-800">Your Points</h2>
              
              <div className="space-y-3">
                {/* Draggable POI Cards */}
                {availablePOIs.map((poi: POI) => (
                  <div
                    key={poi.id}
                    draggable
                    onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, poi)}
                    className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-move hover:scale-[1.02] transition-transform"
                  >
                    <h4 className="font-medium text-slate-800">{poi.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${poi.category === "accommodation" ? "bg-blue-100 text-blue-700" : 
                                                                     poi.category === "sightseeing" ? "bg-green-100 text-green-700" : 
                                                                     poi.category === "food" ? "bg-red-100 text-red-700" : 
                                                                     poi.category === "entertainment" ? "bg-purple-100 text-purple-700" : 
                                                                     "bg-yellow-100 text-yellow-700"}`}>
                      {poi.category.charAt(0).toUpperCase() + poi.category.slice(1)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <h3 className="font-medium text-slate-800 mb-2">Instructions</h3>
                <ul className="text-sm text-slate-600 space-y-1 leading-relaxed">
                  <li>• Drag POIs from the left to the canvas</li>
                  <li>• Arrange them based on their relative positions</li>
                  <li>• Click and drag to move items on the canvas</li>
                </ul>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="lg:flex-1">
              <h2 className="text-2xl font-semibold mb-4 text-slate-800">Map Canvas</h2>
              <div 
                ref={canvasRef}
                id="canvas-area"
                onDrop={(e) => {
                  const poiData = e.dataTransfer.getData("text/plain");
                  if (poiData) {
                    handleDrop(e, JSON.parse(poiData));
                  }
                }}
                onDragOver={allowDrop}
                className="relative"
              >
                <TravelCanvas mode="edit" />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8">
            <button
              type="button"
              onClick={() => router.push('/collection')}
              className="px-6 py-2 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Previous Chapter
            </button>
            <button
              type="button"
              onClick={() => router.push('/plot')}
              className="px-6 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
            >
              Next Chapter
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

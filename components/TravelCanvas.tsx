'use client';

import { useRef, useEffect, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { useTravelBookStore, CanvasPOI, POI, DailyPOI, Route } from "@/stores/travelBookStore";

interface TravelCanvasProps {
  mode: 'edit' | 'route';
  onPOIDragEnd?: (poi: CanvasPOI, info: PanInfo) => void;
  onPOIClick?: (poi: CanvasPOI) => void;
  selectedPoiIds?: string[];
  orderedPois?: DailyPOI[];
  routes?: Route[];
}

export default function TravelCanvas({
  mode,
  onPOIDragEnd,
  onPOIClick,
  selectedPoiIds = [],
  orderedPois = [],
  routes = []
}: TravelCanvasProps) {
  // 画布引用
  const canvasRef = useRef<HTMLDivElement>(null);
  // 拖拽约束引用
  const constraintsRef = useRef<HTMLDivElement>(null);
  // 画布尺寸状态
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 500 });

  // 全局状态管理
  const { currentBook, updateCanvasPOI, deleteCanvasPOI } = useTravelBookStore();

  // 获取当前旅行书的POI数据
  const canvasPOIs = currentBook?.canvasPois || [];

  // 获取画布实际尺寸
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

  // 画布上的拖拽结束 (Framer Motion)
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, poi: CanvasPOI) => {
    // 计算新位置并确保在画布范围内
    const newX = Math.max(20, Math.min(poi.x + info.offset.x, canvasSize.width - 20));
    const newY = Math.max(20, Math.min(poi.y + info.offset.y, canvasSize.height - 20));

    // 更新POI位置
    updateCanvasPOI(poi.id, { x: newX, y: newY });

    // 调用外部回调
    if (onPOIDragEnd) {
      onPOIDragEnd({ ...poi, x: newX, y: newY }, info);
    }
  };

  // 删除画布POI
  const handleDeletePoi = (poiId: string) => {
    deleteCanvasPOI(poiId);
  };

  // 找到POI的排序信息
  const getPoiOrder = (poiId: string): number | undefined => {
    return orderedPois.find(op => op.poiId === poiId)?.order;
  };

  // 获取POI卡片的边缘中点（用于路径连接）
  const getPoiAnchor = (poi: CanvasPOI) => {
    return {
      top: { x: poi.x + 50, y: poi.y },
      bottom: { x: poi.x + 50, y: poi.y + 30 },
      left: { x: poi.x, y: poi.y + 15 },
      right: { x: poi.x + 100, y: poi.y + 15 }
    };
  };

  // 找到POI的CanvasPOI信息
  const getCanvasPoi = (poiId: string): CanvasPOI | undefined => {
    return canvasPOIs.find(cp => cp.id === poiId);
  };

  return (
    <div 
      ref={canvasRef}
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-4 min-h-[500px] relative overflow-hidden"
    >
      {/* Modern Grid Background */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.3
      }}></div>
      
      {/* Canvas Content */}
      <div ref={constraintsRef} className="absolute inset-0">
        {/* Paths (only in route mode) */}
        {mode === 'route' && routes.map((route) => {
          const fromPoi = getCanvasPoi(route.fromPoiId);
          const toPoi = getCanvasPoi(route.toPoiId);
          if (!fromPoi || !toPoi) return null;
          
          return (
            <svg key={route.id} className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id={`arrowhead-${route.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                </marker>
              </defs>
              <path
                d={`M ${fromPoi.x + 50} ${fromPoi.y + 15} C ${(fromPoi.x + toPoi.x) / 2 + 50} ${fromPoi.y + 15}, ${(fromPoi.x + toPoi.x) / 2 + 50} ${toPoi.y + 15}, ${toPoi.x + 50} ${toPoi.y + 15}`}
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                markerEnd={`url(#arrowhead-${route.id})`}
              />
              <text
                x={(fromPoi.x + toPoi.x) / 2 + 50}
                y={(fromPoi.y + toPoi.y) / 2 + 15 - 10}
                fill="#64748b"
                fontSize="12"
                textAnchor="middle"
                pointerEvents="none"
              >
                {route.duration} ({route.transportation})
              </text>
            </svg>
          );
        })}
        
        {/* POIs on Canvas */}
        {canvasPOIs.length === 0 ? (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-400 text-center pointer-events-none">
            <p>
              {mode === 'edit' ? 'Drag points from the sidebar to this canvas' : 'Click points to add them to your itinerary'}
              <br />
              <span className="text-xs mt-2 block">Arrange them based on their relative positions</span>
            </p>
          </div>
        ) : null}
        
        {canvasPOIs.map((poi) => {
          const isSelected = selectedPoiIds.includes(poi.id);
          const order = getPoiOrder(poi.id);
          
          return (
            <motion.div
              key={poi.id}
              className="absolute cursor-move group"
              style={{ 
                x: poi.x, 
                y: poi.y,
              }}
              drag={mode === 'edit'}
              dragConstraints={constraintsRef}
              dragElastic={0}
              dragMomentum={false}
              onDragEnd={(event, info) => handleDragEnd(event, info, poi)}
              onClick={() => onPOIClick && onPOIClick(poi)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div 
                className={`bg-white shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 relative transition-all duration-300 ${isSelected 
                  ? 'ring-2 ring-green-500 ring-offset-2' 
                  : mode === 'route' ? 'opacity-50' : ''}`}
              >
                {/* Category Indicator */}
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ 
                    backgroundColor: poi.category === "accommodation" ? "#3b82f6" : 
                                   poi.category === "sightseeing" ? "#10b981" : 
                                   poi.category === "food" ? "#ef4444" : 
                                   poi.category === "entertainment" ? "#8b5cf6" : 
                                   poi.category === "shopping" ? "#f59e0b" : 
                                   "#64748b"
                  }}
                />
                
                {/* Order Badge (only in route mode) */}
                {mode === 'route' && order && (
                  <div className="absolute -top-3 -left-3 bg-slate-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {order}
                  </div>
                )}
                
                {/* POI Name */}
                <span className="text-xs font-medium text-slate-800">{poi.name}</span>
                
                {/* Delete Button (only in edit mode) */}
                {mode === 'edit' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePoi(poi.id);
                    }}
                    className="absolute -top-1 -right-1 bg-white rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100"
                    title="Delete this point"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
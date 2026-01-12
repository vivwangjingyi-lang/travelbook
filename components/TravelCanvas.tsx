'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useTravelBookStore, CanvasPOI, POI, DailyPOI, Route } from '@/stores/travelBookStore';
import { useLanguageStore } from '@/stores/languageStore';
import { getTranslation } from '@/utils/i18n';

interface TravelCanvasProps {
  mode: 'edit' | 'route';
  onPOIDragEnd?: (poi: CanvasPOI, info: PanInfo) => void;
  onPOIClick?: (poi: CanvasPOI) => void;
  selectedPoiIds?: string[];
  orderedPois?: DailyPOI[];
  routes?: Route[];
}

const TravelCanvas: React.FC<TravelCanvasProps> = ({
  mode,
  onPOIDragEnd,
  onPOIClick,
  selectedPoiIds = [],
  orderedPois = [],
  routes = []
}) => {
  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 500 });

  // Global state
  const { currentBook, updateCanvasPOI, deleteCanvasPOI } = useTravelBookStore();
  const { language } = useLanguageStore();

  // Translation helper
  const t = (key: string) => getTranslation(key, language);
  const canvasPOIs = currentBook?.canvasPois || [];

  // Update canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const { offsetWidth, offsetHeight } = canvasRef.current;
        setCanvasSize({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Drag local state to avoid real-time store update deadlock
  const [dragInfo, setDragInfo] = useState<{ id: string | null; offset: { x: number; y: number } }>({ id: null, offset: { x: 0, y: 0 } });

  // Handle drag (UI only update)
  const handleDrag = useCallback((_event: any, info: PanInfo, poi: CanvasPOI) => {
    setDragInfo(prev => ({
      id: poi.id,
      offset: {
        x: prev.id === poi.id ? prev.offset.x + info.delta.x : info.delta.x,
        y: prev.id === poi.id ? prev.offset.y + info.delta.y : info.delta.y
      }
    }));
  }, []);

  // Handle drag end (Final Store Update)
  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, poi: CanvasPOI) => {
    // 基于原始位置 + 累计位移计算最终位置
    const finalX = Math.max(20, Math.min(poi.x + dragInfo.offset.x, canvasSize.width - 20));
    const finalY = Math.max(20, Math.min(poi.y + dragInfo.offset.y, canvasSize.height - 20));

    // Clear local drag state first to prevent flickering
    setDragInfo({ id: null, offset: { x: 0, y: 0 } });

    // Commit to store
    updateCanvasPOI(poi.id, { x: finalX, y: finalY });

    if (onPOIDragEnd) {
      onPOIDragEnd({ ...poi, x: finalX, y: finalY }, info);
    }
  }, [updateCanvasPOI, canvasSize, onPOIDragEnd, dragInfo.offset]);

  // Handle delete POI
  const handleDeletePoi = useCallback((poiId: string) => {
    deleteCanvasPOI(poiId);
  }, [deleteCanvasPOI]);

  // Get POI order
  const getPoiOrder = useCallback((poiId: string): number | undefined => {
    return orderedPois.find(op => op.poiId === poiId)?.order;
  }, [orderedPois]);

  // Get POI anchor points
  const getCanvasPoi = useCallback((poiId: string): CanvasPOI | undefined => {
    return canvasPOIs.find(cp => cp.id === poiId);
  }, [canvasPOIs]);

  return (
    <div ref={canvasRef} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-4 min-h-[500px] relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>

      {/* Canvas Content */}
      <div ref={constraintsRef} className="absolute inset-0">
        {/* Routes removed from canvas, now displayed as list below */}

        {/* Parent-Child Relationships (Behind POIs) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {canvasPOIs.map(childPoi => {
            if (!childPoi.parentId) return null;

            // 查找对应的父节点 Canvas 对象
            const parentPoi = canvasPOIs.find(p => p.id === childPoi.parentId);
            if (!parentPoi) return null;

            // 实时坐标计算逻辑
            // 使用与POI元素相同的拖拽跟随逻辑，确保视觉同步
            const isParentDragging = dragInfo.id === parentPoi.id;
            const isChildDragging = dragInfo.id === childPoi.id;
            const isChildFollowing = dragInfo.id && childPoi.parentId && dragInfo.id === childPoi.parentId;

            // 计算父节点当前视觉坐标
            const parentX = isParentDragging ? parentPoi.x + dragInfo.offset.x : parentPoi.x;
            const parentY = isParentDragging ? parentPoi.y + dragInfo.offset.y : parentPoi.y;

            // 计算子节点当前视觉坐标（与POI元素使用相同的逻辑）
            const childX = (isChildDragging || isChildFollowing) ? childPoi.x + dragInfo.offset.x : childPoi.x;
            const childY = (isChildDragging || isChildFollowing) ? childPoi.y + dragInfo.offset.y : childPoi.y;

            // 连接线起点和终点定位到POI卡片的边缘
            // 这样即使卡片宽度变化，连接线看起来也会紧紧连接
            // 假设卡片垂直方向始终居中，使用固定的Y坐标
            const startX = parentX + 40;
            const startY = parentY + 17;
            const endX = childX + 40;
            const endY = childY + 17;

            // 贝塞尔曲线控制点（中间位置）
            const controlX = (startX + endX) / 2;

            return (
              <g key={`relation-${parentPoi.id}-${childPoi.id}`}>
                <path
                  d={`M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />
              </g>
            );
          })}
        </svg>

        {/* Empty State */}
        {canvasPOIs.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-400 text-center pointer-events-none">
            <p>
              {mode === 'edit' ? t('canvas.dragToCanvas') : t('canvas.clickToAdd')}
              <br />
              <span className="text-xs mt-2 block">{t('canvas.instruction2')}</span>
            </p>
          </div>
        )}

        {/* POIs */}
        {canvasPOIs.map((poi) => {
          const isSelected = selectedPoiIds.includes(poi.id);
          const order = getPoiOrder(poi.id);

          // 核心展示逻辑 - 实现空间解耦：父子节点独立移动
          const isBeingDragged = dragInfo.id === poi.id;

          const currentX = isBeingDragged ? poi.x + dragInfo.offset.x : poi.x;
          const currentY = isBeingDragged ? poi.y + dragInfo.offset.y : poi.y;

          return (
            <motion.div
              key={poi.id}
              className="absolute cursor-move group mx-1 my-1"
              style={{ x: currentX, y: currentY }}
              drag={mode === 'edit'}
              dragConstraints={constraintsRef}
              dragElastic={0}
              dragMomentum={false}
              onDrag={(event, info) => handleDrag(event, info, poi)}
              onDragEnd={(event, info) => handleDragEnd(event, info, poi)}
              onClick={() => onPOIClick && onPOIClick(poi)}
              whileHover={{ scale: 1.05, zIndex: 100 }}
              whileTap={{ scale: 0.95 }}
              dragTransition={{ bounceStiffness: 500, bounceDamping: 30 }}
              whileDrag={{ scale: 1.1, zIndex: 100 }}
            >
              <div
                className={`bg-white shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 relative transition-all duration-300 ${isSelected ? 'ring-2 ring-green-500 ring-offset-2' : (mode === 'route' || (mode === 'edit' && poi.parentId)) ? 'opacity-50' : ''} ${poi.parentId ? 'scale-90 border border-slate-200' : ''}`}
                role="button"
                aria-label={`${poi.name}, ${poi.category}`}
              >
                {/* Category Indicator */}
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: poi.category === 'accommodation' ? '#3b82f6' :
                      poi.category === 'sightseeing' ? '#10b981' :
                        poi.category === 'food' ? '#ef4444' :
                          poi.category === 'entertainment' ? '#8b5cf6' :
                            poi.category === 'shopping' ? '#f59e0b' : '#64748b'
                  }}
                />

                {/* Order Badge - Ensure it's always on top */}
                {mode === 'route' && order && (
                  <div className="absolute -top-3 -left-3 bg-slate-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg ring ring-offset-2 ring-slate-900" style={{ zIndex: 1000 }}>
                    {order}
                  </div>
                )}

                {/* Hierarchy Badge - Move parent indicator to bottom left */}
                {poi.parentId && (
                  <div className="absolute -bottom-1 -left-1 bg-indigo-500 text-white text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-sm border border-white" title="Sub-location">
                    L
                  </div>
                )}
                {canvasPOIs.some(p => p.parentId === poi.id) && (
                  <div className="absolute -bottom-1 left-1 bg-amber-500 text-white text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-sm border border-white" title="Parent location">
                    P
                  </div>
                )}

                {/* POI Name */}
                <span className="text-xs font-medium text-slate-800">{poi.name}</span>

                {/* Delete Button */}
                {mode === 'edit' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePoi(poi.id);
                    }}
                    className="absolute -top-1 -right-1 bg-white rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100"
                    title="Delete this point"
                    aria-label="Delete this point of interest"
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
};

export default React.memo(TravelCanvas);

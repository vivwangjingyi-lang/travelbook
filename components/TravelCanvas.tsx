'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useTravelBookStore, CanvasPOI, POI, DailyPOI, Route } from '@/stores/travelBookStore';
import { useLanguageStore } from '@/stores/languageStore';
import { getTranslation } from '@/utils/i18n';

interface TravelCanvasProps {
  mode: 'edit' | 'route';
  onPOIDragEnd?: (poi: CanvasPOI, info: PanInfo) => void;
  onPOIClick?: (poi: CanvasPOI, e: React.MouseEvent) => void; // Added event
  selectedPoiIds?: string[];
  orderedPois?: DailyPOI[];
  routes?: Route[];
  canvasPOIs?: CanvasPOI[]; // Optional prop to override internal POI source
}

const TravelCanvas: React.FC<TravelCanvasProps> = ({
  mode,
  onPOIDragEnd,
  onPOIClick,
  selectedPoiIds = [],
  orderedPois = [],
  routes = [],
  canvasPOIs: externalCanvasPOIs // Optional external POI source
}) => {
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 500 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Local drag state
  const [dragInfo, setDragInfo] = useState<{ id: string | null; offset: { x: number; y: number } }>({ id: null, offset: { x: 0, y: 0 } });
  const { currentBook, updateCanvasPOI, deleteCanvasPOI, getActiveScenePois, updateScenePOI, deleteScenePOI } = useTravelBookStore();
  const { language } = useLanguageStore();

  const t = (key: string) => getTranslation(key, language);
  // 使用外部传入的POI或当前场景的POI
  const canvasPOIs = externalCanvasPOIs || getActiveScenePois();
  
  // 调试信息 - 查看canvasPOIs的parentId关系
  useEffect(() => {
    console.log('Canvas POIs:', canvasPOIs);
    canvasPOIs.forEach(poi => {
      if (poi.parentId) {
        const parent = canvasPOIs.find(p => p.id === poi.parentId);
        console.log(`POI ${poi.name} (${poi.id}) has parent ${parent?.name} (${parent?.id})`);
      }
    });
  }, [canvasPOIs]);

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

  // Track if we're currently dragging to prevent click from firing
  const isDraggingRef = useRef(false);

  const handleDrag = useCallback((_event: any, info: PanInfo, poi: CanvasPOI) => {
    isDraggingRef.current = true;
    setDragInfo({
      id: poi.id,
      offset: info.offset
    });
  }, []);

  // Handle drag end (Final Store Update)
  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, poi: CanvasPOI) => {
    // Check if we are dragging a selected item
    const isDraggingSelected = selectedPoiIds.includes(poi.id);

    // Items to update
    const poisToUpdate = isDraggingSelected ? selectedPoiIds : [poi.id];

    poisToUpdate.forEach(id => {
      const p = canvasPOIs.find(cp => cp.id === id);
      if (p) {
        const finalX = Math.max(20, Math.min(p.x + info.offset.x, canvasSize.width - 20));
        const finalY = Math.max(20, Math.min(p.y + info.offset.y, canvasSize.height - 20));
        // 使用场景感知的更新方法
        updateScenePOI(id, { x: finalX, y: finalY });
      }
    });

    // Clear local drag state first to prevent flickering
    setDragInfo({ id: null, offset: { x: 0, y: 0 } });

    // Reset dragging flag after a short delay to prevent click from firing
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);

    if (onPOIDragEnd) {
      onPOIDragEnd({ ...poi, x: poisToUpdate.length === 1 ? poi.x + info.offset.x : poi.x, y: poisToUpdate.length === 1 ? poi.y + info.offset.y : poi.y }, info);
    }
  }, [updateScenePOI, canvasSize, onPOIDragEnd, selectedPoiIds, canvasPOIs]);

  // Handle POI click with drag awareness
  const handlePoiClick = useCallback((poi: CanvasPOI, e: React.MouseEvent) => {
    // Ignore click if we just finished dragging
    if (isDraggingRef.current) {
      return;
    }
    if (onPOIClick) {
      onPOIClick(poi, e);
    }
  }, [onPOIClick]);

  // Handle delete POI
  const handleDeletePoi = useCallback((poiId: string) => {
    // 使用场景感知的删除方法
    deleteScenePOI(poiId);
  }, [deleteScenePOI]);

  // Get POI order
  const getPoiOrder = useCallback((poiId: string): number | undefined => {
    return orderedPois.find(op => op.poiId === poiId)?.order;
  }, [orderedPois]);

  // 核心问题修复：Framer Motion 的 drag 属性会在拖拽期间覆盖 style.x/y
  // 因此需要分别计算：
  // 1. stylePosition: 传递给 motion.div 的 style.x/y
  // 2. renderPosition: 用于 SVG 连线计算的实际渲染位置
  const getPositions = useCallback((poi: CanvasPOI) => {
    // 无拖拽状态：静态位置
    if (!dragInfo.id) {
      return {
        styleX: poi.x, styleY: poi.y,
        renderX: poi.x, renderY: poi.y
      };
    }

    const isBeingDragged = dragInfo.id === poi.id;
    const draggedPoiIsSelected = selectedPoiIds.includes(dragInfo.id);
    const thisPoiIsSelected = selectedPoiIds.includes(poi.id);

    if (isBeingDragged) {
      // 被直接拖拽的元素：
      // - style.x/y 保持静态 (poi.x)，让 Framer Motion 内部添加拖拽偏移
      // - renderPosition 需要加上偏移，用于 SVG 连线计算
      return {
        styleX: poi.x,
        styleY: poi.y,
        renderX: poi.x + dragInfo.offset.x,
        renderY: poi.y + dragInfo.offset.y
      };
    } else if (draggedPoiIsSelected && thisPoiIsSelected) {
      // 跟随移动的选中元素（未被直接拖拽，但在选中列表中）：
      // - 需要手动在 style.x/y 上添加偏移来移动元素
      // - renderPosition 同样需要加上偏移
      return {
        styleX: poi.x + dragInfo.offset.x,
        styleY: poi.y + dragInfo.offset.y,
        renderX: poi.x + dragInfo.offset.x,
        renderY: poi.y + dragInfo.offset.y
      };
    } else {
      // 不移动的元素（未选中或被拖拽的节点不在选中列表）
      return {
        styleX: poi.x,
        styleY: poi.y,
        renderX: poi.x,
        renderY: poi.y
      };
    }
  }, [dragInfo.id, dragInfo.offset.x, dragInfo.offset.y, selectedPoiIds]);

  return (
    <div ref={canvasRef} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-4 min-h-[500px] relative overflow-visible">
      {/* Grid Background */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 }}></div>

      {/* Canvas Content */}
      <div ref={constraintsRef} className="absolute inset-0">
        {/* Parent-Child Relationships (Behind POIs) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {canvasPOIs.map(childPoi => {
            if (!childPoi.parentId) return null;

            const parentPoi = canvasPOIs.find(p => p.id === childPoi.parentId);
            if (!parentPoi) return null;

            const { renderX: parentX, renderY: parentY } = getPositions(parentPoi);
            const { renderX: childX, renderY: childY } = getPositions(childPoi);

            const startX = parentX + 40;
            const startY = parentY + 17;
            const endX = childX + 40;
            const endY = childY + 17;

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
          const { styleX, styleY } = getPositions(poi);

          return (
            <motion.div
              key={poi.id}
              className="absolute cursor-move group mx-1 my-1"
              style={{ x: styleX, y: styleY, zIndex: 10 }}
              drag={mode === 'edit'}
              dragConstraints={constraintsRef}
              dragElastic={0}
              dragMomentum={false}
              onDrag={(event, info) => handleDrag(event, info, poi)}
              onDragEnd={(event, info) => handleDragEnd(event, info, poi)}
              onClick={(e) => handlePoiClick(poi, e)}
              whileHover={{ scale: 1.05, zIndex: 100 }}
              whileTap={{ scale: 0.95 }}
              dragTransition={{ bounceStiffness: 500, bounceDamping: 30 }}
              whileDrag={{ scale: 1.1, zIndex: 100 }}
            >
              <div
                className={`bg-white shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 relative transition-all duration-300 ${isSelected ? 'ring-2 ring-green-500 ring-offset-2' : (mode === 'route') ? 'opacity-50' : ''} ${poi.parentId ? 'scale-90 border border-slate-200' : ''}`}
                role="button"
                aria-label={`${poi.name}, ${poi.category}`}
              >
                {/* 悬停信息提示框 */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[200] transform scale-95 group-hover:scale-100">
                  <div className="bg-white/95 backdrop-blur-md text-slate-700 text-xs rounded-xl px-3.5 py-2.5 shadow-lg border border-slate-200/80 min-w-[160px] max-w-[220px]">
                    {/* 箭头 */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/95"></div>

                    {/* POI 名称 */}
                    <div className="font-semibold text-sm mb-1.5 text-slate-800">{poi.name}</div>

                    {/* 类别 */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-slate-500">类别:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${poi.category === 'accommodation' ? 'bg-blue-100 text-blue-700' :
                        poi.category === 'sightseeing' ? 'bg-green-100 text-green-700' :
                          poi.category === 'food' ? 'bg-red-100 text-red-700' :
                            poi.category === 'entertainment' ? 'bg-purple-100 text-purple-700' :
                              poi.category === 'shopping' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {t(`category.${poi.category}`)}
                      </span>
                    </div>

                    {/* 访问时间 */}
                    {poi.visitTime && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-slate-500">时间:</span>
                        <span className="text-slate-700">{poi.visitTime}</span>
                      </div>
                    )}

                    {/* 备注 */}
                    {poi.notes && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200">
                        <span className="text-slate-500 block mb-0.5">备注:</span>
                        <span className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">{poi.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

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

                {mode === 'route' && order && (
                  <div className="absolute -top-3 -left-3 bg-slate-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg ring ring-offset-2 ring-slate-900" style={{ zIndex: 1000 }}>
                    {order}
                  </div>
                )}

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

                <span className="text-xs font-medium text-slate-800">{poi.name}</span>

                {mode === 'edit' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePoi(poi.id);
                    }}
                    className="ml-1 w-3.5 h-3.5 flex items-center justify-center text-[8px] text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-150"
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

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

  // Handle drag end
  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, poi: CanvasPOI) => {
    const newX = Math.max(20, Math.min(poi.x + info.offset.x, canvasSize.width - 20));
    const newY = Math.max(20, Math.min(poi.y + info.offset.y, canvasSize.height - 20));
    updateCanvasPOI(poi.id, { x: newX, y: newY });
    if (onPOIDragEnd) {
      onPOIDragEnd({ ...poi, x: newX, y: newY }, info);
    }
  }, [updateCanvasPOI, canvasSize, onPOIDragEnd]);

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
        {/* Routes */}
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
              <text x={(fromPoi.x + toPoi.x) / 2 + 50} y={(fromPoi.y + toPoi.y) / 2 + 15 - 10} fill="#64748b" fontSize="12" textAnchor="middle" pointerEvents="none">
                {route.duration} ({route.transportation})
              </text>
            </svg>
          );
        })}
        
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
          
          return (
            <motion.div
              key={poi.id}
              className="absolute cursor-move group"
              style={{ x: poi.x, y: poi.y }}
              drag={mode === 'edit'}
              dragConstraints={constraintsRef}
              dragElastic={0}
              dragMomentum={false}
              onDragEnd={(event, info) => handleDragEnd(event, info, poi)}
              onClick={() => onPOIClick && onPOIClick(poi)}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              dragTransition={{ bounceStiffness: 500, bounceDamping: 30 }}
              whileDrag={{ scale: 1.1, zIndex: 100 }}
            >
              <div 
                className={`bg-white shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2 relative transition-all duration-300 ${isSelected ? 'ring-2 ring-green-500 ring-offset-2' : mode === 'route' ? 'opacity-50' : ''}`}
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
                
                {/* Order Badge */}
                {mode === 'route' && order && (
                  <div className="absolute -top-3 -left-3 bg-slate-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {order}
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

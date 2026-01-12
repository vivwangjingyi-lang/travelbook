'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { POI } from '@/stores/travelBookStore';

interface POICardProps {
  poi: POI;
  onDelete: (id: string) => void;
  onEdit?: (poi: POI) => void;
  onView?: (poi: POI) => void;
  parentName?: string;
}

export default React.memo(function POICard({ poi, onDelete, onEdit, onView, parentName }: POICardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accommodation':
        return 'bg-blue-100 text-blue-700';
      case 'sightseeing':
        return 'bg-green-100 text-green-700';
      case 'food':
        return 'bg-red-100 text-red-700';
      case 'entertainment':
        return 'bg-purple-100 text-purple-700';
      case 'shopping':
        return 'bg-yellow-100 text-yellow-700';
      case 'transportation':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => onView?.(poi)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-slate-800 truncate">{poi.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(poi.category)}`}>
              {poi.category.charAt(0).toUpperCase() + poi.category.slice(1)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-slate-500">{poi.visitTime}</span>
            {parentName && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                📍 {parentName}
              </span>
            )}
          </div>
          {poi.notes && (
            <p className="text-sm text-slate-600 mt-2 line-clamp-2 truncate">{poi.notes}</p>
          )}
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(poi);
              }}
              className="text-blue-500 hover:text-blue-700 transition-colors p-1"
              aria-label="Edit POI"
            >
              ✏️
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(poi.id);
            }}
            className="text-red-500 hover:text-red-700 transition-colors p-1"
            aria-label="Delete POI"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
});

'use client';

import { motion, AnimatePresence } from "framer-motion";
import { POI } from '@/stores/travelBookStore';

interface POIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  poi: POI | null;
  parentName?: string;
  subPois?: POI[];
}

export default function POIDetailModal({ isOpen, onClose, poi, parentName, subPois }: POIDetailModalProps) {
  if (!poi) return null;

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">{poi.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700`}>
                    {getCategoryDisplayName(poi.category)}
                  </span>
                  <span className="text-sm text-gray-500">{poi.visitTime}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {parentName && (
              <div className="mb-4">
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 flex items-center gap-1.5 w-fit">
                  <span>📍 Belongs to:</span>
                  <span className="font-semibold">{parentName}</span>
                </span>
              </div>
            )}

            {poi.notes && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Notes</h4>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">{poi.notes}</p>
              </div>
            )}

            {subPois && subPois.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <span>Sub-locations</span>
                  <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{subPois.length}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {subPois.map(sub => (
                    <span key={sub.id} className="text-xs px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 shadow-sm">
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
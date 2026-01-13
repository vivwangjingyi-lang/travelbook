'use client';

import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import POIForm from "@/components/POIForm";
import { POI, Scene } from '@/stores/travelBookStore';

interface POIFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: POI;
  title?: string;
  feedback?: { message: string; type: 'success' | 'error' } | null;
  allPois?: POI[];
  scenes?: Scene[]; // 新增：场景列表
  onSubmit: (poiData: Omit<POI, 'id'>) => void;
}

export default function POIFormModal({
  isOpen,
  onClose,
  initialData,
  title,
  feedback,
  allPois,
  scenes,
  onSubmit
}: POIFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Backdrop click to close */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg z-10"
            onClick={(e) => e.stopPropagation()} // Prevent click propagation to backdrop
          >
            {/* We use POIForm directly here. 
               POIForm has its own container styling (bg-white/90...), 
               so we don't need to add another white container around it. */}
            <POIForm
              initialData={initialData}
              onSubmit={onSubmit}
              onCancel={onClose}
              isEditMode={!!initialData}
              title={title}
              feedback={feedback}
              allPois={allPois}
              scenes={scenes}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

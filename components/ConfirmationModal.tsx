'use client';

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  children?: React.ReactNode;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  children
}: ConfirmationModalProps) {
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
            <h3 className="text-xl font-semibold mb-3 text-slate-800">{title}</h3>
            <p className="text-slate-600 leading-relaxed mb-6">{message}</p>
            
            {/* Additional content */}
            {children}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full shadow-lg hover:bg-white/90 hover:shadow-xl transition-all duration-300 text-slate-800"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${destructive 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
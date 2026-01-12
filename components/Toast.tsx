'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Toast 类型定义
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

// 创建 Toast Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast 图标组件
const ToastIcon = ({ type }: { type: ToastType }) => {
    switch (type) {
        case 'success':
            return (
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            );
        case 'error':
            return (
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        case 'warning':
            return (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            );
        case 'info':
        default:
            return (
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
};

// 获取 Toast 背景样式
const getToastStyles = (type: ToastType) => {
    switch (type) {
        case 'success':
            return 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50';
        case 'error':
            return 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50';
        case 'warning':
            return 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50';
        case 'info':
        default:
            return 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50';
    }
};

// Toast Provider 组件
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    // 显示 Toast 消息
    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newToast: Toast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        // 自动移除 Toast
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    // 手动移除 Toast
    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast 容器 */}
            <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 
                rounded-xl border shadow-lg backdrop-blur-xl
                ${getToastStyles(toast.type)}
                min-w-[280px] max-w-[400px]
              `}
                        >
                            {/* 图标 */}
                            <div className="flex-shrink-0">
                                <ToastIcon type={toast.type} />
                            </div>

                            {/* 消息内容 */}
                            <p className="flex-1 text-sm font-medium text-slate-700">
                                {toast.message}
                            </p>

                            {/* 关闭按钮 */}
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
                            >
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

// 使用 Toast 的 Hook
export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast 必须在 ToastProvider 内部使用');
    }
    return context;
}

export default ToastProvider;

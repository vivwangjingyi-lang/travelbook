'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddSceneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string, category: string, image?: string) => void;
}

const categories = [
    { id: 'city', name: '城市', icon: '🏙️' },
    { id: 'beach', name: '海滩', icon: '🏖️' },
    { id: 'nature', name: '森林/自然', icon: '🌿' },
    { id: 'mountain', name: '山野', icon: '🚵' },
    { id: 'culture', name: '人文/古迹', icon: '🏛️' },
    { id: 'other', name: '其他', icon: '📍' },
];

const AddSceneModal: React.FC<AddSceneModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('city');
    const [image, setImage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd(name, category, image || undefined);
        // Reset and close
        setName('');
        setCategory('city');
        setImage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-slate-800">添加新地点</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">地点名称</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="例如：巴黎、三亚、北海道..."
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Category Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">场景类型</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`
                                                flex flex-col items-center p-3 rounded-xl border transition-all
                                                ${category === cat.id
                                                    ? 'bg-violet-50 border-violet-200 text-violet-700 shadow-sm'
                                                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}
                                            `}
                                        >
                                            <span className="text-2xl mb-1">{cat.icon}</span>
                                            <span className="text-xs font-medium">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Image Input (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">图片链接 (可选)</label>
                                <input
                                    type="url"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                />
                                <p className="mt-1.5 text-[11px] text-slate-400">留空则使用分类默认图标</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 shadow-md shadow-violet-200 transition-all font-medium"
                                >
                                    创建地点
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddSceneModal;

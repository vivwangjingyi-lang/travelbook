'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useTravelBookStore, Scene, InterSceneRoute, CanvasPOI } from '@/stores/travelBookStore';
import { useLanguageStore } from '@/stores/languageStore';
import { getTranslation } from '@/utils/i18n';

interface WorldViewProps {
    onSceneDoubleClick?: (scene: Scene) => void;
    onAddScene?: () => void;
    onSceneTemplateClick?: () => void;
}

// 交通图标映射
const transportIcons: Record<InterSceneRoute['transportType'], string> = {
    flight: '✈️',
    train: '🚄',
    bus: '🚌',
    car: '🚗',
    ship: '🚢',
};

// 场景分类图标映射
const categoryIcons: Record<string, string> = {
    beach: '🏖️',
    city: '🏙️',
    nature: '🌿',
    mountain: '🚵',
    culture: '🏛️',
    other: '📍',
};

// 计算场景的天数
const calculateSceneDays = (scene: Scene): number => {
    if (!scene.startDate || !scene.endDate) return 0;

    const start = new Date(scene.startDate);
    const end = new Date(scene.endDate);
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff + 1; // 包含起止日期
};

// 统计不同类型的POI数量
const countPOICategories = (pois: CanvasPOI[]): Record<string, number> => {
    return pois.reduce((counts, poi) => {
        counts[poi.category] = (counts[poi.category] || 0) + 1;
        return counts;
    }, {} as Record<string, number>);
};

const WorldView: React.FC<WorldViewProps> = ({ onSceneDoubleClick, onAddScene, onSceneTemplateClick }) => {
    const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 500 });
    const canvasRef = useRef<HTMLDivElement>(null);

    // 拖拽状态
    const [dragInfo, setDragInfo] = useState<{ id: string | null; offset: { x: number; y: number } }>({ id: null, offset: { x: 0, y: 0 } });
    const isDraggingRef = useRef(false);

    const { currentBook, updateScene, switchScene } = useTravelBookStore();
    const { language } = useLanguageStore();
    const t = (key: string) => getTranslation(key, language);

    const scenes = currentBook?.scenes || [];
    const sceneRoutes = currentBook?.sceneRoutes || [];
    const activeSceneId = currentBook?.activeSceneId || '';

    // 监听画布尺寸变化
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

    // 核心：计算位置策略
    const getPositions = useCallback((scene: Scene) => {
        if (dragInfo.id === scene.id) {
            return {
                styleX: scene.x,
                styleY: scene.y,
                renderX: scene.x + dragInfo.offset.x,
                renderY: scene.y + dragInfo.offset.y
            };
        }
        return {
            styleX: scene.x,
            styleY: scene.y,
            renderX: scene.x,
            renderY: scene.y
        };
    }, [dragInfo.id, dragInfo.offset.x, dragInfo.offset.y]);

    // 处理拖拽
    const handleDrag = useCallback((_event: any, info: PanInfo, scene: Scene) => {
        isDraggingRef.current = true;
        setDragInfo({
            id: scene.id,
            offset: info.offset
        });
    }, []);

    // 处理拖拽结束
    const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, scene: Scene) => {
        const finalX = Math.max(60, Math.min(scene.x + info.offset.x, canvasSize.width - 60));
        const finalY = Math.max(60, Math.min(scene.y + info.offset.y, canvasSize.height - 60));
        updateScene(scene.id, { x: finalX, y: finalY });

        setDragInfo({ id: null, offset: { x: 0, y: 0 } });

        // 防止拖拽结束立即触发点击
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 50);
    }, [updateScene, canvasSize]);

    // 处理双击进入场景
    const handleSceneDoubleClick = useCallback((scene: Scene) => {
        if (!isDraggingRef.current) {
            switchScene(scene.id);
            if (onSceneDoubleClick) {
                onSceneDoubleClick(scene);
            }
        }
    }, [switchScene, onSceneDoubleClick]);

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden bg-slate-50 select-none"
        >
            {/* 全局样式定义 - 使用内联样式替代jsx语法 */}
            <div className="animate-flow">
                {/* This element exists solely to define the CSS variables and animations */}
                <style>
                    {`
                        @keyframes flow {
                            from { stroke-dashoffset: 24; }
                            to { stroke-dashoffset: 0; }
                        }
                        .animate-flow {
                            animation: flow 1s linear infinite;
                        }
                        @keyframes breathe {
                            0%, 100% { opacity: 0.3; }
                            50% { opacity: 0.6; }
                        }
                        .animate-breathe {
                            animation: breathe 3s ease-in-out infinite;
                        }
                    `}
                </style>
            </div>

            {/* 性能优化的背景网格：使用 CSS radial-gradient 替代大量 div */}
            <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1.5px, transparent 0)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* 连线层 SVG */}
            <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%', zIndex: 0, overflow: 'visible' }}
            >
                {sceneRoutes.map(route => {
                    const fromScene = scenes.find(s => s.id === route.fromSceneId);
                    const toScene = scenes.find(s => s.id === route.toSceneId);
                    if (!fromScene || !toScene) return null;

                    const { renderX: startX, renderY: startY } = getPositions(fromScene);
                    const { renderX: endX, renderY: endY } = getPositions(toScene);

                    // 贝塞尔曲线控制点
                    const dx = endX - startX;
                    const dy = endY - startY;
                    const controlOffset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.3 + 50;
                    const midX = (startX + endX) / 2;
                    const midY = (startY + endY) / 2;

                    const path = `M ${startX} ${startY} 
                                  C ${startX + controlOffset} ${startY}, 
                                    ${endX - controlOffset} ${endY}, 
                                    ${endX} ${endY}`;

                    return (
                        <g key={route.id}>
                            {/* 底层轨道 */}
                            <path
                                d={path}
                                stroke="#e2e8f0"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                            />
                            {/* 顶层虚线 */}
                            <path
                                d={path}
                                stroke="#94a3b8"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="4,6"
                                strokeLinecap="round"
                                className="animate-flow"
                            />
                            {/* 交通图标 */}
                            <foreignObject x={midX - 16} y={midY - 16} width="32" height="32" className="overflow-visible">
                                <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-sm">
                                    {transportIcons[route.transportType]}
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}
            </svg>

            {/* 场景节点层 */}
            {scenes.map((scene, index) => {
                const isActive = scene.id === activeSceneId;
                const { styleX, styleY } = getPositions(scene);

                return (
                    <motion.div
                        key={scene.id}
                        drag
                        dragMomentum={false}
                        dragElastic={0}
                        onDrag={(event, info) => handleDrag(event, info, scene)}
                        onDragEnd={(event, info) => handleDragEnd(event as any, info, scene)}
                        onDoubleClick={() => handleSceneDoubleClick(scene)}
                        className="absolute z-10 -ml-[50px] -mt-[60px]"
                        style={{
                            x: styleX,
                            y: styleY,
                            willChange: 'transform' // 强制 GPU 加速
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* 磨砂玻璃容器 - SaaS 极简风格 */}
                        <div
                            className={`
                                relative w-[100px] h-[120px] rounded-2xl flex flex-col items-center p-3 transition-all duration-300
                                bg-white/90
                            `}
                            style={{
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                border: '1px solid rgba(139, 92, 246, 0.5)',
                                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.1)'
                            }}
                        >
                            {/* 序号 Index */}
                            <div className="w-full flex justify-between items-center mb-2">
                                <span className={`text-[10px] font-medium tracking-tight text-violet-500`}>
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                {/* 统计信息 Badges */}
                                <div className="flex gap-1">
                                    {/* POI 计数 Badge */}
                                    {scene.pois.length > 0 && (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600`}>
                                            {scene.pois.length}点
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 嵌入式圆形图片/图标容器 */}
                            <div className="relative mb-3">
                                <div
                                    className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-xl shadow-inner border border-white"
                                    style={{
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    {scene.image ? (
                                        <img src={scene.image} alt={scene.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{categoryIcons[scene.category || 'other']}</span>
                                    )}
                                </div>
                                {/* Active 发光光环 - 默认常亮 */}
                                <div
                                    className="absolute -inset-1 rounded-full border border-violet-500/30 animate-breathe pointer-events-none"
                                    style={{
                                        boxShadow: '0 0 15px 2px rgba(139, 92, 246, 0.3)'
                                    }}
                                />
                            </div>

                            {/* 地点名称 */}
                            <div className="w-full text-center">
                                <h3 className={`text-sm font-medium truncate w-full text-violet-700`}>
                                    {scene.name}
                                </h3>

                                {/* POI分类统计 */}
                                {scene.pois.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-1 mt-1">
                                        {Object.entries(countPOICategories(scene.pois)).map(([category, count]) => (
                                            <span key={category} className="text-[8px] px-1 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                {category === 'accommodation' && '🏨'}
                                                {category === 'sightseeing' && '🏛️'}
                                                {category === 'food' && '🍽️'}
                                                {category === 'entertainment' && '🎭'}
                                                {category === 'shopping' && '🛍️'}
                                                {category === 'transportation' && '🚆'}
                                                {count}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            {/* 场景管理按钮组 */}
            <div className="absolute bottom-6 right-6 flex space-x-3">
                {/* 场景模板按钮 */}
                <button
                    onClick={() => onSceneTemplateClick?.()}
                    className="w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-600 shadow-lg hover:shadow-xl border border-slate-100 flex items-center justify-center transition-all duration-200 active:scale-95"
                    title="场景模板"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </button>

                {/* 添加场景按钮 */}
                {onAddScene && (
                    <button
                        onClick={onAddScene}
                        className="w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-600 shadow-lg hover:shadow-xl border border-slate-100 flex items-center justify-center transition-all duration-200 active:scale-95"
                        title="添加场景"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                )}
            </div>

            {/* 空状态 */}
            {scenes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-3xl mb-4">
                        🗺️
                    </div>
                    <h3 className="text-lg font-medium text-slate-600 mb-1">{t('canvas.noScenesTitle')}</h3>
                    <p className="text-sm text-slate-500 mb-6 text-center">{t('canvas.noScenesDescription')}</p>
                    {onAddScene && (
                        <button
                            onClick={onAddScene}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            {t('canvas.addFirstScene')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorldView;

'use client';

import React from 'react';
import { useTravelBookStore, Scene, InterSceneRoute } from '@/stores/travelBookStore';
import { useLanguageStore } from '@/stores/languageStore';
import { getTranslation } from '@/utils/i18n';

// 交通图标映射
const transportIcons: Record<InterSceneRoute['transportType'], string> = {
    flight: '✈️',
    train: '🚄',
    bus: '🚌',
    car: '🚗',
    ship: '🚢',
};

// 场景颜色
const sceneColors = [
    'bg-indigo-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-purple-500',
];

// 计算场景的天数
const calculateSceneDays = (scene: Scene): number => {
    if (!scene.startDate || !scene.endDate) return 0;
    
    const start = new Date(scene.startDate);
    const end = new Date(scene.endDate);
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff + 1; // 包含起止日期
};

interface SceneJourneySummaryProps {
    onSceneClick?: (scene: Scene) => void;
}

const SceneJourneySummary: React.FC<SceneJourneySummaryProps> = ({ onSceneClick }) => {
    const { currentBook } = useTravelBookStore();
    const { language } = useLanguageStore();
    const t = (key: string) => getTranslation(key, language);

    const scenes = currentBook?.scenes || [];
    const sceneRoutes = currentBook?.sceneRoutes || [];

    // 如果没有场景，不显示
    if (scenes.length === 0) {
        return null;
    }

    // 构建有序场景链（根据路由顺序）
    const orderedScenes: Scene[] = [];
    const routeMap = new Map<string, InterSceneRoute>();

    // 建立从场景到下一个路由的映射
    sceneRoutes.forEach(route => {
        routeMap.set(route.fromSceneId, route);
    });

    // 找到起始场景（没有任何路由指向它）
    const destinationSceneIds = new Set(sceneRoutes.map(r => r.toSceneId));
    let startScene = scenes.find(s => !destinationSceneIds.has(s.id)) || scenes[0];

    // 按路由顺序构建场景序列
    if (startScene) {
        orderedScenes.push(startScene);
        let currentSceneId = startScene.id;

        while (routeMap.has(currentSceneId)) {
            const route = routeMap.get(currentSceneId)!;
            const nextScene = scenes.find(s => s.id === route.toSceneId);
            if (nextScene && !orderedScenes.includes(nextScene)) {
                orderedScenes.push(nextScene);
                currentSceneId = nextScene.id;
            } else {
                break;
            }
        }

        // 添加未链接的场景
        scenes.forEach(s => {
            if (!orderedScenes.includes(s)) {
                orderedScenes.push(s);
            }
        });
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg">
            <h3 className="text-sm font-medium text-slate-500 mb-3 text-center">
                {t('plot.journeyOverview') || '旅程概览'}
            </h3>

            <div className="flex items-center justify-center gap-2 flex-wrap">
                {orderedScenes.map((scene, index) => {
                    const colorClass = sceneColors[index % sceneColors.length];
                    const route = routeMap.get(scene.id);

                    return (
                        <React.Fragment key={scene.id}>
                            {/* 场景节点 */}
                            <button
                                onClick={() => onSceneClick?.(scene)}
                                className={`px-4 py-2 rounded-full text-white text-sm font-medium shadow-md hover:shadow-lg transition-all hover:scale-105 ${colorClass}`}
                            >
                                {scene.name}
                                <span className="ml-2 bg-white/30 px-1.5 py-0.5 rounded-full text-xs">
                                    {calculateSceneDays(scene)}天
                                </span>
                                {scene.pois.length > 0 && (
                                    <span className="ml-1 bg-white/30 px-1.5 py-0.5 rounded-full text-xs">
                                        {scene.pois.length}点
                                    </span>
                                )}
                            </button>

                            {/* 交通连接线 */}
                            {route && index < orderedScenes.length - 1 && (
                                <div className="flex items-center gap-1 text-slate-400">
                                    <span className="text-lg">→</span>
                                    <span className="text-lg">{transportIcons[route.transportType]}</span>
                                    <span className="text-lg">→</span>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default SceneJourneySummary;

'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore, CanvasPOI, DailyPOI, TransportationType } from "@/stores/travelBookStore";
import TravelCanvas from "@/components/TravelCanvas";
import RouteList from "@/components/RouteList";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";

export default function Plot() {
  const router = useRouter();
  const { currentBook, setCurrentDay, ensureDailyItinerary, togglePoiSelection, removePoiSelection, reorderDailyPois, addRoute, deleteRoute, updateBook } = useTravelBookStore();
  const { language } = useLanguageStore();
  
  // 翻译辅助函数
  const t = (key: string) => getTranslation(key, language);
  
  const [currentPhase, setCurrentPhase] = useState<'selection' | 'ordering'>('selection');
  const [selectedFromPoiId, setSelectedFromPoiId] = useState<string | null>(null);
  const [selectedToPoiId, setSelectedToPoiId] = useState<string | null>(null);
  const [transportation, setTransportation] = useState<TransportationType>('walk');
  const [duration, setDuration] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  
  // Calculate number of days for the trip
  const calculateDays = () => {
    if (!currentBook?.startDate || !currentBook?.endDate) return 1;
    
    const start = new Date(currentBook.startDate);
    const end = new Date(currentBook.endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  };
  
  const totalDays = calculateDays();
  
  // Handle day selection change
  const handleDayChange = (day: number) => {
    setSelectedDay(day);
    setCurrentPhase('selection'); // Reset to selection phase when changing days
    
    // Ensure selectedPoiIds is empty when changing days
    if (currentBook) {
      const existingItinerary = currentBook.dailyItineraries.find(i => i.day === day);
      if (existingItinerary) {
        // Clear selectedPoiIds for the new day
        existingItinerary.selectedPoiIds = [];
        existingItinerary.orderedPois = [];
        existingItinerary.routes = [];
        
        // Update the daily itinerary
        const updatedItineraries = [...currentBook.dailyItineraries];
        const index = updatedItineraries.findIndex(i => i.day === day);
        if (index !== -1) {
          updatedItineraries[index] = existingItinerary;
          // Update the currentBook in the store
          updateBook({
            ...currentBook,
            dailyItineraries: updatedItineraries
          });
        }
      }
    }
  };

  // 获取当前旅行书的POI数据
  const canvasPOIs = currentBook?.canvasPois || [];
  const dailyItinerary = currentBook?.dailyItineraries.find(i => i.day === selectedDay) || null;
  const selectedPoiIds = dailyItinerary?.selectedPoiIds || [];
  const orderedPois = dailyItinerary?.orderedPois || [];
  const routes = dailyItinerary?.routes || [];
  
  // 确保所选日期的行程存在
  useEffect(() => {
    ensureDailyItinerary(selectedDay);
  }, [selectedDay]);







  // 完成选择阶段，进入排序阶段
  const handleCompleteSelection = () => {
    if (selectedPoiIds.length < 2) return;
    
    // 初始化排序
    const initialOrder = selectedPoiIds.map((id, index) => ({
      poiId: id,
      order: index + 1
    }));
    
    reorderDailyPois(selectedDay, initialOrder);
    setCurrentPhase('ordering');
  };

  // 处理POI排序
  const handleDragEnd = (index: number, newIndex: number) => {
    const newOrder = [...orderedPois];
    const [removed] = newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, removed);
    
    // 更新顺序号
    const updatedOrder = newOrder.map((poi, idx) => ({
      ...poi,
      order: idx + 1
    }));
    
    reorderDailyPois(selectedDay, updatedOrder);
  };

  // 处理路径创建
  const handleAddRoute = () => {
    if (selectedFromPoiId && selectedToPoiId && currentBook && selectedFromPoiId !== selectedToPoiId) {
      addRoute(selectedDay, {
        fromPoiId: selectedFromPoiId,
        toPoiId: selectedToPoiId,
        transportation,
        duration
      });
      
      // 重置表单
      setSelectedFromPoiId(null);
      setSelectedToPoiId(null);
      setTransportation('walk');
      setDuration('');
    }
  };

  // 处理路线删除
  const handleRouteDelete = (routeId: string) => {
    deleteRoute(selectedDay, routeId);
  };

  // 找到POI的排序信息
  const getPoiOrder = (poiId: string): number | undefined => {
    return orderedPois.find(op => op.poiId === poiId)?.order;
  };

  // 找到POI的CanvasPOI信息
  const getCanvasPoi = (poiId: string): CanvasPOI | undefined => {
    return canvasPOIs.find(cp => cp.id === poiId);
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={4} />
      
      <div className="max-w-6xl mx-auto pt-24">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-slate-800">{t('plot.title')}</h1>
          <p className="text-lg text-slate-600 leading-relaxed">{t('plot.subtitle')}</p>
        </header>

        {/* Main Content */}
        <main className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8">
          {/* Day Navigation */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-slate-800 text-center">{t('plot.yourItinerary')}</h2>
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {Array.from({ length: totalDays }, (_, index) => index + 1).map((day) => (
                <button
                  key={day}
                  onClick={() => handleDayChange(day)}
                  className={`px-4 py-2 rounded-full shadow-md transition-all duration-300 ${selectedDay === day
                    ? 'bg-slate-800 text-white shadow-lg scale-105'
                    : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-lg'}`}
                >
                  {t('plot.day')} {day}
                </button>
              ))}
            </div>
          </div>
          
          {/* Phase Information */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold mb-2 text-slate-800">
              {currentPhase === 'selection' ? t('plot.selectionPhase') : t('plot.orderingPhase')}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {currentPhase === 'selection' 
                ? t('plot.selectionDescription').replace('{day}', selectedDay.toString())
                : t('plot.orderingDescription').replace('{day}', selectedDay.toString())}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Canvas */}
            <div className="lg:col-span-2">
              <TravelCanvas 
                mode="route" 
                selectedPoiIds={selectedPoiIds} 
                orderedPois={orderedPois} 
                routes={routes}
                onPOIClick={(poi) => {
                  if (currentPhase === 'selection') {
                    togglePoiSelection(selectedDay, poi.id);
                  }
                }}
              />
              
              {/* Route List */}
              {currentPhase === 'ordering' && (
                <div className="mt-6">
                  <RouteList 
                    routes={routes} 
                    canvasPOIs={canvasPOIs} 
                    onRouteDelete={handleRouteDelete} 
                  />
                </div>
              )}
            </div>

            {/* Itinerary Panel */}
            <div>
              {/* Phase Control */}
              {currentPhase === 'selection' ? (
                <div className="mb-6">
                  <button
                    onClick={handleCompleteSelection}
                    disabled={selectedPoiIds.length < 2}
                    className={`w-full px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${selectedPoiIds.length < 2 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-slate-800 text-white hover:bg-slate-700 hover:shadow-xl'}`}
                  >
                    {t('plot.confirmSelection').replace('{count}', selectedPoiIds.length.toString())}
                  </button>
                </div>
              ) : (
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setCurrentPhase('selection');
                      // 清理状态：将routes清空
                      if (currentBook && dailyItinerary) {
                        const updatedItinerary = {
                          ...dailyItinerary,
                          routes: []
                        };
                        const updatedItineraries = [...currentBook.dailyItineraries];
                        const index = updatedItineraries.findIndex(i => i.day === selectedDay);
                        if (index !== -1) {
                          updatedItineraries[index] = updatedItinerary;
                          updateBook({
                            ...currentBook,
                            dailyItineraries: updatedItineraries
                          });
                        }
                      }
                    }}
                    className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-800 rounded-full shadow-lg hover:bg-slate-100 transition-all duration-300"
                  >
                    {t('plot.backToSelection')}
                  </button>
                </div>
              )}
              
              {/* Selected POIs List */}
              {currentPhase === 'selection' && selectedPoiIds.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">{t('plot.selectedPOIs')} ({selectedPoiIds.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedPoiIds.map((poiId, index) => {
                      const canvasPoi = getCanvasPoi(poiId);
                      if (!canvasPoi) return null;
                      return (
                        <div key={`${poiId}-${index}`} className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm">
                          <span className="text-sm font-medium text-slate-800">{canvasPoi.name}</span>
                          <button
                            onClick={() => removePoiSelection(selectedDay, poiId)}
                            className="text-xs text-red-500 hover:text-red-700 transition-colors"
                          >
                            {t('plot.remove')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Itinerary List */}
              {currentPhase === 'ordering' && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800">{t('plot.yourItineraryList')}</h2>
                  <div className="space-y-3">
                    {orderedPois
                      .sort((a, b) => a.order - b.order)
                      .map((orderedPoi, index) => {
                        const canvasPoi = getCanvasPoi(orderedPoi.poiId);
                        if (!canvasPoi) return null;
                        
                        return (
                              <motion.div
                                key={`${orderedPoi.poiId}-${orderedPoi.order}`}
                                className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-move"
                                draggable
                                onDragStart={() => setSelectedFromPoiId(orderedPoi.poiId)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (selectedFromPoiId) {
                                    const fromIndex = orderedPois.findIndex(p => p.poiId === selectedFromPoiId);
                                    if (fromIndex !== -1) {
                                      handleDragEnd(fromIndex, index);
                                    }
                                  }
                                }}
                              >
                            <div className="flex items-center gap-2">
                              <div className="bg-slate-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                {orderedPoi.order}
                              </div>
                              <span className="font-medium text-slate-800">{canvasPoi.name}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Route Creation */}
              {currentPhase === 'ordering' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-slate-800">{t('plot.addRoute')}</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t('plot.from')}</label>
                      <select
                          value={selectedFromPoiId || ''}
                          onChange={(e) => setSelectedFromPoiId(e.target.value || null)}
                          className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                          <option value="">{t('plot.selectPOI')}</option>
                          {[...new Set(selectedPoiIds)].map((poiId) => {
                            const poi = getCanvasPoi(poiId);
                            return poi ? <option key={poiId} value={poiId}>{poi.name}</option> : null;
                          })}
                        </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t('plot.to')}</label>
                      <select
                          value={selectedToPoiId || ''}
                          onChange={(e) => setSelectedToPoiId(e.target.value || null)}
                          className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                          <option value="">{t('plot.selectPOI')}</option>
                          {[...new Set(selectedPoiIds)].map((poiId) => {
                            const poi = getCanvasPoi(poiId);
                            return poi ? <option key={poiId} value={poiId}>{poi.name}</option> : null;
                          })}
                        </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t('plot.transportation')}</label>
                      <select
                        value={transportation}
                        onChange={(e) => setTransportation(e.target.value as TransportationType)}
                        className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="walk">{t('transport.walk')}</option>
                        <option value="bus">{t('transport.bus')}</option>
                        <option value="taxi">{t('transport.taxi')}</option>
                        <option value="train">{t('transport.train')}</option>
                        <option value="car">{t('transport.car')}</option>
                        <option value="bike">{t('transport.bike')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t('plot.duration')}</label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder={t('plot.durationPlaceholder')}
                        className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    
                    <button
                      onClick={handleAddRoute}
                      disabled={!selectedFromPoiId || !selectedToPoiId || !duration}
                      className={`w-full px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${!selectedFromPoiId || !selectedToPoiId || !duration 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-slate-800 text-white hover:bg-slate-700 hover:shadow-xl'}`}
                    >
                      {t('plot.addRouteButton')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
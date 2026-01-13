'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore, Memo } from "@/stores/travelBookStore";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";

import { useToast } from "@/components/Toast";

export default function Epilogue() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    currentBook,
    addMemo,
    updateMemo,
    deleteMemo,
    toggleMemoPin,
    saveBook
  } = useTravelBookStore();
  const { language } = useLanguageStore();

  // 翻译辅助函数
  const t = (key: string) => getTranslation(key, language);

  // Handle copy link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        showToast(t('epilogue.copySuccess'), 'success');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        showToast(t('epilogue.copyFail'), 'error');
      });
  };

  // Handle export as PDF
  const handleExportPDF = () => {
    window.print();
  };

  // Handle share
  const handleShare = () => {
    const url = window.location.href;
    const title = `My Travel Book: ${currentBook?.title || 'Unnamed Trip'}`;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'Check out my travel book!',
        url: url,
      })
        .then(() => {
          showToast(t('epilogue.shareSuccess'), 'success');
        })
        .catch(err => {
          console.error('Error sharing:', err);
          // If it's not an abort error (user cancelled), try fallback
          if (err.name !== 'AbortError') {
            handleCopyLink();
          }
        });
    } else {
      // Fallback to copy link if share API not supported
      handleCopyLink();
    }
  };

  // 获取行程数据
  const totalDays = currentBook?.dailyItineraries.length || 0;
  const totalPOIs = currentBook?.pois.length || 0;
  const totalCanvasPOIs = currentBook?.canvasPois.length || 0;
  const totalRoutes = currentBook?.dailyItineraries.reduce((sum, day) => sum + day.routes.length, 0) || 0;

  // 多场景统计
  const scenes = currentBook?.scenes || [];
  const totalScenes = scenes.length;
  const totalScenePOIs = scenes.reduce((sum, scene) => sum + scene.pois.length, 0);
  const sceneRoutes = currentBook?.sceneRoutes || [];

  // 获取按天排序的行程
  const sortedItineraries = currentBook?.dailyItineraries
    .sort((a, b) => a.day - b.day) || [];

  // 获取POI信息
  const getPOIInfo = (poiId: string) => {
    const poi = currentBook?.canvasPois.find(p => p.id === poiId) ||
      currentBook?.pois.find(p => p.id === poiId);
    return poi || { name: 'Unknown Location', visitTime: 'Unknown' };
  };

  // 获取交通方式的图标
  const getTransportIcon = (transportation: string) => {
    switch (transportation) {
      case 'walk': return '🚶‍♂️';
      case 'bus': return '🚌';
      case 'taxi': return '🚕';
      case 'train': return '🚆';
      case 'car': return '🚗';
      case 'bike': return '🚲';
      default: return '🚶‍♂️';
    }
  };

  // Memo functionality state
  const [showAddMemoModal, setShowAddMemoModal] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [memoTitle, setMemoTitle] = useState('');
  const [memoContent, setMemoContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);

  // Get sorted and filtered memos
  const sortedMemos = currentBook?.memos
    .filter(memo => {
      // Filter by search query
      const matchesSearch = searchQuery
        ? memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memo.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      // Filter by pinned status
      const matchesPinned = showOnlyPinned ? memo.pinned : true;

      return matchesSearch && matchesPinned;
    })
    .sort((a, b) => {
      // Pinned memos first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Then by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }) || [];


  // Handle save memo (combined add/update)
  const handleSaveMemo = () => {
    if (!currentBook || !memoTitle.trim()) return;

    if (editingMemo) {
      updateMemo(editingMemo.id, memoTitle.trim(), memoContent.trim());
      showToast(t('feedback.editPOISuccess'), 'success'); // Reusing existing success message or generic
    } else {
      addMemo(memoTitle.trim(), memoContent.trim());
      showToast(t('feedback.addPOISuccess'), 'success');
    }

    saveBook();

    // Reset form
    setEditingMemo(null);
    setMemoTitle('');
    setMemoContent('');
    setShowAddMemoModal(false);
  };

  // Handle edit memo
  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setMemoTitle(memo.title);
    setMemoContent(memo.content);
    setShowAddMemoModal(true);
  };

  // Handle delete memo
  const handleDeleteMemo = (memoId: string) => {
    if (currentBook) {
      deleteMemo(memoId);
      saveBook();
    }
  };

  // Handle toggle pin
  const handleTogglePin = (memoId: string) => {
    if (currentBook) {
      toggleMemoPin(memoId);
      saveBook();
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate date for a specific day
  const calculateDayDate = (day: number) => {
    if (!currentBook?.startDate) return null;
    const startDate = new Date(currentBook.startDate);
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + (day - 1));
    return dayDate;
  };

  // Format date for display
  const formatDayDate = (date: Date) => {
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // Generate personalized travel summary
  const generateTravelSummary = () => {
    if (!currentBook) return null;

    const summary = {
      basicInfo: {
        destination: currentBook.destination || 'Unknown Destination',
        duration: totalDays,
        startDate: currentBook.startDate,
        endDate: currentBook.endDate
      },
      highlights: {
        totalPOIs: totalPOIs,
        mostVisitedCategory: getMostVisitedCategory(),
        totalRoutes: totalRoutes,
        primaryTransport: getPrimaryTransport()
      },
      activities: getActivityBreakdown()
    };

    return summary;
  };

  // Get most visited POI category
  const getMostVisitedCategory = () => {
    if (!currentBook || totalPOIs === 0) return 'None';

    const categoryCount: Record<string, number> = {};

    // Count categories from both regular POIs and canvas POIs
    [...(currentBook.pois || []), ...(currentBook.canvasPois || [])]
      .forEach(poi => {
        const category = poi.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

    // Find category with highest count
    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';
  };

  // Get primary transportation method
  const getPrimaryTransport = () => {
    if (!currentBook || totalRoutes === 0) return 'None';

    const transportCount: Record<string, number> = {};

    currentBook.dailyItineraries.forEach(day => {
      day.routes.forEach(route => {
        transportCount[route.transportation] =
          (transportCount[route.transportation] || 0) + 1;
      });
    });

    return Object.entries(transportCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';
  };

  // Get activity breakdown by category
  const getActivityBreakdown = () => {
    if (!currentBook || totalPOIs === 0) return [];

    const categoryCount: Record<string, number> = {};

    // Combine unique POIs from both lists
    const allPois = [...(currentBook.pois || [])];
    if (currentBook.canvasPois) {
      currentBook.canvasPois.forEach(cp => {
        if (!allPois.some(p => p.id === cp.id)) {
          allPois.push(cp as any);
        }
      });
    }

    const totalCalculatedPOIs = allPois.length;
    if (totalCalculatedPOIs === 0) return [];

    // Count categories
    allPois.forEach(poi => {
      const category = poi.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalCalculatedPOIs) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Get travel summary
  const travelSummary = generateTravelSummary();



  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      {/* Floating Navigation */}
      <div className="print:hidden">
        <FloatingNavbar currentChapter={5} />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-24">
        {/* Header */}
        <header className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold mb-2 text-slate-800"
          >
            {t('epilogue.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed"
          >
            {t('epilogue.subtitle')}
          </motion.p>
        </header>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-6 sm:p-8"
        >
          <div className="text-center mb-8">
            <div className="text-5xl sm:text-6xl mb-4">🎉</div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-2 text-slate-800">{t('epilogue.ready')}</h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {t('epilogue.congratulations')}
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{totalDays}</div>
              <div className="text-sm text-slate-600">{t('epilogue.statisticsDays')}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-2xl mb-2">📍</div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{totalPOIs}</div>
              <div className="text-sm text-slate-600">{t('epilogue.statisticsPOIs')}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{totalCanvasPOIs}</div>
              <div className="text-sm text-slate-600">{t('epilogue.statisticsCanvasPOIs')}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="text-2xl mb-2">🗺️</div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{totalRoutes}</div>
              <div className="text-sm text-slate-600">{t('epilogue.statisticsRoutes')}</div>
            </motion.div>
          </div>

          {/* Scenes Overview - 多场景概览 */}
          {totalScenes > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-slate-800">
                🌍 {t('epilogue.scenesOverview') || '目的地概览'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-200"
                  >
                    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="text-slate-700 font-medium">{scene.name}</span>
                    {scene.pois.length > 0 && (
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        {scene.pois.length} POIs
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {sceneRoutes.length > 0 && (
                <div className="mt-4 text-sm text-slate-500">
                  ✈️ {sceneRoutes.length} {t('epilogue.sceneConnections') || '条跨城交通'}
                </div>
              )}
            </motion.div>
          )}

          {/* Personalized Travel Summary */}
          {travelSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-slate-800">{t('epilogue.personalizedSummary')}</h3>

              {/* Basic Information */}
              <div className="mb-6">
                <h4 className="text-base sm:text-lg font-medium mb-3 text-slate-700">{t('epilogue.tripBasics')}</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">📍</span>
                    <span className="text-slate-600">{travelSummary.basicInfo.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">⏱️</span>
                    <span className="text-slate-600">{travelSummary.basicInfo.duration} {travelSummary.basicInfo.duration === 1 ? t('epilogue.day') : t('epilogue.days')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">📅</span>
                    <span className="text-slate-600">
                      {new Date(travelSummary.basicInfo.startDate).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })}
                      {' - '}
                      {new Date(travelSummary.basicInfo.endDate).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })} {new Date(travelSummary.basicInfo.startDate).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trip Highlights */}
              <div className="mb-6">
                <h4 className="text-base sm:text-lg font-medium mb-3 text-slate-700">{t('epilogue.tripHighlights')}</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">⭐</span>
                    <span className="text-slate-600">{travelSummary.highlights.totalPOIs} {t('epilogue.placesVisited')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">🏷️</span>
                    <span className="text-slate-600">{t('epilogue.mostVisitedLabel')} {travelSummary.highlights.mostVisitedCategory === 'None' ? t('category.None') : t(`category.${travelSummary.highlights.mostVisitedCategory}`)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">🗺️</span>
                    <span className="text-slate-600">{travelSummary.highlights.totalRoutes} {t('epilogue.transportRoutes')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">🚗</span>
                    <span className="text-slate-600">{t('epilogue.primaryTransportLabel')} {travelSummary.highlights.primaryTransport === 'None' ? t('transport.None') : t(`transport.${travelSummary.highlights.primaryTransport}`)}</span>
                  </div>
                </div>
              </div>

              {/* Activity Breakdown */}
              {travelSummary.activities.length > 0 && (
                <div>
                  <h4 className="text-base sm:text-lg font-medium mb-3 text-slate-700">{t('epilogue.activityBreakdown')}</h4>
                  <div className="space-y-3">
                    {travelSummary.activities.map((activity, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-slate-600">{t(`category.${activity.category}`)}</span>
                          <span className="text-sm text-slate-600">{activity.count} ({activity.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${activity.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            className="bg-slate-800 h-2 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              )}

              {/* Transportation Tickets */}
              {currentBook?.transportationTickets && currentBook.transportationTickets.length > 0 && (
                <div className="mb-8 break-inside-avoid">
                  <h4 className="text-base sm:text-lg font-medium mb-3 text-slate-700">{t('epilogue.tickets')}</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {currentBook.transportationTickets.map((ticket) => (
                      <div key={ticket.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100 print:border-slate-300">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {ticket.type === 'flight' ? '✈️' :
                                ticket.type === 'train' ? '🚆' :
                                  ticket.type === 'bus' ? '🚌' :
                                    ticket.type === 'car' ? '🚗' : '🎫'}
                            </span>
                            <div>
                              <div className="font-medium text-slate-800">{ticket.provider}</div>
                              <div className="text-xs text-slate-500">{t('epilogue.ticketNumber')}: {ticket.ticketNumber}</div>
                            </div>
                          </div>
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded print:border print:border-slate-300">
                            {t(`transport.${ticket.type}`)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">{t('epilogue.departure')}</div>
                            <div className="font-medium text-slate-700">{formatDate(ticket.departureDate + ' ' + ticket.departureTime)}</div>
                            <div className="text-sm text-slate-600">{ticket.departureLocation}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 mb-0.5">{t('epilogue.arrival')}</div>
                            <div className="font-medium text-slate-700">{formatDate(ticket.arrivalDate + ' ' + ticket.arrivalTime)}</div>
                            <div className="text-sm text-slate-600">{ticket.arrivalLocation}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Itinerary Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8"
          >
            <h3 className="text-xl font-semibold mb-4 text-slate-800">{t('epilogue.itineraryOverview')}</h3>

            {sortedItineraries.length > 0 ? (
              <div className="space-y-8">
                {sortedItineraries.map((itinerary) => {
                  const sortedPOIs = [...itinerary.orderedPois].sort((a, b) => a.order - b.order);

                  // Calculate day date
                  const dayDate = calculateDayDate(itinerary.day);
                  const formattedDate = dayDate ? formatDayDate(dayDate) : '';

                  return (
                    <div key={itinerary.day} className="border-l-4 border-slate-800 pl-4">
                      {/* Enhanced Day Header with Date and Weekday */}
                      <h4 className="text-lg font-medium text-slate-800 mb-1">{t('plot.day')} {itinerary.day}</h4>
                      {formattedDate && (
                        <p className="text-sm text-slate-500 mb-3">{formattedDate}</p>
                      )}

                      {/* Enhanced POI Schedule with Transportation Details */}
                      {sortedPOIs.length > 0 && (
                        <div className="mb-4">

                          <div className="space-y-4">
                            {sortedPOIs.map((orderedPOI, index) => {
                              const poiInfo = getPOIInfo(orderedPOI.poiId);
                              const nextPOI = sortedPOIs[index + 1];
                              const routeToNextPOI = nextPOI ? itinerary.routes.find(
                                r => r.fromPoiId === orderedPOI.poiId && r.toPoiId === nextPOI.poiId
                              ) : null;

                              return (
                                <div key={orderedPOI.poiId}>
                                  {/* POI Node with Duration */}
                                  <div className="flex items-center gap-3 text-slate-600">
                                    <span className="bg-slate-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                      {orderedPOI.order}
                                    </span>
                                    <div className="flex-grow">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{poiInfo.name}</span>
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded">{poiInfo.visitTime}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Transportation to Next POI */}
                                  {routeToNextPOI && nextPOI && (
                                    <div className="flex items-center gap-3 text-slate-600 ml-8 mt-1">
                                      <span className="text-sm">{getTransportIcon(routeToNextPOI.transportation)}</span>
                                      <div className="flex-grow flex items-center gap-2">
                                        <span className="text-xs text-slate-500">{t('epilogue.to')}</span>
                                        <span className="text-sm font-medium">{getPOIInfo(nextPOI.poiId).name}</span>
                                      </div>
                                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">{routeToNextPOI.duration}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-600">
                <p>{t('epilogue.noItinerary')}</p>
              </div>
            )}
          </motion.div>

          {/* Travel Memos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8"
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-slate-800">{t('epilogue.travelMemos')}</h3>
                <button
                  onClick={() => setShowAddMemoModal(true)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-700 hover:shadow-lg transition-all duration-300"
                >
                  {t('epilogue.addMemo')}
                </button>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('epilogue.searchMemos')}
                    className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔍</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showOnlyPinned"
                    checked={showOnlyPinned}
                    onChange={() => setShowOnlyPinned(!showOnlyPinned)}
                    className="w-4 h-4 text-slate-800 rounded focus:ring-slate-400"
                  />
                  <label htmlFor="showOnlyPinned" className="text-sm text-slate-600 cursor-pointer">{t('epilogue.onlyPinned')}</label>
                </div>
              </div>
            </div>

            {/* Memo List */}
            {sortedMemos.length > 0 ? (
              <div className="space-y-3">
                {sortedMemos.map((memo) => (
                  <div
                    key={memo.id}
                    className={`bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 ${memo.pinned ? 'border-yellow-500' : 'border-slate-300'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-md font-medium text-slate-800">{memo.title}</h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleTogglePin(memo.id)}
                          className={`p-1 rounded-full hover:bg-slate-100 transition-colors ${memo.pinned ? 'text-yellow-500' : 'text-slate-400'}`}
                          title={memo.pinned ? 'Unpin' : 'Pin'}
                        >
                          {memo.pinned ? '📌' : '📌'}
                        </button>
                        <button
                          onClick={() => handleEditMemo(memo)}
                          className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteMemo(memo.id)}
                          className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-red-500"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{memo.content}</p>
                    <p className="text-xs text-slate-500">{formatDate(memo.date)}</p>


                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-600">
                <p className="mb-2">{t('epilogue.noMemos')}</p>
                <p className="text-sm">{t('epilogue.addFirstMemo')}</p>
              </div>
            )}
          </motion.div>

          {/* Final Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8"
          >
            <h3 className="text-xl font-semibold mb-4 text-slate-800">{t('epilogue.finalThoughts')}</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              {t('epilogue.finalMessage1')}
            </p>
            <p className="text-slate-600 leading-relaxed">
              {t('epilogue.finalMessage2')}
            </p>
          </motion.div>

          {/* Share and Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8"
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-slate-800">{t('epilogue.shareTravelBook')}</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-700 hover:shadow-lg transition-all duration-300"
                title={t('epilogue.copyLink')}
              >
                🔗
                <span>{t('epilogue.copyLink')}</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-700 hover:shadow-lg transition-all duration-300"
                title={t('epilogue.exportPDF')}
              >
                📄
                <span>{t('epilogue.exportPDF')}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-700 hover:shadow-lg transition-all duration-300"
                title={t('epilogue.share')}
              >
                📤
                <span>{t('epilogue.share')}</span>
              </button>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-between items-center pt-4 print:hidden"
          >
            <button
              onClick={() => router.push('/plot')}
              className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 border border-slate-200"
            >
              <span>←</span>
              <span>{t('navigation.previous')}</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-slate-700 transition-all duration-300"
            >
              <span>🏠</span>
              <span>{t('navigation.home')}</span>
            </button>
          </motion.div>



          {/* Add Memo Modal */}
          {showAddMemoModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
              <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">
                  {editingMemo ? t('epilogue.editMemo') : t('epilogue.addNewMemo')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('epilogue.titleLabel')}</label>
                    <input
                      type="text"
                      value={memoTitle}
                      onChange={(e) => setMemoTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                      placeholder={t('epilogue.memoTitle')}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('epilogue.contentLabel')}</label>
                    <textarea
                      value={memoContent}
                      onChange={(e) => setMemoContent(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 h-32 resize-none"
                      placeholder={t('epilogue.memoContent')}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowAddMemoModal(false);
                        setEditingMemo(null);
                        setMemoTitle('');
                        setMemoContent('');
                      }}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {t('button.cancel')}
                    </button>
                    <button
                      onClick={handleSaveMemo}
                      className="px-6 py-2 bg-slate-800 text-white rounded-lg shadow-md hover:bg-slate-700 transition-all"
                    >
                      {editingMemo ? t('epilogue.save') : t('epilogue.addMemoButton')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.main>
      </div>
    </div >
  );
}
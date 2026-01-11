'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore, Memo } from "@/stores/travelBookStore";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";

export default function Epilogue() {
  const router = useRouter();
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

  // 获取行程数据
  const totalDays = currentBook?.dailyItineraries.length || 0;
  const totalPOIs = currentBook?.pois.length || 0;
  const totalCanvasPOIs = currentBook?.canvasPois.length || 0;
  const totalRoutes = currentBook?.dailyItineraries.reduce((sum, day) => sum + day.routes.length, 0) || 0;
  
  // 获取按天排序的行程
  const sortedItineraries = currentBook?.dailyItineraries
    .sort((a, b) => a.day - b.day) || [];
  
  // 获取POI信息
  const getPOIName = (poiId: string) => {
    const poi = currentBook?.canvasPois.find(p => p.id === poiId) || 
                currentBook?.pois.find(p => p.id === poiId);
    return poi?.name || 'Unknown Location';
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
  
  // Handle add memo
  const handleAddMemo = () => {
    if (memoTitle.trim() && currentBook) {
      addMemo(memoTitle.trim(), memoContent.trim());
      saveBook();
      
      // Reset form
      setMemoTitle('');
      setMemoContent('');
      setShowAddMemoModal(false);
    }
  };
  
  // Handle update memo
  const handleUpdateMemo = () => {
    if (editingMemo && memoTitle.trim() && currentBook) {
      updateMemo(editingMemo.id, memoTitle.trim(), memoContent.trim());
      saveBook();
      
      // Reset form
      setEditingMemo(null);
      setMemoTitle('');
      setMemoContent('');
    }
  };
  
  // Handle edit memo
  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setMemoTitle(memo.title);
    setMemoContent(memo.content);
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
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    
    // Count categories from both regular POIs and canvas POIs
    [...(currentBook.pois || []), ...(currentBook.canvasPois || [])]
      .forEach(poi => {
        const category = poi.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    
    return Object.entries(categoryCount)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalPOIs) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Get travel summary
  const travelSummary = generateTravelSummary();

  // Handle copy link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        alert('Failed to copy link. Please try again.');
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
        console.log('Successfully shared');
      })
      .catch(err => {
        console.error('Error sharing:', err);
        // Fallback to copy link if sharing fails
        handleCopyLink();
      });
    } else {
      // Fallback to copy link if share API not supported
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={5} />
      
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
                    <span className="text-slate-600">{travelSummary.basicInfo.duration} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">📅</span>
                    <span className="text-slate-600">
                      {new Date(travelSummary.basicInfo.startDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - 
                      {new Date(travelSummary.basicInfo.endDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} {new Date(travelSummary.basicInfo.startDate).getFullYear()}
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
                    <span className="text-slate-600">{travelSummary.highlights.totalPOIs} places visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">🏷️</span>
                    <span className="text-slate-600">Most visited: {travelSummary.highlights.mostVisitedCategory}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">🗺️</span>
                    <span className="text-slate-600">{travelSummary.highlights.totalRoutes} transportation routes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">🚗</span>
                    <span className="text-slate-600">Primary transport: {travelSummary.highlights.primaryTransport}</span>
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
                          <span className="text-sm text-slate-600">{activity.category}</span>
                          <span className="text-sm text-slate-600">{activity.count} ({activity.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
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
              <div className="space-y-6">
                {sortedItineraries.map((itinerary) => {
                  const sortedPOIs = [...itinerary.orderedPois].sort((a, b) => a.order - b.order);
                  
                  return (
                    <div key={itinerary.day} className="border-l-4 border-slate-800 pl-4">
                        <h4 className="text-lg font-medium text-slate-800 mb-3">{t('plot.day')} {itinerary.day}</h4>
                      
                      {/* POI Schedule */}
                      {sortedPOIs.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-md font-medium text-slate-700 mb-2">{t('epilogue.placesToVisit')}</h5>
                          <ul className="space-y-2">
                            {sortedPOIs.map((orderedPOI) => (
                              <li key={orderedPOI.poiId} className="flex items-center gap-2 text-slate-600">
                                <span className="bg-slate-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                  {orderedPOI.order}
                                </span>
                                <span>{getPOIName(orderedPOI.poiId)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Routes */}
                      {itinerary.routes.length > 0 && (
                        <div>
                          <h5 className="text-md font-medium text-slate-700 mb-2">{t('epilogue.transportationRoutes')}</h5>
                          <ul className="space-y-2">
                            {itinerary.routes.map((route) => (
                              <li key={route.id} className="flex items-center gap-3 text-slate-600">
                                <span>{getTransportIcon(route.transportation)}</span>
                                <span className="flex-grow">
                                  {getPOIName(route.fromPoiId)} → {getPOIName(route.toPoiId)}
                                </span>
                                <span className="text-sm bg-slate-100 px-2 py-1 rounded">{route.duration}</span>
                              </li>
                            ))}
                          </ul>
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
                    
                    {/* Edit Form */}
                    {editingMemo?.id === memo.id && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
                        <input
                          type="text"
                          value={memoTitle}
                          onChange={(e) => setMemoTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                          placeholder={t('epilogue.memoTitle')}
                        />
                        <textarea
                          value={memoContent}
                          onChange={(e) => setMemoContent(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                          rows={3}
                          placeholder={t('epilogue.memoContent')}
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingMemo(null)}
                            className="px-3 py-1 bg-white border border-slate-300 rounded-full text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            {t('button.cancel')}
                          </button>
                          <button
                            onClick={handleUpdateMemo}
                            className="px-3 py-1 bg-slate-800 text-white rounded-full text-sm hover:bg-slate-700 transition-colors"
                          >
                            {t('button.save')}
                          </button>
                        </div>
                      </div>
                    )}
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


          
          {/* Add Memo Modal */}
          {showAddMemoModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{t('epilogue.addNewMemo')}</h3>
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
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                      rows={4}
                      placeholder={t('epilogue.memoContent')}
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setShowAddMemoModal(false)}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-full shadow-md hover:bg-slate-100 transition-colors"
                    >
                      {t('button.cancel')}
                    </button>
                    <button
                      onClick={handleAddMemo}
                      className="px-4 py-2 bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-700 hover:shadow-lg transition-colors"
                    >
                      {t('epilogue.addMemoButton')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
}
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore, Memo } from "@/stores/travelBookStore";

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
  
  // Get sorted memos (pinned first, then newest)
  const sortedMemos = currentBook?.memos
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

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={5} />
      
      <div className="max-w-4xl mx-auto pt-24">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-slate-800">Chapter V: Epilogue</h1>
          <p className="text-lg text-slate-600 leading-relaxed">Your journey awaits</p>
        </header>

        {/* Main Content */}
        <main className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-semibold mb-2 text-slate-800">Your Travel Book is Ready!</h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Congratulations! You've successfully created your travel itinerary. Here's a summary of your journey:
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <div className="text-3xl font-bold text-slate-800 mb-1">{totalDays}</div>
              <div className="text-sm text-slate-600">Days</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <div className="text-3xl font-bold text-slate-800 mb-1">{totalPOIs}</div>
              <div className="text-sm text-slate-600">Points of Interest</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <div className="text-3xl font-bold text-slate-800 mb-1">{totalCanvasPOIs}</div>
              <div className="text-sm text-slate-600">Canvas POIs</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <div className="text-3xl font-bold text-slate-800 mb-1">{totalRoutes}</div>
              <div className="text-sm text-slate-600">Routes</div>
            </div>
          </div>

          {/* Itinerary Overview */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4 text-slate-800">Your Itinerary Overview</h3>
            
            {sortedItineraries.length > 0 ? (
              <div className="space-y-6">
                {sortedItineraries.map((itinerary) => {
                  const sortedPOIs = [...itinerary.orderedPois].sort((a, b) => a.order - b.order);
                  
                  return (
                    <div key={itinerary.day} className="border-l-4 border-slate-800 pl-4">
                      <h4 className="text-lg font-medium text-slate-800 mb-3">Day {itinerary.day}</h4>
                      
                      {/* POI Schedule */}
                      {sortedPOIs.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-md font-medium text-slate-700 mb-2">Places to Visit</h5>
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
                          <h5 className="text-md font-medium text-slate-700 mb-2">Transportation Routes</h5>
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
                <p>No detailed itinerary yet. Head to the Plot chapter to plan your daily schedule.</p>
              </div>
            )}
          </div>

          {/* Travel Memos */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Your Travel Memos</h3>
              <button
                onClick={() => setShowAddMemoModal(true)}
                className="px-4 py-2 bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-700 hover:shadow-lg transition-all duration-300"
              >
                + Add Memo
              </button>
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
                          placeholder="Memo title"
                        />
                        <textarea
                          value={memoContent}
                          onChange={(e) => setMemoContent(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                          rows={3}
                          placeholder="Memo content"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingMemo(null)}
                            className="px-3 py-1 bg-white border border-slate-300 rounded-full text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateMemo}
                            className="px-3 py-1 bg-slate-800 text-white rounded-full text-sm hover:bg-slate-700 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-600">
                <p className="mb-2">No memos yet</p>
                <p className="text-sm">Add your first memo to keep track of important details!</p>
              </div>
            )}
          </div>

          {/* Final Message */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4 text-slate-800">Final Thoughts</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Your journey is now mapped out, but the real adventure begins when you step out the door. 
              Remember to be flexible and embrace the unexpected—some of the best travel experiences 
              happen when you deviate from the plan.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Whether you're exploring a new city, hiking through nature, or simply relaxing on a beach, 
              we hope your TravelBook helps make your journey unforgettable.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push('/canvas')}
              className="px-6 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
            >
              Edit Canvas
            </button>
            <button
              onClick={() => router.push('/plot')}
              className="px-6 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
            >
              Edit Itinerary
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-white border border-slate-300 text-slate-800 rounded-full shadow-lg hover:bg-slate-100 transition-all duration-300"
            >
              Create New Travel Book
            </button>
          </div>
          
          {/* Add Memo Modal */}
          {showAddMemoModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">Add New Memo</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={memoTitle}
                      onChange={(e) => setMemoTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                      placeholder="Memo title"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                    <textarea
                      value={memoContent}
                      onChange={(e) => setMemoContent(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                      rows={4}
                      placeholder="Memo content"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setShowAddMemoModal(false)}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-full shadow-md hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMemo}
                      className="px-4 py-2 bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-700 hover:shadow-lg transition-colors"
                    >
                      Add Memo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
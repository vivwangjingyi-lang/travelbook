'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore, POICategory, POI } from "@/stores/travelBookStore";
import { AnimatePresence, motion } from "framer-motion";
import POICard from "@/components/POICard";
import POIFormModal from "@/components/POIFormModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import POIDetailModal from "@/components/POIDetailModal";
import DataStatistics from "@/components/DataStatistics";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";

export default function Collection() {
  const router = useRouter();
  const { currentBook, addPOI, deletePOI, updatePOI } = useTravelBookStore();
  const { language } = useLanguageStore();

  // 翻译辅助函数
  const t = (key: string) => getTranslation(key, language);

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState<string | null>(null);
  const [poiToEdit, setPoiToEdit] = useState<POI | undefined>(undefined);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const [poiToView, setPoiToView] = useState<POI | null>(null);

  const pois = currentBook?.pois || [];
  const [selectedCategory, setSelectedCategory] = useState<POICategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting options
  type SortOption = 'name-asc' | 'name-desc' | 'time-asc' | 'time-desc';
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  // Filter POIs based on selected category and search term
  const filteredPOIs = useMemo(() => {
    return pois.filter(poi => {
      const matchesCategory = selectedCategory === 'all' || poi.category === selectedCategory;
      const matchesSearch = searchTerm === '' ||
        poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [pois, selectedCategory, searchTerm]);

  // Sort filtered POIs
  const sortedPOIs = useMemo(() => {
    return [...filteredPOIs].sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'time-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'time-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [filteredPOIs, sortOption]);

  // Calculate category counts based on filtered POIs
  const categoryCounts = useMemo(() => {
    const counts: Record<POICategory | 'all', number> = {
      all: pois.length,
      accommodation: 0,
      sightseeing: 0,
      food: 0,
      entertainment: 0,
      shopping: 0,
      transportation: 0,
    };

    pois.forEach(poi => {
      counts[poi.category]++;
    });

    return counts;
  }, [pois]);

  const handleAddSubmit = (poiData: Omit<POI, 'id'>) => {
    try {
      addPOI(poiData);
      setFeedback({ message: t('feedback.addPOISuccess'), type: 'success' });
      setIsAddModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({ message: t('feedback.addPOIFailed'), type: 'error' });
    }
  };

  const handleEditSubmit = (poiData: Omit<POI, 'id'>) => {
    try {
      if (poiToEdit) {
        updatePOI(poiToEdit.id, poiData);
        setFeedback({ message: t('feedback.editPOISuccess'), type: 'success' });
        setIsEditModalOpen(false);
        setPoiToEdit(undefined);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (error) {
      setFeedback({ message: t('feedback.editPOIFailed'), type: 'error' });
    }
  };

  return (
    <div className="min-h-screen pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={2} />

      <div className="pt-24 px-4 lg:px-8 max-w-7xl mx-auto">
        {/* Header (Outside container) */}
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold mb-2 text-slate-800">{t('collection.title')}</h1>
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg text-slate-600 leading-relaxed">{t('collection.subtitle')}</p>
            {/* Stats Button */}
            {pois.length > 0 && (
              <button
                onClick={() => setShowStatsModal(true)}
                className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors"
                title="View Statistics"
              >
                <span className="text-xl">📊</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Glass Container */}
        <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl p-6 md:p-8 space-y-8">

          {/* Top Controls Area (Search, Add, Sort, Filter) */}
          <div className="space-y-6">
            {/* Search & Sort Row */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search Bar with Add Button */}
              <div className="flex w-full md:w-auto gap-4 items-center flex-1">
                {/* Add POI Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex-shrink-0 px-4 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="text-lg font-bold">+</span>
                  <span className="text-sm font-medium">{t('collection.addPOI')}</span>
                </button>

                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder={t('collection.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-white/60 border border-white/40 text-gray-800 placeholder-gray-500 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/80 transition-all duration-300"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    🔍
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={t('collection.clearSearch')}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-sm text-gray-600 whitespace-nowrap">{t('collection.sortBy')}</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="text-sm px-3 py-2 rounded-lg bg-white/60 border border-white/40 text-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/80 transition-all duration-300 cursor-pointer"
                >
                  <option value="name-asc">{t('collection.sortNameAsc')}</option>
                  <option value="name-desc">{t('collection.sortNameDesc')}</option>
                  <option value="time-asc">{t('collection.sortTimeAsc')}</option>
                  <option value="time-desc">{t('collection.sortTimeDesc')}</option>
                </select>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar pl-1">
              {(['all', 'accommodation', 'sightseeing', 'food', 'entertainment', 'shopping', 'transportation'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out whitespace-nowrap ${selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white/60 border border-white/40 text-gray-700 shadow-sm hover:bg-white/80 hover:shadow-md'
                    }`}
                >
                  {t(`category.${cat}`)}
                  <span className={`text-xs ml-1 ${selectedCategory === cat ? 'opacity-100' : 'opacity-60'}`}>
                    {categoryCounts[cat]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* POI Grid Content */}
          <div className="min-h-[40vh]">
            {pois.length === 0 ? (
              <div className="text-center py-16 rounded-xl border-2 border-dashed border-slate-300 bg-white/20 shadow-inner">
                <p className="text-xl text-slate-600 mb-2 font-medium">{t('collection.noPOI')}</p>
                <p className="text-sm text-slate-500 mb-6">{t('collection.addFirstPOI')}</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {t('collection.addPOI')}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-500 px-1">
                  {t('collection.showingPOIs').replace('{count}', filteredPOIs.length.toString())}
                </div>

                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {sortedPOIs.map((poi) => (
                      <div key={poi.id}>
                        <POICard
                          poi={poi}
                          parentName={poi.parentId ? pois.find(p => p.id === poi.parentId)?.name : undefined}
                          onView={(poi) => {
                            setPoiToView(poi);
                            setShowDetailModal(true);
                          }}
                          onEdit={(poi) => {
                            setPoiToEdit(poi);
                            setIsEditModalOpen(true);
                          }}
                          onDelete={(id) => {
                            setPoiToDelete(id);
                            setShowDeleteModal(true);
                          }}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </div>

          {/* Bottom Navigation (Inside Container) */}
          <div className="flex justify-between items-center pt-8 border-t border-white/30">
            <button
              type="button"
              onClick={() => router.push('/departure')}
              className="px-6 py-2 bg-white/60 backdrop-blur-sm border border-white/40 text-slate-700 rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all duration-300 font-medium"
            >
              ← {t('canvas.previousChapter')}
            </button>

            <button
              type="button"
              onClick={() => router.push('/canvas')}
              className="px-6 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300 font-medium"
            >
              {t('collection.continueToCanvas')} →
            </button>
          </div>

        </div>

        {/* Modals outside container */}
        <POIFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={t('collection.addPOI')}
          feedback={feedback}
          allPois={pois}
          onSubmit={handleAddSubmit}
          scenes={currentBook?.scenes || []}
        />

        <POIFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setPoiToEdit(undefined);
          }}
          initialData={poiToEdit}
          title={t('collection.editPOI')}
          feedback={feedback}
          allPois={pois}
          onSubmit={handleEditSubmit}
          scenes={currentBook?.scenes || []}
        />

        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setPoiToDelete(null);
          }}
          onConfirm={() => {
            if (poiToDelete) {
              deletePOI(poiToDelete);
              setShowDeleteModal(false);
              setPoiToDelete(null);
            }
          }}
          title={t('collection.deletePOI')}
          message={t('collection.deletePOIMessage')}
          confirmText={t('button.delete')}
          cancelText={t('button.cancel')}
          destructive={true}
        />

        <POIDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setPoiToView(null);
          }}
          poi={poiToView}
          parentName={poiToView?.parentId ? pois.find(p => p.id === poiToView.parentId)?.name : undefined}
          subPois={poiToView ? pois.filter(p => p.parentId === poiToView.id) : []}
        />

        {/* Stats Modal */}
        <ConfirmationModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          onConfirm={() => setShowStatsModal(false)}
          title={t('collection.statistics')}
          message=""
          confirmText={t('button.close')}
          cancelText=""
        >
          <DataStatistics pois={pois} />
        </ConfirmationModal>

      </div>
    </div>
  );
}
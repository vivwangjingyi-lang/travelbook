'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore, POICategory, POI } from "@/stores/travelBookStore";
import { AnimatePresence } from "framer-motion";
import POICard from "@/components/POICard";
import POIForm from "@/components/POIForm";
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

  const [name, setName] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState<string | null>(null);
  const [poiToEdit, setPoiToEdit] = useState<POI | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
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
      all: filteredPOIs.length,
      accommodation: 0,
      sightseeing: 0,
      food: 0,
      entertainment: 0,
      shopping: 0,
      transportation: 0,
    };

    filteredPOIs.forEach(poi => {
      counts[poi.category]++;
    });

    return counts;
  }, [filteredPOIs]);

  // 删除未使用的函数
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   addPOI({ name, category, visitTime, notes, createdAt: new Date().toISOString() });
  //   setName("");
  //   setVisitTime("");
  //   setNotes("");
  // };

  // const handleDelete = (poiId: string) => {
  //   deletePOI(poiId);
  // };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={2} />

      <div className="pt-24 px-4 lg:px-0">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 text-slate-800">{t('collection.title')}</h1>
            <p className="text-lg text-slate-600 leading-relaxed">{t('collection.subtitle')}</p>
          </header>

          {/* Main Content */}
          <main className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add/Edit POI Form */}
              <div className="sticky top-0 max-h-[300px] sm:max-h-[400px] md:max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                <POIForm
                  initialData={poiToEdit}
                  isEditMode={isEditing}
                  title={isEditing ? t('collection.editPOI') : t('collection.addPOI')}
                  feedback={feedback}
                  allPois={pois}
                  onSubmit={(poiData) => {
                    try {
                      if (isEditing && poiToEdit) {
                        updatePOI(poiToEdit.id, poiData);
                        setFeedback({ message: t('feedback.editPOISuccess'), type: 'success' });
                        setIsEditing(false);
                        setPoiToEdit(undefined);
                      } else {
                        addPOI(poiData);
                        setFeedback({ message: t('feedback.addPOISuccess'), type: 'success' });
                      }
                      // Clear feedback after 3 seconds
                      setTimeout(() => setFeedback(null), 3000);
                    } catch (error) {
                      setFeedback({ message: isEditing ? t('feedback.editPOIFailed') : t('feedback.addPOIFailed'), type: 'error' });
                    }
                  }}
                  onCancel={() => {
                    setIsEditing(false);
                    setPoiToEdit(undefined);
                  }}
                />
              </div>

              {/* POI List */}
              <div className="space-y-4">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md">
                  <h2 className="text-2xl font-semibold text-slate-800">{t('collection.yourCollection')}</h2>
                  {pois.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <p>{t('collection.noPOI')}</p>
                      <p className="text-sm mt-2">{t('collection.addFirstPOI')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('collection.searchPlaceholder')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
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

                      {/* Sort Options */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                          {t('collection.showingPOIs').replace('{count}', filteredPOIs.length.toString())}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{t('collection.sortBy')}</span>
                          <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-300"
                          >
                            <option value="name-asc">{t('collection.sortNameAsc')}</option>
                            <option value="name-desc">{t('collection.sortNameDesc')}</option>
                            <option value="time-asc">{t('collection.sortTimeAsc')}</option>
                            <option value="time-desc">{t('collection.sortTimeDesc')}</option>
                          </select>
                        </div>
                      </div>

                      {/* Filter Chips */}
                      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
                        {(['all', 'accommodation', 'sightseeing', 'food', 'entertainment', 'shopping', 'transportation'] as const).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${selectedCategory === cat
                              ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                          >
                            {t(`category.${cat}`)}
                            <span className="text-xs opacity-80">{categoryCounts[cat]}</span>
                          </button>
                        ))}
                      </div>
                      <div className="space-y-3 max-h-[200px] sm:max-h-[250px] md:max-h-[calc(100vh-500px)] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="wait">
                          {sortedPOIs.map((poi) => (
                            <POICard
                              key={poi.id}
                              poi={poi}
                              parentName={poi.parentId ? pois.find(p => p.id === poi.parentId)?.name : undefined}
                              onView={(poi) => {
                                setPoiToView(poi);
                                setShowDetailModal(true);
                              }}
                              onEdit={(poi) => {
                                setPoiToEdit(poi);
                                setIsEditing(true);
                              }}
                              onDelete={(id) => {
                                setPoiToDelete(id);
                                setShowDeleteModal(true);
                              }}
                            />
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Next Button */}
                      <div className="mt-6">
                        <button
                          onClick={() => router.push('/canvas')}
                          className="w-full px-4 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
                        >
                          {t('collection.continueToCanvas')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Statistics */}
              {pois.length > 0 && (
                <div className="mt-8 md:col-span-2">
                  <DataStatistics pois={pois} />
                </div>
              )}
            </div>

            {/* Confirmation Modal for Delete */}
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

            {/* POI Detail Modal */}
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
          </main>
        </div>
      </div>
    </div>
  );
}
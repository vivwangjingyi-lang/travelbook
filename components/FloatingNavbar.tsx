'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelBookStore } from '@/stores/travelBookStore';
import { useLanguageStore } from '@/stores/languageStore';
import { getTranslation } from '@/utils/i18n';
import ConfirmationModal from './ConfirmationModal';

interface FloatingNavbarProps {
  currentChapter: number;
}

export default function FloatingNavbar({ currentChapter }: FloatingNavbarProps) {
  const router = useRouter();
  const { currentBook, isDirty, saveBook, resetBook } = useTravelBookStore();
  const { language } = useLanguageStore();
  const [showModal, setShowModal] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  
  // 翻译辅助函数
  const t = (key: string) => getTranslation(key, language);

  const chapters = [
    { number: 0, key: 'chapter.introduction', path: '/introduction' },
    { number: 1, key: 'chapter.departure', path: '/departure' },
    { number: 2, key: 'chapter.collection', path: '/collection' },
    { number: 3, key: 'chapter.canvas', path: '/canvas' },
    { number: 4, key: 'chapter.plot', path: '/plot' },
    { number: 5, key: 'chapter.epilogue', path: '/epilogue' },
  ];

  // Handle navigation to other chapters
  const handleNavigate = (path: string) => {
    // Show confirmation modal when navigating with unsaved changes
    if (isDirty) {
      setTargetPath(path);
      setShowModal(true);
    } else {
      router.push(path);
    }
  };

  // Handle back to library
  const handleBackToLibrary = () => {
    if (isDirty) {
      setTargetPath('/');
      setShowModal(true);
    } else {
      router.push('/');
    }
  };

  // Save and exit
  const handleSaveAndExit = () => {
    saveBook();
    if (targetPath) {
      router.push(targetPath);
    }
    setShowModal(false);
    setTargetPath(null);
  };

  // Discard changes and exit
  const handleDiscardChanges = () => {
    resetBook();
    if (targetPath) {
      router.push(targetPath);
    }
    setShowModal(false);
    setTargetPath(null);
  };

  // Cancel navigation
  const handleCancel = () => {
    setShowModal(false);
    setTargetPath(null);
  };

  return (
    <>
      {/* Floating Navigation Capsule */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 h-14 bg-white/70 backdrop-blur-xl rounded-full shadow-lg px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {/* Back to Library Button */}
        <button
          onClick={handleBackToLibrary}
          className="px-4 py-2 bg-white/90 text-slate-600 hover:bg-white/100 hover:shadow-md rounded-full text-sm transition-all duration-300 whitespace-nowrap"
        >
          ← {t('nav.library')}
        </button>
        
        {/* Chapter Navigation Buttons */}
        {chapters.map((chapter) => (
          <button
            key={chapter.number}
            onClick={() => handleNavigate(chapter.path)}
            className={`px-4 py-2 rounded-full text-sm transition-all duration-300 whitespace-nowrap ${currentChapter === chapter.number
              ? 'bg-slate-800 text-white shadow-lg' 
              : 'bg-white/90 text-slate-600 hover:bg-white/100 hover:shadow-md'}`}
          >
            {t('nav.chapter')} {chapter.number}: {t(chapter.key)}
          </button>
        ))}
      </nav>

      {/* Navigation Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCancel}
        onConfirm={handleSaveAndExit}
        title={t('introduction.unsavedChanges')}
        message={t('introduction.unsavedMessage')}
        confirmText={t('introduction.saveAndExit')}
        cancelText={t('button.cancel')}
      >
        {/* Additional button for Discard Changes */}
        <button
          onClick={handleDiscardChanges}
          className="absolute bottom-6 left-6 px-4 py-2 bg-gray-200/80 backdrop-blur-sm text-slate-700 rounded-full shadow-lg hover:bg-gray-300/80 transition-all duration-300 text-sm"
        >
          {t('introduction.discardChanges')}
        </button>
      </ConfirmationModal>
    </>
  );
}

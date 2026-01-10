'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelBookStore } from '@/stores/travelBookStore';
import ConfirmationModal from './ConfirmationModal';

interface FloatingNavbarProps {
  currentChapter: number;
}

export default function FloatingNavbar({ currentChapter }: FloatingNavbarProps) {
  const router = useRouter();
  const { currentBook, isDirty, saveBook, resetBook } = useTravelBookStore();
  const [showModal, setShowModal] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  const chapters = [
    { number: 0, name: 'Introduction', path: '/introduction' },
    { number: 1, name: 'Departure', path: '/departure' },
    { number: 2, name: 'Collection', path: '/collection' },
    { number: 3, name: 'Canvas', path: '/canvas' },
    { number: 4, name: 'Plot', path: '/plot' },
    { number: 5, name: 'Epilogue', path: '/epilogue' },
  ];

  // Handle navigation to other chapters
  const handleNavigate = (path: string) => {
    // Auto-save when navigating between chapters
    if (isDirty) {
      saveBook();
    }
    router.push(path);
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
          ← Library
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
            Chapter {chapter.number}: {chapter.name}
          </button>
        ))}
      </nav>

      {/* Navigation Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCancel}
        onConfirm={handleSaveAndExit}
        title="You have unsaved changes"
        message="What would you like to do with your unsaved changes?"
        confirmText="Save & Exit"
        cancelText="Cancel"
      >
        {/* Additional button for Discard Changes */}
        <button
          onClick={handleDiscardChanges}
          className="absolute bottom-6 left-6 px-4 py-2 bg-gray-200/80 backdrop-blur-sm text-slate-700 rounded-full shadow-lg hover:bg-gray-300/80 transition-all duration-300 text-sm"
        >
          Discard Changes
        </button>
      </ConfirmationModal>
    </>
  );
}

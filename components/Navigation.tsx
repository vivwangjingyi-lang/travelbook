'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelBookStore } from '@/stores/travelBookStore';
import ConfirmationModal from './ConfirmationModal';

interface NavigationProps {
  currentChapter: number;
}

export default function Navigation({ currentChapter }: NavigationProps) {
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

  // 处理导航到其他章节
  const handleNavigate = (path: string) => {
    // 导航到其他章节时自动保存，不显示提示
    if (isDirty) {
      saveBook();
    }
    router.push(path);
  };

  // 处理返回图书馆
  const handleBackToLibrary = () => {
    if (isDirty) {
      setTargetPath('/');
      setShowModal(true);
    } else {
      router.push('/');
    }
  };

  // 保存并退出
  const handleSaveAndExit = () => {
    saveBook();
    if (targetPath) {
      router.push(targetPath);
    }
    setShowModal(false);
    setTargetPath(null);
  };

  // 放弃更改并退出
  const handleDiscardChanges = () => {
    resetBook();
    if (targetPath) {
      router.push(targetPath);
    }
    setShowModal(false);
    setTargetPath(null);
  };

  // 取消导航
  const handleCancel = () => {
    setShowModal(false);
    setTargetPath(null);
  };

  return (
    <nav className="mb-8">
      <div className="flex flex-nowrap justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Back to Library Button */}
        <button
          onClick={handleBackToLibrary}
          className="px-4 py-2 bg-white/70 backdrop-blur-sm text-slate-600 hover:bg-white/90 hover:shadow-md rounded-full text-sm transition-all duration-300"
        >
          ← Library
        </button>
        
        {/* Chapter Navigation Buttons */}
        {chapters.map((chapter) => (
          <button
            key={chapter.number}
            onClick={() => handleNavigate(chapter.path)}
            className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${currentChapter === chapter.number
              ? 'bg-slate-800 text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-sm text-slate-600 hover:bg-white/90 hover:shadow-md'}`}
          >
            Chapter {chapter.number}: {chapter.name}
          </button>
        ))}
      </div>

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
    </nav>
  );
}

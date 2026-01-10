'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTravelBookStore, TravelBook } from "@/stores/travelBookStore";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function Home() {
  const router = useRouter();
  const { books, loadBooks, createBook, deleteBook, selectBook } = useTravelBookStore();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 加载书籍列表
  useEffect(() => {
    loadBooks();
  }, []);

  // 创建新书
  const handleCreateBook = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    createBook(
      "New Journey",
      "A new travel adventure awaits",
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0]
    );
    
    // 导航到引言页面（定义旅程）
    router.push('/introduction');
  };

  // 选择书籍
  const handleSelectBook = (bookId: string) => {
    selectBook(bookId);
    router.push('/canvas');
  };

  // 打开删除确认模态框
  const handleDeleteClick = (bookId: string) => {
    setSelectedBookId(bookId);
    setShowDeleteModal(true);
  };

  // 确认删除书籍
  const confirmDeleteBook = () => {
    if (selectedBookId) {
      deleteBook(selectedBookId);
      setShowDeleteModal(false);
      setSelectedBookId(null);
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-6xl font-bold mb-4 text-slate-800 font-[family-name:var(--font-playfair-display)]">The Anthology</h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Every trip is a story. Where will you go next?
          </p>
        </header>

        {/* Create New Button - Always visible */}
        <div className="mb-16 text-center">
          <button
            onClick={handleCreateBook}
            className="px-8 py-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300 text-lg"
          >
            Draft New Journey
          </button>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          // Empty State - Beautiful Centered Design
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              className="mb-8 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-amber-100 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-6xl">📖</span>
            </motion.div>
            <h2 className="text-3xl font-semibold mb-4 text-slate-800 font-[family-name:var(--font-playfair-display)]">Start Your First Chapter</h2>
            <p className="text-slate-600 leading-relaxed max-w-md text-center">
              Every great journey begins with a single step. Use the button above to create your first travel story.
            </p>
          </div>
        ) : (
          // Books Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {books.map((book: TravelBook) => (
              <motion.div
                key={book.id}
                className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                transition={{ duration: 0.3 }}
                onClick={() => handleSelectBook(book.id)}
              >
                {/* Book Cover */}
                <div className="absolute inset-0">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={`Cover of ${book.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-300 via-purple-200 to-amber-200">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-purple-300/20 to-amber-300/20"></div>
                    </div>
                  )}
                </div>
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                
                {/* Book Content (At Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                  {/* Date Range */}
                  <div className="text-sm opacity-90 mb-2">
                    {book.startDate} - {book.endDate}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-white font-[family-name:var(--font-playfair-display)]">{book.title}</h3>
                </div>
                
                {/* Delete Button (appears on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(book.id);
                  }}
                  className="absolute top-3 right-3 bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                  title="Delete this journey"
                >
                  🗑️
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteBook}
          title="Delete Journey"
          message="Are you sure you want to delete this journey? This cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          destructive
        />
      </div>
    </div>
  );
}
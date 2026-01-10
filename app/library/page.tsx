'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTravelBookStore, TravelBook } from "@/stores/travelBookStore";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function Library() {
  const router = useRouter();
  const { books, loadBooks, deleteBook, selectBook } = useTravelBookStore();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 加载书籍列表
  useEffect(() => {
    loadBooks();
  }, []);

  // 选择书籍
  const handleSelectBook = (bookId: string) => {
    selectBook(bookId);
    router.push('/introduction');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900 transition-colors duration-300"
            >
              ← Back to Home
            </button>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-[family-name:var(--font-playfair-display)]">My Library</h1>
            
            {/* Empty div for balance */}
            <div className="w-24"></div>
          </div>
        </header>

        {/* Books Grid */}
        {books.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-32">
            <motion.div
              className="mb-10 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-100 to-amber-100 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-8xl">📚</span>
            </motion.div>
            <h2 className="text-3xl font-semibold mb-6 text-slate-800 font-[family-name:var(--font-playfair-display)]">Your Library is Empty</h2>
            <p className="text-slate-600 leading-relaxed max-w-md text-center mb-8">
              No travel books yet. Start creating your first travel journal today!
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 text-lg font-medium"
            >
              Create New Book
            </button>
          </div>
        ) : (
          // Books Grid - Waterfall Layout
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <p className="text-xl text-slate-600 mb-10 text-center">
              You have {books.length} travel {books.length === 1 ? 'book' : 'books'}
            </p>
            
            {/* Waterfall Flow Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-4 gap-8">
              {books.map((book: TravelBook, index) => (
                <motion.div
                  key={book.id}
                  className="mb-8 break-inside-avoid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.1)]"
                       onClick={() => handleSelectBook(book.id)}>
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
                      
                      {/* Volume Number */}
                      <div className="text-xs opacity-70 mt-1">Vol. {index + 1}</div>
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
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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

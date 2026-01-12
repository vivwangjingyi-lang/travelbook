'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTravelBookStore, TravelBook } from "@/stores/travelBookStore";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function Library() {
    const router = useRouter();
    const { books, loadBooks, deleteBook, selectBook } = useTravelBookStore();
    const { language } = useLanguageStore();
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // 翻译处理
    const t = (key: string) => getTranslation(key, language);

    // 简单的复数处理
    const getBookCountText = (count: number) => {
        if (language === 'zh') return `您有 ${count} 本旅行手册`;
        return `You have ${count} travel ${count === 1 ? 'book' : 'books'}`;
    };

    useEffect(() => {
        if (books.length === 0) {
            loadBooks();
        }
    }, []);

    const handleSelectBook = (bookId: string) => {
        selectBook(bookId);
        router.push('/introduction');
    };

    const handleDeleteClick = (bookId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedBookId(bookId);
        setShowDeleteModal(true);
    };

    const confirmDeleteBook = () => {
        if (selectedBookId) {
            deleteBook(selectedBookId);
            setShowDeleteModal(false);
            setSelectedBookId(null);
        }
    };

    return (
        <div className="min-h-screen relative">
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <button
                        onClick={() => router.push('/')}
                        className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('nav.backToHome')}
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    >
                        + {t('library.createNewBook')}
                    </button>
                </header>

                {/* Title Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-[family-name:var(--font-playfair-display)] mb-4">
                        {t('library.title')}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {getBookCountText(books.length)}
                    </p>
                </div>

                {/* Grid Section */}
                {books.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-3xl">📚</div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">{t('library.empty')}</h2>
                        <p className="text-slate-500 mb-8 max-w-sm">{t('library.emptyDescription')}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                        >
                            {t('library.createNewBook')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {books.map((book: TravelBook, index) => (
                            <motion.div
                                key={book.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group relative"
                                onClick={() => handleSelectBook(book.id)}
                            >
                                {/* Book Card */}
                                <div className="aspect-[3/4] relative rounded-xl bg-white overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-xl transition-all duration-300 cursor-pointer">
                                    {/* Cover Image/Color */}
                                    {book.coverImage ? (
                                        <img src={book.coverImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-8">
                                            <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 text-4xl">
                                                {index + 1}
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                                    {/* Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-left">
                                        <p className="text-[10px] uppercase tracking-wider opacity-70 mb-2 font-bold">{book.startDate} — {book.endDate}</p>
                                        <h3 className="text-xl font-bold font-[family-name:var(--font-playfair-display)] leading-tight line-clamp-2">{book.title}</h3>
                                        {book.destination && (
                                            <p className="text-xs mt-2 flex items-center gap-1 opacity-90 capitalize font-medium">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                {book.destination}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action UI (Delete) - 增强对比度使其可见 */}
                                    <button
                                        onClick={(e) => handleDeleteClick(book.id, e)}
                                        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-900/40 backdrop-blur-md text-white border border-white/20 hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-lg z-20"
                                        title={t('button.delete')}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteBook}
                title={t('library.deleteJourney')}
                message={t('library.deleteConfirmation')}
                confirmText={t('button.delete')}
                cancelText={t('button.cancel')}
                destructive
            />
        </div>
    );
}

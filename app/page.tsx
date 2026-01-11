'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTravelBookStore, TravelBook } from "@/stores/travelBookStore";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";

export default function Home() {
  const router = useRouter();
  const { books, loadBooks, createBook, deleteBook, selectBook } = useTravelBookStore();
  const { language, setLanguage, isEnglish, isChinese } = useLanguageStore();
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 获取翻译文本的辅助函数
  const t = (key: string) => getTranslation(key, language);

  // 加载书籍列表
  useEffect(() => {
    loadBooks();
  }, []);

  // 创建新书
  const handleCreateBook = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    // 创建新书后，createBook函数会自动更新store中的books数组
    // 并异步保存到存储，所以不需要额外的保存操作
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8 pb-20 font-[family-name:var(--font-geist-sans)] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero Section */}
        <header className="mb-16 text-center">
          {/* 语言选择按钮 */}
          <div className="flex justify-end mb-8">
            <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full transition-all duration-300 ${isEnglish() ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-100'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('zh')}
                className={`px-3 py-1 rounded-full transition-all duration-300 ${isChinese() ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-100'}`}
              >
                中文
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-4 text-slate-900 font-[family-name:var(--font-playfair-display)] leading-tight tracking-[0.05em]">{t('home.title')}</h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-12">
              {t('home.subtitle')}
            </p>
          </motion.div>
        </header>

        {/* Call to Action Buttons - Moved above features */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-12"
          >
            {/* Usage Instructions Button */}
            <motion.button
              onClick={() => router.push('/examples')}
              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 text-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('home.usageInstructions')}
            </motion.button>
            
            {/* My Travel Books Button */}
            <motion.button
              onClick={() => router.push('/library')}
              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 text-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('home.myTravelBooks')}
            </motion.button>
            
            {/* Create New Book Button */}
            <motion.button
              onClick={handleCreateBook}
              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 text-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('home.createNewBook')}
            </motion.button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="mb-28">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-24 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('home.whyChoose')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <motion.div
                className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-slate-200/50"
                whileHover={{ y: -8 }}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl text-slate-600">🎨</span>
                </div>
                <h3 className="text-2xl font-semibold text-center mb-4 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('home.feature1.title')}</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  {t('home.feature1.description')}
                </p>
              </motion.div>
              
              {/* Feature 2 */}
              <motion.div
                className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-slate-200/50"
                whileHover={{ y: -8 }}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl text-slate-600">📍</span>
                </div>
                <h3 className="text-2xl font-semibold text-center mb-4 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('home.feature2.title')}</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  {t('home.feature2.description')}
                </p>
              </motion.div>
              
              {/* Feature 3 */}
              <motion.div
                className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-slate-200/50"
                whileHover={{ y: -8 }}
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl text-slate-600">📅</span>
                </div>
                <h3 className="text-2xl font-semibold text-center mb-4 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('home.feature3.title')}</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  {t('home.feature3.description')}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
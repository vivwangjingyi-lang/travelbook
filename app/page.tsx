'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTravelBookStore } from "@/stores/travelBookStore";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";
import {
  TiltCard,
  FeatureIcons,
  TravelIcons
} from "@/components/AnimatedElements";
import Background from "@/components/Background";

export default function Home() {
  const router = useRouter();
  const { loadBooks, initNewBook } = useTravelBookStore();
  const { language, setLanguage, isEnglish, isChinese } = useLanguageStore();
  const [currentPhrase, setCurrentPhrase] = useState(0);

  // 获取翻译文本的辅助函数
  const t = (key: string) => getTranslation(key, language);

  // 简化的轮播短语
  const phrases = language === 'en'
    ? ['Your Ideas', 'Your Logic', 'Your Journey']
    : ['你的想法', '你的逻辑', '你的旅程'];

  // 加载书籍列表
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // 短语轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [phrases.length]);

  // 创建新书逻辑优化：先初始化但不存入列表
  const handleCreateBook = () => {
    initNewBook();
    router.push('/introduction');
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* 背景组件 */}
      <Background />
      
      {/* 语言切换 - 固定右上角 */}
      <motion.div
        className="fixed top-6 right-8 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="glass rounded-full px-1.5 py-1.5 shadow-lg flex items-center">
          <motion.button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-full transition-all duration-300 text-xs font-medium ${isEnglish()
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-white/50'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            EN
          </motion.button>
          <motion.button
            onClick={() => setLanguage('zh')}
            className={`px-3 py-1.5 rounded-full transition-all duration-300 text-xs font-medium ${isChinese()
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
              : 'text-slate-600 hover:bg-white/50'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            中
          </motion.button>
        </div>
      </motion.div>

      {/* ========================================
          Hero 区域 - 简洁设计
          ======================================== */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 pb-20">
        <div className="max-w-4xl mx-auto text-center">

          {/* 主标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-7xl md:text-8xl lg:text-9xl font-bold mb-8 font-[family-name:var(--font-playfair-display)] leading-none tracking-tight"
          >
            <span className="gradient-text-animated">TravelBook</span>
          </motion.h1>

          {/* 品牌口号 - 更加突出 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/50">
              <span className="text-lg md:text-xl font-light tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                ALL NOT IN ONE BOX
              </span>
            </span>
          </motion.div>

          {/* 动态短语 - 简洁轮播 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-12 mb-12 flex items-center justify-center"
          >
            <div className="flex items-center gap-4 text-slate-500">
              {phrases.map((phrase, index) => (
                <motion.span
                  key={phrase}
                  className={`text-lg transition-all duration-500 ${index === currentPhrase
                    ? 'text-slate-800 font-medium scale-110'
                    : 'text-slate-400'
                    }`}
                  animate={{
                    opacity: index === currentPhrase ? 1 : 0.4,
                    scale: index === currentPhrase ? 1.1 : 1,
                  }}
                >
                  {index > 0 && <span className="mr-4 text-slate-300">·</span>}
                  {phrase}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* CTA 按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* 主按钮 */}
            <motion.button
              onClick={handleCreateBook}
              className="group relative px-10 py-4 rounded-full font-medium text-white overflow-hidden btn-glow"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-full" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>
              <span className="relative flex items-center gap-2">
                <span>✨</span>
                {t('home.createNewBook')}
              </span>
            </motion.button>

            {/* 次要按钮 */}
            <motion.button
              onClick={() => router.push('/library')}
              className="group px-8 py-4 rounded-full font-medium text-slate-700 glass hover:bg-white/80 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <TravelIcons.Luggage className="w-4 h-4" />
                {t('home.myTravelBooks')}
              </span>
            </motion.button>
          </motion.div>

          {/* 辅助链接 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-6"
          >
            <button
              onClick={() => router.push('/examples')}
              className="text-sm text-slate-400 hover:text-indigo-600 transition-colors duration-300 flex items-center gap-1 mx-auto"
            >
              <TravelIcons.Compass className="w-3.5 h-3.5" />
              {t('home.usageInstructions')}
              <span className="ml-1">→</span>
            </button>
          </motion.div>
        </div>

        {/* 滚动提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 1.2, duration: 0.6 },
            y: { delay: 1.2, duration: 1.5, repeat: Infinity }
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-slate-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ========================================
          功能特性区域 - 精简卡片设计
          ======================================== */}
      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          {/* 区域标题 - 更简洁 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 font-[family-name:var(--font-playfair-display)] mb-3">
              {t('home.whyChoose')}
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
          </motion.div>

          {/* 特性卡片 - 简洁设计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FeatureIcons.VisualPlanning className="w-10 h-10" />,
                title: t('home.feature1.title'),
                color: 'from-indigo-100 to-purple-100',
                accent: 'from-indigo-500 to-purple-500'
              },
              {
                icon: <FeatureIcons.POIManagement className="w-10 h-10" />,
                title: t('home.feature2.title'),
                color: 'from-pink-100 to-rose-100',
                accent: 'from-pink-500 to-rose-500'
              },
              {
                icon: <FeatureIcons.ItineraryPlanning className="w-10 h-10" />,
                title: t('home.feature3.title'),
                color: 'from-cyan-100 to-blue-100',
                accent: 'from-cyan-500 to-blue-500'
              }
            ].map((feature, index) => (
              <TiltCard key={index} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative h-full p-8 rounded-2xl glass hover:shadow-xl transition-all duration-500"
                >
                  {/* 顶部装饰条 */}
                  <div className={`absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full`} />

                  {/* 图标 */}
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-semibold text-center text-slate-800 font-[family-name:var(--font-playfair-display)]">
                    {feature.title}
                  </h3>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          页脚 - 极简
          ======================================== */}
      <footer className="pb-12 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm text-slate-400"
        >
          Made with ❤️ for travelers
        </motion.p>
      </footer>
    </div>
  );
}
'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";

export default function ExamplesPage() {
  const router = useRouter();
  const { language } = useLanguageStore();

  // 获取翻译文本的辅助函数
  const t = (key: string) => getTranslation(key, language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900 transition-colors duration-300 mr-4"
            >
              ← Back to Home
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-slate-900 font-[family-name:var(--font-playfair-display)]">{t('examples.title')}</h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {t('examples.subtitle')}
            </p>
          </motion.div>
        </header>

        {/* Getting Started Section */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200"
          >
            <h2 className="text-3xl font-semibold mb-8 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.gettingStarted')}</h2>

            <div className="space-y-12">
              {/* Step 1: Creating Your First Travel Book */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-indigo-700">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.step1.title')}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {t('examples.step1.description')}
                  </p>
                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <p className="text-sm text-indigo-700">
                      {t('examples.step1.tip')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Adding POIs */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-indigo-700">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.step2.title')}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {t('examples.step2.description')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-sm text-slate-700 mb-2">{t('examples.step2.categories')}</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• {t('category.accommodation')}</li>
                        <li>• {t('category.sightseeing')}</li>
                        <li>• {t('category.food')}</li>
                        <li>• {t('category.entertainment')}</li>
                        <li>• {t('category.shopping')}</li>
                        <li>• {t('category.transportation')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Using the Canvas */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-indigo-700">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.step3.title')}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {t('examples.step3.description')}
                  </p>
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-sm text-yellow-700">
                      {t('examples.step3.tip')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4: Daily Itineraries */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-indigo-700">4</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.step4.title')}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {t('examples.step4.description')}
                  </p>
                </div>
              </div>

              {/* Step 5: Adding Memos */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-indigo-700">5</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.step5.title')}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {t('examples.step5.description')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Overview Section */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-semibold mb-10 text-center text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.featuresOverview')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-indigo-700 font-bold">📝</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.featureOverview1.title')}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {t('examples.featureOverview1.description')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-indigo-700 font-bold">📍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.featureOverview2.title')}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {t('examples.featureOverview2.description')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-indigo-700 font-bold">🎨</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.featureOverview3.title')}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {t('examples.featureOverview3.description')}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-indigo-700 font-bold">📅</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.featureOverview4.title')}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {t('examples.featureOverview4.description')}
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-indigo-700 font-bold">💡</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.featureOverview5.title')}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {t('examples.featureOverview5.description')}
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-indigo-700 font-bold">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.featureOverview6.title')}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {t('examples.featureOverview6.description')}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Tips & Tricks Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200"
          >
            <h2 className="text-3xl font-semibold mb-8 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('examples.tips')}</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-yellow-100 rounded-full p-2 mr-4 mt-1">
                  <span className="text-yellow-700">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('examples.tip1.title')}</h3>
                  <p className="text-slate-600">{t('examples.tip1.description')}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-yellow-100 rounded-full p-2 mr-4 mt-1">
                  <span className="text-yellow-700">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('examples.tip2.title')}</h3>
                  <p className="text-slate-600">{t('examples.tip2.description')}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-yellow-100 rounded-full p-2 mr-4 mt-1">
                  <span className="text-yellow-700">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('examples.tip3.title')}</h3>
                  <p className="text-slate-600">{t('examples.tip3.description')}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-yellow-100 rounded-full p-2 mr-4 mt-1">
                  <span className="text-yellow-700">💡</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('examples.tip4.title')}</h3>
                  <p className="text-slate-600">{t('examples.tip4.description')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

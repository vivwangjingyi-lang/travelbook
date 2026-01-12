'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTravelBookStore } from "@/stores/travelBookStore";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslation } from "@/utils/i18n";
import { useToast } from "@/components/Toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import FloatingNavbar from "@/components/FloatingNavbar";

interface FormData {
  title: string;
  destination: string;
  companions: string;
  description: string;
  coverImage: string | null;
  startDate: string;
  endDate: string;
}

export default function Introduction() {
  const router = useRouter();
  const { currentBook, updateBook, isDirty, saveBook, resetBook } = useTravelBookStore();
  const { language } = useLanguageStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    title: currentBook?.title || "",
    destination: currentBook?.destination || "",
    companions: currentBook?.companions || "",
    description: currentBook?.description || "",
    coverImage: currentBook?.coverImage || null,
    startDate: currentBook?.startDate || "",
    endDate: currentBook?.endDate || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isBookSaved, setIsBookSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 翻译辅助函数
  const t = useCallback((key: string) => getTranslation(key, language), [language]);

  // 浏览器离开前警告（F5刷新、关闭标签页等）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = t('warning.unsavedChanges');
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, t]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // 实时验证表单有效性
  useEffect(() => {
    const isValid = !!(formData.title.trim() && formData.destination.trim() && formData.startDate);
    setIsFormValid(isValid);
  }, [formData.title, formData.destination, formData.startDate]);

  // 初始化时检查书籍是否已保存
  useEffect(() => {
    if (currentBook?.title && currentBook?.destination && currentBook?.startDate) {
      setIsBookSaved(true);
    }
  }, [currentBook]);

  // Handle cover image upload with compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };

      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions for cover image
        const maxWidth = 800;
        const maxHeight = 800;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image with new dimensions
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with quality compression
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);

          // Update form data with compressed image
          setFormData(prev => ({ ...prev, coverImage: compressedImage }));
        }
      };

      // Read the file
      reader.readAsDataURL(file);
    }
  };

  // Validate form for submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t('error.titleRequired');
    }

    if (!formData.destination.trim()) {
      newErrors.destination = t('error.destinationRequired');
    }

    if (!formData.startDate) {
      newErrors.startDate = t('error.startDateRequired');
    }

    // Validate end date only if it's provided
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = t('error.endDateInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save book
  const handleSaveBook = async () => {
    if (!isFormValid || !currentBook) return;

    setIsSaving(true);

    try {
      // Update the current book with form data
      updateBook({
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        destination: formData.destination,
        companions: formData.companions,
        ...(formData.coverImage && { coverImage: formData.coverImage })
      });

      // Save the book to storage
      saveBook();
      setIsBookSaved(true);

      // 显示成功提示
      showToast(t('feedback.saveSuccess'), 'success');
    } catch (error) {
      showToast(t('feedback.saveFailed'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save and continue (一键操作)
  const handleSaveAndContinue = async () => {
    if (!validateForm() || !currentBook) return;

    setIsSaving(true);

    try {
      // Update the current book with form data
      updateBook({
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        destination: formData.destination,
        companions: formData.companions,
        ...(formData.coverImage && { coverImage: formData.coverImage })
      });

      // Save the book to storage
      saveBook();

      // 显示成功提示并导航
      showToast(t('feedback.saveAndContinue'), 'success');

      // 短暂延迟后跳转，让用户看到提示
      setTimeout(() => {
        router.push('/departure');
      }, 500);
    } catch (error) {
      showToast(t('feedback.saveFailed'), 'error');
      setIsSaving(false);
    }
  };

  // Handle form submission (继续按钮，要求先保存)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm() && currentBook && isBookSaved) {
      // Update the current book with form data
      updateBook({
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        destination: formData.destination,
        companions: formData.companions,
        ...(formData.coverImage && { coverImage: formData.coverImage })
      });

      // Navigate to Chapter 1 (Transportation)
      router.push('/departure');
    }
  };

  // Handle back to library - 改进的逻辑
  const handleBackToLibrary = () => {
    if (isDirty) {
      // 如果有未保存的更改，显示确认 Modal
      // 不再强制要求填写必填字段，而是让用户选择
      setShowModal(true);
    } else {
      router.push('/');
    }
  };

  // Save and exit
  const handleSaveAndExit = () => {
    // 检查必填字段是否完整
    if (!isFormValid) {
      setShowModal(false);
      setShowRequiredFieldsModal(true);
      return;
    }

    // 更新并保存
    updateBook({
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      destination: formData.destination,
      companions: formData.companions,
      ...(formData.coverImage && { coverImage: formData.coverImage })
    });

    saveBook();
    showToast(t('feedback.saveSuccess'), 'success');

    setTimeout(() => {
      router.push('/');
    }, 300);
  };

  // Discard changes and exit
  const handleDiscardChanges = () => {
    resetBook();
    setShowModal(false);
    setShowRequiredFieldsModal(false);
    router.push('/');
  };

  // Cancel navigation
  const handleCancel = () => {
    setShowModal(false);
    setShowRequiredFieldsModal(false);
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={0} />

      <div className="max-w-4xl mx-auto pt-24">
        {/* Header */}
        <motion.header
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-2 text-slate-800 font-[family-name:var(--font-playfair-display)]">{t('introduction.title')}</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            {t('introduction.subtitle')}
          </p>
        </motion.header>

        {/* Form */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Journey Name */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                {t('introduction.journeyName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.title ? 'border-red-500' : 'border-slate-200'} bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all`}
                placeholder="e.g., 'Summer Adventure in Italy'"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Destination */}
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-slate-700 mb-2">
                {t('introduction.destination')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.destination ? 'border-red-500' : 'border-slate-200'} bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all`}
                placeholder="e.g., 'Rome, Italy'"
              />
              {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination}</p>}
            </div>

            {/* Travel Companions */}
            <div>
              <label htmlFor="companions" className="block text-sm font-medium text-slate-700 mb-2">
                {t('introduction.companions')}
              </label>
              <input
                type="text"
                id="companions"
                name="companions"
                value={formData.companions}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                placeholder="e.g., 'Family, Friends, Solo'"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                {t('introduction.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                placeholder="What are you looking forward to most on this journey?"
              ></textarea>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('introduction.coverImage')}
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="coverImage"
                />
                <label htmlFor="coverImage" className="cursor-pointer">
                  {formData.coverImage ? (
                    <div className="relative">
                      <img
                        src={formData.coverImage}
                        alt="Journey Cover"
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium">{t('introduction.changeImage')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">🖼️</span>
                      <span className="text-slate-600">{t('introduction.uploadImage')}</span>
                      <span className="text-xs text-slate-500 mt-1">PNG, JPG, or GIF (Max 5MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('introduction.startDate')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.startDate ? 'border-red-500' : 'border-slate-200'} bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('introduction.endDate')}
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.endDate ? 'border-red-500' : 'border-slate-200'} bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>

            {/* Navigation Buttons - 改进的按钮布局 */}
            <div className="flex flex-wrap justify-between pt-8 gap-4">
              <button
                type="button"
                onClick={handleBackToLibrary}
                className="px-6 py-2.5 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-300 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                {t('introduction.backToLibrary')}
              </button>

              <div className="flex gap-3">
                {/* 保存按钮 */}
                <button
                  type="button"
                  onClick={handleSaveBook}
                  disabled={!isFormValid || isSaving}
                  className={`px-6 py-2.5 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 ${isFormValid && !isSaving
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  title={!isFormValid ? t('error.requiredFieldsMessage') : ''}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{t('button.save')}...</span>
                    </>
                  ) : isBookSaved ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t('introduction.saveBook')}</span>
                    </>
                  ) : (
                    <span>{t('introduction.saveBook')}</span>
                  )}
                </button>

                {/* 保存并继续按钮（一键操作） */}
                <button
                  type="button"
                  onClick={handleSaveAndContinue}
                  disabled={!isFormValid || isSaving}
                  className={`px-6 py-2.5 rounded-full shadow-lg transition-all duration-300 ${isFormValid && !isSaving
                      ? 'bg-slate-800 text-white hover:bg-slate-700 hover:shadow-xl'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  title={!isFormValid ? t('error.requiredFieldsMessage') : ''}
                >
                  {t('introduction.continueToChapter1')} →
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* 未保存更改确认 Modal */}
        <ConfirmationModal
          isOpen={showModal}
          onClose={handleCancel}
          onConfirm={handleSaveAndExit}
          title={t('introduction.unsavedChanges')}
          message={t('introduction.unsavedMessage')}
          confirmText={t('introduction.saveAndExit')}
          cancelText={t('button.cancel')}
        >
          {/* 放弃更改按钮 */}
          <button
            onClick={handleDiscardChanges}
            className="absolute bottom-6 left-6 px-4 py-2 bg-gray-200/80 backdrop-blur-sm text-slate-700 rounded-full shadow-lg hover:bg-gray-300/80 transition-all duration-300 text-sm"
          >
            {t('introduction.discardChanges')}
          </button>
        </ConfirmationModal>

        {/* 必填字段缺失 Modal */}
        <ConfirmationModal
          isOpen={showRequiredFieldsModal}
          onClose={handleCancel}
          onConfirm={handleCancel}
          title={t('error.requiredFieldsTitle')}
          message={t('error.discardOrFill')}
          confirmText={t('button.back')}
          cancelText={t('introduction.discardChanges')}
        >
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 whitespace-pre-line">
              {t('error.requiredFieldsMessage')}
            </p>
          </div>
          <button
            onClick={handleDiscardChanges}
            className="absolute bottom-6 left-6 px-4 py-2 bg-red-100/80 backdrop-blur-sm text-red-700 rounded-full shadow-lg hover:bg-red-200/80 transition-all duration-300 text-sm"
          >
            {t('introduction.discardChanges')}
          </button>
        </ConfirmationModal>
      </div>
    </div>
  );
}
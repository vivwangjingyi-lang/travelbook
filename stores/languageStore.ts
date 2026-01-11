import { create } from 'zustand';

type Language = 'en' | 'zh';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  isEnglish: () => boolean;
  isChinese: () => boolean;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'en', // 默认语言为英文
  setLanguage: (lang: Language) => set({ language: lang }),
  isEnglish: () => get().language === 'en',
  isChinese: () => get().language === 'zh',
}));

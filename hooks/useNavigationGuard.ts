'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTravelBookStore } from "@/stores/travelBookStore";

export interface NavigationGuardOptions {
  onNavigate: () => void;
  onSaveAndExit: () => void;
  onDiscardChanges: () => void;
  onCancel: () => void;
}

export const useNavigationGuard = (options: NavigationGuardOptions) => {
  const router = useRouter();
  const { isDirty, saveBook, resetBook } = useTravelBookStore();

  // 处理页面关闭或刷新
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = ''; // 这会触发浏览器的确认对话框
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // 保存并退出
  const handleSaveAndExit = () => {
    saveBook();
    options.onSaveAndExit();
  };

  // 放弃更改并退出
  const handleDiscardChanges = () => {
    resetBook();
    options.onDiscardChanges();
  };

  // 返回图书馆
  const handleBackToLibrary = () => {
    if (isDirty) {
      // 显示导航确认模态框的逻辑应该在调用组件中实现
      // 这里我们只提供回调函数，由组件来处理UI
      options.onNavigate();
    } else {
      // 没有未保存的更改，直接导航
      options.onSaveAndExit();
    }
  };

  return {
    isDirty,
    handleSaveAndExit,
    handleDiscardChanges,
    handleBackToLibrary,
    handleCancel: options.onCancel
  };
};
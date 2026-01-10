'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTravelBookStore } from "@/stores/travelBookStore";
import ConfirmationModal from "./ConfirmationModal";

export default function NavigationGuard() {
  const router = useRouter();
  const { isDirty, saveBook, resetBook } = useTravelBookStore();
  const [showModal, setShowModal] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  // 处理导航
  const handleNavigate = (path: string) => {
    if (isDirty) {
      setTargetPath(path);
      setShowModal(true);
    } else {
      router.push(path);
    }
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

  return {
    handleNavigate,
    handleBackToLibrary,
    showModal,
    handleSaveAndExit,
    handleDiscardChanges,
    handleCancel
  };
}
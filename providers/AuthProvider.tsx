'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { initializeAutoSave } from '@/utils/autoSave';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { initialize } = useAuthStore();

    useEffect(() => {
        initialize();
        // 启动自动保存监听
        const unsub = initializeAutoSave();
        return () => unsub(); // 清理订阅
    }, [initialize]);

    return <>{children}</>;
}

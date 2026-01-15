import { useTravelBookStore } from '@/stores/travelBookStore';

export const initializeAutoSave = () => {
    let timeoutId: NodeJS.Timeout;
    let prevIsDirty = false;
    console.log('🔧 AutoSave: Initializing...');

    // 订阅 store 变化
    const unsub = useTravelBookStore.subscribe((state: any) => {
        const { isDirty, currentBook } = state;

        // 核心逻辑：当 isDirty 变为 true 时，安排一次保存
        if (isDirty && currentBook) {
            // 清除之前的定时器，重新计时（防抖）
            clearTimeout(timeoutId);

            console.log('⏳ AutoSave: Scheduling save for:', currentBook.title);

            timeoutId = setTimeout(() => {
                const currentState = useTravelBookStore.getState();
                if (currentState.isDirty && currentState.currentBook) {
                    console.log('💾 AutoSave: Saving book:', currentState.currentBook.title);
                    currentState.saveBook();
                }
            }, 3000);
        }

        prevIsDirty = isDirty;
    });

    console.log('✅ AutoSave: Initialized');
    return unsub;
};

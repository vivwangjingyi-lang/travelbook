import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    profile: any | null;
    isLoading: boolean;
    initialized: boolean;

    setUser: (user: User | null) => void;
    setProfile: (profile: any | null) => void;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    isLoading: true,
    initialized: false,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    },

    initialize: async () => {
        try {
            console.log('AuthStore: Initializing...');
            // 获取当前会话
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) console.error('AuthStore: Error getting session:', sessionError);

            const user = session?.user ?? null;
            console.log('AuthStore: Session user:', user?.id);

            if (user) {
                // 获取用户资料
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('AuthStore: Error fetching profile:', profileError);
                    // 如果获取 Profile 失败但 User 存在，仍然视为已登录
                }

                set({ user, profile, isLoading: false, initialized: true });
            } else {
                set({ user: null, profile: null, isLoading: false, initialized: true });
            }

            // 监听会话变更
            supabase.auth.onAuthStateChange(async (_event, session) => {
                const currentUser = session?.user ?? null;
                set({ user: currentUser });

                if (currentUser) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentUser.id)
                        .single();
                    set({ profile });
                } else {
                    set({ profile: null });
                }
            });
        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ isLoading: false, initialized: true });
        }
    },
}));

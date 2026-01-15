'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { getTranslation } from '@/utils/i18n';
import Background from '@/components/Background';
import { TravelIcons } from '@/components/AnimatedElements';

export default function LoginPage() {
    const router = useRouter();
    const { language } = useLanguageStore();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const t = (key: string, params?: Record<string, string>) => {
        let text = getTranslation(key, language);
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
            });
        }
        return text;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (loginError) throw loginError;
                router.push('/');
            } else {
                const { data, error: signupError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username,
                        },
                    },
                });
                if (signupError) throw signupError;

                // 如果注册成功且有用户 ID，创建 profile
                if (data.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            { id: data.user.id, username: username || email.split('@')[0] }
                        ]);
                    if (profileError) console.error('Error creating profile:', profileError);
                }

                setError(language === 'zh' ? '注册成功！请检查邮箱确认。' : 'Sign up successful! Please check your email for confirmation.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative px-4 overflow-hidden">
            <Background />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass p-8 rounded-3xl shadow-2xl border border-white/30 backdrop-blur-xl relative overflow-hidden">
                    {/* 装饰性光晕 */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

                    <div className="text-center mb-8 relative">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <TravelIcons.Passport className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 font-[family-name:var(--font-playfair-display)]">
                            {isLogin ? t('auth.login') : t('auth.signup')}
                        </h1>
                        <p className="text-slate-500 text-sm mt-2">
                            {isLogin ? 'Welcome back to your TravelBook' : 'Start your journey with us today'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-medium text-slate-600 block pl-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
                                        placeholder="Enter your name"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600 block pl-1">{t('auth.email')}</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600 block pl-1">{t('auth.password')}</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 border border-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-100"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                isLogin ? t('auth.login') : t('auth.signup')
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/30 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-300"
                        >
                            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                            <span className="ml-1 font-bold">{isLogin ? t('auth.signup') : t('auth.login')}</span>
                        </button>
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={() => router.push('/')}
                            className="text-xs text-slate-400 hover:text-slate-600 block mx-auto underline"
                        >
                            {t('nav.backToHome')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

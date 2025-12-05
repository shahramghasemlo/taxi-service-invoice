import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!supabase) {
                throw new Error('خطا در اتصال به سرور (Supabase Client initialized as null)');
            }

            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onLoginSuccess();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('ثبت‌نام با موفقیت انجام شد! لطفاً ایمیل خود را برای تأیید چک کنید.');
                setIsLogin(true);
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'خطایی رخ داده است.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4" dir="rtl">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">تاکسی سرویس هوشمند</h1>
                    <p className="text-yellow-100">لطفاً برای ادامه وارد شوید</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleAuth} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                ایمیل
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                رمز عبور
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : isLogin ? (
                                <>
                                    <LogIn size={20} />
                                    ورود به حساب
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    ثبت‌نام
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                        >
                            {isLogin
                                ? 'حساب کاربری ندارید؟ ثبت‌نام کنید'
                                : 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

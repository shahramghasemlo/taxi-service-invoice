import React, { useState, useEffect } from 'react';
import {
  Car,
  BookOpen,
  X,
  Wallet,
  FileText,
  LogOut,
  CheckCircle
} from 'lucide-react';
import { InvoiceDashboard } from './components/invoice/InvoiceDashboard';
import { AccountingDashboard } from './components/accounting/AccountingDashboard';
import { downloadBackup } from './services/backupService';

import { supabase } from './services/supabaseClient';
import { LoginPage } from './components/auth/LoginPage';

type Module = 'invoice' | 'accounting';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentModule, setCurrentModule] = useState<Module>('invoice');
  const [showHelp, setShowHelp] = useState(false);
  const [isExited, setIsExited] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4" dir="rtl">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-4 border-red-500">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطا در تنظیمات</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            اطلاعات اتصال به Supabase یافت نشد.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-left text-sm font-mono mb-6 overflow-x-auto">
            <p className="text-gray-500 mb-2">Please create .env.local file:</p>
            <code className="block text-blue-600 dark:text-blue-400">VITE_SUPABASE_URL=...</code>
            <code className="block text-blue-600 dark:text-blue-400">VITE_SUPABASE_ANON_KEY=...</code>
          </div>
          <p className="text-sm text-gray-500">
            لطفاً طبق راهنما، فایل .env.local را ایجاد کنید.
          </p>
        </div>
      </div>
    );
  }

  const handleExit = async () => {
    if (confirm('آیا می‌خواهید از حساب کاربری خود خارج شوید؟')) {
      await supabase?.auth.signOut();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onLoginSuccess={() => { }} />;
  }

  if (isExited) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white p-4" dir="rtl">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold">خداحافظ! 👋</h1>
          <p className="text-gray-300 text-lg">
            با موفقیت خارج شدید.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 text-blue-400 hover:text-blue-300 underline"
          >
            بازگشت به صفحه ورود
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-200" dir="rtl">
      {/* Navbar - Hidden on print */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 no-print transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 text-gray-900 p-2 rounded-lg">
                <Car size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">تاکسی سرویس هوشمند</span>
            </div>

            {/* Main Module Navigation */}
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mx-2 sm:mx-4">
              <button
                onClick={() => setCurrentModule('invoice')}
                className={`flex items-center gap-2 px-3 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${currentModule === 'invoice'
                  ? 'bg-white dark:bg-gray-600 text-yellow-600 dark:text-yellow-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                <FileText size={18} />
                <span className="hidden sm:inline">صدور فاکتور</span>
              </button>
              <button
                onClick={() => setCurrentModule('accounting')}
                className={`flex items-center gap-2 px-3 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${currentModule === 'accounting'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                <Wallet size={18} />
                <span className="hidden sm:inline">حسابداری</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Help Button */}
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="راهنما"
              >
                <BookOpen size={20} />
              </button>

              {/* Exit Button */}
              <button
                onClick={handleExit}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {currentModule === 'invoice' ? <InvoiceDashboard /> : <AccountingDashboard />}
      </main>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 no-print" onClick={() => setShowHelp(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen size={32} />
                <h2 className="text-2xl font-bold">راهنمای استفاده</h2>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <h2>👋 خوش آمدید</h2>
                <p>این نرم‌افزار دارای دو بخش اصلی است:</p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <h3 className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 mt-0">
                      <FileText size={20} />
                      بخش فاکتور
                    </h3>
                    <ul className="mb-0 text-sm">
                      <li>صدور فاکتور حرفه‌ای</li>
                      <li>مدیریت مشتریان</li>
                      <li>تنظیمات شرکت</li>
                      <li>تولید هوشمند با AI</li>
                    </ul>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <h3 className="flex items-center gap-2 text-indigo-800 dark:text-indigo-400 mt-0">
                      <Wallet size={20} />
                      بخش حسابداری
                    </h3>
                    <ul className="mb-0 text-sm">
                      <li>ثبت هزینه‌های خودرو</li>
                      <li>مدیریت سرفصل‌ها</li>
                      <li>گزارش‌گیری و نمودار</li>
                      <li>تاریخچه مخارج</li>
                    </ul>
                  </div>
                </div>

                <h3>💾 ذخیره و خروج</h3>
                <p>با کلیک روی دکمه <strong>خروج</strong> در نوار بالا، تمام اطلاعات شما در یک فایل ذخیره شده و دانلود می‌شود. این فایل نسخه پشتیبان شماست.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
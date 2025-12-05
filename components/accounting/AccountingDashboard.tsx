import React, { useState, useEffect } from 'react';
import { CategoryManager } from './CategoryManager';
import { ExpenseEntry } from './ExpenseEntry';
import { ExpenseHistory } from './ExpenseHistory';
import { ExpenseReports } from './ExpenseReports';
import { getExpenses, getCategories } from '../../services/storageService';
import { Expense, ExpenseCategory } from '../../types';
import {
    LayoutDashboard,
    PlusCircle,
    History,
    Tags,
    Wallet,
    TrendingUp,
    PieChart,
    BarChart3
} from 'lucide-react';

type Tab = 'dashboard' | 'add' | 'history' | 'categories' | 'reports';

export const AccountingDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);

    useEffect(() => {
        loadData();
    }, [activeTab]); // Reload data when tab changes

    const loadData = async () => {
        const [expensesData, categoriesData] = await Promise.all([
            getExpenses(),
            getCategories()
        ]);
        setExpenses(expensesData);
        setCategories(categoriesData);
    };

    const calculateCategoryTotals = () => {
        const totals: { [key: string]: number } = {};
        expenses.forEach(exp => {
            totals[exp.categoryId] = (totals[exp.categoryId] || 0) + exp.amount;
        });
        return totals;
    };

    const renderDashboard = () => {
        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        const categoryTotals = calculateCategoryTotals();
        const sortedCategories = categories
            .map(cat => ({ ...cat, total: categoryTotals[cat.id] || 0 }))
            .filter(cat => cat.total > 0)
            .sort((a, b) => b.total - a.total);

        return (
            <div className="space-y-6 animate-fade-in">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-indigo-100 font-medium">مجموع کل هزینه‌ها</p>
                                <h3 className="text-3xl font-bold mt-1">
                                    {new Intl.NumberFormat('fa-IR').format(totalAmount)}
                                    <span className="text-sm font-normal opacity-80 mr-1">ریال</span>
                                </h3>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Wallet size={24} />
                            </div>
                        </div>
                        <div className="text-xs text-indigo-100 bg-white/10 inline-block px-2 py-1 rounded">
                            {expenses.length} تراکنش ثبت شده
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                            <TrendingUp size={20} />
                            <span className="font-medium">پرهزینه‌ترین سرفصل</span>
                        </div>
                        {sortedCategories.length > 0 ? (
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{sortedCategories[0].title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    {new Intl.NumberFormat('fa-IR').format(sortedCategories[0].total)} ریال
                                </p>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: '100%', backgroundColor: sortedCategories[0].color }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 mt-2">هنوز هزینه‌ای ثبت نشده است</p>
                        )}
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Category Breakdown */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                            <PieChart size={20} className="text-gray-500" />
                            تفکیک هزینه‌ها
                        </h3>

                        {sortedCategories.length > 0 ? (
                            <div className="space-y-4">
                                {sortedCategories.map(cat => {
                                    const percentage = Math.round((cat.total / totalAmount) * 100);
                                    return (
                                        <div key={cat.id}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{cat.title}</span>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {percentage}% ({new Intl.NumberFormat('fa-IR').format(cat.total)})
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p>داده‌ای برای نمایش وجود ندارد</p>
                                <button
                                    onClick={() => setActiveTab('add')}
                                    className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                >
                                    اولین هزینه را ثبت کنید
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'categories':
                return <CategoryManager />;
            case 'dashboard':
                return renderDashboard();
            case 'add':
                return <ExpenseEntry onSave={() => setActiveTab('history')} />;
            case 'history':
                return <ExpenseHistory />;
            case 'reports':
                return <ExpenseReports />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Wallet size={32} />
                    <h1 className="text-3xl font-bold">حسابداری هزینه خودرو</h1>
                </div>
                <p className="text-indigo-100">مدیریت مخارج، تعمیرات و هزینه‌های جاری خودرو</p>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-5 gap-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${activeTab === 'dashboard'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <LayoutDashboard size={18} />
                        <span className="hidden sm:inline">داشبورد</span>
                        <span className="sm:hidden text-[10px]">داشبورد</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${activeTab === 'add'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <PlusCircle size={18} />
                        <span className="hidden sm:inline">ثبت هزینه</span>
                        <span className="sm:hidden text-[10px]">ثبت</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${activeTab === 'history'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <History size={18} />
                        <span className="hidden sm:inline">تاریخچه</span>
                        <span className="sm:hidden text-[10px]">تاریخچه</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${activeTab === 'categories'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <Tags size={18} />
                        <span className="hidden sm:inline">سرفصل‌ها</span>
                        <span className="sm:hidden text-[10px]">سرفصل</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 p-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-sm ${activeTab === 'reports'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <BarChart3 size={18} />
                        <span className="hidden sm:inline">گزارشات</span>
                        <span className="sm:hidden text-[10px]">گزارش</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {renderContent()}
            </div>
        </div>
    );
};

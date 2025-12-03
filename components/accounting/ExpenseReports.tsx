import React, { useState, useMemo, useEffect } from 'react';
import { Expense, ExpenseCategory } from '../../types';
import { getExpenses, getCategories } from '../../services/storageService';
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    PieChart,
    BarChart3,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Filter
} from 'lucide-react';

type DateRange = 'thisMonth' | 'lastMonth' | 'thisYear' | 'all';

export const ExpenseReports: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>('thisMonth');

    useEffect(() => {
        setExpenses(getExpenses());
        setCategories(getCategories());
    }, []);

    const filterExpensesByDate = (expenses: Expense[], range: DateRange) => {
        const now = new Date();
        // Convert Persian date string to JS Date is tricky without a library, 
        // but for this app we can rely on the fact that dates are stored as YYYY/MM/DD
        // We will do a simple string comparison for now or basic parsing if needed.
        // Ideally we should store ISO dates, but let's work with what we have.

        // Helper to parse "1403/09/12" to comparable values
        const parseDate = (dateStr: string) => {
            const parts = dateStr.split('/');
            return {
                year: parseInt(parts[0]),
                month: parseInt(parts[1]),
                day: parseInt(parts[2])
            };
        };

        // Get current Persian date components (approximate for now or use a library if available)
        // Since we don't have a persian date library installed, we'll do a best effort 
        // based on the stored string format which seems to be Persian.
        // For "This Month", we match the year and month of the current date (converted to Persian).
        // To make this robust without a library, let's assume the user enters dates correctly.

        // Let's get the current Persian date from the system if possible, or use the latest expense date as "Today" for demo purposes?
        // No, let's use the Intl API as seen in types.ts
        const todayPersian = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
        // todayPersian is like "۱۴۰۳/۰۹/۱۲" (with Persian digits) or "1403/09/12" (with Latin digits depending on locale).
        // The app seems to use Latin digits in storage based on types.ts example.

        // Let's normalize to Latin digits for comparison
        const toLatinDigits = (s: string) => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
        const currentDate = toLatinDigits(todayPersian);
        const [curYear, curMonth] = currentDate.split('/').map(Number);

        return expenses.filter(exp => {
            const expDate = toLatinDigits(exp.date);
            const [expYear, expMonth] = expDate.split('/').map(Number);

            switch (range) {
                case 'thisMonth':
                    return expYear === curYear && expMonth === curMonth;
                case 'lastMonth':
                    let lastM = curMonth - 1;
                    let lastY = curYear;
                    if (lastM === 0) { lastM = 12; lastY--; }
                    return expYear === lastY && expMonth === lastM;
                case 'thisYear':
                    return expYear === curYear;
                case 'all':
                    return true;
                default:
                    return true;
            }
        });
    };

    const filteredExpenses = useMemo(() => filterExpensesByDate(expenses, dateRange), [expenses, dateRange]);

    const stats = useMemo(() => {
        const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        const count = filteredExpenses.length;
        const average = count > 0 ? total / count : 0;

        // Category breakdown
        const categoryTotals: Record<string, number> = {};
        filteredExpenses.forEach(e => {
            categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] || 0) + e.amount;
        });

        const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        const topCategory = topCategoryEntry
            ? categories.find(c => c.id === topCategoryEntry[0])
            : null;

        return { total, count, average, topCategory, topCategoryAmount: topCategoryEntry?.[1] || 0 };
    }, [filteredExpenses, categories]);

    const categoryBreakdown = useMemo(() => {
        const totals: Record<string, { amount: number, count: number }> = {};
        filteredExpenses.forEach(e => {
            if (!totals[e.categoryId]) totals[e.categoryId] = { amount: 0, count: 0 };
            totals[e.categoryId].amount += e.amount;
            totals[e.categoryId].count += 1;
        });

        return categories
            .map(cat => ({
                ...cat,
                amount: totals[cat.id]?.amount || 0,
                count: totals[cat.id]?.count || 0,
                percentage: stats.total > 0 ? ((totals[cat.id]?.amount || 0) / stats.total) * 100 : 0
            }))
            .filter(c => c.amount > 0)
            .sort((a, b) => b.amount - a.amount);
    }, [filteredExpenses, categories, stats.total]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <BarChart3 className="text-indigo-500" />
                    <h2 className="font-bold text-lg">گزارش هزینه‌ها</h2>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    {[
                        { id: 'thisMonth', label: 'این ماه' },
                        { id: 'lastMonth', label: 'ماه قبل' },
                        { id: 'thisYear', label: 'امسال' },
                        { id: 'all', label: 'کل دوره' },
                    ].map(range => (
                        <button
                            key={range.id}
                            onClick={() => setDateRange(range.id as DateRange)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${dateRange === range.id
                                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Expense */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DollarSign size={100} />
                    </div>
                    <p className="text-indigo-100 font-medium mb-1">مجموع هزینه</p>
                    <h3 className="text-3xl font-bold">
                        {formatCurrency(stats.total)}
                        <span className="text-sm font-normal opacity-80 mr-1">ریال</span>
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
                        <Filter size={14} />
                        <span>{filteredExpenses.length} تراکنش</span>
                    </div>
                </div>

                {/* Average */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">میانگین هر تراکنش</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                                {formatCurrency(Math.round(stats.average))}
                                <span className="text-xs text-gray-400 mr-1">ریال</span>
                            </h3>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>

                {/* Top Category */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">بیشترین هزینه</p>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white truncate max-w-[150px]">
                                {stats.topCategory?.title || '---'}
                            </h3>
                            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                                {formatCurrency(stats.topCategoryAmount)} <span className="text-xs">ریال</span>
                            </p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                            <PieChart size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts & Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-gray-500" />
                        تفکیک هزینه‌ها بر اساس سرفصل
                    </h3>

                    <div className="space-y-5">
                        {categoryBreakdown.map(cat => (
                            <div key={cat.id}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                        {cat.title}
                                    </span>
                                    <div className="text-right">
                                        <span className="block font-bold text-gray-900 dark:text-white">{formatCurrency(cat.amount)}</span>
                                        <span className="text-xs text-gray-500">{Math.round(cat.percentage)}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                                    />
                                </div>
                            </div>
                        ))}

                        {categoryBreakdown.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                داده‌ای برای نمایش وجود ندارد
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-gray-500" />
                        جزئیات آماری
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">سرفصل</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">تعداد</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">مبلغ کل (ریال)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {categoryBreakdown.map(cat => (
                                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                                {cat.title}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{cat.count}</td>
                                        <td className="px-4 py-3 text-left font-mono text-gray-800 dark:text-gray-200">{formatCurrency(cat.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {categoryBreakdown.length > 0 && (
                                <tfoot className="border-t border-gray-200 dark:border-gray-600">
                                    <tr>
                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">مجموع کل</td>
                                        <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">{stats.count}</td>
                                        <td className="px-4 py-3 text-left font-bold text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(stats.total)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            {/* Detailed Transaction List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <Calendar size={20} className="text-gray-500" />
                    ریز تراکنش‌ها
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">تاریخ</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">سرفصل</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">توضیحات</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">مبلغ (ریال)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredExpenses.map(expense => {
                                const category = categories.find(c => c.id === expense.categoryId);
                                return (
                                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{expense.date}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs text-white"
                                                style={{ backgroundColor: category?.color || '#9ca3af' }}
                                            >
                                                {category?.title || 'نامشخص'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{expense.description}</td>
                                        <td className="px-4 py-3 text-left font-mono text-gray-800 dark:text-gray-200">{formatCurrency(expense.amount)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredExpenses.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            هیچ تراکنشی در این بازه زمانی یافت نشد
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

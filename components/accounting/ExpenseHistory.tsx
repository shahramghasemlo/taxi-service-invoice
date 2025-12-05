import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory } from '../../types';
import { getExpenses, getCategories, deleteExpense } from '../../services/storageService';
import { Trash2, Calendar, Tag, Search, Filter } from 'lucide-react';

export const ExpenseHistory: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [expensesData, categoriesData] = await Promise.all([
            getExpenses(),
            getCategories()
        ]);
        setExpenses(expensesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setCategories(categoriesData);
    };

    const handleDelete = async (id: string) => {
        if (confirm('آیا از حذف این هزینه مطمئن هستید؟')) {
            try {
                await deleteExpense(id);
                loadData();
            } catch (error) {
                alert('خطا در حذف هزینه');
            }
        }
    };

    const getCategoryDetails = (id: string) => {
        return categories.find(c => c.id === id) || { title: 'نامشخص', color: '#9ca3af' };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fa-IR').format(amount);
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.amount.toString().includes(searchTerm);
        const matchesCategory = filterCategory === 'all' || expense.categoryId === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="جستجو در توضیحات یا مبلغ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div className="w-full md:w-64 relative">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white appearance-none"
                    >
                        <option value="all">همه دسته‌بندی‌ها</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-xl shadow-md flex justify-between items-center">
                <div>
                    <p className="text-emerald-100 text-sm">مجموع هزینه‌های نمایش داده شده</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(totalAmount)} <span className="text-sm font-normal opacity-80">ریال</span></p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                    <Tag size={24} />
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredExpenses.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <p>هیچ هزینه‌ای یافت نشد</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-bold">تاریخ</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">سرفصل</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">توضیحات</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">کیلومتر</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold">مبلغ</th>
                                    <th className="px-4 py-3 text-center text-sm font-bold w-20">عملیات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredExpenses.map((expense) => {
                                    const category = getCategoryDetails(expense.categoryId);
                                    return (
                                        <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {expense.date}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                                                    style={{ backgroundColor: category.color }}
                                                >
                                                    {category.title}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                                {expense.description || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                {expense.odometer ? expense.odometer.toLocaleString() : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-left font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(expense.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory } from '../../types';
import { getCategories, saveExpense } from '../../services/storageService';
import { Save, Calendar, DollarSign, FileText, Gauge, Tag } from 'lucide-react';

export const ExpenseEntry: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [formData, setFormData] = useState<Partial<Expense>>({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        odometer: undefined,
        categoryId: ''
    });

    useEffect(() => {
        setCategories(getCategories());
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.categoryId || !formData.amount || !formData.date) {
            alert('لطفاً موارد الزامی را پر کنید');
            return;
        }

        const expense: Expense = {
            id: Date.now().toString(),
            categoryId: formData.categoryId,
            amount: Number(formData.amount),
            date: formData.date,
            description: formData.description || '',
            odometer: formData.odometer ? Number(formData.odometer) : undefined,
            createdAt: new Date().toISOString()
        };

        try {
            saveExpense(expense);
            // Reset form
            setFormData({
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                description: '',
                odometer: undefined,
                categoryId: ''
            });
            alert('هزینه با موفقیت ثبت شد ✅');
            onSave(); // Notify parent to refresh data
        } catch (error) {
            alert('خطا در ثبت هزینه');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    ثبت هزینه جدید
                </h2>
                <p className="text-indigo-100 text-sm mt-1">اطلاعات هزینه را وارد کنید</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Category Selection */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            سرفصل هزینه <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, categoryId: cat.id })}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-2 ${formData.categoryId === cat.id
                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 ring-2 ring-indigo-200 dark:ring-indigo-800'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                                        }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                        style={{ backgroundColor: cat.color }}
                                    >
                                        <Tag size={16} />
                                    </div>
                                    {cat.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            مبلغ (ریال/تومان) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="number"
                                value={formData.amount || ''}
                                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            تاریخ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Odometer */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            کیلومتر خودرو (اختیاری)
                        </label>
                        <div className="relative">
                            <Gauge className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="number"
                                value={formData.odometer || ''}
                                onChange={e => setFormData({ ...formData, odometer: Number(e.target.value) })}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                placeholder="مثلاً: 120000"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            توضیحات
                        </label>
                        <div className="relative">
                            <FileText className="absolute right-3 top-3 text-gray-400" size={18} />
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                placeholder="جزئیات هزینه..."
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t dark:border-gray-700 flex justify-end">
                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                    >
                        <Save size={20} />
                        ثبت هزینه
                    </button>
                </div>
            </form>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { ExpenseCategory } from '../../types';
import { getCategories, saveCategory, deleteCategory } from '../../services/storageService';
import {
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Fuel,
    Wrench,
    Settings,
    FileText,
    Droplets,
    AlertTriangle,
    MoreHorizontal,
    Tag
} from 'lucide-react';

const ICONS: { [key: string]: React.ElementType } = {
    Fuel,
    Wrench,
    Settings,
    FileText,
    Droplets,
    AlertTriangle,
    MoreHorizontal,
    Tag
};

const COLORS = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#84cc16', // Lime
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#d946ef', // Fuchsia
    '#f43f5e', // Rose
    '#64748b', // Slate
];

export const CategoryManager: React.FC = () => {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<Partial<ExpenseCategory>>({
        title: '',
        color: COLORS[0],
        icon: 'Tag'
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const data = await getCategories();
        setCategories(data);
    };

    const handleSave = async () => {
        if (!formData.title) {
            alert('عنوان دسته‌بندی الزامی است');
            return;
        }

        const category: ExpenseCategory = {
            id: editingCategory?.id || Date.now().toString(),
            title: formData.title,
            color: formData.color || COLORS[0],
            icon: formData.icon || 'Tag',
            isDefault: editingCategory?.isDefault || false
        };

        try {
            await saveCategory(category);
            loadCategories();
            handleCancel();
        } catch (error) {
            alert('خطا در ذخیره دسته‌بندی');
        }
    };

    const handleEdit = (category: ExpenseCategory) => {
        setEditingCategory(category);
        setFormData(category);
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('آیا از حذف این دسته‌بندی مطمئن هستید؟')) {
            try {
                await deleteCategory(id);
                loadCategories();
            } catch (error) {
                alert('خطا در حذف دسته‌بندی');
            }
        }
    };

    const handleCancel = () => {
        setEditingCategory(null);
        setIsAdding(false);
        setFormData({
            title: '',
            color: COLORS[0],
            icon: 'Tag'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">مدیریت سرفصل‌های هزینه</h2>
                <button
                    onClick={() => {
                        setIsAdding(true);
                        setEditingCategory(null);
                        setFormData({ title: '', color: COLORS[0], icon: 'Tag' });
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Plus size={18} />
                    سرفصل جدید
                </button>
            </div>

            {/* Form */}
            {(isAdding || editingCategory) && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                        {editingCategory ? 'ویرایش سرفصل' : 'سرفصل جدید'}
                    </h3>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                عنوان سرفصل <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                placeholder="مثال: سوخت، تعمیرات..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                رنگ برچسب
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setFormData({ ...formData, color })}
                                        className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                آیکون
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(ICONS).map(([name, Icon]) => (
                                    <button
                                        key={name}
                                        onClick={() => setFormData({ ...formData, icon: name })}
                                        className={`p-2 rounded-lg border transition-colors ${formData.icon === name
                                            ? 'bg-blue-100 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <Icon size={20} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-6">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-colors"
                        >
                            <X size={18} />
                            انصراف
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Save size={18} />
                            ذخیره
                        </button>
                    </div>
                </div>
            )}

            {/* Categories List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map(category => {
                    const Icon = ICONS[category.icon || 'Tag'] || Tag;
                    return (
                        <div
                            key={category.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                                    style={{ backgroundColor: category.color }}
                                >
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{category.title}</h4>
                                    {category.isDefault && (
                                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">پیش‌فرض</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    title="ویرایش"
                                >
                                    <Edit2 size={16} />
                                </button>
                                {!category.isDefault && (
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="حذف"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

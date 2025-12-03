import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { getCustomers, saveCustomer, deleteCustomer } from '../services/storageService';
import { Plus, Edit2, Trash2, Save, X, Search, Users } from 'lucide-react';

export const CustomerManagement: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<Partial<Customer>>({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = () => {
        const data = getCustomers();
        setCustomers(data);
    };

    const handleSave = () => {
        if (!formData.name || !formData.phone) {
            alert('نام و تلفن الزامی است');
            return;
        }

        const customer: Customer = {
            id: editingCustomer?.id || Date.now().toString(),
            name: formData.name,
            email: formData.email || '',
            phone: formData.phone,
            address: formData.address || '',
            notes: formData.notes || '',
            createdAt: editingCustomer?.createdAt || new Date().toISOString()
        };

        try {
            saveCustomer(customer);
            loadCustomers();
            handleCancel();
        } catch (error) {
            alert('خطا در ذخیره مشتری');
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData(customer);
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('آیا از حذف این مشتری مطمئن هستید؟')) {
            try {
                deleteCustomer(id);
                loadCustomers();
            } catch (error) {
                alert('خطا در حذف مشتری');
            }
        }
    };

    const handleCancel = () => {
        setEditingCustomer(null);
        setIsAdding(false);
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            notes: ''
        });
    };

    const handleAddNew = () => {
        setIsAdding(true);
        setEditingCustomer(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            notes: ''
        });
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Users size={32} />
                    <h1 className="text-3xl font-bold">مدیریت مشتریان</h1>
                </div>
                <p className="text-blue-100">مدیریت لیست مشتریان ثابت برای صدور سریع فاکتور</p>
            </div>

            {/* Search and Add */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="جستجو بر اساس نام، تلفن یا ایمیل..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Plus size={20} />
                        افزودن مشتری جدید
                    </button>
                </div>
            </div>

            {/* Form */}
            {(isAdding || editingCustomer) && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-lg">
                    <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-4">
                        {editingCustomer ? 'ویرایش مشتری' : 'افزودن مشتری جدید'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                نام مشتری <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                placeholder="نام کامل مشتری"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                تلفن <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                placeholder="شماره تماس"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ایمیل</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                placeholder="آدرس ایمیل"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">آدرس</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                placeholder="آدرس کامل"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">یادداشت</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                placeholder="یادداشت‌های اضافی"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X size={18} />
                            انصراف
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Save size={18} />
                            ذخیره
                        </button>
                    </div>
                </div>
            )}

            {/* Customer List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredCustomers.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">
                            {searchTerm ? 'مشتری‌ای یافت نشد' : 'هنوز مشتری‌ای اضافه نشده است'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-bold">نام</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">تلفن</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">ایمیل</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">آدرس</th>
                                    <th className="px-4 py-3 text-center text-sm font-bold w-32">عملیات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredCustomers.map((customer, index) => (
                                    <tr
                                        key={customer.id}
                                        className={index % 2 === 0 ? 'bg-blue-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            {customer.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                                            {customer.phone}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {customer.email || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {customer.address || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleEdit(customer)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="ویرایش"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-bold">{customers.length}</span> مشتری ثبت شده
                    {searchTerm && ` • ${filteredCustomers.length} نتیجه یافت شد`}
                </p>
            </div>
        </div>
    );
};

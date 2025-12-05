import React, { useState, useEffect } from 'react';
import { CompanyInfo } from '../types';
import { getCompanyInfo, saveCompanyInfo } from '../services/storageService';
import { Building2, Save, Upload, Trash2 } from 'lucide-react';

export const CompanySettings: React.FC = () => {
    const [formData, setFormData] = useState<CompanyInfo>({
        name: '',
        email: '',
        address: '',
        phone: '',
        logo: ''
    });
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        loadCompanyInfo();
    }, []);

    const loadCompanyInfo = async () => {
        const data = await getCompanyInfo();
        if (data) {
            setFormData(data);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.phone) {
            alert('نام شرکت و تلفن الزامی است');
            return;
        }

        try {
            await saveCompanyInfo(formData);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error: any) {
            alert(`خطا در ذخیره اطلاعات: ${error.message || error}`);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, logo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <Building2 size={32} />
                    <h1 className="text-3xl font-bold">تنظیمات شرکت</h1>
                </div>
                <p className="text-yellow-100">مدیریت اطلاعات شرکت سرویس‌دهنده</p>
            </div>

            {/* Success Message */}
            {isSaved && (
                <div className="bg-green-100 border-2 border-green-400 text-green-800 px-4 py-3 rounded-lg">
                    ✓ اطلاعات با موفقیت ذخیره شد
                </div>
            )}

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="space-y-6">
                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            لوگو شرکت
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                                <Upload className="ml-2 h-4 w-4" />
                                <span>انتخاب تصویر</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                            {formData.logo && (
                                <div className="relative h-20 w-20 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 p-2">
                                    <img src={formData.logo} alt="Logo" className="h-full w-full object-contain" />
                                    <button
                                        onClick={() => setFormData({ ...formData, logo: '' })}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            نام شرکت / سرویس <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="نام شرکت یا سرویس تاکسی"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            تلفن تماس <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="شماره تماس"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            ایمیل / وب‌سایت
                        </label>
                        <input
                            type="text"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="آدرس ایمیل یا وب‌سایت"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            آدرس
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="آدرس کامل شرکت"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-md"
                        >
                            <Save size={20} />
                            ذخیره اطلاعات
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    💡 این اطلاعات به صورت خودکار در تمام فاکتورها به عنوان اطلاعات فروشنده استفاده می‌شود.
                </p>
            </div>
        </div>
    );
};

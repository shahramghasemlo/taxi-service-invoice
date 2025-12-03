import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
    Printer,
    Plus,
    Trash2,
    Sparkles,
    Loader2,
    FileText,
    Settings,
    Upload,
    User,
    Building2,
    FileCheck,
    ChevronLeft,
    Users,
    Home
} from 'lucide-react';
import { InvoiceData, LineItem, initialInvoiceState, Customer } from '../../types';
import { InvoicePreview } from '../InvoicePreview';
import { CustomerManagement } from '../CustomerManagement';
import { CompanySettings } from '../CompanySettings';
import { generateLineItemsFromText } from '../../services/geminiService';
import { getCustomers, getCompanyInfo } from '../../services/storageService';

type Page = 'invoice' | 'customers' | 'settings';

export const InvoiceDashboard: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('invoice');
    const [data, setData] = useState<InvoiceData>(initialInvoiceState);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

    const componentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadCustomers();
        loadCompanyInfo();
    }, []);

    const loadCustomers = () => {
        const customerList = getCustomers();
        setCustomers(customerList);
    };

    const loadCompanyInfo = () => {
        const companyInfo = getCompanyInfo();
        if (companyInfo) {
            setData(prev => ({
                ...prev,
                fromName: companyInfo.name,
                fromEmail: companyInfo.email,
                fromAddress: companyInfo.address,
                logo: companyInfo.logo || ''
            }));
        }
    };

    const handleCustomerSelect = (customerId: string) => {
        setSelectedCustomerId(customerId);
        if (customerId) {
            const customer = customers.find(c => c.id === customerId);
            if (customer) {
                setData(prev => ({
                    ...prev,
                    toName: customer.name,
                    toEmail: customer.email,
                    toAddress: customer.address
                }));
            }
        } else {
            setData(prev => ({
                ...prev,
                toName: '',
                toEmail: '',
                toAddress: ''
            }));
        }
    };

    const subtotal = useMemo(() => {
        return data.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    }, [data.items]);

    const discountAmount = useMemo(() => subtotal * (data.discountRate / 100), [subtotal, data.discountRate]);
    const taxAmount = useMemo(() => (subtotal - discountAmount) * (data.taxRate / 100), [subtotal, discountAmount, data.taxRate]);
    const total = useMemo(() => subtotal - discountAmount + taxAmount, [subtotal, discountAmount, taxAmount]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...data.items];
        // @ts-ignore
        newItems[index] = { ...newItems[index], [field]: value };
        setData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setData(prev => ({
            ...prev,
            items: [...prev.items, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, rate: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData(prev => ({ ...prev, items: newItems }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({ ...prev, logo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCompanySignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({ ...prev, companySignature: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomerSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({ ...prev, customerSignature: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        try {
            const generatedItems = await generateLineItemsFromText(aiPrompt);
            const itemsWithIds = generatedItems.map(item => ({
                ...item,
                id: Math.random().toString(36).substr(2, 9)
            }));

            setData(prev => ({
                ...prev,
                items: [...prev.items, ...itemsWithIds]
            }));
            setAiPrompt('');
        } catch (error) {
            console.error(error);
            alert('خطا در تولید آیتم‌ها. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const renderInvoicePage = () => (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Editor Column */}
            <div className={`lg:w-1/2 no-print ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                    <div className="p-6 space-y-8">
                        {/* AI Section */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-5 rounded-xl border border-yellow-100 dark:border-yellow-800">
                            <div className="flex items-center gap-2 mb-3 text-yellow-800 dark:text-yellow-300">
                                <Sparkles size={18} />
                                <h2 className="font-semibold">تولید هوشمند خدمات (AI)</h2>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="مثال: ترانسفر فرودگاه امام با تویوتا کمری و ۵ ساعت در اختیار"
                                    className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    onClick={handleAiGenerate}
                                    disabled={isGenerating || !aiPrompt}
                                    className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <ChevronLeft size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* General Settings */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
                                <Settings size={18} />
                                <h3 className="font-semibold">تنظیمات فاکتور</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره فاکتور</label>
                                    <input
                                        type="text"
                                        name="invoiceNumber"
                                        value={data.invoiceNumber}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">واحد پول</label>
                                    <input
                                        type="text"
                                        name="currency"
                                        value={data.currency}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاریخ صدور</label>
                                    <input
                                        type="text"
                                        name="date"
                                        value={data.date}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاریخ سررسید</label>
                                    <input
                                        type="text"
                                        name="dueDate"
                                        value={data.dueDate}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">لوگو شرکت</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer w-full transition-colors">
                                            <Upload className="ml-2 h-4 w-4" />
                                            <span>انتخاب تصویر</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                        </label>
                                        {data.logo && (
                                            <div className="h-10 w-10 relative shrink-0">
                                                <img src={data.logo} alt="Preview" className="h-full w-full object-contain rounded bg-white" />
                                                <button
                                                    onClick={() => setData(prev => ({ ...prev, logo: '' }))}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seller Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
                                <Building2 size={18} />
                                <h3 className="font-semibold">مشخصات مجری / راننده</h3>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    name="fromName"
                                    placeholder="نام شرکت / راننده"
                                    value={data.fromName}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="text"
                                    name="fromEmail"
                                    placeholder="ایمیل / تلفن تماس"
                                    value={data.fromEmail}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                />
                                <textarea
                                    name="fromAddress"
                                    placeholder="آدرس / ایستگاه"
                                    value={data.fromAddress}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Buyer Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
                                <User size={18} />
                                <h3 className="font-semibold">مشخصات مسافر / شرکت</h3>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    انتخاب از لیست مشتریان
                                </label>
                                <select
                                    value={selectedCustomerId}
                                    onChange={(e) => handleCustomerSelect(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">-- ورود دستی --</option>
                                    {customers.map(customer => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} ({customer.phone})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    name="toName"
                                    placeholder="نام مسافر / شرکت طرف قرارداد"
                                    value={data.toName}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="text"
                                    name="toEmail"
                                    placeholder="ایمیل / تلفن"
                                    value={data.toEmail}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                />
                                <textarea
                                    name="toAddress"
                                    placeholder="آدرس مقصد / شرکت"
                                    value={data.toAddress}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
                                <div className="flex items-center gap-2">
                                    <FileCheck size={18} />
                                    <h3 className="font-semibold">لیست خدمات / مسیرها</h3>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {data.items.map((item, index) => (
                                    <div key={item.id} className="flex gap-2 items-start bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                placeholder="شرح خدمات / مسیر / نوع خودرو"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                className="w-full rounded border-gray-300 dark:border-gray-600 border p-1.5 text-sm dark:bg-gray-700 dark:text-white"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="تعداد/ساعت"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="w-24 rounded border-gray-300 dark:border-gray-600 border p-1.5 text-sm text-center dark:bg-gray-700 dark:text-white"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="مبلغ واحد"
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                                    className="flex-1 rounded border-gray-300 dark:border-gray-600 border p-1.5 text-sm dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded transition-colors mt-1"
                                            title="حذف"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addItem}
                                    className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-yellow-500 dark:hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <Plus size={16} />
                                    افزودن سرویس جدید
                                </button>
                            </div>
                        </div>

                        {/* Totals Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">درصد مالیات</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="taxRate"
                                        value={data.taxRate}
                                        onChange={(e) => setData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm pl-8 dark:bg-gray-700 dark:text-white"
                                    />
                                    <span className="absolute left-3 top-2 text-gray-400 text-sm">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">درصد تخفیف</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="discountRate"
                                        value={data.discountRate}
                                        onChange={(e) => setData(prev => ({ ...prev, discountRate: parseFloat(e.target.value) || 0 }))}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm pl-8 dark:bg-gray-700 dark:text-white"
                                    />
                                    <span className="absolute left-3 top-2 text-gray-400 text-sm">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Signatures */}
                        <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">توضیحات</label>
                                <textarea
                                    name="notes"
                                    value={data.notes}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شرایط پرداخت</label>
                                <textarea
                                    name="terms"
                                    value={data.terms}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 border p-2 text-sm dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
                                <FileText size={18} />
                                <h3 className="font-semibold">امضاها</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">امضای شرکت / راننده</label>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                                            <Upload className="ml-2 h-4 w-4" />
                                            <span>انتخاب امضا</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleCompanySignatureUpload} />
                                        </label>
                                        {data.companySignature && (
                                            <div className="relative h-20 w-full bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 p-2">
                                                <img src={data.companySignature} alt="Company Signature" className="h-full w-full object-contain" />
                                                <button
                                                    onClick={() => setData(prev => ({ ...prev, companySignature: '' }))}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">امضای مشتری / مسافر</label>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                                            <Upload className="ml-2 h-4 w-4" />
                                            <span>انتخاب امضا</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleCustomerSignatureUpload} />
                                        </label>
                                        {data.customerSignature && (
                                            <div className="relative h-20 w-full bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 p-2">
                                                <img src={data.customerSignature} alt="Customer Signature" className="h-full w-full object-contain" />
                                                <button
                                                    onClick={() => setData(prev => ({ ...prev, customerSignature: '' }))}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Column */}
            <div className={`lg:w-1/2 ${activeTab === 'edit' ? 'hidden lg:block' : 'block'} print-area`}>
                <div className="sticky top-24">
                    <div className="mb-4 flex items-center justify-between lg:hidden no-print">
                        <h2 className="font-bold text-gray-800 dark:text-white">پیش‌نمایش فاکتور</h2>
                        <button
                            onClick={handlePrint}
                            className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                        >
                            چاپ کردن
                        </button>
                    </div>

                    <div className="shadow-2xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <InvoicePreview
                            ref={componentRef}
                            data={data}
                            subtotal={subtotal}
                            taxAmount={taxAmount}
                            discountAmount={discountAmount}
                            total={total}
                        />
                    </div>

                    <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm no-print">
                        <p>برای ذخیره به صورت PDF، روی دکمه چاپ کلیک کنید و گزینه Save as PDF را انتخاب نمایید.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (currentPage) {
            case 'customers':
                return <CustomerManagement />;
            case 'settings':
                return <CompanySettings />;
            default:
                return renderInvoicePage();
        }
    };

    return (
        <div className="space-y-6">
            {/* Sub Navigation */}
            <div className="flex overflow-x-auto gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 no-print">
                <button
                    onClick={() => setCurrentPage('invoice')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 'invoice'
                        ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <Home size={18} />
                    فاکتور جدید
                </button>
                <button
                    onClick={() => {
                        setCurrentPage('customers');
                        loadCustomers();
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 'customers'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <Users size={18} />
                    مشتریان
                </button>
                <button
                    onClick={() => setCurrentPage('settings')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 'settings'
                        ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <Settings size={18} />
                    تنظیمات
                </button>

                {/* Invoice Tabs */}
                {currentPage === 'invoice' && (
                    <>
                        <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'edit'
                                ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            ویرایش
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'preview'
                                ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            پیش‌نمایش
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-sm mr-auto"
                        >
                            <Printer size={18} />
                            <span>چاپ</span>
                        </button>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {renderContent()}
            </div>
        </div>
    );
};

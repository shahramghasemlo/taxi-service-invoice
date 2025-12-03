export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface CompanyInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
  logo?: string;
}

export interface ExpenseCategory {
  id: string;
  title: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  date: string;
  description: string;
  odometer?: number;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  logo?: string;
  toName: string;
  toEmail: string;
  toAddress: string;
  items: LineItem[];
  notes: string;
  terms: string;
  currency: string;
  taxRate: number;
  discountRate: number;
  companySignature?: string;
  customerSignature?: string;
}

// Helper to format date in Persian Calendar
const getPersianDate = (date: Date) => {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

export const initialInvoiceState: InvoiceData = {
  invoiceNumber: 'TAX-1403-1001',
  date: getPersianDate(new Date()),
  dueDate: getPersianDate(new Date()), // Taxi services are usually immediate payment
  fromName: 'تاکسی سرویس فرودگاه رویال',
  fromEmail: 'info@royal-taxi.ir',
  fromAddress: 'تهران، فرودگاه بین‌المللی امام خمینی (ره)، ترمینال ۱، باجه ۴',
  logo: '',
  toName: 'شرکت بازرگانی افق',
  toEmail: 'accounting@ofogh-co.ir',
  toAddress: 'تهران، بلوار آفریقا، خیابان پدیدار، پلاک ۱۰',
  items: [
    { id: '1', description: 'ترانسفر فرودگاهی (ونک به فرودگاه امام) - تویوتا کمری', quantity: 1, rate: 9500000 },
    { id: '2', description: 'سرویس بین شهری (تهران به قم) - رفت و برگشت', quantity: 1, rate: 25000000 },
    { id: '3', description: 'توقف در مسیر (ساعتی)', quantity: 2, rate: 2000000 },
  ],
  notes: 'مسافر: آقای محمدی\nکد اشتراک: ۴۰۵۲',
  terms: 'لطفاً مبلغ فاکتور را به شماره کارت ۶۰۳۷۹۹۱۱۰۰۰۰۰۰۰۰ نزد بانک ملی واریز نمایید.',
  currency: 'ریال',
  taxRate: 9,
  discountRate: 0,
  companySignature: '',
  customerSignature: '',
};
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
export const getPersianDate = (date: Date | string) => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch (e) {
    return '';
  }
};

export const initialInvoiceState: InvoiceData = {
  invoiceNumber: 'TAX-1403-0001',
  date: getPersianDate(new Date()),
  dueDate: getPersianDate(new Date()),
  fromName: '',
  fromEmail: '',
  fromAddress: '',
  logo: '',
  toName: '',
  toEmail: '',
  toAddress: '',
  items: [],
  notes: '',
  terms: '',
  currency: 'ریال',
  taxRate: 0,
  discountRate: 0,
  companySignature: '',
  customerSignature: '',
};
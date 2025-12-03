// LocalStorage service for managing customers and company info

import { Customer, CompanyInfo, ExpenseCategory, Expense } from '../types';

const CUSTOMERS_KEY = 'taxi-invoice-customers';
const COMPANY_KEY = 'taxi-invoice-company';
const CATEGORIES_KEY = 'taxi-invoice-categories';
const EXPENSES_KEY = 'taxi-invoice-expenses';

// Customer Management
export const getCustomers = (): Customer[] => {
    try {
        const data = localStorage.getItem(CUSTOMERS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading customers:', error);
        return [];
    }
};

export const saveCustomer = (customer: Customer): void => {
    try {
        const customers = getCustomers();
        const existingIndex = customers.findIndex(c => c.id === customer.id);

        if (existingIndex >= 0) {
            customers[existingIndex] = customer;
        } else {
            customers.push(customer);
        }

        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    } catch (error) {
        console.error('Error saving customer:', error);
        throw new Error('خطا در ذخیره مشتری');
    }
};

export const deleteCustomer = (id: string): void => {
    try {
        const customers = getCustomers();
        const filtered = customers.filter(c => c.id !== id);
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw new Error('خطا در حذف مشتری');
    }
};

export const getCustomerById = (id: string): Customer | undefined => {
    const customers = getCustomers();
    return customers.find(c => c.id === id);
};

// Company Info Management
export const getCompanyInfo = (): CompanyInfo | null => {
    try {
        const data = localStorage.getItem(COMPANY_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading company info:', error);
        return null;
    }
};

export const saveCompanyInfo = (info: CompanyInfo): void => {
    try {
        localStorage.setItem(COMPANY_KEY, JSON.stringify(info));
    } catch (error) {
        console.error('Error saving company info:', error);
        throw new Error('خطا در ذخیره اطلاعات شرکت');
    }
};

// Expense Categories Management
export const getCategories = (): ExpenseCategory[] => {
    try {
        const data = localStorage.getItem(CATEGORIES_KEY);
        if (data) return JSON.parse(data);

        // Seed default categories if none exist
        const defaultCategories: ExpenseCategory[] = [
            { id: '1', title: 'سوخت و انرژی', color: '#ef4444', icon: 'Fuel', isDefault: true },
            { id: '2', title: 'تعمیرات و سرویس', color: '#f97316', icon: 'Wrench', isDefault: true },
            { id: '3', title: 'لوازم یدکی', color: '#3b82f6', icon: 'Settings', isDefault: true },
            { id: '4', title: 'بیمه و عوارض', color: '#8b5cf6', icon: 'FileText', isDefault: true },
            { id: '5', title: 'نظافت و کارواش', color: '#06b6d4', icon: 'Droplets', isDefault: true },
            { id: '6', title: 'جریمه‌ها', color: '#64748b', icon: 'AlertTriangle', isDefault: true },
            { id: '7', title: 'سایر هزینه‌ها', color: '#94a3b8', icon: 'MoreHorizontal', isDefault: true },
        ];

        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
        return defaultCategories;
    } catch (error) {
        console.error('Error loading categories:', error);
        return [];
    }
};

export const saveCategory = (category: ExpenseCategory): void => {
    try {
        const categories = getCategories();
        const existingIndex = categories.findIndex(c => c.id === category.id);

        if (existingIndex >= 0) {
            categories[existingIndex] = category;
        } else {
            categories.push(category);
        }

        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
        console.error('Error saving category:', error);
        throw new Error('خطا در ذخیره دسته‌بندی');
    }
};

export const deleteCategory = (id: string): void => {
    try {
        const categories = getCategories();
        const filtered = categories.filter(c => c.id !== id);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting category:', error);
        throw new Error('خطا در حذف دسته‌بندی');
    }
};

// Expenses Management
export const getExpenses = (): Expense[] => {
    try {
        const data = localStorage.getItem(EXPENSES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading expenses:', error);
        return [];
    }
};

export const saveExpense = (expense: Expense): void => {
    try {
        const expenses = getExpenses();
        const existingIndex = expenses.findIndex(e => e.id === expense.id);

        if (existingIndex >= 0) {
            expenses[existingIndex] = expense;
        } else {
            expenses.push(expense);
        }

        localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    } catch (error) {
        console.error('Error saving expense:', error);
        throw new Error('خطا در ثبت هزینه');
    }
};

export const deleteExpense = (id: string): void => {
    try {
        const expenses = getExpenses();
        const filtered = expenses.filter(e => e.id !== id);
        localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting expense:', error);
        throw new Error('خطا در حذف هزینه');
    }
};

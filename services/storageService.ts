// Supabase service for managing data
import { supabase } from './supabaseClient';
import { Customer, CompanyInfo, ExpenseCategory, Expense } from '../types';

// Get current authenticated user ID
const getCurrentUserId = async (): Promise<string> => {
    if (!supabase) throw new Error('Supabase not initialized');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('کاربر وارد سیستم نشده است');
    return user.id;
};

// Customer Management
export const getCustomers = async (): Promise<Customer[]> => {
    const { data, error } = await supabase
        .from('customers')
        .select('*');

    if (error) {
        console.error('Error loading customers:', error);
        return [];
    }
    return data || [];
};

export const saveCustomer = async (customer: Customer): Promise<void> => {
    const userId = await getCurrentUserId();
    // Map camelCase to snake_case for database
    const payload = {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        notes: customer.notes,
        created_at: customer.createdAt,
        user_id: userId
    };

    const { error } = await supabase
        .from('customers')
        .upsert(payload);

    if (error) {
        console.error('Error saving customer:', error);
        throw new Error(error.message || 'خطا در ذخیره مشتری');
    }
};

export const deleteCustomer = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting customer:', error);
        throw new Error('خطا در حذف مشتری');
    }
};

export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error loading customer:', error);
        return undefined;
    }
    return data;
};

// Company Info Management
export const getCompanyInfo = async (): Promise<CompanyInfo | null> => {
    const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single();

    if (error) {
        // If no row found, return null (not an error for first time load)
        if (error.code === 'PGRST116') return null;
        console.error('Error loading company info:', error);
        return null;
    }
    return data;
};

export const saveCompanyInfo = async (info: CompanyInfo): Promise<void> => {
    const userId = await getCurrentUserId();
    // Each user has their own company info row
    const payload = { ...info, id: userId, user_id: userId };
    const { error } = await supabase
        .from('company_info')
        .upsert(payload);

    if (error) {
        console.error('Error saving company info:', error);
        throw new Error(error.message || 'خطا در ذخیره اطلاعات شرکت');
    }
};

// Expense Categories Management
export const getCategories = async (): Promise<ExpenseCategory[]> => {
    const { data, error } = await supabase
        .from('expense_categories')
        .select('*');

    if (error) {
        console.error('Error loading categories:', error);
        return [];
    }

    if (!data || data.length === 0) {
        // Seed default categories if none exist for this user
        const userId = await getCurrentUserId();
        const defaultCategories: ExpenseCategory[] = [
            { id: `${userId}-1`, title: 'سوخت و انرژی', color: '#ef4444', icon: 'Fuel', isDefault: true },
            { id: `${userId}-2`, title: 'تعمیرات و سرویس', color: '#f97316', icon: 'Wrench', isDefault: true },
            { id: `${userId}-3`, title: 'لوازم یدکی', color: '#3b82f6', icon: 'Settings', isDefault: true },
            { id: `${userId}-4`, title: 'بیمه و عوارض', color: '#8b5cf6', icon: 'FileText', isDefault: true },
            { id: `${userId}-5`, title: 'نظافت و کارواش', color: '#06b6d4', icon: 'Droplets', isDefault: true },
            { id: `${userId}-6`, title: 'جریمه‌ها', color: '#64748b', icon: 'AlertTriangle', isDefault: true },
            { id: `${userId}-7`, title: 'سایر هزینه‌ها', color: '#94a3b8', icon: 'MoreHorizontal', isDefault: true },
        ];

        // Insert defaults (map to snake_case for DB)
        const dbCategories = defaultCategories.map(c => ({
            id: c.id,
            title: c.title,
            color: c.color,
            icon: c.icon,
            is_default: c.isDefault,
            user_id: userId
        }));

        const { error: insertError } = await supabase
            .from('expense_categories')
            .insert(dbCategories);

        if (insertError) {
            console.error('Error seeding categories:', insertError);
        }
        return defaultCategories;
    }

    // Map snake_case from DB to camelCase for App
    return data.map((c: any) => ({
        id: c.id,
        title: c.title,
        color: c.color,
        icon: c.icon,
        isDefault: c.is_default
    }));
};

export const saveCategory = async (category: ExpenseCategory): Promise<void> => {
    const userId = await getCurrentUserId();
    const { error } = await supabase
        .from('expense_categories')
        .upsert({
            id: category.id,
            title: category.title,
            color: category.color,
            icon: category.icon, // Store icon name as string
            is_default: category.isDefault,
            user_id: userId
        });

    if (error) {
        console.error('Error saving category:', error);
        throw new Error('خطا در ذخیره دسته‌بندی');
    }
};

export const deleteCategory = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting category:', error);
        throw new Error('خطا در حذف دسته‌بندی');
    }
};

// Expenses Management
export const getExpenses = async (): Promise<Expense[]> => {
    const { data, error } = await supabase
        .from('expenses')
        .select('*');

    if (error) {
        console.error('Error loading expenses:', error);
        return [];
    }

    // Map snake_case to camelCase if needed, but here we assume types match or we map them
    // Supabase returns data matching table columns. 
    // If table has snake_case (category_id), we need to map to camelCase (categoryId)
    return data?.map((e: any) => ({
        ...e,
        categoryId: e.category_id
    })) || [];
};

export const saveExpense = async (expense: Expense): Promise<void> => {
    const userId = await getCurrentUserId();
    const payload = {
        id: expense.id,
        amount: expense.amount,
        date: expense.date,
        description: expense.description,
        category_id: expense.categoryId,
        user_id: userId
    };

    const { error } = await supabase
        .from('expenses')
        .upsert(payload);

    if (error) {
        console.error('Error saving expense:', error);
        throw new Error('خطا در ثبت هزینه');
    }
};

export const deleteExpense = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting expense:', error);
        throw new Error('خطا در حذف هزینه');
    }
};


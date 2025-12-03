import { Customer, CompanyInfo, ExpenseCategory, Expense } from '../types';

export const createBackup = () => {
    const backup = {
        customers: localStorage.getItem('taxi-invoice-customers'),
        company: localStorage.getItem('taxi-invoice-company'),
        categories: localStorage.getItem('taxi-invoice-categories'),
        expenses: localStorage.getItem('taxi-invoice-expenses'),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    };

    return JSON.stringify(backup, null, 2);
};

export const downloadBackup = () => {
    try {
        const data = createBackup();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const date = new Date().toISOString().split('T')[0];
        const link = document.createElement('a');
        link.href = url;
        link.download = `taxi_invoice_backup_${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Backup failed:', error);
        return false;
    }
};

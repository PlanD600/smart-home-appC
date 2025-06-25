import React, { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A utility function to format numbers as currency.
 * @param {number} amount - The number to format.
 * @param {string} currency - The currency symbol.
 * @returns {string} - The formatted currency string.
 */
const formatCurrency = (amount, currency) => {
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
};

/**
 * A small, reusable component for a single statistic card.
 */
const StatCard = ({ icon, title, value, colorClass = '', detail = null }) => (
    <div className={`stat-card ${colorClass}`}>
        <div className="stat-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="stat-content">
            <h5 className="stat-title">{title}</h5>
            <p className="stat-value">{value}</p>
            {detail && <div className="stat-detail">{detail}</div>}
        </div>
    </div>
);

/**
 * Displays a summary of the current month's finances: income, expenses, balance, and savings rate.
 */
const FinancialSummary = () => {
    const { activeHome, loading } = useAppContext();

    const monthlyTotals = useMemo(() => {
        if (!activeHome?.finances) {
            return { totalIncome: 0, totalExpenses: 0, balance: 0, savingsRate: 0, currency: 'ש"ח' };
        }

        const { income = [], paidBills = [], financeSettings } = activeHome.finances;
        const currency = financeSettings?.currency || 'ש"ח';

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const totalIncome = income
            .filter(i => {
                const d = new Date(i.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, i) => sum + i.amount, 0);

        const totalExpenses = paidBills
            .filter(p => {
                const d = new Date(p.datePaid);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + p.amount, 0);

        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? Math.max(0, (balance / totalIncome) * 100) : 0;

        return { totalIncome, totalExpenses, balance, savingsRate, currency };
    }, [activeHome?.finances]);

    if (loading && !activeHome) {
        return <LoadingSpinner />;
    }

    const { totalIncome, totalExpenses, balance, savingsRate, currency } = monthlyTotals;

    return (
        <div className="financial-summary-grid">
            <StatCard 
                icon="fa-arrow-up" 
                title="סך הכנסות (החודש)" 
                value={formatCurrency(totalIncome, currency)}
                colorClass="income"
            />
            <StatCard 
                icon="fa-arrow-down" 
                title="סך הוצאות (החודש)" 
                value={formatCurrency(totalExpenses, currency)}
                colorClass="expense"
            />
            <StatCard 
                icon="fa-balance-scale" 
                title="מאזן" 
                value={formatCurrency(balance, currency)}
                colorClass={balance >= 0 ? 'balance-positive' : 'balance-negative'}
            />
            <StatCard 
                icon="fa-piggy-bank" 
                title="שיעור חיסכון" 
                value={`${savingsRate.toFixed(0)}%`}
                colorClass="savings"
                detail={
                    <div className="savings-progress-bar">
                        <div style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
                    </div>
                }
            />
        </div>
    );
};

export default FinancialSummary;
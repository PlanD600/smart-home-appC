import React, { useMemo, useState, useEffect, Suspense, lazy } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import LoadingSpinner from '@/components/LoadingSpinner';

// --- רכיבי תצוגה ---

const formatCurrency = (amount, currency) => {
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency}`;
};

const StatCard = ({ icon, title, value, colorClass = '' }) => (
    <div className={`stat-card ${colorClass}`}>
        <div className="stat-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="stat-content">
            <h5 className="stat-title">{title}</h5>
            <p className="stat-value">{value}</p>
        </div>
    </div>
);

// --- קומפוננטת הסיכום האישי (שולבה כאן) ---
const UserFinanceSummary = () => {
    const { activeHome } = useAppContext();
    const { fetchUserMonthlyFinanceSummary, loading } = useFinanceActions();
    
    const [summaryData, setSummaryData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!activeHome?._id || !fetchUserMonthlyFinanceSummary) {
            setSummaryData(null);
            return;
        }

        const getSummary = async () => {
            setError(null);
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;

            try {
                const data = await fetchUserMonthlyFinanceSummary(year, month);
                setSummaryData(data);
            } catch (err) {
                console.error("Failed to fetch user summary:", err);
                setError("שגיאה בטעינת סיכום חודשי");
            }
        };

        getSummary();
    }, [activeHome?._id, activeHome?.finances?.income, activeHome?.finances?.paidBills, fetchUserMonthlyFinanceSummary]);

    const usersToDisplay = useMemo(() => {
        const users = activeHome?.users || [];
        const sharedDataExists = summaryData && summaryData['משותף'] && (summaryData['משותף'].income > 0 || summaryData['משותף'].expenses > 0);
        
        const all = [...users];
        if (sharedDataExists) {
            all.push({ name: 'משותף', _id: 'shared' });
        }
        return all;
    }, [activeHome?.users, summaryData]);

    const currency = activeHome?.finances?.financeSettings?.currency || 'ש"ח';

    if (loading && !summaryData) {
        return <LoadingSpinner text="טוען סיכום אישי..." />;
    }
    
    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }
    
    if (!summaryData || usersToDisplay.length === 0) {
        return <div className="text-center text-gray-500 p-4">אין נתונים להצגה.</div>;
    }
    
    return (
        <div className="user-summary-container">
            {usersToDisplay.map(user => {
                const data = summaryData[user.name] || { income: 0, expenses: 0, net: 0 };
                const netClass = data.net >= 0 ? 'net-positive' : 'net-negative';
                return (
                    <div key={user._id || user.name} className={`user-summary-row ${netClass}`}>
                        <span className="user-name-cell">
                            <i className={`fas ${user.name === 'משותף' ? 'fa-users' : 'fa-user-circle'}`}></i>
                            {user.name}
                        </span>
                        <span className="amount-cell income">{formatCurrency(data.income, '')}</span>
                        <span className="amount-cell expense">{formatCurrency(data.expenses, '')}</span>
                        <span className="amount-cell net-balance">{formatCurrency(data.net, currency)}</span>
                    </div>
                );
            })}
        </div>
    );
};


// --- הקומפוננטה הראשית המשלבת הכל ---
const FinancialSummary = () => {
    const { activeHome, loading } = useAppContext();

    const monthlyTotals = useMemo(() => {
        if (!activeHome?.finances) {
            return { totalIncome: 0, totalExpenses: 0, balance: 0, currency: 'ש"ח' };
        }
        const { income = [], paidBills = [], financeSettings } = activeHome.finances;
        const currency = financeSettings?.currency || 'ש"ח';
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const totalIncome = income.filter(i => new Date(i.date).getMonth() === currentMonth && new Date(i.date).getFullYear() === currentYear).reduce((sum, i) => sum + i.amount, 0);
        const totalExpenses = paidBills.filter(p => new Date(p.datePaid).getMonth() === currentMonth && new Date(p.datePaid).getFullYear() === currentYear).reduce((sum, p) => sum + p.amount, 0);
        const balance = totalIncome - totalExpenses;
        return { totalIncome, totalExpenses, balance, currency };
    }, [activeHome?.finances]);

    if (loading && !activeHome) {
        return <LoadingSpinner />;
    }

    const { totalIncome, totalExpenses, balance, currency } = monthlyTotals;

    return (
        <div className="unified-summary-section">
            <div className="financial-summary-grid">
                <StatCard icon="fa-arrow-up" title="סך הכנסות" value={formatCurrency(totalIncome, currency)} colorClass="income" />
                <StatCard icon="fa-arrow-down" title="סך הוצאות" value={formatCurrency(totalExpenses, currency)} colorClass="expense" />
                <StatCard icon="fa-balance-scale" title="מאזן" value={formatCurrency(balance, currency)} colorClass={balance >= 0 ? 'balance-positive' : 'balance-negative'} />
            </div>

            <hr className="summary-divider" />

            <div className="personal-summary-wrapper">
                <h4 className="personal-summary-title">סיכום פיננסי אישי (החודש)</h4>
                <div className="user-summary-header">
                    <span>משתמש</span>
                    <span>הכנסות</span>
                    <span>הוצאות</span>
                    <span>מאזן</span>
                </div>
                <UserFinanceSummary />
            </div>
        </div>
    );
};

export default FinancialSummary;
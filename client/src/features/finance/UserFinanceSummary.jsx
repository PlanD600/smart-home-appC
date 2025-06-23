import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A small, reusable component for displaying a single user's financial summary row.
 */
const UserStatRow = ({ icon, label, amount, currency, className = '' }) => (
    <div className={`user-stat-row ${className}`}>
        <span><i className={`fas ${icon}`}></i> {label}</span>
        <span className="font-semibold">{amount.toLocaleString()} {currency}</span>
    </div>
);

/**
 * Displays a summary of the current month's finances, broken down by user.
 */
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
    }, [activeHome?._id, fetchUserMonthlyFinanceSummary]);

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
        return <LoadingSpinner text="טוען סיכום..." />;
    }
    
    if (error) {
        return <div className="text-center text-red-500 p-4">{error}</div>;
    }
    
    if (!summaryData) {
        return <div className="text-center text-gray-500 p-4">אין נתונים להצגה.</div>;
    }
    
    return (
        <div className="user-summary-container">
            {usersToDisplay.map(user => {
                const data = summaryData[user.name] || { income: 0, expenses: 0, net: 0 };
                const netClass = data.net > 0 ? 'net-positive' : data.net < 0 ? 'net-negative' : '';
                
                return (
                    <div key={user._id || user.name} className="user-summary-card">
                        <h4 className="user-card-title">
                            <i className={`fas ${user.name === 'משותף' ? 'fa-users' : 'fa-user-circle'}`}></i>
                            {user.name}
                        </h4>
                        <div className="user-stats">
                            <UserStatRow icon="fa-arrow-up" label="הכנסות" amount={data.income} currency={currency} className="income-row" />
                            <UserStatRow icon="fa-arrow-down" label="הוצאות" amount={data.expenses} currency={currency} className="expense-row" />
                            <hr className="my-2 border-gray-200"/>
                            <UserStatRow icon="fa-balance-scale" label="מאזן" amount={data.net} currency={currency} className={`font-bold ${netClass}`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserFinanceSummary;

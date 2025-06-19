// client/src/features/finance/UserFinanceSummary.jsx

import React, { useState, useEffect } from 'react';
import { useHome } from '../../context/HomeContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserFinanceSummary = () => {
    // שלב 1: שימוש בקונטקסט אך ללא תלות ב-loading הגלובלי
    const { activeHome, fetchUserMonthlyFinanceSummary } = useHome();
    
    // שלב 2: ניהול State של טעינה ושגיאה באופן מקומי!
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!activeHome?._id) {
            setSummaryData(null);
            return;
        }

        const getSummary = async () => {
            setIsLoading(true); // שימוש ב-state מקומי
            setError(null);
            
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;

            try {
                // הקריאה לפונקציה מהקונטקסט עדיין מתרחשת
                const data = await fetchUserMonthlyFinanceSummary(year, month);
                setSummaryData(data);
            } catch (err) {
                console.error("Failed to fetch user summary:", err);
                setError("שגיאה בטעינת סיכום חודשי");
            } finally {
                setIsLoading(false); // שימוש ב-state מקומי
            }
        };

        getSummary();

    // מערך התלויות נשאר יציב
    }, [activeHome?._id, fetchUserMonthlyFinanceSummary]);

    // --- קוד תצוגה ---
    // התצוגה תלויה עכשיו ב-state המקומי (isLoading) ולא הגלובלי

    if (isLoading) {
        return (
            <div className="card bg-base-100 shadow-xl p-4 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    
    // ... שאר קוד התצוגה כפי שהיה קודם ...
    if (error) {
        return (
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center"><p className="text-error">{error}</p></div>
            </div>
        );
    }
    
    if (!summaryData) {
        return (
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center"><p>אין נתונים פיננסיים להצגה.</p></div>
            </div>
        );
    }

    const usersToDisplay = [...new Set([...(activeHome.users || []), 'משותף'])];
    const currency = activeHome.finances?.financeSettings?.currency || 'ILS';

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">סיכום פיננסי חודשי (לפי משתמש)</h2>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>משתמש</th>
                                <th>סך הכנסות</th>
                                <th>סך הוצאות</th>
                                <th>מאזן</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersToDisplay.map(user => {
                                const data = summaryData[user] || { income: 0, expenses: 0, net: 0 };
                                const netClass = data.net > 0 ? 'text-success' : data.net < 0 ? 'text-error' : '';
                                return (
                                    <tr key={user}>
                                        <th>{user}</th>
                                        <td className="text-success">{data.income.toLocaleString()} {currency}</td>
                                        <td className="text-error">{data.expenses.toLocaleString()} {currency}</td>
                                        <td className={`font-bold ${netClass}`}>{data.net.toLocaleString()} {currency}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserFinanceSummary;
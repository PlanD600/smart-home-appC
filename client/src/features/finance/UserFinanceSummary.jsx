import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext'; // ✅ נתיב מעודכן
import { useFinanceActions } from '../../context/FinanceActionsContext'; // ✅ ייבוא FinanceActionsContext
import LoadingSpinner from '../../components/LoadingSpinner';

const UserFinanceSummary = () => {
    // ✅ קבלת activeHome מ-useAppContext
    const { activeHome } = useAppContext();
    // ✅ קבלת fetchUserMonthlyFinanceSummary מ-useFinanceActions
    const { fetchUserMonthlyFinanceSummary } = useFinanceActions();
    
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // נוודא ש-activeHome ו-fetchUserMonthlyFinanceSummary זמינים
        if (!activeHome?._id || !fetchUserMonthlyFinanceSummary) {
            setSummaryData(null);
            return;
        }

        const getSummary = async () => {
            setIsLoading(true);
            setError(null);
            
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;

            try {
                const data = await fetchUserMonthlyFinanceSummary(year, month);
                setSummaryData(data);
            } catch (err) {
                console.error("Failed to fetch user summary:", err);
                setError("שגיאה בטעינת סיכום חודשי");
            } finally {
                setIsLoading(false);
            }
        };

        getSummary();
        // הוספת fetchUserMonthlyFinanceSummary כתלות ל-useEffect
    }, [activeHome?._id, fetchUserMonthlyFinanceSummary]);

    if (isLoading) {
        return (
            <div className="card bg-base-100 shadow-xl p-4 flex items-center justify-center min-h-[150px]">
                <LoadingSpinner />
            </div>
        );
    }
    
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
    
    // ✅ שלב 1: יצירת רשימה אחידה של משתמשים להצגה
    // נוסיף אובייקט מיוחד עבור 'משותף' כדי לשמור על מבנה אחיד
    const usersForTable = [...(activeHome.users || []), { name: 'משותף', _id: 'shared' }];
    const currency = activeHome.finances?.financeSettings?.currency || 'ש"ח';

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
                            {/* ✅ שלב 2: תיקון הלולאה */}
                            {usersForTable.map(user => {
                                // המשתמש הוא תמיד אובייקט, אז ניגש לשם שלו
                                const userName = user.name;
                                const data = summaryData[userName] || { income: 0, expenses: 0, net: 0 };
                                const netClass = data.net > 0 ? 'text-success' : data.net < 0 ? 'text-error' : '';
                                
                                return (
                                    // המפתח הוא תמיד ערך ייחודי מהאובייקט
                                    <tr key={user._id || userName}>
                                        {/* תמיד נציג את שם המשתמש */}
                                        <th>{userName}</th> 
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
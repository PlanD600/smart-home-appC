import React, { useState, useEffect } from 'react';
import { useHome } from '../../context/HomeContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserFinanceSummary = () => {
    console.log(`%c[${new Date().toLocaleTimeString()}] RENDER START`, 'color: gray; font-style: italic;');

    const { activeHome, fetchUserMonthlyFinanceSummary } = useHome();
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    useEffect(() => {
        console.log(`%c[${new Date().toLocaleTimeString()}] useEffect triggered.`, 'color: purple; font-weight: bold;');

        const getSummary = async () => {
            if (!activeHome || !activeHome._id) {
                console.warn(`[${new Date().toLocaleTimeString()}] No activeHome._id – skipping fetch.`);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                console.log(`[${new Date().toLocaleTimeString()}] Fetching finance summary...`);
                const data = await fetchUserMonthlyFinanceSummary(currentYear, currentMonth);
                
                // בדיקה שה־data תקף (למנוע שגיאות בעתיד)
                if (data && typeof data === 'object') {
                    setSummaryData(data);
                } else {
                    throw new Error("Invalid data format");
                }

                console.log(`[${new Date().toLocaleTimeString()}] Summary data set.`);
            } catch (err) {
                console.error(`[${new Date().toLocaleTimeString()}] Fetch error:`, err);
                setError("אירעה שגיאה בטעינת הנתונים");
            } finally {
                setIsLoading(false);
            }
        };

        getSummary();

    }, [activeHome?._id, fetchUserMonthlyFinanceSummary, currentMonth, currentYear]);

    // --- תנאי רינדור ---
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <p style={{ color: 'var(--coral-red)', textAlign: 'center' }}>{error}</p>;
    }

    return (
        <div id="user-finance-summary-section">
            <div className="sub-section-header">
                <h4>סיכום פיננסי לפי משתמש</h4>
            </div>

            {/* תוכל להוסיף פה לולאת map או טבלה עם summaryData אם יש */}
            {summaryData ? (
                <pre style={{ direction: 'ltr', background: '#f7f7f7', padding: '1rem' }}>
                    {JSON.stringify(summaryData, null, 2)}
                </pre>
            ) : (
                <p style={{ textAlign: 'center' }}>אין נתונים להצגה.</p>
            )}
        </div>
    );
};

export default UserFinanceSummary;

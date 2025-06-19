import React, { useState, useEffect } from 'react';
import { useHome } from '../../context/HomeContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserFinanceSummary = () => {
    // שלב 1: לקיחת המידע הנחוץ בלבד
    const { activeHome, fetchUserMonthlyFinanceSummary } = useHome();
    const [summaryData, setSummaryData] = useState(null);

    // שלב 2: useEffect פשוט ככל האפשר
    useEffect(() => {
        // אם אין בית פעיל, אין מה לעשות
        if (!activeHome?._id) {
            return;
        }

        // הגדרת משתנים פשוטים כדי שלא יהיו ב-state
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;

        // קריאה לפונקציה ועדכון ה-state כשהמידע חוזר
        fetchUserMonthlyFinanceSummary(year, month).then(data => {
            setSummaryData(data);
        });

    // useEffect זה ירוץ רק אם ה-ID של הבית משתנה, או אם הפונקציה מהקונטקסט משתנה
    }, [activeHome?._id, fetchUserMonthlyFinanceSummary]);

    // שלב 3: תצוגה פשוטה
    // כל עוד אין נתונים, נציג ספינר טעינה
    if (!summaryData) {
        return <LoadingSpinner />;
    }

    // ברגע שיש נתונים, נציג אותם בצורה גולמית
    return (
        <div style={{ border: '2px solid blue', padding: '10px', direction: 'ltr', textAlign: 'left' }}>
            <h2>סיכום פיננסי (גרסה מינימלית)</h2>
            <p>אם אתה רואה את זה והלופ הפסיק, מצאנו את הבעיה.</p>
            <pre>
                {JSON.stringify(summaryData, null, 2)}
            </pre>
        </div>
    );
};

export default UserFinanceSummary;
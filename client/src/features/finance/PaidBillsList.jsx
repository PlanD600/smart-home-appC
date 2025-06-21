import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext'; // ✅ נתיב מעודכן
import LoadingSpinner from '../../components/LoadingSpinner'; // ✅ ייבוא ספינר טעינה

// ✅ הקומפוננטה כבר לא מקבלת props
const PaidBillsList = () => {
    // ✅ שלב 1: קבלת המידע מ-useAppContext
    const { activeHome, loading } = useAppContext(); // הוספתי loading מ-AppContext
    const [monthOffset, setMonthOffset] = useState(0);

    // ✅ שלב 2: בדיקת הגנה
    // נציג ספינר טעינה אם activeHome בטעינה, ואם אין נתוני כספים - הודעה מתאימה.
    if (loading) {
        return <LoadingSpinner />;
    }
    if (!activeHome?.finances) {
        return <div className="p-4 text-center text-gray-500">אין נתוני כספים זמינים עבור הבית הפעיל.</div>;
    }

    // ✅ שלב 3: פירוק משתנים בטוח מהקונטקסט
    const { paidBills = [], financeSettings } = activeHome.finances;
    const currency = financeSettings?.currency || 'ש"ח';


    // --- מכאן והלאה, כל הלוגיקה המקורית שלך נשארת זהה ---

    const getTargetMonth = () => {
        const date = new Date();
        date.setDate(1); // Avoid issues with day numbers
        date.setMonth(date.getMonth() - monthOffset);
        return date;
    };

    const targetDate = getTargetMonth();

    const filteredBills = paidBills
        .filter(bill => {
            const billDate = new Date(bill.datePaid);
            return billDate.getMonth() === targetDate.getMonth() && billDate.getFullYear() === targetDate.getFullYear();
        })
        .sort((a, b) => new Date(b.datePaid) - new Date(a.datePaid));

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-700">תשלומים שבוצעו</h4>
                <div className="flex items-center">
                    <button 
                        className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50" 
                        onClick={() => setMonthOffset(prev => prev + 1)}
                        disabled={loading} // השבתה בזמן טעינה
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                    <span className="w-32 text-center font-semibold text-gray-600">
                        {targetDate.toLocaleString('he-IL', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                        className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50" 
                        onClick={() => setMonthOffset(prev => Math.max(0, prev - 1))} 
                        disabled={monthOffset === 0 || loading} // השבתה בזמן טעינה או בחודש הנוכחי
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
                <ul>
                    {filteredBills.length > 0 ? (
                        filteredBills.map(bill => (
                            <li key={bill._id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800">{bill.text}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(bill.datePaid).toLocaleDateString('he-IL')}
                                            {bill.category && ` • ${bill.category}`}
                                            {bill.assignedTo && ` • ${bill.assignedTo}`}
                                        </p>
                                    </div>
                                    <div className="font-semibold text-gray-800">
                                        {bill.amount.toLocaleString()} {currency}
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="text-center p-8 text-gray-500">אין תשלומים בחודש זה.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default PaidBillsList;
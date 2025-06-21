import React from 'react';
import { useAppContext } from '../../context/AppContext'; // ✅ נתיב מעודכן
import { useModal } from '../../context/ModalContext';
import IncomeForm from './forms/IncomeForm';
import LoadingSpinner from '../../components/LoadingSpinner';

// ✅ הקומפוננטה כבר לא מקבלת props
const IncomeList = () => {
    // ✅ שלב 1: קבלת המידע מ-useAppContext
    const { activeHome, loading } = useAppContext(); // הוספתי loading מ-AppContext
    const { showModal } = useModal();

    // ✅ שלב 2: בדיקת הגנה
    // נציג ספינר טעינה אם activeHome בטעינה, ואם אין נתוני כספים - הודעה מתאימה.
    if (loading) {
        return <LoadingSpinner />;
    }
    if (!activeHome?.finances) {
        return <div className="p-4 text-center text-gray-500">אין נתוני כספים זמינים עבור הבית הפעיל.</div>;
    }

    // ✅ שלב 3: פירוק משתנים בטוח מהקונטקסט
    const { income = [], financeSettings } = activeHome.finances;
    const currency = financeSettings?.currency || 'ש"ח';

    const openAddIncomeModal = () => showModal(<IncomeForm onSave={() => showModal(null)} onCancel={() => showModal(null)} />, { title: 'הוספת הכנסה' });

    // --- מכאן והלאה, כל הלוגיקה המקורית שלך נשארת זהה ---
    
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-700">הכנסות</h4>
                <button 
                    onClick={openAddIncomeModal}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors flex items-center"
                    disabled={loading} // השבתה בזמן טעינה
                >
                    <i className="fas fa-plus mr-2"></i>
                    <span>הוסף הכנסה</span>
                </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
                <ul>
                    {income.length > 0 ? (
                        income.map(inc => (
                            <li key={inc._id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800">{inc.text}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(inc.date).toLocaleDateString('he-IL')}
                                            {inc.source && ` • ${inc.source}`}
                                        </p>
                                    </div>
                                    <div className="font-semibold text-green-600">
                                        + {inc.amount.toLocaleString()} {currency}
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="text-center p-8 text-gray-500">לא הוזנו הכנסות.</li>
                    )}
                </ul>
            </div>
            <div className="text-right font-bold mt-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-800">סה"כ הכנסות: </span>
                <span className="text-green-700">{totalIncome.toLocaleString()} {currency}</span>
            </div>
        </div>
    );
};

export default IncomeList;
import React, { useMemo, useCallback } from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import { useLanguage } from '../../context/LanguageContext'; // ייבוא ה-useLanguage hook
import BudgetForm from './forms/BudgetForm';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';

const formatCurrency = (value, currency) => {
    try {
        return new Intl.NumberFormat('he-IL', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    } catch (error) {
        console.error("Currency formatting error:", error);
        return `${currency} ${value}`;
    }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE', '#FF8B8B'];
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const BudgetTracker = () => {
    const { activeHome, loading } = useHome();
    const { t } = useLanguage() || {}; // וודא ש-t קיים, או שיהיה אובייקט ריק
    const { showModal, hideModal } = useModal();

    // וודא שאנחנו לוקחים את המטבע מהמקום הנכון, עם גישה בטוחה
    const currency = activeHome?.finances?.financeSettings?.currency || 'ILS'; 

    const handleEditBudgets = () => {
        if (!activeHome) return;
        
        showModal(
            <BudgetForm onClose={hideModal} />,
            { title: t?.('עדכון תקציב') || 'עדכון תקציב' } // שימוש ב-t?. וב-fallback
        );
    };

    // חישוב סך התקציב
    const totalBudget = useMemo(() =>
        activeHome?.finances?.expenseCategories?.reduce((sum, cat) => sum + (cat.budgetAmount || 0), 0) || 0
    , [activeHome?.finances?.expenseCategories]);

    // חישוב סך ההוצאות
    const totalSpent = useMemo(() => {
        if (!activeHome?.finances?.paidBills) return 0;
        return activeHome.finances.paidBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    }, [activeHome?.finances?.paidBills]);

    const remainingBudget = totalBudget - totalSpent;

    // **הוספת פונקציית calculateCategorySpent**
    const calculateCategorySpent = useCallback((categoryName) => {
        if (!activeHome?.finances?.paidBills) return 0;
        return activeHome.finances.paidBills.reduce((sum, bill) => {
            return sum + (bill.category === categoryName ? (bill.amount || 0) : 0);
        }, 0);
    }, [activeHome?.finances?.paidBills]);


    const expenseDataForChart = useMemo(() => {
        if (!activeHome?.finances?.expenseCategories) return [];

        // נבנה מפה של קטגוריות וההוצאות שלהן
        const categorySpending = new Map();
        activeHome.finances.paidBills.forEach(bill => {
            const currentSpent = categorySpending.get(bill.category) || 0;
            categorySpending.set(bill.category, currentSpent + (bill.amount || 0));
        });

        // נמיר את המפה למערך בפורמט שהתרשים מצפה לו
        // ונוודא שכל קטגוריה קיימת בתקציב כדי לקבל את הצבע שלה
        return activeHome.finances.expenseCategories.map(category => {
            const spent = categorySpending.get(category.name) || 0;
            return {
                name: t?.(category.name) || category.name, // השתמש ב-t?. וב-fallback
                spent: spent,
                color: category.color // נשתמש בצבע המוגדר לקטגוריה
            };
        }).filter(data => data.spent > 0); // נציג רק קטגוריות עם הוצאות בפועל

    }, [activeHome?.finances?.expenseCategories, activeHome?.finances?.paidBills, t]); // t חייב להיות כאן בתלויות


    if (loading && !activeHome) {
        return <LoadingSpinner />;
    }

    // במקרה שאין home או finances או expenseCategories, או שהן ריקות
    if (!activeHome || !activeHome.finances || !activeHome.finances.expenseCategories || activeHome.finances.expenseCategories.length === 0) {
        return (
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                    <h3 className="card-title">{t?.('מעקב תקציב') || 'מעקב תקציב'}</h3>
                    <p>{t?.('עדיין לא הגדרת תקציב. בואו נתחיל!') || 'עדיין לא הגדרת תקציב. בואו נתחיל!'}</p>
                    <button onClick={handleEditBudgets} className="btn btn-primary">{t?.('הגדרת תקציב') || 'הגדרת תקציב'}</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title">{t?.('מעקב תקציב מול הוצאות') || 'מעקב תקציב מול הוצאות'}</h2>
                    <button onClick={handleEditBudgets} className="btn btn-outline btn-primary btn-sm" aria-label={t?.('ערוך תקציב') || 'ערוך תקציב'}>
                        ✏️ {t?.('עריכה') || 'עריכה'}
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div>
                        <div className="text-sm text-gray-500">{t?.('הוצאות') || 'הוצאות'}</div>
                        <div className="text-lg font-bold">{formatCurrency(totalSpent, currency)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">{t?.('סך התקציב') || 'סך התקציב'}</div>
                        <div className="text-lg font-bold">{formatCurrency(totalBudget, currency)}</div>
                    </div>
                    <div>
                        <div className={`text-lg font-bold ${remainingBudget < 0 ? 'text-error' : 'text-success'}`}>
                            {formatCurrency(remainingBudget, currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                             {remainingBudget < 0 ? t?.('חריגה') || 'חריגה' : t?.('נותר') || 'נותר'}
                        </div>
                    </div>
                </div>
                <div className="h-64 w-full">
                    {expenseDataForChart.length > 0 ? (
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={expenseDataForChart}
                                    dataKey="spent"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                >
                                    {expenseDataForChart.map((entry, index) => (
                                        // השתמש ב-entry.color אם קיים, אחרת בצבע מתוך COLORS לפי האינדקס
                                        <Cell key={`cell-${entry.name || index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                {/* Tooltip ו-Legend צריכים להיות ילדים ישירים של PieChart, לא של Pie */}
                                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">{t?.('אין הוצאות להצגה החודש') || 'אין הוצאות להצגה החודש'}</div>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">{t?.('פירוט תקציב') || 'פירוט תקציב'}</h3>
                    <div className="space-y-2">
                        {activeHome.finances.expenseCategories.map((category, index) => (
                            // הוספתי index ל-key כ-fallback אם category.name אינו ייחודי
                            <div key={category.name || index} className="flex justify-between items-center p-3 rounded-lg bg-base-200">
                                <span className="font-medium">{t?.(category.name) || category.name}</span>
                                <span>{formatCurrency(category.budgetAmount, currency)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetTracker;
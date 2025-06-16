// client/src/features/finance/FinancialSummary.jsx
import React, { useContext, useMemo } from 'react';
import HomeContext from '../../context/HomeContext.jsx';

function FinancialSummary() {
    const { activeHome } = useContext(HomeContext);

    // useMemo מבטיח שהחישובים המורכבים יתבצעו רק כאשר הנתונים הרלוונטיים משתנים.
    // זה משפר את ביצועי האפליקציה.
    const summaryData = useMemo(() => {
        if (!activeHome || !activeHome.finances) {
            return { totalIncome: 0, totalExpenses: 0, balance: 0, savingsRate: 0, currency: '₪' };
        }

        const { income, paidBills, financeSettings } = activeHome.finances;
        const currency = financeSettings?.currency || '₪';
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
        const savingsRate = totalIncome > 0 ? Math.max(0, (balance / totalIncome) * 100).toFixed(0) : 0;

        return { totalIncome, totalExpenses, balance, savingsRate, currency };

    }, [activeHome]); // הרץ את החישוב מחדש רק אם activeHome משתנה

    const { totalIncome, totalExpenses, balance, savingsRate, currency } = summaryData;

    return (
        <div id="financial-summary-section" className="financial-summary-grid">
            <div className="summary-card">
                <h5>סך הכנסות (החודש)</h5>
                <p className="positive">{totalIncome.toLocaleString()} {currency}</p>
            </div>
            <div className="summary-card">
                <h5>סך הוצאות (החודש)</h5>
                <p className="negative">{totalExpenses.toLocaleString()} {currency}</p>
            </div>
            <div className={`summary-card ${balance >= 0 ? 'positive' : 'negative'}`}>
                <h5>מאזן</h5>
                <p>{balance.toLocaleString()} {currency}</p>
            </div>
            <div className="summary-card">
                <h5>שיעור חיסכון</h5>
                <p>{savingsRate}%</p>
            </div>
        </div>
    );
}

export default FinancialSummary;
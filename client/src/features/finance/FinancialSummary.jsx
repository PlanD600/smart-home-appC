// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/finance/FinancialSummary.jsx
import React, { useMemo } from 'react';

function FinancialSummary({ income, paidBills, settings }) {
    // useMemo מבטיח שהחישובים המורכבים יתבצעו רק כאשר המידע הרלוונטי משתנה
    const summaryData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const totalIncome = (income || [])
            .filter(i => {
                const d = new Date(i.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, i) => sum + i.amount, 0);

        const totalExpenses = (paidBills || [])
            .filter(p => {
                const d = new Date(p.datePaid);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + p.amount, 0);

        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? Math.max(0, (balance / totalIncome) * 100).toFixed(0) : 0;

        return { totalIncome, totalExpenses, balance, savingsRate };
    }, [income, paidBills]);

    const currency = settings?.currency || '₪';

    return (
        <div id="financial-summary-section" className="financial-summary-grid">
            <div className="summary-card">
                <h5>סך הכנסות (החודש)</h5>
                <p className="positive">{summaryData.totalIncome.toLocaleString()} {currency}</p>
            </div>
            <div className="summary-card">
                <h5>סך הוצאות (החודש)</h5>
                <p className="negative">{summaryData.totalExpenses.toLocaleString()} {currency}</p>
            </div>
            <div className={`summary-card ${summaryData.balance >= 0 ? 'positive' : 'negative'}`}>
                <h5>מאזן</h5>
                <p>{summaryData.balance.toLocaleString()} {currency}</p>
            </div>
            <div className="summary-card">
                <h5>שיעור חיסכון</h5>
                <p>{summaryData.savingsRate}%</p>
            </div>
        </div>
    );
}

export default FinancialSummary;
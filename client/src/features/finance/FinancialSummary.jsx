 import React, { useContext } from 'react';
import { HomeContext } from '../../context/HomeContext.jsx';

function FinancialSummary() {
        const container = document.getElementById('financial-summary-section');
        if (!container || !home || !home.finances) return;

        const { income, paidBills, financeSettings } = home.finances;
        const currency = financeSettings.currency || '₪';
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

        container.innerHTML = `
            <div class="summary-card">
                <h5>סך הכנסות (החודש)</h5>
                <p class="positive">${totalIncome.toLocaleString()} ${currency}</p>
            </div>
            <div class="summary-card">
                <h5>סך הוצאות (החודש)</h5>
                <p class="negative">${totalExpenses.toLocaleString()} ${currency}</p>
            </div>
            <div class="summary-card ${balance >= 0 ? 'positive' : 'negative'}">
                <h5>מאזן</h5>
                <p>${balance.toLocaleString()} ${currency}</p>
            </div>
            <div class="summary-card">
                <h5>שיעור חיסכון</h5>
                <p>${savingsRate}%</p>
            </div>
        `;
    }

export default FinancialSummary;

// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/finance/ExpenseChart.jsx
import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// רישום הרכיבים הנדרשים ל-ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DEFAULT_CATEGORY_COLORS = ["#AED581", "#FFB74D", "#4FC3F7", "#BA68C8", "#7986CB", "#F06292", "#4DB6AC", "#90A4AE", "#E57373", "#A1887F", "#FF8A65", "#7CB342"];

function ExpenseChart({ paidBills, settings }) {
    const [view, setView] = useState('monthly'); // 'monthly' or 'yearly'

    const chartData = useMemo(() => {
        const currency = settings?.currency || '₪';
        if (view === 'monthly') {
            const today = new Date();
            const categoryTotals = (paidBills || []).reduce((acc, bill) => {
                const billDate = new Date(bill.datePaid);
                if (billDate.getMonth() === today.getMonth() && billDate.getFullYear() === today.getFullYear()) {
                    const category = bill.category || 'ללא קטגוריה';
                    acc[category] = (acc[category] || 0) + bill.amount;
                }
                return acc;
            }, {});

            const labels = Object.keys(categoryTotals);
            const data = Object.values(categoryTotals);
            
            return {
                labels,
                datasets: [{
                    data,
                    backgroundColor: DEFAULT_CATEGORY_COLORS,
                    borderColor: '#fff',
                    borderWidth: 2,
                }]
            };
        } else { // yearly view
            const monthNames = ["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יוני", "יולי", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"];
            const monthlyTotals = Array(12).fill(0);
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
    
            (paidBills || []).forEach(bill => {
                const billDate = new Date(bill.datePaid);
                const monthDiff = (currentYear - billDate.getFullYear()) * 12 + (currentMonth - billDate.getMonth());
                if (monthDiff >= 0 && monthDiff < 12) {
                    monthlyTotals[11 - monthDiff] += bill.amount;
                }
            });
            
            const labels = Array.from({length: 12}, (_, i) => monthNames[(currentMonth - 11 + i + 12) % 12]);

            return {
                labels,
                datasets: [{
                    label: 'סך הוצאות',
                    data: monthlyTotals,
                    backgroundColor: 'rgba(136, 216, 176, 0.6)',
                    borderColor: 'rgba(136, 216, 176, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                }]
            };
        }
    }, [view, paidBills, settings]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: view === 'monthly' ? 'top' : 'none',
            },
            title: {
                display: true,
                text: view === 'monthly' ? 'הוצאות לפי קטגוריה (חודשי)' : 'הוצאות לפי חודש (שנתי)',
                font: { size: 16 }
            }
        }
    };

    const noData = !chartData.datasets[0].data.some(d => d > 0);

    return (
        <div id="finance-dashboard-area">
            <div className="chart-controls">
                <h4>ניתוח הוצאות</h4>
                <div className="chart-view-selector">
                    <button className={`view-btn ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>
                        <i className="fas fa-chart-pie"></i> חודשי
                    </button>
                    <button className={`view-btn ${view === 'yearly' ? 'active' : ''}`} onClick={() => setView('yearly')}>
                        <i className="fas fa-chart-bar"></i> שנתי
                    </button>
                </div>
            </div>
            <div className="chart-container">
                {noData ? (
                     <p id="no-chart-data-msg" style={{textAlign:'center'}}>אין נתונים להצגה</p>
                ) : (
                    view === 'monthly' ? 
                    <Doughnut data={chartData} options={chartOptions} /> : 
                    <Bar data={chartData} options={chartOptions} />
                )}
            </div>
        </div>
    );
}

export default ExpenseChart;
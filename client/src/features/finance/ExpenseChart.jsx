import React, { useContext, useState, useMemo } from 'react';
import { HomeContext } from '../../context/HomeContext.jsx';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// רישום הרכיבים ש-Chart.js צריך
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function ExpenseChart() {
  const { activeHome } = useContext(HomeContext);
  const [view, setView] = useState('monthly'); // State לניהול התצוגה (חודשי/שנתי)

  // useMemo: "זוכר" את החישובים ומריץ אותם מחדש רק אם הנתונים משתנים. זה משפר ביצועים.
  const chartData = useMemo(() => {
    if (!activeHome || !activeHome.finances || !activeHome.finances.paidBills) {
      return { labels: [], datasets: [] };
    }

    const { paidBills } = activeHome.finances;
    
    if (view === 'yearly') {
      const monthNames = ["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יוני", "יולי", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"];
      const monthlyTotals = Array(12).fill(0);
      const now = new Date();
      
      paidBills.forEach(bill => {
        const billDate = new Date(bill.datePaid);
        const monthDiff = (now.getFullYear() - billDate.getFullYear()) * 12 + (now.getMonth() - billDate.getMonth());
        if (monthDiff >= 0 && monthDiff < 12) {
          monthlyTotals[11 - monthDiff] += bill.amount;
        }
      });
      
      const labels = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = (now.getMonth() - (11 - i) + 12) % 12;
        return monthNames[monthIndex];
      });

      return {
        labels,
        datasets: [{
          label: 'סך הוצאות',
          data: monthlyTotals,
          backgroundColor: 'rgba(136, 216, 176, 0.6)',
        }],
      };
    } else { // monthly view
      const categoryTotals = {};
      const now = new Date();
      
      paidBills.forEach(bill => {
        const billDate = new Date(bill.datePaid);
        if (billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear()) {
          const category = bill.category || 'ללא קטגוריה';
          categoryTotals[category] = (categoryTotals[category] || 0) + bill.amount;
        }
      });

      return {
        labels: Object.keys(categoryTotals),
        datasets: [{
          data: Object.values(categoryTotals),
          backgroundColor: ['#AED581', '#FFB74D', '#4FC3F7', '#BA68C8', '#7986CB', '#F06292'],
          borderColor: '#fff',
          borderWidth: 2,
        }],
      };
    }
  }, [activeHome, view]); // הרץ את החישוב מחדש רק אם הנתונים או התצוגה משתנים

  const hasData = chartData.datasets.length > 0 && chartData.datasets[0].data.some(d => d > 0);
  
  const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' }, title: { display: true, text: view === 'monthly' ? 'הוצאות חודשיות לפי קטגוריה' : 'הוצאות ב-12 החודשים האחרונים' } },
  };

  return (
    <div id="finance-dashboard-area">
      <div className="chart-controls">
        <h4 data-lang-key="expense_analysis">ניתוח הוצאות</h4>
        <div className="chart-view-selector">
          <button className={`view-btn ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>
            <i className="fas fa-chart-pie"></i> <span data-lang-key="monthly_view">חודשי</span>
          </button>
          <button className={`view-btn ${view === 'yearly' ? 'active' : ''}`} onClick={() => setView('yearly')}>
            <i className="fas fa-chart-bar"></i> <span data-lang-key="yearly_view">שנתי</span>
          </button>
        </div>
      </div>
      <div className="chart-container">
        {hasData ? (
          view === 'monthly' ? <Doughnut options={options} data={chartData} /> : <Bar options={options} data={chartData} />
        ) : (
          <p id="no-chart-data-msg">אין נתונים להצגה בתקופה שנבחרה</p>
        )}
      </div>
    </div>
  );
}

export default ExpenseChart;
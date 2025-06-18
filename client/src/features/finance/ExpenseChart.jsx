import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // ייבוא הפלאגין

// Register Chart.js components we will use
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartDataLabels // רישום הפלאגין
);

// הצבעים כעת יגיעו מקטגוריות התקציב עצמן
const DEFAULT_CATEGORY_COLORS = ["#AED581", "#FFB74D", "#4FC3F7", "#BA68C8", "#7986CB", "#F06292", "#4DB6AC", "#90A4AE", "#E57373", "#A1887F"];

const ExpenseChart = ({ paidBills, expenseCategories, currency }) => { // קבלת expenseCategories כ-prop
  const [view, setView] = useState('monthly'); // 'monthly' or 'yearly'

  // --- Data processing for Monthly Doughnut Chart ---
  const getMonthlyChartData = () => {
    const now = new Date();
    const categoryTotals = paidBills
      .filter(bill => {
        const billDate = new Date(bill.datePaid);
        return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
      })
      .reduce((acc, bill) => {
        const category = bill.category || 'ללא קטגוריה';
        acc[category] = (acc[category] || 0) + bill.amount;
        return acc;
      }, {});

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    // מיפוי קטגוריות לצבעים שלהן, שימוש בצבע ברירת מחדל אם לא נמצא צבע לקטגוריה
    const backgroundColors = labels.map((label, index) => {
      const category = expenseCategories.find(cat => cat.name === label);
      return category && category.color ? category.color : DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length];
    });
    
    return {
      hasData: data.length > 0,
      chartData: {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors, // שימוש בצבעים מהקטגוריות
          borderColor: '#fff',
          borderWidth: 2,
        }],
      },
    };
  };

  // --- Data processing for Yearly Bar Chart ---
  const getYearlyChartData = () => {
    const now = new Date();
    const monthlyTotals = Array(12).fill(0);
    const labels = [];
    
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(d.toLocaleString('he-IL', { month: 'short' }));
    }

    paidBills.forEach(bill => {
        const billDate = new Date(bill.datePaid);
        const monthDiff = (now.getFullYear() - billDate.getFullYear()) * 12 + (now.getMonth() - billDate.getMonth());
        if (monthDiff >= 0 && monthDiff < 12) {
            monthlyTotals[11 - monthDiff] += bill.amount;
        }
    });

    return {
        hasData: monthlyTotals.some(total => total > 0),
        chartData: {
            labels,
            datasets: [{
                label: 'סך הוצאות',
                data: monthlyTotals,
                backgroundColor: 'rgba(136, 216, 176, 0.6)',
                borderColor: 'rgba(136, 216, 176, 1)',
                borderWidth: 1,
                borderRadius: 4,
            }],
        }
    };
  };

  const { hasData, chartData } = view === 'monthly' ? getMonthlyChartData() : getYearlyChartData();

  // אפשרויות לתרשים העוגה עם הצגת אחוזים
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const currentValue = context.parsed;
              const percentage = ((currentValue / total) * 100).toFixed(1);
              label += `${currentValue.toLocaleString()} ${currency} (${percentage}%)`;
            }
            return label;
          }
        }
      },
      datalabels: { // הגדרות הפלאגין להצגת אחוזים על העוגה
        color: '#fff', // צבע הטקסט של האחוזים
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
          const percentage = (value / total * 100).toFixed(1) + '%';
          return percentage;
        },
        font: {
          weight: 'bold',
          size: 12,
        },
      },
    },
  };

  return (
    <div id="finance-dashboard-area">
      <div className="chart-controls">
        <h4 data-lang-key="expense_analysis">ניתוח הוצאות</h4>
        <div className="chart-view-selector">
          <button className={`view-btn ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>
            <i className="fas fa-chart-pie"></i> <span>חודשי (קטגוריות)</span>
          </button>
          <button className={`view-btn ${view === 'yearly' ? 'active' : ''}`} onClick={() => setView('yearly')}>
            <i className="fas fa-chart-bar"></i> <span>שנתי</span>
          </button>
        </div>
      </div>
      <div className="chart-container">
        {!hasData ? (
          <p id="no-chart-data-msg" style={{ textAlign: 'center', paddingTop: '50px' }}>אין נתונים להצגה</p>
        ) : view === 'monthly' ? (
          <Doughnut data={chartData} options={doughnutOptions} />
        ) : (
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
        )}
      </div>
    </div>
  );
};

export default ExpenseChart;
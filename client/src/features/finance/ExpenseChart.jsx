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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useAppContext } from '../../context/AppContext'; // ✅ נתיב מעודכן
import LoadingSpinner from '../../components/LoadingSpinner'; // ✅ ייבוא ספינר טעינה

// רישום רכיבי התרשים
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ChartDataLabels
);

const DEFAULT_CATEGORY_COLORS = ["#AED581", "#FFB74D", "#4FC3F7", "#BA68C8", "#7986CB", "#F06292", "#4DB6AC", "#90A4AE", "#E57373", "#A1887F"];

// ✅ הקומפוננטה כבר לא מקבלת props
const ExpenseChart = () => {
    // ✅ שלב 1: קבלת המידע מהקונטקסט
    // נשתמש ב-loading מ-useAppContext אם נדרש לספינר טעינה כללי
    const { activeHome, loading } = useAppContext(); 
    const [view, setView] = useState('monthly');

    // ✅ שלב 2: בדיקת הגנה
    // נציג ספינר טעינה אם activeHome בטעינה או עדיין לא קיים
    if (loading || !activeHome?.finances) {
        // אם activeHome עדיין null או בטעינה, נציג ספינר.
        // אם activeHome קיים אבל אין לו נתוני כספים, נציג הודעה מתאימה.
        if (loading) {
            return <LoadingSpinner />;
        } else if (!activeHome?.finances) {
            return <p className="text-center text-gray-500 pt-16">אין נתוני כספים זמינים עבור הבית הפעיל.</p>;
        }
    }

    // ✅ שלב 3: פירוק משתנים בטוח מהקונטקסט
    const { paidBills = [], expenseCategories = [], financeSettings } = activeHome.finances;
    const currency = financeSettings?.currency || 'ש"ח';

    // --- מכאן והלאה, כל הלוגיקה המקורית שלך נשארת זהה ---

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
        
        const backgroundColors = labels.map((label, index) => {
            const category = expenseCategories.find(cat => cat.name === label);
            return category && category.color ? category.color : DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length];
        });

        return {
            hasData: data.length > 0,
            chartData: {
                labels,
                datasets: [{ data, backgroundColor: backgroundColors, borderColor: '#fff', borderWidth: 2 }],
            },
        };
    };

    // --- Data processing for Yearly Bar Chart ---
    const getYearlyChartData = () => {
        const now = new Date();
        const labels = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
            return d.toLocaleString('he-IL', { month: 'short', year: '2-digit' });
        });
        
        const last12MonthsData = Array(12).fill(0);
        paidBills.forEach(bill => {
            const billDate = new Date(bill.datePaid);
            const monthDiff = (now.getFullYear() - billDate.getFullYear()) * 12 + (now.getMonth() - billDate.getMonth());
            if (monthDiff >= 0 && monthDiff < 12) {
                last12MonthsData[11 - monthDiff] += bill.amount;
            }
        });


        return {
            hasData: last12MonthsData.some(total => total > 0),
            chartData: {
                labels,
                datasets: [{
                    label: 'סך הוצאות',
                    data: last12MonthsData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                }],
            }
        };
    };

    const { hasData, chartData } = view === 'monthly' ? getMonthlyChartData() : getYearlyChartData();

    const doughnutOptions = {
        // ... (כל האופציות שלך נשארות זהות)
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed !== null) {
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const currentValue = context.parsed;
                            const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(1) : 0;
                            label += `${currentValue.toLocaleString()} ${currency} (${percentage}%)`;
                        }
                        return label;
                    }
                }
            },
            datalabels: {
                color: '#fff',
                formatter: (value, context) => {
                    const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                    if (total === 0) return '';
                    const percentage = (value / total * 100);
                    return percentage > 5 ? percentage.toFixed(0) + '%' : ''; // הצג אחוז רק אם הוא גדול מספיק
                },
                font: { weight: 'bold', size: 12 },
            },
        },
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold text-gray-800">ניתוח הוצאות</h4>
                <div className="flex bg-gray-200 rounded-full p-1">
                    <button className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${view === 'monthly' ? 'bg-blue-500 text-white' : 'text-gray-600'}`} onClick={() => setView('monthly')}>
                        חודשי
                    </button>
                    <button className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${view === 'yearly' ? 'bg-blue-500 text-white' : 'text-gray-600'}`} onClick={() => setView('yearly')}>
                        שנתי
                    </button>
                </div>
            </div>
            <div className="h-80 w-full">
                {!hasData ? (
                    <p className="text-center text-gray-500 pt-16">אין נתונים להצגה לתקופה זו</p>
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
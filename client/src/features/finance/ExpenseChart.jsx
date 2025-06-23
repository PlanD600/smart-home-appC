import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '@/context/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';

// Default colors for categories if none are provided
const DEFAULT_CATEGORY_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f", "#ffbb28"];

/**
 * A custom tooltip component for the pie chart for better styling.
 */
const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-chart-tooltip">
                <p className="tooltip-label">{`${payload[0].name} : ${payload[0].value.toLocaleString()} ש"ח`}</p>
                <p className="tooltip-desc">{`(${payload[0].payload.percent.toFixed(0)}%)`}</p>
            </div>
        );
    }
    return null;
};

const ExpenseChart = () => {
    const { activeHome, loading } = useAppContext();
    const [view, setView] = useState('monthly'); // 'monthly' (pie) or 'yearly' (bar)

    const { paidBills = [], expenseCategories = [] } = activeHome?.finances || {};

    // Memoize chart data to avoid recalculation on every render
    const chartData = useMemo(() => {
        const now = new Date();
        
        if (view === 'monthly') {
            const monthlyData = paidBills
                .filter(bill => new Date(bill.datePaid).getMonth() === now.getMonth() && new Date(bill.datePaid).getFullYear() === now.getFullYear())
                .reduce((acc, bill) => {
                    const category = bill.category || 'ללא קטגוריה';
                    acc[category] = (acc[category] || 0) + bill.amount;
                    return acc;
                }, {});

            const total = Object.values(monthlyData).reduce((sum, value) => sum + value, 0);

            return Object.entries(monthlyData).map(([name, value], index) => {
                const categoryInfo = expenseCategories.find(c => c.name === name);
                return {
                    name,
                    value,
                    percent: total > 0 ? (value / total) * 100 : 0,
                    fill: categoryInfo?.color || DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length],
                };
            });
        }
        
        // Yearly data
        const yearlyData = Array.from({ length: 12 }, (_, i) => {
             const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
             return {
                 name: d.toLocaleString('he-IL', { month: 'short' }),
                 total: 0
             };
        }).reverse();

        paidBills.forEach(bill => {
            const billDate = new Date(bill.datePaid);
            const monthDiff = (now.getFullYear() - billDate.getFullYear()) * 12 + (now.getMonth() - billDate.getMonth());
            if (monthDiff >= 0 && monthDiff < 12) {
                yearlyData[11 - monthDiff].total += bill.amount;
            }
        });
        
        return yearlyData;

    }, [paidBills, expenseCategories, view]);

    if (loading) {
        return <LoadingSpinner text="טוען נתונים..." />;
    }

    return (
        <div className="expense-chart-container">
            <div className="chart-view-selector">
                <button onClick={() => setView('monthly')} className={view === 'monthly' ? 'active' : ''}>הוצאות החודש</button>
                <button onClick={() => setView('yearly')} className={view === 'yearly' ? 'active' : ''}>הוצאות שנתיות</button>
            </div>
            
            <div className="chart-wrapper">
                {chartData.length === 0 ? (
                    <div className="no-chart-data">אין נתונים להצגה</div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        {view === 'monthly' ? (
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend />
                            </PieChart>
                        ) : (
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value.toLocaleString()} ש"ח`} />
                                <Legend />
                                <Bar dataKey="total" name="סך הוצאות" fill="#82ca9d" />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default ExpenseChart;

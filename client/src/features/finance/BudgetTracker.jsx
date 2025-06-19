import React, { useMemo } from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
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
    const { showModal, hideModal } = useModal();

    const currency = activeHome?.finances?.currency || 'ILS';

    const handleEditBudgets = () => {
        if (!activeHome) return;
        
        showModal(
            <BudgetForm onClose={hideModal} />,
            { title: 'עדכון תקציב' }
        );
    };

    const totalBudget = useMemo(() =>
        activeHome?.finances?.expenseCategories.reduce((sum, cat) => sum + cat.budgetAmount, 0) || 0
    , [activeHome?.finances?.expenseCategories]);

    const totalSpent = useMemo(() => {
        if (!activeHome?.finances) return 0;
        return activeHome.finances.paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    }, [activeHome?.finances?.paidBills]);

    const remainingBudget = totalBudget - totalSpent;

    const expenseDataForChart = useMemo(() => {
        if (!activeHome?.finances?.expenseCategories) return [];

        const categoryMap = new Map();
        activeHome.finances.paidBills.forEach(bill => {
            const currentSpent = categoryMap.get(bill.category) || 0;
            categoryMap.set(bill.category, currentSpent + bill.amount);
        });

        return Array.from(categoryMap, ([name, spent]) => ({ name, spent }))
                    .filter(data => data.spent > 0);

    }, [activeHome?.finances]);

    if (loading && !activeHome) {
        return <LoadingSpinner />;
    }

    if (!activeHome || !activeHome.finances || !activeHome.finances.expenseCategories || activeHome.finances.expenseCategories.length === 0) {
        return (
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                    <h3 className="card-title">מעקב תקציב</h3>
                    <p>עדיין לא הגדרת תקציב. בואו נתחיל!</p>
                    <button onClick={handleEditBudgets} className="btn btn-primary">הגדרת תקציב</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title">מעקב תקציב מול הוצאות</h2>
                    <button onClick={handleEditBudgets} className="btn btn-outline btn-primary btn-sm" aria-label="ערוך תקציב">
                        ✏️ עריכה
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div>
                        <div className="text-sm text-gray-500">הוצאות</div>
                        <div className="text-lg font-bold">{formatCurrency(totalSpent, currency)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">סך התקציב</div>
                        <div className="text-lg font-bold">{formatCurrency(totalBudget, currency)}</div>
                    </div>
                    <div>
                        <div className={`text-lg font-bold ${remainingBudget < 0 ? 'text-error' : 'text-success'}`}>
                            {formatCurrency(remainingBudget, currency)}
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
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">אין הוצאות להצגה החודש</div>
                    )}
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">פירוט תקציב</h3>
                    <div className="space-y-2">
                        {activeHome.finances.expenseCategories.map((category) => (
                            <div key={category.name} className="flex justify-between items-center p-3 rounded-lg bg-base-200">
                                <span className="font-medium">{category.name}</span>
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
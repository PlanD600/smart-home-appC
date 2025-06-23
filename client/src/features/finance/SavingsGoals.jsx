import React, { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFinanceActions } from '@/context/FinanceActionsContext';
import { useModal } from '@/context/ModalContext';
import SavingsGoalForm from './forms/SavingsGoalForm';
import AddFundsForm from './forms/AddFundsForm';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A component that displays and manages savings goals.
 */
const SavingsGoals = () => {
    const { activeHome, loading } = useAppContext();
    const { addFundsToSavingsGoal } = useFinanceActions();
    const { showModal } = useModal();

    const openAddGoalModal = () => {
        showModal(<SavingsGoalForm />, { title: 'הוספת יעד חיסכון חדש' });
    };

    const openAddFundsModal = (goal) => {
        showModal(<AddFundsForm goal={goal} onSuccess={() => {}} />, { title: `הוספת כספים ל"${goal.name}"` });
    };

    const savingsGoals = activeHome?.finances?.savingsGoals || [];
    const currency = activeHome?.finances?.financeSettings?.currency || 'ש"ח';

    const sortedGoals = useMemo(() => {
        return [...savingsGoals].sort((a, b) => {
            const aComplete = (a.currentAmount / a.targetAmount) * 100;
            const bComplete = (b.currentAmount / b.targetAmount) * 100;
            return bComplete - aComplete; // Sort by percentage complete, descending
        });
    }, [savingsGoals]);

    return (
        <div className="savings-goals-container">
            <header className="savings-goals-header">
                <button onClick={openAddGoalModal} className="add-goal-btn" disabled={loading}>
                    <i className="fas fa-plus"></i> הוסף יעד
                </button>
            </header>

            {loading && sortedGoals.length === 0 ? (
                <LoadingSpinner />
            ) : sortedGoals.length === 0 ? (
                <div className="no-items-message">
                    <i className="fas fa-piggy-bank"></i>
                    <p>לא הוגדרו יעדי חיסכון. זה הזמן להתחיל!</p>
                </div>
            ) : (
                <div className="savings-goals-grid">
                    {sortedGoals.map(goal => {
                        const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                        const isCompleted = goal.currentAmount >= goal.targetAmount;

                        return (
                            <div key={goal._id} className={`savings-goal-card ${isCompleted ? 'completed' : ''}`}>
                                {isCompleted && <div className="completion-badge"><i className="fas fa-check"></i></div>}
                                <div className="goal-header">
                                    <span className="goal-name">{goal.name}</span>
                                    <button className="add-funds-btn" onClick={() => openAddFundsModal(goal)} disabled={isCompleted || loading}>
                                        <i className="fas fa-plus-circle"></i>
                                    </button>
                                </div>
                                <div className="goal-progress-bar">
                                    <div className="goal-progress-fill" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                                </div>
                                <div className="goal-footer">
                                    <span className="progress-text">
                                        {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} {currency}
                                    </span>
                                    <span className="progress-percent">{Math.round(percentage)}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SavingsGoals;

// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/features/finance/SavingsGoals.jsx
import React from 'react';
import { useHome } from '../../context/HomeContext';

function SavingsGoals({ finances, onAddGoal }) {
    const { currentHome, updateCurrentHome } = useHome();

    const handleAddToGoal = (goalId) => {
        if (!currentHome) return;

        const amountToAddStr = prompt(`הזן סכום להוספה ליעד:`);
        const amountToAdd = parseFloat(amountToAddStr);

        if (!amountToAdd || amountToAdd <= 0) {
            alert("יש להזין סכום חיובי.");
            return;
        }

        const updatedGoals = finances.savingsGoals.map(goal => {
            if (goal._id.toString() === goalId) {
                return { ...goal, currentAmount: goal.currentAmount + amountToAdd };
            }
            return goal;
        });

        updateCurrentHome({
            finances: { ...finances, savingsGoals: updatedGoals }
        });
    };

    const currency = finances.financeSettings?.currency || '₪';

    return (
        <div id="savings-goals-section">
            <div className="sub-section-header">
                <h4>יעדי חיסכון</h4>
                <button className="header-style-button" onClick={onAddGoal}>
                    <i className="fas fa-bullseye"></i> הוסף יעד חדש
                </button>
            </div>
            <div id="savings-goals-container" className="savings-goals-grid">
                {(finances.savingsGoals || []).length > 0 ? finances.savingsGoals.map(goal => {
                    const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                    return (
                        <div key={goal._id} className="savings-goal-card">
                            <h5>{goal.name}</h5>
                            <div className="goal-progress-bar" role="progressbar" aria-valuenow={percentage.toFixed(0)}>
                                <div className="goal-progress-fill" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                            </div>
                            <div className="card-footer">
                                <span className="progress-info">
                                    {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} {currency}
                                </span>
                                <button className="add-to-goal-btn header-style-button" onClick={() => handleAddToGoal(goal._id)}>
                                    <i className="fas fa-plus"></i> <span className="btn-text">הוסף</span>
                                </button>
                            </div>
                        </div>
                    );
                }) : <p style={{textAlign: 'center'}}>אין יעדי חיסכון. הוסף יעד חדש כדי להתחיל!</p>}
            </div>
        </div>
    );
}

export default SavingsGoals;
import React from 'react';
import { useModal } from '../../context/ModalContext';
import SavingsGoalForm from './forms/SavingsGoalForm';
import AddFundsForm from './forms/AddFundsForm';

const SavingsGoals = ({ savingsGoals, currency }) => {
  const { showModal } = useModal();

  const openAddGoalModal = () => showModal(<SavingsGoalForm />, { title: 'הוספת יעד חדש' });
  
  const openAddFundsModal = (goal) => {
    showModal(<AddFundsForm goal={goal} />, { title: `הוספת כספים ל"${goal.name}"` });
  };

  return (
    <div id="savings-goals-section">
      <div className="sub-section-header">
        <h4 data-lang-key="savings_goals">יעדי חיסכון</h4>
        <button id="add-savings-goal-btn" className="header-style-button" onClick={openAddGoalModal}>
          <i className="fas fa-bullseye"></i> <span className="btn-text">הוסף יעד חדש</span>
        </button>
      </div>
      <div id="savings-goals-container" className="savings-goals-grid">
        {savingsGoals && savingsGoals.length > 0 ? (
          savingsGoals.map(goal => {
            const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div key={goal._id} className={`savings-goal-card ${isCompleted ? 'goal-completed' : ''}`}>
                {isCompleted && <span className="completion-badge">🎉 הושלם!</span>}
                <h5>{goal.name}</h5>
                <div className="goal-progress-bar">
                  <div className="goal-progress-fill" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
                <div className="card-footer">
                {/* ======================================================== */}
                {/* כאן הוספנו את תצוגת האחוז, בנוסף למה שכבר היה קיים */}
                  <span className="progress-percentage" style={{ fontWeight: 'bold' }}>{Math.round(percentage)}%</span>
                {/* ======================================================== */}
                  <span className="progress-info">{goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} {currency}</span>
                  <button className="add-to-goal-btn header-style-button" onClick={() => openAddFundsModal(goal)}>
                    <i className="fas fa-plus"></i> <span className="btn-text">הוסף</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#777' }}>אין יעדי חיסכון. הגיע הזמן להתחיל לחסוך!</p>
        )}
      </div>
    </div>
  );
};

export default SavingsGoals;
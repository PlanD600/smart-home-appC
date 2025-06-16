import React, { useContext } from 'react';
import { HomeContext } from '../../context/HomeContext.jsx';

function SavingsGoals() {
  const { activeHome, openModal } = useContext(HomeContext);
  
  const handleAddGoal = () => {
    alert('פונקציונליות הוספת יעד תמומש בקרוב!');
  };

  const handleAddToSavings = (goal) => {
    alert(`פונקציונליות הוספת כסף ל"${goal.name}" תמומש בקרוב!`);
  };

  if (!activeHome || !activeHome.finances) return null;

  const { savingsGoals, financeSettings } = activeHome.finances;

  return (
    <div id="savings-goals-section">
      <div className="sub-section-header">
        <h4 data-lang-key="savings_goals">יעדי חיסכון</h4>
        <button id="add-savings-goal-btn" className="header-style-button" onClick={handleAddGoal}>
          <i className="fas fa-bullseye"></i> <span className="btn-text">הוסף יעד חדש</span>
        </button>
      </div>
      <div id="savings-goals-container" className="savings-goals-grid">
        {savingsGoals && savingsGoals.length > 0 ? (
          savingsGoals.map(goal => {
            const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <div key={goal._id || goal.name} className="savings-goal-card">
                <h5>{goal.name}</h5>
                <div className="goal-progress-bar">
                  <div className="goal-progress-fill" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                </div>
                <div className="card-footer">
                  <span className="progress-info">
                    {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} {financeSettings.currency}
                  </span>
                  <button className="add-to-goal-btn header-style-button" onClick={() => handleAddToSavings(goal)}>
                    <i className="fas fa-plus"></i> <span className="btn-text">הוסף</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', color: '#777' }}>לא הוגדרו יעדי חיסכון.</p>
        )}
      </div>
    </div>
  );
}

export default SavingsGoals;
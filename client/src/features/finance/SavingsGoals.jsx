import React from 'react';
import { useModal } from '../../context/ModalContext';
import { useAppContext } from '../../context/AppContext'; // ✅ ייבוא AppContext
import { useFinanceActions } from '../../context/FinanceActionsContext'; // ✅ ייבוא FinanceActionsContext
import SavingsGoalForm from './forms/SavingsGoalForm';
import AddFundsForm from './forms/AddFundsForm';
import LoadingSpinner from '../../components/LoadingSpinner'; // ייבוא ספינר טעינה

const SavingsGoals = () => {
  // ✅ קבלת activeHome ו-loading מ-useAppContext
  const { activeHome, loading: appLoading } = useAppContext();
  // ✅ קבלת פונקציות השמירה מ-useFinanceActions
  const { saveSavingsGoal, addFundsToSavingsGoal, loading: financeActionsLoading } = useFinanceActions();

  // נשתמש ב-loading המשותף אם אחד מה-Contexts נמצא בטעינה
  const loading = appLoading || financeActionsLoading;

  const { showModal } = useModal();

  // ✅ בדיקת הגנה וטעינה
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!activeHome?.finances) {
    return <div className="p-4 text-center text-gray-500">אין נתוני כספים זמינים עבור הבית הפעיל.</div>;
  }

  // ✅ קבלת הנתונים מתוך activeHome
  const { savingsGoals = [], financeSettings } = activeHome.finances;
  const currency = financeSettings?.currency || 'ש"ח';

  const openAddGoalModal = () => showModal(
    // נשלח את saveSavingsGoal לטופס
    <SavingsGoalForm onSave={saveSavingsGoal} onCancel={() => showModal(null)} />, 
    { title: 'הוספת יעד חדש' }
  );
  
  const openAddFundsModal = (goal) => {
    showModal(
      // נשלח את addFundsToSavingsGoal לטופס
      <AddFundsForm goal={goal} onSave={addFundsToSavingsGoal} onCancel={() => showModal(null)} />, 
      { title: `הוספת כספים ל"${goal.name}"` }
    );
  };

  return (
    <div id="savings-goals-section">
      <div className="sub-section-header">
        <h4 data-lang-key="savings_goals">יעדי חיסכון</h4>
        <button id="add-savings-goal-btn" className="header-style-button" onClick={openAddGoalModal} disabled={loading}>
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
                  <span className="progress-percentage" style={{ fontWeight: 'bold' }}>{Math.round(percentage)}%</span>
                  <span className="progress-info">{goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()} {currency}</span>
                  <button 
                        className="add-to-goal-btn header-style-button" 
                        onClick={() => openAddFundsModal(goal)} 
                        disabled={isCompleted || loading} // השבתה אם הושלם או בטעינה
                    >
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
import React, { Suspense, lazy } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

// Import all the necessary components and forms
import FinancialSummary from './FinancialSummary';
import ExpenseChart from './ExpenseChart';
import ExpectedBills from './ExpectedBills';
import PaidBillsList from './PaidBillsList';
import BudgetTracker from './BudgetTracker';
import SavingsGoals from './SavingsGoals';
import IncomeList from './IncomeList';
import FinanceActions from './FinanceActions';
import BillForm from './forms/BillForm';
import SavingsGoalForm from './forms/SavingsGoalForm'; // ייבוא טופס יעדים
import IncomeForm from './forms/IncomeForm';       // ייבוא טופס הכנסות
import BudgetForm from './forms/BudgetForm';       // ייבוא טופס תקציב

const UserFinanceSummary = lazy(() => import('./UserFinanceSummary'));

const FinanceManagement = () => {
  const { activeHome, loading } = useAppContext();
  const { showModal } = useModal();

  // פונקציות מרכזיות לפתיחת המודלים
  const openAddBillModal = () => showModal(<BillForm />, { title: 'הוספת חשבון חדש' });
  const openAddGoalModal = () => showModal(<SavingsGoalForm />, { title: 'הוספת יעד חיסכון חדש' });
  const openAddIncomeModal = () => showModal(<IncomeForm />, { title: 'הוספת הכנסה חדשה' });
  const openEditBudgetModal = () => showModal(<BudgetForm />, { title: 'עריכת תקציבים' });

  if (loading && !activeHome) {
    return <LoadingSpinner fullPage text="טוען נתונים פיננסיים..." />;
  }

  if (!activeHome || !activeHome.finances) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold">לא נמצאו נתונים</h3>
        <p className="text-gray-500 mt-2">לא נמצאו נתונים פיננסיים להצגה עבור הבית הפעיל.</p>
      </div>
    );
  }

  return (
    <div className="finance-page-layout">
      <h2 className="finance-page-title">
        <i className="fas fa-wallet"></i>
        ניהול כספים
      </h2>

      {/* כפתורי הפעולה הגלובליים (אופציונלי, אפשר להסיר אם רוצים רק כפתורים מקומיים) */}
      <div className="finance-actions-container">
        <FinanceActions />
      </div>

      <div className="finance-section summary-section">
        <FinancialSummary />
      </div>

      <div className="finance-grid">
        {/* עמודה ראשית */}
        <div className="finance-main-column">
          <section className="finance-section card">
            <h3 className="section-title">ניתוח הוצאות חודשי</h3>
            <ExpenseChart />
          </section>

          {/* יעדי חיסכון עם כפתור */}
          <section className="finance-section card">
            <div className="section-header">
              <h3 className="section-title">יעדי חיסכון</h3>
              <button onClick={openAddGoalModal} className="section-action-btn">
                <i className="fas fa-plus"></i> הוסף יעד
              </button>
            </div>
            <SavingsGoals />
          </section>

          <section className="finance-section card">
            <div className="section-header">
              <h3 className="section-title">הוצאות צפויות</h3>
              <button onClick={openAddBillModal} className="section-action-btn">
                <i className="fas fa-plus"></i> הוסף חשבון
              </button>
            </div>
            <ExpectedBills />
          </section>
        </div>

        {/* עמודת צד */}
        <div className="finance-sidebar-column">
          <section className="finance-section card">
            <h3 className="section-title">היסטוריית חשבונות ששולמו</h3>
            <PaidBillsList />
          </section>

          <section className="finance-section card">
            <h3 className="section-title">סיכום פיננסי אישי</h3>
            <Suspense fallback={<LoadingSpinner />}>
                <UserFinanceSummary />
            </Suspense>
          </section>
          
          {/* הכנסות עם כפתור */}
          <section className="finance-section card">
            <div className="section-header">
              <h3 className="section-title">הכנסות</h3>
              <button onClick={openAddIncomeModal} className="section-action-btn">
                <i className="fas fa-plus"></i> הוסף הכנסה
              </button>
            </div>
            <IncomeList />
          </section>
          
          {/* מעקב תקציב עם כפתור */}
          <section className="finance-section card">
            <div className="section-header">
                <h3 className="section-title">מעקב תקציב חודשי</h3>
                <button onClick={openEditBudgetModal} className="section-action-btn">
                    <i className="fas fa-edit"></i> ערוך תקציב
                </button>
            </div>
            <BudgetTracker />
          </section>
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement;
// client/src/features/finance/FinanceManagement.jsx (מתוקן)

import React, { Suspense, lazy } from 'react';
// ✅ תיקון: שימוש ב-useAppContext מהמקור הנכון, ובנתיבים מקוצרים
import { useAppContext } from '@/context/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';

// ייבוא קומפוננטות-הבן (הנתיבים היחסיים כאן תקינים כי הם באותה תיקייה)
import FinancialSummary from './FinancialSummary';
import ExpenseChart from './ExpenseChart';
import ExpectedBills from './ExpectedBills';
import PaidBillsList from './PaidBillsList';
import BudgetTracker from './BudgetTracker';
import SavingsGoals from './SavingsGoals';
import IncomeList from './IncomeList';
import FinanceSection from './FinanceSection';
import FinanceActions from './FinanceActions';

// שימוש ב-lazy loading נשאר תקין
const UserFinanceSummary = lazy(() => import('./UserFinanceSummary'));

const FinanceManagement = () => {
  // ✅ תיקון: שימוש ב-useAppContext במקום ב-useHome
  const { activeHome, loading } = useAppContext();

  if (loading && !activeHome) {
    return <LoadingSpinner />;
  }

  if (!activeHome || !activeHome.finances) {
    return <div className="p-4 text-center text-gray-500">לא נבחרו נתונים להצגה.</div>;
  }
  
  return (
    <section id="finance-management" className="p-4 md:p-6 bg-white rounded-lg shadow-md">
      <div className="list-title-container mb-4">
        <h3 className="text-xl font-bold text-gray-800" data-lang-key="finance_management">ניהול כספים</h3>
      </div>

      <FinanceActions />
      
      <div className="finance-section-content">
        <FinanceSection title="סיכום כללי">
          <FinancialSummary />
        </FinanceSection>

        <FinanceSection title="סיכום אישי">
          <Suspense fallback={<LoadingSpinner />}>
            <UserFinanceSummary />
          </Suspense>
        </FinanceSection>

        <FinanceSection title="הוצאות צפויות">
          <ExpectedBills />
        </FinanceSection>
        
        <FinanceSection title="מעקב תקציב">
          <BudgetTracker />
        </FinanceSection>
        
        <FinanceSection title="פירוט הוצאות לפי קטגוריה">
          <ExpenseChart />
        </FinanceSection>

        <FinanceSection title="היסטוריית חשבונות ששולמו">
          <PaidBillsList />
        </FinanceSection>

        <FinanceSection title="יעדי חיסכון">
          <SavingsGoals />
        </FinanceSection>
        
        <FinanceSection title="הכנסות">
          <IncomeList />
        </FinanceSection>
      </div>
    </section>
  );
};

export default FinanceManagement;
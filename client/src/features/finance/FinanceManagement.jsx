import React, { Suspense, lazy } from 'react';
import { useAppContext } from '@/context/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';

// Import child components
import FinancialSummary from './FinancialSummary';
import ExpenseChart from './ExpenseChart';
import ExpectedBills from './ExpectedBills';
import PaidBillsList from './PaidBillsList';
import BudgetTracker from './BudgetTracker';
import SavingsGoals from './SavingsGoals';
import IncomeList from './IncomeList';
import FinanceActions from './FinanceActions';

// Lazy load the user summary component for better performance
const UserFinanceSummary = lazy(() => import('./UserFinanceSummary'));

const FinanceManagement = () => {
  const { activeHome, loading } = useAppContext();

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
    <div className="finance-dashboard">
      <header className="dashboard-header">
        <h2 className="dashboard-title">
          <i className="fas fa-chart-line"></i>
          דשבורד פיננסי
        </h2>
        {/* Action buttons are now placed in a prominent header position */}
        <FinanceActions />
      </header>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column (takes 2/3 of the space on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="finance-card">
            <h3 className="card-title">סיכום חודשי כללי</h3>
            <FinancialSummary />
          </div>
          <div className="finance-card">
             <h3 className="card-title">הוצאות צפויות</h3>
            <ExpectedBills />
          </div>
          <div className="finance-card">
             <h3 className="card-title">מעקב תקציב חודשי</h3>
            <BudgetTracker />
          </div>
           <div className="finance-card">
             <h3 className="card-title">היסטוריית חשבונות ששולמו</h3>
            <PaidBillsList />
          </div>
        </div>

        {/* Sidebar Column (takes 1/3 of the space on large screens) */}
        <div className="lg:col-span-1 space-y-6">
           <div className="finance-card">
            <h3 className="card-title">ניתוח הוצאות חודשי</h3>
            <ExpenseChart />
          </div>
          <div className="finance-card">
             <h3 className="card-title">יעדי חיסכון</h3>
            <SavingsGoals />
          </div>
           <div className="finance-card">
            <h3 className="card-title">סיכום פיננסי אישי</h3>
            <Suspense fallback={<LoadingSpinner />}>
                <UserFinanceSummary />
            </Suspense>
          </div>
          <div className="finance-card">
             <h3 className="card-title">הכנסות</h3>
            <IncomeList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement;

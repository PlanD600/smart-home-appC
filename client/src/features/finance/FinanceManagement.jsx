import React, { useState, useEffect } from 'react';
import { useHome } from 'src/context/HomeContext'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import { useModal } from 'src/context/ModalContext'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import FinancialSummary from 'src/features/finance/FinancialSummary'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import ExpenseChart from 'src/features/finance/ExpenseChart'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import ExpectedBills from 'src/features/finance/ExpectedBills'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import BudgetTracker from 'src/features/finance/BudgetTracker'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import SavingsGoals from 'src/features/finance/SavingsGoals'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import PaidBillsList from 'src/features/finance/PaidBillsList'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import IncomeList from 'src/features/finance/IncomeList'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)

// Import the newly created forms
import BillForm from 'src/features/finance/forms/BillForm'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import BudgetForm from 'src/features/finance/forms/BudgetForm'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import SavingsGoalForm from 'src/features/finance/forms/SavingsGoalForm'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import IncomeForm from 'src/features/finance/forms/IncomeForm'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)
import CommentForm from 'src/features/common/CommentForm'; // נתיב יבוא תקין (תיקון: נתיב מוחלט מ-src)

/**
 * @file FinanceManagement component
 * @description Main component for managing financial aspects of the smart home,
 * integrating various financial sub-components and modal forms.
 */
const FinanceManagement = () => {
  const { currentHome, loading, updateCurrentHome } = useHome();
  const { showModal, hideModal, showAlert } = useModal();

  // State to manage the active user filter for financial data
  const [activeUser, setActiveUser] = useState('all');
  // State to manage the active view for the expense chart (monthly/yearly)
  const [activeChartView, setActiveChartView] = useState('monthly');
  // State to manage the month offset for paid bills list (0 for current month, -1 for previous, etc.)
  const [paidBillsMonthOffset, setPaidBillsMonthOffset] = useState(0);

  // Effect to set initial active user filter from local storage or default to 'all'
  useEffect(() => {
    const savedFilter = localStorage.getItem('financeActiveUserFilter');
    if (savedFilter) {
      setActiveUser(savedFilter);
    }
  }, []);

  // Effect to save active user filter to local storage when it changes
  useEffect(() => {
    localStorage.setItem('financeActiveUserFilter', activeUser);
  }, [activeUser]);

  /**
   * Handles changing the active user filter.
   * @param {string} user - The user to filter by, or 'all' for no filter.
   */
  const handleUserFilterChange = (user) => {
    setActiveUser(user);
  };

  /**
   * Opens the BudgetForm modal to manage monthly budgets.
   */
  const handleManageBudgets = () => {
    showModal(
      'ניהול תקציבים',
      <BudgetForm onClose={hideModal} />
    );
  };

  /**
   * Opens the SavingsGoalForm modal to add a new savings goal.
   */
  const handleAddSavingsGoal = () => {
    showModal(
      'הוספת יעד חיסכון חדש',
      <SavingsGoalForm onClose={hideModal} />
    );
  };

  /**
   * Opens the IncomeForm modal to add a new income entry.
   */
  const handleAddIncome = () => {
    showModal(
      'הוספת הכנסה חדשה',
      <IncomeForm onClose={hideModal} />
    );
  };

  /**
   * Opens the BillForm modal to add a new expected bill.
   */
  const handleAddExpectedBill = () => {
    showModal(
      'הוספת חשבון חדש',
      <BillForm onClose={hideModal} />
    );
  };

  /**
   * Handles editing an existing bill.
   * @param {string} billId - The ID of the bill to edit.
   */
  const handleEditBill = (billId) => {
    const billToEdit = currentHome?.finances?.expectedBills?.find(b => b.id === billId);
    if (billToEdit) {
      showModal(
        'עריכת חשבון',
        <BillForm onClose={hideModal} billToEdit={billToEdit} />
      );
    } else {
      showAlert("חשבון לא נמצא לעריכה.", "שגיאה");
    }
  };

  /**
   * Handles editing an existing income entry.
   * @param {string} incomeId - The ID of the income entry to edit.
   */
  const handleEditIncome = (incomeId) => {
    const incomeToEdit = currentHome?.finances?.income?.find(i => i.id === incomeId);
    if (incomeToEdit) {
      showModal(
        'עריכת הכנסה',
        <IncomeForm onClose={hideModal} incomeToEdit={incomeToEdit} />
      );
    } else {
      showAlert("הכנסה לא נמצאה לעריכה.", "שגיאה");
    }
  };

  /**
   * Handles adding an amount to a savings goal.
   * @param {string} goalId - The ID of the savings goal to update.
   */
  const handleAddToSavings = (goalId) => {
    const goal = currentHome?.finances?.savingsGoals?.find(g => g.id === goalId);
    if (!goal) {
      showAlert("יעד חיסכון לא נמצא.", "שגיאה");
      return;
    }

    const handleConfirmAdd = (amount) => {
      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        showAlert("נא להזין סכום חיובי.", "שגיאה");
        return;
      }
      const newAmount = goal.currentAmount + parseFloat(amount);
      const updatedFinances = {
        ...currentHome.finances,
        savingsGoals: currentHome.finances.savingsGoals.map(sg =>
          sg.id === goalId ? { ...sg, currentAmount: newAmount } : sg
        ),
      };
      updateCurrentHome({ finances: updatedFinances });
      showAlert(`נוסף ${parseFloat(amount).toLocaleString()} ${currentHome?.finances?.financeSettings?.currency || '₪'} ליעד "${goal.name}".`, "הצלחה");
      hideModal();
    };

    showModal(
      `הוספה ליעד "${goal.name}"`,
      <div>
        <label htmlFor="amount-to-add">הוסף סכום:</label>
        <input type="number" id="amount-to-add-input" placeholder="500" />
      </div>,
      [
        { text: 'הוסף', class: 'primary-action', onClick: () => handleConfirmAdd(document.getElementById('amount-to-add-input').value) },
        { text: 'בטל', class: 'secondary-action', onClick: hideModal },
      ]
    );
  };

  /**
   * Handles toggling the priority (isUrgent) status of a bill.
   * @param {string} billId - The ID of the bill.
   */
  const handleBillTogglePriority = (billId) => {
    if (!currentHome || !currentHome.finances) return;
    const updatedFinances = { ...currentHome.finances };
    updatedFinances.expectedBills = updatedFinances.expectedBills.map(bill =>
      bill.id === billId ? { ...bill, isUrgent: !bill.isUrgent } : bill
    );
    updateCurrentHome({ finances: updatedFinances });
  };

  /**
   * Handles marking a bill as paid.
   * @param {string} billId - The ID of the bill to mark as paid.
   * @param {string} billText - The text of the bill for confirmation.
   */
  const handlePayBill = (billId, billText) => {
    showAlert(`האם לשלם את חשבון "${billText}"?`, "אישור תשלום", () => {
      if (!currentHome || !currentHome.finances) return;

      const updatedFinances = { ...currentHome.finances };
      const billIndex = updatedFinances.expectedBills.findIndex(b => b.id === billId);

      if (billIndex > -1) {
        const [billToPay] = updatedFinances.expectedBills.splice(billIndex, 1);

        const paidBill = {
          ...billToPay,
          id: `paid_${Date.now()}`,
          datePaid: new Date().toISOString().split('T')[0],
          comment: billToPay.comment || '',
        };
        // Remove properties not needed in paidBills list
        delete paidBill.status;
        delete paidBill.dueDate;
        updatedFinances.paidBills.push(paidBill);

        // If recurring, add a new instance for the next period
        if (billToPay.recurring && billToPay.recurring.frequency) {
          const nextDueDate = new Date(billToPay.dueDate);
          if (billToPay.recurring.frequency === 'monthly') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          } else if (billToPay.recurring.frequency === 'yearly') {
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          }

          const recurringBill = {
            ...billToPay,
            id: `bill_${Date.now()}`,
            dueDate: nextDueDate.toISOString().split('T')[0],
            isUrgent: false,
          };
          updatedFinances.expectedBills.push(recurringBill);
        }
        updateCurrentHome({ finances: updatedFinances });
        showAlert("החשבון שולם בהצלחה!", "הצלחה");
      }
      hideModal();
    }, true); // The `true` here makes it a confirmation dialog
  };

  /**
   * Handles assigning a user to a financial item (bill, income).
   * @param {string} type - 'bill' or 'income'.
   * @param {string} itemId - The ID of the item.
   */
  const handleAssignUser = (type, itemId) => {
    if (!currentHome) return;

    let item;
    let itemsArrayName;
    if (type === 'bill') {
      item = currentHome.finances?.expectedBills?.find(i => i.id === itemId);
      itemsArrayName = 'expectedBills';
    } else if (type === 'income') {
      item = currentHome.finances?.income?.find(i => i.id === itemId);
      itemsArrayName = 'income';
    } else {
      return;
    }

    if (!item) {
      showAlert("פריט לא נמצא לשיוך משתמש.", "שגיאה");
      return;
    }

    const userOptions = [{ value: 'משותף', label: 'משותף' }, ...currentHome.users.map(user => ({ value: user, label: user }))];

    const handleConfirmAssign = (selectedUser) => {
      const updatedFinances = { ...currentHome.finances };
      updatedFinances[itemsArrayName] = updatedFinances[itemsArrayName].map(i =>
        i.id === itemId ? { ...i, assignedTo: selectedUser } : i
      );
      updateCurrentHome({ finances: updatedFinances });
      hideModal();
    };

    showModal(
      `שיוך "${item.text}"`,
      <div>
        <label htmlFor="assign-user-select">שייך פריט אל:</label>
        <select
          id="assign-user-select"
          defaultValue={item.assignedTo || 'משותף'} // Set default value
        >
          {userOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>,
      [
        { text: 'שמור', class: 'primary-action', onClick: () => handleConfirmAssign(document.getElementById('assign-user-select').value) },
        { text: 'בטל', class: 'secondary-action', onClick: hideModal },
      ]
    );
  };

  /**
   * Handles opening the CommentForm for a financial item.
   * @param {string} type - 'bill' or 'paidBill' or 'income'.
   * @param {string} itemId - The ID of the item.
   */
  const handleItemComment = (type, itemId) => {
    if (!currentHome || !currentHome.finances) return;

    let item;
    let itemsArrayName;
    if (type === 'bill') {
      item = currentHome.finances.expectedBills.find(i => i.id === itemId);
      itemsArrayName = 'expectedBills';
    } else if (type === 'paidBill') {
      item = currentHome.finances.paidBills.find(i => i.id === itemId);
      itemsArrayName = 'paidBills';
    } else if (type === 'income') {
        item = currentHome.finances.income.find(i => i.id === itemId);
        itemsArrayName = 'income';
    } else {
      return;
    }

    if (!item) {
      showAlert("פריט לא נמצא להוספת הערה.", "שגיאה");
      return;
    }

    const handleSaveComment = (comment) => {
      const updatedFinances = { ...currentHome.finances };
      updatedFinances[itemsArrayName] = updatedFinances[itemsArrayName].map(i =>
        i.id === itemId ? { ...i, comment: comment } : i
      );
      updateCurrentHome({ finances: updatedFinances });
      hideModal();
    };

    showModal(
      `הוספה/עריכת הערה עבור "${item.text}"`,
      <CommentForm initialComment={item.comment} onSave={handleSaveComment} onClose={hideModal} />
    );
  };


  /**
   * Handles deleting a financial item (bill, paid bill, income, savings goal).
   * @param {string} type - The type of item ('bill', 'paidBill', 'income', 'savingsGoal').
   * @param {string} itemId - The ID of the item to delete.
   * @param {string} itemText - The text of the item for confirmation.
   */
  const handleDeleteItem = (type, itemId, itemText) => {
    showAlert(`האם למחוק את "${itemText}"?`, "אישור מחיקה", () => {
      if (!currentHome || !currentHome.finances) return;

      const updatedFinances = { ...currentHome.finances };
      let targetArray;

      switch (type) {
        case 'bill':
          targetArray = updatedFinances.expectedBills;
          break;
        case 'paidBill':
          targetArray = updatedFinances.paidBills;
          break;
        case 'income':
          targetArray = updatedFinances.income;
          break;
        case 'savingsGoal':
          targetArray = updatedFinances.savingsGoals;
          break;
        default:
          return;
      }

      const index = targetArray.findIndex(i => i.id === itemId);
      if (index > -1) {
        targetArray.splice(index, 1);
        updateCurrentHome({ finances: updatedFinances });
        showAlert("הפריט נמחק בהצלחה.", "הצלחה");
      } else {
        showAlert("הפריט לא נמצא למחיקה.", "שגיאה");
      }
      hideModal(); // Close confirmation modal
    }, true); // The `true` here makes it a confirmation dialog
  };

  if (loading || !currentHome?.finances) {
    return <div className="modal-loader"><div className="spinner"></div></div>;
  }

  const { finances, users } = currentHome;

  // Filter users to display in the filter buttons, excluding 'משותף' if it's not a real user
  const filterUsers = ['all', 'משותף', ...users.filter(u => u !== 'משותף')];

  // Logic to render month display for paid bills list
  const targetDate = new Date();
  targetDate.setDate(1); // Set to 1st to avoid issues with month lengths
  targetDate.setMonth(targetDate.getMonth() + paidBillsMonthOffset);
  const paidBillsMonthDisplay = targetDate.toLocaleString('he-IL', { month: 'long', year: 'numeric' });

  return (
    <section id="finance-management" className="list-section active">
      <div className="list-title-container">
        <h3><span data-lang-key="finance_management">ניהול כספים</span></h3>
      </div>

      <div className="finance-section-content">
        <FinancialSummary finances={finances} />

        {/* User Filter Buttons */}
        <div className="list-filters">
          <label data-lang-key="filter_by_user">סנן לפי בן/בת בית:</label>
          <div className="user-filter-buttons">
            {filterUsers.map(user => (
              <button
                key={user}
                className={`user-filter-btn ${activeUser === user ? 'active' : ''}`}
                onClick={() => handleUserFilterChange(user)}
              >
                {user === 'all' ? 'כולם' : user}
              </button>
            ))}
          </div>
        </div>

        {/* Expense Analysis Chart */}
        <div id="finance-dashboard-area">
          <div className="chart-controls">
            <h4 data-lang-key="expense_analysis">ניתוח הוצאות</h4>
            <div className="chart-view-selector">
              <button
                className={`view-btn ${activeChartView === 'monthly' ? 'active' : ''}`}
                data-view="monthly"
                onClick={() => setActiveChartView('monthly')}
              >
                <i className="fas fa-chart-pie"></i> <span data-lang-key="monthly_view">חודשי (קטגוריות)</span>
              </button>
              <button
                className={`view-btn ${activeChartView === 'yearly' ? 'active' : ''}`}
                data-view="yearly"
                onClick={() => setActiveChartView('yearly')}
              >
                <i className="fas fa-chart-bar"></i> <span data-lang-key="yearly_view">שנתי</span>
              </button>
            </div>
          </div>
          <ExpenseChart finances={finances} view={activeChartView} />
        </div>

        <div id="bills-section">
          <div className="sub-section-header">
            <h4 data-lang-key="expected_bills">חשבונות לתשלום (חיובים צפויים)</h4>
            <button id="add-expected-bill-btn" className="header-style-button" onClick={handleAddExpectedBill}>
              <i className="fas fa-plus"></i> <span className="btn-text" data-lang-key="add_bill">הוסף חשבון</span>
            </button>
          </div>
          <ExpectedBills
            bills={finances.expectedBills}
            currency={finances.financeSettings.currency}
            activeUser={activeUser}
            onEditBill={handleEditBill}
            onPayBill={handlePayBill}
            onTogglePriority={handleBillTogglePriority}
            onAssignUser={handleAssignUser}
            onItemComment={handleItemComment}
            onDeleteItem={handleDeleteItem}
          />
        </div>
        <hr />

        <div id="budget-tracking-section">
          <div className="sub-section-header">
            <h4 data-lang-key="monthly_budget_tracking">מעקב תקציב חודשי</h4>
            <button id="manage-budgets-btn" className="header-style-button" onClick={handleManageBudgets}>
              <i className="fas fa-cogs"></i> <span className="btn-text" data-lang-key="manage_budgets">נהל תקציבים</span>
            </button>
          </div>
          <BudgetTracker finances={finances} />
        </div>
        <hr />

        <div id="savings-goals-section">
          <div className="sub-section-header">
            <h4 data-lang-key="savings_goals">יעדי חיסכון</h4>
            <button id="add-savings-goal-btn" className="header-style-button" onClick={handleAddSavingsGoal}>
              <i className="fas fa-bullseye"></i> <span className="btn-text" data-lang-key="add_new_goal">הוסף יעד חדש</span>
            </button>
          </div>
          <SavingsGoals
            goals={finances.savingsGoals}
            currency={finances.financeSettings.currency}
            onAddToGoal={handleAddToSavings}
            onDeleteItem={handleDeleteItem}
          />
        </div>
        <hr />

        <div id="paid-bills-section">
          <div className="sub-section-header">
            <h4 data-lang-key="paid_bills">תשלומים שבוצעו</h4>
            <div className="month-navigation">
              <button
                id="paid-bills-prev-month"
                className="header-style-button"
                onClick={() => setPaidBillsMonthOffset(prev => prev - 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
              <span id="paid-bills-month-display">{paidBillsMonthDisplay}</span>
              <button
                id="paid-bills-next-month"
                className="header-style-button"
                onClick={() => setPaidBillsMonthOffset(prev => prev + 1)}
                disabled={paidBillsMonthOffset >= 0}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>
          </div>
          <PaidBillsList
            paidBills={finances.paidBills}
            currency={finances.financeSettings.currency}
            activeUser={activeUser}
            monthOffset={paidBillsMonthOffset}
            onItemComment={handleItemComment}
            onDeleteItem={handleDeleteItem}
          />
        </div>
        <hr />

        <div id="income-section">
          <div className="sub-section-header">
            <h4 data-lang-key="income">הכנסות</h4>
            <button id="add-income-btn" className="header-style-button" onClick={handleAddIncome}>
              <i className="fas fa-plus"></i> <span className="btn-text" data-lang-key="add_income">הוסף הכנסה</span>
            </button>
          </div>
          <IncomeList
            income={finances.income}
            currency={finances.financeSettings.currency}
            activeUser={activeUser}
            onEditIncome={handleEditIncome}
            onAssignUser={handleAssignUser}
            onItemComment={handleItemComment}
            onDeleteItem={handleDeleteItem}
          />
        </div>
      </div>
    </section>
  );
};

export default FinanceManagement;

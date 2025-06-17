import React, { useState, useEffect } from 'react';
import { useHome } from 'src/context/HomeContext'; // נתיב יבוא תקין
import { useModal } from 'src/context/ModalContext'; // נתיב יבוא תקין

/**
 * @file IncomeForm component
 * @description Handles adding and editing income entries.
 * @param {object} props - Component props
 * @param {function} props.onClose - Function to close the modal
 * @param {object} [props.incomeToEdit] - Optional: The income object to edit
 */
const IncomeForm = ({ onClose, incomeToEdit }) => {
  const { currentHome, updateCurrentHome, loading } = useHome();
  const { showAlert } = useModal();

  // State to hold the form input values
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('משותף'); // Default to 'משותף'
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly'); // 'monthly' or 'yearly'

  // Effect hook to populate form fields if editing an existing income entry
  useEffect(() => {
    if (incomeToEdit) {
      setText(incomeToEdit.text || '');
      setAmount(incomeToEdit.amount || '');
      setDate(incomeToEdit.date || '');
      setAssignedTo(incomeToEdit.assignedTo || 'משותף');
      setIsRecurring(!!incomeToEdit.recurring); // Convert to boolean
      setFrequency(incomeToEdit.recurring?.frequency || 'monthly');
    } else {
      // Set default date to today for new income entries
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [incomeToEdit]);

  /**
   * Handles the form submission to add a new income entry or update an existing one.
   */
  const handleSubmit = async () => {
    // Validate inputs
    if (!text.trim()) {
      showAlert("תיאור ההכנסה הוא שדה חובה.", "שגיאה");
      return;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      showAlert("סכום הכנסה חייב להיות מספר חיובי.", "שגיאה");
      return;
    }
    if (!date) {
      showAlert("תאריך קבלה הוא שדה חובה.", "שגיאה");
      return;
    }

    // Ensure currentHome and finances object exist
    if (!currentHome || !currentHome.finances) {
      showAlert("Home data not available.", "Error");
      return;
    }

    // Create a deep copy of the finances object to modify
    const updatedFinances = { ...currentHome.finances };
    const parsedAmount = parseFloat(amount);

    const incomeData = {
      text: text.trim(),
      amount: parsedAmount,
      date: date,
      assignedTo: assignedTo,
      recurring: isRecurring ? { frequency: frequency } : null,
      comment: incomeToEdit?.comment || '', // Preserve existing comment if editing
    };

    if (incomeToEdit) {
      // Editing an existing income entry
      updatedFinances.income = updatedFinances.income.map(inc =>
        inc.id === incomeToEdit.id
          ? { ...inc, ...incomeData }
          : inc
      );
    } else {
      // Adding a new income entry
      updatedFinances.income.push({
        id: `inc_${Date.now()}`, // Generate a unique ID
        ...incomeData,
      });
    }

    try {
      // Update the home context, which will then send the updated finances to the backend
      await updateCurrentHome({ finances: updatedFinances });
      showAlert(`ההכנסה "${text.trim()}" נשמרה בהצלחה!`, "הצלחה");
      onClose(); // Close the modal after successful save
    } catch (error) {
      console.error("Failed to save income entry:", error);
      showAlert("Failed to save income entry. Please try again.", "Error");
    }
  };

  if (loading) {
    return <div className="modal-loader"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h4>{incomeToEdit ? 'עריכת הכנסה' : 'הוספת הכנסה חדשה'}</h4>
      <label htmlFor="income-name">תיאור ההכנסה:</label>
      <input
        type="text"
        id="income-name"
        placeholder="למשל: משכורת"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <label htmlFor="income-amount">סכום:</label>
      <input
        type="number"
        id="income-amount"
        placeholder="10000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <label htmlFor="income-date">תאריך קבלה:</label>
      <input
        type="date"
        id="income-date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      
      <label htmlFor="income-assign-user">שייך ל:</label>
      <select 
        id="income-assign-user" 
        value={assignedTo} 
        onChange={(e) => setAssignedTo(e.target.value)}
      >
        <option value="משותף">משותף</option>
        {currentHome?.users?.map(user => (
          <option key={user} value={user}>{user}</option>
        ))}
      </select>

      <div className="checkbox-container">
        <input
          type="checkbox"
          id="income-recurring-checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
        />
        <label htmlFor="income-recurring-checkbox">הכנסה קבועה</label>
        {isRecurring && (
          <select
            id="income-recurring-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="monthly">חודשי</option>
            <option value="yearly">שנתי</option>
          </select>
        )}
      </div>

      <div className="modal-footer">
        <button className="primary-action" onClick={handleSubmit}>
          {incomeToEdit ? 'שמור שינויים' : 'הוסף הכנסה'}
        </button>
        <button className="secondary-action" onClick={onClose}>
          בטל
        </button>
      </div>
    </div>
  );
};

export default IncomeForm;

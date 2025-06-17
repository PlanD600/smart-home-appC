import React, { useState, useEffect } from 'react';
import { useHome } from 'src/context/HomeContext'; // נתיב יבוא תקין
import { useModal } from 'src/context/ModalContext'; // נתיב יבוא תקין

/**
 * @file SavingsGoalForm component
 * @description Handles adding and editing savings goals.
 * @param {object} props - Component props
 * @param {function} props.onClose - Function to close the modal
 * @param {object} [props.goalToEdit] - Optional: The savings goal object to edit
 */
const SavingsGoalForm = ({ onClose, goalToEdit }) => {
  const { currentHome, updateCurrentHome, loading } = useHome();
  const { showAlert } = useModal();

  // State to hold the form input values
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');

  // Effect hook to populate form fields if editing an existing goal
  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name || '');
      setTargetAmount(goalToEdit.targetAmount || '');
      setCurrentAmount(goalToEdit.currentAmount || 0); // Default to 0 for current amount if not set
    }
  }, [goalToEdit]);

  /**
   * Handles the form submission to add a new savings goal or update an existing one.
   */
  const handleSubmit = async () => {
    // Validate inputs
    if (!name.trim()) {
      showAlert("שם היעד הוא שדה חובה.", "שגיאה");
      return;
    }
    if (isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0) {
      showAlert("סכום יעד חייב להיות מספר חיובי.", "שגיאה");
      return;
    }
    if (isNaN(parseFloat(currentAmount)) || parseFloat(currentAmount) < 0) {
      showAlert("סכום נוכחי חייב להיות מספר חיובי או אפס.", "שגיאה");
      return;
    }

    // Ensure currentHome and finances object exist
    if (!currentHome || !currentHome.finances) {
      showAlert("Home data not available.", "Error");
      return;
    }

    // Create a deep copy of the finances object to modify
    const updatedFinances = { ...currentHome.finances };
    const parsedTargetAmount = parseFloat(targetAmount);
    const parsedCurrentAmount = parseFloat(currentAmount);

    if (goalToEdit) {
      // Editing an existing goal
      updatedFinances.savingsGoals = updatedFinances.savingsGoals.map(goal =>
        goal.id === goalToEdit.id
          ? {
              ...goal,
              name: name.trim(),
              targetAmount: parsedTargetAmount,
              currentAmount: parsedCurrentAmount,
            }
          : goal
      );
    } else {
      // Adding a new goal
      updatedFinances.savingsGoals.push({
        id: `sg_${Date.now()}`, // Generate a unique ID
        name: name.trim(),
        targetAmount: parsedTargetAmount,
        currentAmount: parsedCurrentAmount,
      });
    }

    try {
      // Update the home context, which will then send the updated finances to the backend
      await updateCurrentHome({ finances: updatedFinances });
      showAlert(`יעד החיסכון "${name.trim()}" נשמר בהצלחה!`, "הצלחה");
      onClose(); // Close the modal after successful save
    } catch (error) {
      console.error("Failed to save savings goal:", error);
      showAlert("Failed to save savings goal. Please try again.", "Error");
    }
  };

  if (loading) {
    return <div className="modal-loader"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h4>{goalToEdit ? 'עריכת יעד חיסכון' : 'הוספת יעד חיסכון חדש'}</h4>
      <label htmlFor="goal-name">שם היעד:</label>
      <input
        type="text"
        id="goal-name"
        placeholder="למשל: חופשה ביוון"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="goal-target-amount">סכום יעד:</label>
      <input
        type="number"
        id="goal-target-amount"
        placeholder="15000"
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
      />

      <label htmlFor="goal-current-amount">סכום נוכחי (אופציונלי):</label>
      <input
        type="number"
        id="goal-current-amount"
        placeholder="0"
        value={currentAmount}
        onChange={(e) => setCurrentAmount(e.target.value)}
      />

      <div className="modal-footer">
        <button className="primary-action" onClick={handleSubmit}>
          {goalToEdit ? 'שמור שינויים' : 'הוסף יעד'}
        </button>
        <button className="secondary-action" onClick={onClose}>
          בטל
        </button>
      </div>
    </div>
  );
};

export default SavingsGoalForm;

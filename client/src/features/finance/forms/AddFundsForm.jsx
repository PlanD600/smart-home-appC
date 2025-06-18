import React, { useState } from 'react';
import { useHome } from '../../../context/HomeContext'; //
import { useModal } from '../../../context/ModalContext'; //

const AddFundsForm = ({ goal }) => {
  const { addFundsToSavingsGoal } = useHome(); // שינוי: מ-addFundsToGoal ל-addFundsToSavingsGoal
  const { hideModal } = useModal(); //
  const [amountToAdd, setAmountToAdd] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!amountToAdd) return;
    addFundsToSavingsGoal(goal._id, parseFloat(amountToAdd)); // שינוי: מ-addFundsToGoal ל-addFundsToSavingsGoal
    hideModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>הוסף סכום לחיסכון עבור "{goal.name}":</label>
      <input type="number" value={amountToAdd} onChange={e => setAmountToAdd(e.target.value)} placeholder="500" required autoFocus />
      <div className="modal-footer">
        <button type="submit" className="primary-action">הוסף לחיסכון</button>
      </div>
    </form>
  );
};

export default AddFundsForm;
import React, { useState } from 'react';
import { useHome } from '../../../context/HomeContext';
import { useModal } from '../../../context/ModalContext';

const SavingsGoalForm = () => {
  const { addGoal } = useHome();
  const { hideModal } = useModal();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    addGoal({ name, targetAmount: parseFloat(targetAmount), currentAmount: 0 });
    hideModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>שם היעד:</label>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="למשל: חופשה בתאילנד" required />
      <label>סכום יעד:</label>
      <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="20000" required />
      <div className="modal-footer">
        <button type="submit" className="primary-action">הוסף יעד</button>
      </div>
    </form>
  );
};

export default SavingsGoalForm;
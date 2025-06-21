import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext'; // ✅ Added missing import
import { useFinanceActions } from '@/context/FinanceActionsContext'; // ✅ Added correct import
import { useModal } from '@/context/ModalContext';

const SavingsGoalForm = () => {
  // ✅ Fixed: Use correct contexts
  const { saveSavingsGoal } = useFinanceActions();
  const { hideModal } = useModal();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    
    setIsLoading(true);
    try {
      await saveSavingsGoal({ 
        name, 
        targetAmount: parseFloat(targetAmount), 
        currentAmount: 0 
      });
      hideModal();
    } catch (error) {
      console.error('Error saving savings goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>שם היעד:</label>
      <input 
        type="text" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        placeholder="למשל: חופשה בתאילנד" 
        required 
      />
      <label>סכום יעד:</label>
      <input 
        type="number" 
        value={targetAmount} 
        onChange={e => setTargetAmount(e.target.value)} 
        placeholder="20000" 
        required 
      />
      <div className="modal-footer">
        <button type="submit" className="primary-action" disabled={isLoading}>
          {isLoading ? 'שומר...' : 'הוסף יעד'}
        </button>
      </div>
    </form>
  );
};

export default SavingsGoalForm;

import React from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import IncomeForm from './forms/IncomeForm';

const IncomeList = ({ income, currency }) => {
  const { showModal } = useModal();
  const openAddIncomeModal = () => showModal(<IncomeForm />, { title: 'הוספת הכנסה' });

  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <div id="income-section">
      <div className="sub-section-header">
        <h4 data-lang-key="income">הכנסות</h4>
        <button id="add-income-btn" className="header-style-button" onClick={openAddIncomeModal}>
          <i className="fas fa-plus"></i> <span className="btn-text">הוסף הכנסה</span>
        </button>
      </div>
      <div className="item-list">
        <ul id="income-list-ul">
          {income.length > 0 ? (
            income.map(inc => (
              <li key={inc._id}>
                <div className="item-text">
                  <span>{inc.text} - {inc.amount.toLocaleString()} {currency}</span>
                  <span className="item-details">
                    תאריך: {new Date(inc.date).toLocaleDateString('he-IL')}
                    {inc.assignedTo && ` | ע"י: ${inc.assignedTo}`}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li style={{ textAlign: 'center', color: '#777', padding: '15px' }}>לא הוזנו הכנסות.</li>
          )}
        </ul>
      </div>
      <div style={{textAlign: 'left', fontWeight: 'bold', marginTop: '10px', padding: '10px', borderTop: '1px solid #eee'}}>
          סה"כ הכנסות: {totalIncome.toLocaleString()} {currency}
      </div>
    </div>
  );
};

export default IncomeList;
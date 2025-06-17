import React from 'react';
import { useHome } from '../../context/HomeContext';
// We'll need to create IncomeForm later, for now just a button.
// import { useModal } from '../../context/ModalContext';
// import IncomeForm from './forms/IncomeForm';

const IncomeList = ({ income, currency }) => {
  // const { showModal } = useModal();
  // const openAddIncomeModal = () => showModal(<IncomeForm />, { title: 'הוספת הכנסה' });

  return (
    <div id="income-section">
      <div className="sub-section-header">
        <h4 data-lang-key="income">הכנסות</h4>
        <button id="add-income-btn" className="header-style-button" /*onClick={openAddIncomeModal}*/>
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
                  <span className="item-details">תאריך: {new Date(inc.date).toLocaleDateString('he-IL')}</span>
                </div>
              </li>
            ))
          ) : (
            <li style={{ textAlign: 'center', color: '#777' }}>לא הוזנו הכנסות.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default IncomeList;
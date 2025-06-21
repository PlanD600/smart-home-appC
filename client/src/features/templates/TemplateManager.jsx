import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext'; // ✅ Fixed import
import { useModal } from '../../context/ModalContext';

const TemplateForm = ({ onClose, templateToEdit, templateIndex }) => {
  // ✅ Fixed: Use useAppContext instead of useHome
  const { activeHome, updateHome, loading } = useAppContext();
  const { showModal, hideModal } = useModal();

  const [name, setName] = useState('');
  const [type, setType] = useState('shopping');
  const [items, setItems] = useState([{ text: '', amount: '', date: '' }]);

  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name || '');
      setType(templateToEdit.type || 'shopping');
      setItems(templateToEdit.items.map(item => ({
        text: item.text || '',
        amount: item.amount || '',
        date: item.date || '',
      })));
    }
  }, [templateToEdit]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setItems([{ text: '', amount: '', date: '' }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems(prevItems => [...prevItems, { text: '', amount: '', date: '' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showModal(<div>נא להזין שם לתבנית.</div>, { title: "שגיאה" });
      return;
    }

    const filteredItems = items.filter(item => item.text.trim() !== '');
    if (filteredItems.length === 0) {
      showModal(<div>נא להוסיף לפחות פריט אחד לתבנית.</div>, { title: "שגיאה" });
      return;
    }

    if (!activeHome) {
      showModal(<div>נתוני הבית אינם זמינים.</div>, { title: "שגיאה" });
      return;
    }

    const updatedTemplates = [...activeHome.templates || []];
    const newTemplate = {
      name: name.trim(),
      type: type,
      items: filteredItems.map(item => {
        const baseItem = { text: item.text.trim() };
        if (type === 'finance') {
          return {
            ...baseItem,
            amount: parseFloat(item.amount) || 0,
            date: item.date || '',
          };
        }
        return baseItem;
      }),
    };

    if (templateToEdit && templateIndex !== undefined) {
      updatedTemplates[templateIndex] = newTemplate;
    } else {
      updatedTemplates.push(newTemplate);
    }

    try {
      await updateHome({ templates: updatedTemplates });
      showModal(<div>התבנית "{name.trim()}" נשמרה בהצלחה!</div>, { title: "הצלחה" });
      onClose();
    } catch (error) {
      console.error("Failed to save template:", error);
      showModal(<div>שגיאה בשמירת התבנית. נסה שוב.</div>, { title: "שגיאה" });
    }
  };

  if (loading) {
    return <div className="modal-loader"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h4>{templateToEdit ? 'עריכת תבנית' : 'יצירת תבנית חדשה'}</h4>
      <label htmlFor="template-name">שם התבנית:</label>
      <input
        type="text"
        id="template-name"
        placeholder="לדוגמה: קניות שבועיות גדולות"
        value={name}
        onChange={handleNameChange}
      />

      <label>סוג התבנית:</label>
      <div className="template-type-selector">
        <button
          className={`type-selector-btn ${type === 'shopping' ? 'active' : ''}`}
          onClick={() => handleTypeChange('shopping')}
        >
          <i className="fas fa-shopping-cart" aria-hidden="true"></i> קניות
        </button>
        <button
          className={`type-selector-btn ${type === 'task' ? 'active' : ''}`}
          onClick={() => handleTypeChange('task')}
        >
          <i className="fas fa-tasks" aria-hidden="true"></i> מטלות
        </button>
        <button
          className={`type-selector-btn ${type === 'finance' ? 'active' : ''}`}
          onClick={() => handleTypeChange('finance')}
        >
          <i className="fas fa-wallet" aria-hidden="true"></i> כספים
        </button>
      </div>

      <label id="template-items-label">פריטים:</label>
      <div id="template-items-container">
        {items.map((item, index) => (
          <div className="template-item-field" key={index}>
            <input
              type="text"
              className="template-item-text-input"
              placeholder={`שם פריט ${index + 1}`}
              value={item.text}
              onChange={(e) => handleItemChange(index, 'text', e.target.value)}
            />
            {type === 'finance' && (
              <>
                <input
                  type="number"
                  className="template-item-number-input"
                  placeholder="סכום"
                  value={item.amount}
                  onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                />
                <input
                  type="date"
                  className="template-item-date-input"
                  value={item.date}
                  onChange={(e) => handleItemChange(index, 'date', e.target.value)}
                />
              </>
            )}
            {items.length > 1 && (
              <button
                type="button"
                className="action-btn delete-btn"
                onClick={() => handleRemoveItem(index)}
                aria-label={`מחק פריט ${index + 1}`}
              >
                <i className="far fa-trash-alt"></i>
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="secondary-action" style={{ marginTop: '10px', padding: '8px 12px' }} onClick={handleAddItem}>
        <i className="fas fa-plus" aria-hidden="true"></i> הוסף פריט
      </button>

      <div className="modal-footer">
        <button className="primary-action" onClick={handleSubmit}>
          {templateToEdit ? 'שמור שינויים' : 'צור תבנית'}
        </button>
        <button className="secondary-action" onClick={onClose}>
          בטל
        </button>
      </div>
    </div>
  );
};

export default TemplateForm;

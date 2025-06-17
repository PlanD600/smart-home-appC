import React, { useState, useEffect } from 'react';
import { useHome } from 'src/context/HomeContext'; // נתיב יבוא תקין בהתבסס על מבנה התיקיות
import { useModal } from 'src/context/ModalContext'; // נתיב יבוא תקין בהתבסס על מבנה התיקיות

/**
 * @file TemplateForm component
 * @description Allows creation and editing of shopping, task, and finance templates.
 * @param {object} props - Component props
 * @param {function} props.onClose - Function to close the modal
 * @param {object} [props.templateToEdit] - Optional: The template object to edit
 * @param {number} [props.templateIndex] - Optional: The index of the template in the array if editing
 */
const TemplateForm = ({ onClose, templateToEdit, templateIndex }) => {
  const { currentHome, updateCurrentHome, loading } = useHome();
  const { showAlert } = useModal();

  // State for form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('shopping'); // Default type
  const [items, setItems] = useState([{ text: '', amount: '', date: '' }]); // Array of template items

  // Effect to populate form fields if editing an existing template
  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name || '');
      setType(templateToEdit.type || 'shopping');
      // Ensure items have correct structure for editing
      setItems(templateToEdit.items.map(item => ({
        text: item.text || '',
        amount: item.amount || '',
        date: item.date || '',
      })));
    }
  }, [templateToEdit]);

  /**
   * Handles changes to the name input field.
   * @param {object} e - The event object
   */
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  /**
   * Handles changing the template type.
   * Resets items to a single empty item when type changes.
   * @param {string} newType - The selected template type ('shopping', 'task', 'finance')
   */
  const handleTypeChange = (newType) => {
    setType(newType);
    setItems([{ text: '', amount: '', date: '' }]); // Reset items when type changes
  };

  /**
   * Handles changes to an individual item's text, amount or date.
   * @param {number} index - The index of the item in the items array
   * @param {string} field - The field to update ('text', 'amount', 'date')
   * @param {string} value - The new value for the field
   */
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  /**
   * Adds a new empty item field to the template.
   */
  const handleAddItem = () => {
    setItems(prevItems => [...prevItems, { text: '', amount: '', date: '' }]);
  };

  /**
   * Removes an item from the template at a given index.
   * @param {number} index - The index of the item to remove
   */
  const handleRemoveItem = (index) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  /**
   * Handles form submission for creating or updating a template.
   */
  const handleSubmit = async () => {
    if (!name.trim()) {
      showAlert("נא להזין שם לתבנית.", "שגיאה");
      return;
    }

    const filteredItems = items.filter(item => item.text.trim() !== '');
    if (filteredItems.length === 0) {
      showAlert("נא להוסיף לפחות פריט אחד לתבנית.", "שגיאה");
      return;
    }

    if (!currentHome) {
      showAlert("נתוני הבית אינם זמינים.", "שגיאה");
      return;
    }

    const updatedTemplates = [...currentHome.templates || []];
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
      // Editing existing template
      updatedTemplates[templateIndex] = newTemplate;
    } else {
      // Adding new template
      updatedTemplates.push(newTemplate);
    }

    try {
      await updateCurrentHome({ templates: updatedTemplates });
      showAlert(`התבנית "${name.trim()}" נשמרה בהצלחה!`, "הצלחה");
      onClose(); // Close the modal
    } catch (error) {
      console.error("Failed to save template:", error);
      showAlert("שגיאה בשמירת התבנית. נסה שוב.", "שגיאה");
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

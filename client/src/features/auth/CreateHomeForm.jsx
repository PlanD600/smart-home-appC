import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext'; // תיקון נתיב הייבוא
import { useModal } from '../../context/ModalContext'; // תיקון נתיב הייבוא

const AVAILABLE_ICONS = [
  'fas fa-home',
  'fas fa-house-user',
  'fas fa-door-open',
  'fas fa-city',
  'fas fa-building',
  'fas fa-couch',
  'fas fa-tree',
  'fas fa-lightbulb',
];

const AVAILABLE_COLORS = [
  'card-color-1', // Mint Green
  'card-color-2', // Light Yellow
  'card-color-3', // Turquoise
];

const CreateHomeForm = ({ onClose }) => {
  const homeContext = useHome();
  console.log("CreateHomeForm: Value from useHome():", homeContext);

  const { createHome, loading, error } = homeContext;
  const { showModal, hideModal } = useModal();

  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !accessCode.trim()) {
      showModal(<div>נא למלא את כל השדות.</div>, { title: "שגיאה" });
      return;
    }

    if (typeof createHome !== 'function') {
      console.error("CreateHomeForm: createHome is NOT a function!", createHome);
      showModal(<div>שגיאה פנימית: פונקציית יצירת בית אינה זמינה.</div>, { title: "שגיאה" });
      return;
    }

    const success = await createHome({ name, accessCode, iconClass: selectedIcon, colorScheme: selectedColor });
    if (success) {
      showModal(<div>הבית "{name}" נוצר בהצלחה!</div>, { title: "הצלחה" });
      if (onClose) onClose(); // Close the modal on successful creation if onClose prop is provided
      hideModal(); // Also hide the modal via context
    } else {
      // Error message is already set by HomeContext and can be displayed here
      showModal(<div>שגיאה ביצירת הבית: {error || "נסה שוב."}</div>, { title: "שגיאה" });
    }
  };

  return (
    <div className="login-card-form">
      <h4>צור בית חדש</h4>
      <form onSubmit={handleSubmit}>
        <label htmlFor="homeName">שם הבית:</label>
        <input
          type="text"
          id="homeName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="לדוגמה: בית משפחת כהן"
          required
        />

        <label htmlFor="accessCode">קוד גישה (לשיתוף):</label>
        <input
          type="password"
          id="accessCode"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          placeholder="בחר קוד קל לזכירה"
          required
        />

        <label>בחר אייקון:</label>
        <div className="icon-selector">
          {AVAILABLE_ICONS.map((icon) => (
            <i
              key={icon}
              className={`${icon} ${selectedIcon === icon ? 'selected' : ''}`}
              onClick={() => setSelectedIcon(icon)}
            ></i>
          ))}
        </div>

        <label>בחר צבע כרטיס:</label>
        <div className="icon-selector">
          {AVAILABLE_COLORS.map((color) => (
            <div
              key={color}
              className={`color-box ${color} ${selectedColor === color ? 'selected' : ''}`}
              onClick={() => setSelectedColor(color)}
              // Inline style for color boxes for direct visual feedback
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: selectedColor === color ? '3px solid var(--dark-grey)' : '1px solid #ccc',
                cursor: 'pointer',
                display: 'inline-block',
                // Set background color for each color option
                backgroundColor: 
                    color === 'card-color-1' ? 'var(--mint-green)' :
                    color === 'card-color-2' ? 'var(--light-yellow)' :
                    color === 'card-color-3' ? 'var(--turquoise)' : 'transparent'
              }}
            ></div>
          ))}
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="modal-footer">
          <button type="submit" className="primary-action" disabled={loading}>
            {loading ? 'יוצר...' : 'צור בית'}
          </button>
          <button type="button" className="secondary-action" onClick={() => { hideModal(); if (onClose) onClose(); }}>
            בטל
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateHomeForm;
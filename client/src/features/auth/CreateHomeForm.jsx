import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';

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
  // ✅ Fixed: Use useAppContext instead of non-existent useHome
  const { createHome, loading, error } = useAppContext();
  const { showModal, hideModal } = useModal();

  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [initialUserName, setInitialUserName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedCurrency, setSelectedCurrency] = useState('ILS');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Enhanced validation
    if (!name.trim() || !accessCode.trim() || !initialUserName.trim()) {
      showModal(<div>נא למלא את כל השדות: שם בית, קוד גישה ושם משתמש ראשוני.</div>, { title: "שגיאה" });
      return;
    }

    if (accessCode.trim().length < 4) {
      showModal(<div>קוד הגישה חייב להיות באורך 4 תווים לפחות.</div>, { title: "שגיאה" });
      return;
    }

    // ✅ Fixed: Proper data structure for createHome
    const homeData = {
      name: name.trim(),
      accessCode: accessCode.trim(),
      iconClass: selectedIcon,
      colorClass: selectedColor,
      users: [{ name: initialUserName.trim(), isAdmin: true }],
      currency: selectedCurrency,
    };

    try {
      const success = await createHome(homeData);
      if (success) {
        showModal(<div>הבית "{name}" נוצר בהצלחה!</div>, { title: "הצלחה" });
        if (onClose) onClose();
        hideModal();
      }
    } catch (err) {
      showModal(<div>שגיאה ביצירת הבית: {err.message || "נסה שוב."}</div>, { title: "שגיאה" });
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="login-card-form">
      <h4>צור בית חדש</h4>
      <form onSubmit={handleSubmit}>
        {/* Form fields remain the same */}
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
          minLength={4}
        />

        <label htmlFor="initialUserName">שם המשתמש שלך (האדמין הראשון):</label>
        <input
          type="text"
          id="initialUserName"
          value={initialUserName}
          onChange={(e) => setInitialUserName(e.target.value)}
          placeholder="השם שלך"
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
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: selectedColor === color ? '3px solid var(--dark-grey)' : '1px solid #ccc',
                cursor: 'pointer',
                display: 'inline-block',
                backgroundColor:
                  color === 'card-color-1' ? 'var(--mint-green)' :
                  color === 'card-color-2' ? 'var(--light-yellow)' :
                  color === 'card-color-3' ? 'var(--turquoise)' : 'transparent'
              }}
            ></div>
          ))}
        </div>
        
        <label htmlFor="currency">מטבע:</label>
        <select
          id="currency"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
        >
          <option value="ILS">ש"ח</option>
          <option value="USD">דולר ארה"ב</option>
          <option value="EUR">אירו</option>
        </select>

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

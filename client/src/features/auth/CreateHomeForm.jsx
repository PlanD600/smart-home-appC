import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';

const AVAILABLE_ICONS = ["fas fa-home", "fas fa-user-friends", "fas fa-briefcase", "fas fa-heart", "fas fa-star"];

const CreateHomeForm = () => {
  // הוסף את שורת הלוג הזו מיד אחרי useHome()
  const homeContext = useHome();
  console.log("CreateHomeForm: Value from useHome():", homeContext);

  // עכשיו נבצע את ה-destructure מתוך המשתנה homeContext
  const { createHome, error } = homeContext; 
  const { hideModal } = useModal();

  const [name, setName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !accessCode) {
      alert('נא למלא שם וקוד כניסה.');
      return;
    }
    // וודא ש-createHome היא אכן פונקציה לפני הקריאה
    if (typeof createHome !== 'function') {
      console.error("CreateHomeForm: createHome is NOT a function!", createHome);
      alert('שגיאה פנימית: פונקציית יצירת בית אינה זמינה.');
      return;
    }

    const newHome = await createHome({ name, accessCode, iconClass: selectedIcon });
    if (newHome) {
      alert(`בית "${name}" נוצר בהצלחה!`);
      hideModal();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="new-home-name">שם הבית:</label>
      <input type="text" id="new-home-name" value={name} onChange={(e) => setName(e.target.value)} />

      <label htmlFor="new-home-code">קוד כניסה:</label>
      <input type="password" id="new-home-code" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />

      <label>בחר אייקון:</label>
      <div>
        {AVAILABLE_ICONS.map(icon => (
          <span 
            key={icon} 
            onClick={() => setSelectedIcon(icon)}
            style={{ 
              fontSize: '24px', 
              padding: '5px', 
              cursor: 'pointer',
              border: selectedIcon === icon ? '2px solid blue' : '2px solid transparent'
            }}
          >
            <i className={icon}></i>
          </span>
        ))}
      </div>
      
      {/* הצגת שגיאות מ-HomeContext */}
      {error && <p style={{color: 'red'}}>{error}</p>}

      <div className="modal-footer">
        <button type="submit" className="primary-action">צור</button>
        <button type="button" className="secondary-action" onClick={hideModal}>בטל</button>
      </div>
    </form>
  );
};

export default CreateHomeForm;
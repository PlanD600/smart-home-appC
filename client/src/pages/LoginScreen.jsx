import React, { useState, useEffect } from 'react';
import { useHome } from '../../../HomeContexttest';
import { useModal } from '../context/ModalContext';
import CreateHomeForm from '../features/auth/CreateHomeForm';
import './LoginScreen.css'; // ייבוא קובץ ה-CSS החדש

// אייקונים זמינים כפי שמוגדרים ב-CreateHomeForm וב-HomeSchema
const AVAILABLE_ICONS = [
  'fas fa-home', 'fas fa-house-user', 'fas fa-door-open', 'fas fa-city',
  'fas fa-building', 'fas fa-couch', 'fas fa-tree', 'fas fa-lightbulb',
];

// צבעים זמינים ליצירה (לא בשימוש בכניסה, אבל עדיין זמינים ליצירה)
const AVAILABLE_COLORS = [
  'card-color-1', 'card-color-2', 'card-color-3',
];

const LoginScreen = () => { // הגדרת הפונקצייה קומפוננטה פעם אחת בלבד
  const { homes, initializeHome, error, loading, activeHome, runIsolatedTest } = useHome(); // וודא runIsolatedTest זמין
  const { showModal } = useModal();

  // מצבי קלט עבור "3 המפתחות" (שם, אייקון, סיסמה)
  const [homeNameInput, setHomeNameInput] = useState('');
  const [selectedIconInput, setSelectedIconInput] = useState(AVAILABLE_ICONS[0]);
  const [accessCodeInput, setAccessCodeInput] = useState('');

  const [loginError, setLoginError] = useState(null); // שגיאות ספציפיות לכניסה

  // useEffect כדי לנקות שגיאות כאשר מצב הטעינה או השגיאה הכללית משתנים
  useEffect(() => {
    if (error || loading || activeHome) { 
      setLoginError(null); 
    }
    // === הוספת לוג כללי: הצגת רשימת הבתים שנטענה ===
    console.log("LoginScreen mounted/updated. Loaded homes:", homes);
    // ===============================================
  }, [error, loading, activeHome, homes]); // הוספנו homes לתלויות

  const handleLogin = async (e) => {
    e.preventDefault(); // מונע ריענון דף

    // ולידציה בסיסית
    if (!homeNameInput.trim() || !accessCodeInput.trim()) {
      setLoginError('נא למלא את שם הבית וקוד הגישה.');
      return;
    }
    // וודא ש-accessCodeInput הוא מחרוזת לפני קריאה ל-trim()
    if (String(accessCodeInput || '').trim().length < 4) {
      setLoginError('קוד הגישה חייב להיות באורך 4 תווים לפחות.');
      return;
    }

    setLoginError(null); // איפוס שגיאות לפני ניסיון חדש

    // === לוגים לאיתור בעיות בסינון הבית ===
    console.log("--- Attempting Login Filter ---");
    console.log("Input Name:", homeNameInput.trim());
    console.log("Input Icon:", selectedIconInput);
    console.log("Available Homes (for filter):", homes); // הצג את כל הבתים הזמינים
    
    // מציאת הבית התואם מתוך הבתים שנטענו (רק לפי שם ואייקון)
    const matchedHomes = homes.filter(home => {
      const nameMatch = home.name === homeNameInput.trim();
      const iconMatch = home.iconClass === selectedIconInput;
      // הוספת לוגים לכל השוואה של בית
      console.log(`  Checking home ID: ${home._id}, Name: "${home.name}" (Match: ${nameMatch}), Icon: "${home.iconClass}" (Match: ${iconMatch})`);
      return nameMatch && iconMatch;
    });

    console.log("Matched homes after filter:", matchedHomes);
    // ========================================

    if (matchedHomes.length === 0) {
      setLoginError('בית לא נמצא עם הפרטים שהוזנו.');
      return;
    }

    if (matchedHomes.length > 1) {
      setLoginError('נמצאו מספר בתים תואמים. אנא פנה למנהל המערכת.'); // מצב נדיר
      return;
    }

    const homeToLogin = matchedHomes[0];

    // נסה להתחבר לבית
    const success = await initializeHome(homeToLogin._id, accessCodeInput);
    // === לוג לאחרי קריאה ל-initializeHome ===
    console.log("initializeHome success status:", success);
    console.log("Global error after initializeHome:", error); // שימו לב: זה יציג את ה-error של הקונטקסט שעודכן בפעולה קודמת.
    // ========================================

    if (!success) {
      setLoginError(error || 'שגיאה כללית בהתחברות. נסה שוב.');
    } else {
      setLoginError(null); // אם ההתחברות הצליחה, אין צורך להציג שגיאה
    }
  };
  
  const openCreateHomeModal = () => {
    showModal(<CreateHomeForm />, { title: 'הוסף בית חדש' });
  };

  // אם ה-activeHome כבר קיים (המשתמש מחובר), אין צורך להציג את מסך הכניסה
  if (activeHome) {
    return null; 
  }

  // הצגת מסך טעינה בזמן שהבתים נטענים או מתבצעת כניסה אוטומטית
  if (loading) { 
    return (
      <div id="login-screen" className="screen active"> {/* שימוש בקלאסים מקוריים */}
        <p>טוען בתים...</p> 
      </div>
    );
  }

  // הרנדור הראשי של הקומפוננטה
  return (
    <div 
      id="login-screen" 
      className="screen active" // שימוש בקלאסים מה-CSS החיצוני
    >
      <div className="login-area">
        {/* כרטיס הכניסה הראשי הגדול */}
        <div className="main-login-card">
          <h1>התחבר <br />לבית שלך</h1>
          
          <form onSubmit={handleLogin}>
            <div>
              <label>
                <i className="fas fa-house-chimney"></i> בחר אייקון:
              </label>
              <div className="icon-selector">
                {AVAILABLE_ICONS.map(icon => (
                  <i
                    key={icon} // מפתח ייחודי
                    className={`${icon} ${selectedIconInput === icon ? 'selected' : ''}`}
                    onClick={() => setSelectedIconInput(icon)}
                    title={icon.replace('fas fa-', '')} /* Tooltip עם שם האייקון */
                  ></i>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="homeNameInput">
                <i className="fas fa-signature"></i> שם הבית:
              </label>
              <input
                type="text"
                id="homeNameInput"
                value={homeNameInput}
                onChange={(e) => setHomeNameInput(e.target.value)}
                placeholder="הכנס שם בית"
                required
              />
            </div>

            <div>
              <label htmlFor="accessCodeInput">
                <i className="fas fa-lock"></i> קוד גישה (4+ תווים):
              </label>
              <input
                type="password"
                id="accessCodeInput"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                placeholder="הזן קוד גישה"
                required
                minLength={4}
              />
            </div>
            
            {loginError && <p className="error-message">{loginError}</p>}
            {error && !loginError && <p className="error-message">שגיאה כללית: {error}</p>}

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-sign-in-alt"></i> כניסה לבית</>}
            </button>
          </form>
        </div>

        {/* כפתור "צור בית חדש" קטן יותר (אבל עדיין בולט ויפה) */}
        <div className="create-home-button-area">
          <button 
            onClick={openCreateHomeModal}
          >
            <i className="fas fa-plus-circle"></i>
            <span>צור בית חדש</span>
          </button>
        </div>
        
        {/* === כפתור זמני להפעלת בדיקת הבידוד === */}
        {/*
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button 
                onClick={runIsolatedTest} 
                disabled={loading}
                style={{
                    backgroundColor: '#FFC107', color: 'black', padding: '10px 20px',
                    border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                }}
            >
                הפעל בדיקת בידוד ליצירה/כניסה
            </button>
        </div>
        */}
        {/* ======================================= */}

      </div>
    </div>
  );
};

export default LoginScreen;

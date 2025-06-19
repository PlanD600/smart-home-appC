import React, { useEffect } from 'react';
import { HomeProvider, useHome } from './context/HomeContext'; // ייבוא HomeProvider ו-useHome
import { ModalProvider } from './context/ModalContext';     // ייבוא ModalProvider
import { useLanguage } from './context/LanguageContext';     // ייבוא useLanguage
import LoginScreen from './pages/LoginScreen';             // ייבוא LoginScreen
import MainAppScreen from './pages/MainAppScreen';         // ייבוא MainAppScreen (דף הבית לאחר כניסה)
import LoadingSpinner from './components/LoadingSpinner';  // ייבוא LoadingSpinner

/**
 * קומפוננטת AppContent מכילה את הלוגיקה העיקרית של רינדור היישום
 * בהתאם למצב ההתחברות (מחובר / לא מחובר).
 */
const AppContent = () => {
  // מושכים את activeHome, loading ו-logoutHome מ-HomeContext
  const { activeHome, loading, logoutHome } = useHome();
  const { setDirection } = useLanguage();

  // הגדרת כיוון השפה (מימין לשמאל עבור עברית)
  useEffect(() => {
    setDirection('rtl');
  }, [setDirection]);

  // הצגת ספינר טעינה כללי כאשר הנתונים הראשוניים נטענים
  // (לדוגמה, בזמן ניסיון התחברות אוטומטית ב-HomeContext)
  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  // החלטה האם להציג את מסך הכניסה או את היישום הראשי
  // אם activeHome הוא null, המשתמש אינו מחובר ויש להציג את מסך הכניסה
  const showLogin = !activeHome;

  return (
    <>
      {showLogin ? (
        <LoginScreen />
      ) : (
        // אם המשתמש מחובר (activeHome קיים), הצג את המסך הראשי של היישום
        <MainAppScreen />
        // הערה: אם תרצה כפתור התנתקות, תוכל למקם אותו בתוך MainAppScreen
        // או בכל קומפוננטה אחרת שנגישה לאחר התחברות, ולקרוא ל-logoutHome()
      )}
    </>
  );
};

/**
 * קומפוננטת App העוטפת את כל היישום בקונטקסטים הגלובליים.
 * זה מבטיח ש-HomeContext, ModalContext ו-LanguageContext יהיו זמינים
 * לכל הקומפוננטות בתוך AppContent.
 */
const App = () => (
  <ModalProvider>
    <HomeProvider>
      {/* AppContent משתמש ב-useHome, ולכן חייב להיות עטוף ב-HomeProvider */}
      <AppContent />
    </HomeProvider>
  </ModalProvider>
);

export default App;

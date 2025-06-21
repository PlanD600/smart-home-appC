import React, { useEffect } from 'react';
import { HomeProvider, useHome } from '../../HomeContexttest';
import { ModalProvider } from './context/ModalContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext'; // ייבוא LanguageProvider ו-useLanguage
import LoginScreen from './pages/LoginScreen';
import MainAppScreen from './pages/MainAppScreen';
import LoadingSpinner from './components/LoadingSpinner';

/**
 * קומפוננטת AppContent מכילה את הלוגיקה העיקרית של רינדור היישום
 * בהתאם למצב ההתחברות (מחובר / לא מחובר).
 */
const AppContent = () => {
  // מושכים את activeHome, loading מ-HomeContext
  const { activeHome, loading } = useHome();
  const { setDirection } = useLanguage();

  // הגדרת כיוון השפה (מימין לשמאל עבור עברית)
  useEffect(() => {
    setDirection('rtl');
  }, [setDirection]);

  // הצגת ספינר טעינה כללי כאשר הנתונים הראשוניים נטענים
  // נציג טעינה רק אם אנחנו באמת בתהליך טעינה ראשוני ו-activeHome עדיין לא הוגדר
  if (loading && !activeHome) { 
    return <LoadingSpinner fullPage={true} />;
  }

  // החלטה האם להציג את מסך הכניסה או את היישום הראשי
  // אם activeHome הוא null, המשתמש אינו מחובר ויש להציג את מסך הכניסה
  return (
    <>
      { !activeHome ? ( // אם אין בית פעיל, הצג את מסך ההתחברות
        <LoginScreen />
      ) : ( // אחרת, הצג את המסך הראשי של היישום
        <MainAppScreen />
      )}
    </>
  );
};

/**
 * קומפוננטת App העוטפת את כל היישום בקונטקסטים הגלובליים.
 * זה מבטיח שכל הקונטקסטים יהיו זמינים לכל הקומפוננטות בתוך AppContent.
 * סדר העטיפה חשוב: LanguageProvider -> ModalProvider -> HomeProvider.
 */
const App = () => (
  <LanguageProvider> {/* עטיפה של כל היישום ב-LanguageProvider */}
    <ModalProvider>
      <HomeProvider>
        <AppContent />
      </HomeProvider>
    </ModalProvider>
  </LanguageProvider>
);

export default App;

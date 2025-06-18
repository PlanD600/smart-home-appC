import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // ננסה לטעון שפה שמורה, אחרת ברירת מחדל לעברית
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('appLang') || 'he';
  });

  // הגדרת כיווניות הטקסט לפי השפה
  const [direction, setDirectionState] = useState(() => {
    return (localStorage.getItem('appLang') || 'he') === 'he' ? 'rtl' : 'ltr';
  });

  // פונקציה לשינוי השפה
  const changeLanguage = useCallback((lang) => {
    if (lang !== currentLang) {
      setCurrentLang(lang);
      localStorage.setItem('appLang', lang); // שמור את השפה ב-localStorage
      const newDirection = lang === 'he' ? 'rtl' : 'ltr';
      setDirectionState(newDirection);
    }
  }, [currentLang]);

  // פונקציה להגדרת הכיווניות - לשימוש חיצוני אם רוצים לשלוט בכיווניות בנפרד מהשפה
  const setDirection = useCallback((dir) => {
    setDirectionState(dir);
  }, []);

  // useEffect לניהול כיווניות גלובלית ברמת ה-body וה-html
  useEffect(() => {
    document.documentElement.lang = currentLang; // הגדרת lang attribute ב-<html>
    
    // ניהול class על ה-body כדי ש-CSS יוכל להגיב לכיווניות
    document.body.classList.remove('lang-rtl', 'lang-ltr');
    document.body.classList.add(`lang-${direction}`);
    
    // הגדרת dir attribute על ה-body
    document.body.dir = direction; 
  }, [currentLang, direction]);


  // אובייקט עם ערכי הקונטקסט שיהיו זמינים לכל הקומפוננטות העטופות
  const contextValue = {
    currentLang,
    changeLanguage,
    direction,
    setDirection, // אם תרצה שליטה ידנית יותר
    // ניתן להוסיף כאן פונקציית תרגום
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
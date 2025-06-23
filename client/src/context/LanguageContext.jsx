import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// A simple dictionary for translations. In a larger app, this would be in separate files.
// For example: /src/translations/en.json, /src/translations/he.json
const translations = {
  en: {
    welcome: "Welcome!",
    shopping_list: "Shopping List",
    task_list: "Task List",
    finance_management: "Finance Management",
    create_new_home: "Create a New Home",
    home_name: "Home Name",
    your_name: "Your Name",
  },
  he: {
    welcome: "ברוכים הבאים!",
    shopping_list: "רשימת קניות",
    task_list: "רשימת מטלות",
    finance_management: "ניהול כספים",
    create_new_home: "יצירת בית חדש",
    home_name: "שם הבית",
    your_name: "השם שלך",
  }
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

/**
 * Gets the initial language from localStorage, defaulting to Hebrew ('he').
 */
const getInitialLang = () => {
    try {
        const storedLang = localStorage.getItem('appLang');
        return storedLang && translations[storedLang] ? storedLang : 'he';
    } catch (error) {
        console.error("Could not access localStorage:", error);
        return 'he';
    }
};

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(getInitialLang);

  // The direction is derived from the current language.
  // useMemo prevents recalculating this on every render.
  const direction = useMemo(() => (currentLang === 'he' ? 'rtl' : 'ltr'), [currentLang]);

  // Effect to update the document's lang and dir attributes whenever the language changes.
  // This is crucial for accessibility and CSS styling.
  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = direction;
    // For compatibility with some CSS frameworks, also set it on the body.
    document.body.dir = direction;
  }, [currentLang, direction]);

  /**
   * Changes the application's current language and persists it to localStorage.
   */
  const changeLanguage = useCallback((lang) => {
    // Only update if the language is new and supported.
    if (lang !== currentLang && translations[lang]) {
      setCurrentLang(lang);
      try {
        localStorage.setItem('appLang', lang);
      } catch (error) {
        console.error("Could not save language to localStorage:", error);
      }
    }
  }, [currentLang]);
  
  /**
   * The translation function 't'.
   * Takes a key and returns the translated string for the current language.
   * Falls back to the key itself if the translation is not found.
   */
  const t = useCallback((key) => {
    return translations[currentLang]?.[key] || key;
  }, [currentLang]);

  // Memoize the context value to prevent unnecessary re-renders of consuming components.
  // Only a new object is created if one of the dependencies changes.
  const contextValue = useMemo(() => ({
    currentLang,
    direction,
    changeLanguage,
    t, // Provide the translation function through the context
  }), [currentLang, direction, changeLanguage, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

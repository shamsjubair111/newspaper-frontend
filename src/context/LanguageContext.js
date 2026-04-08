import React, { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'bn');
  // Calendar filter state — shared between Navbar (sets) and Homepage (reads)
  const [filterDate, setFilterDate] = useState(null); // { year, month } or null

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'bn' ? 'en' : 'bn';
      localStorage.setItem('lang', next);
      return next;
    });
  }, []);

  const clearFilter = useCallback(() => setFilterDate(null), []);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, filterDate, setFilterDate, clearFilter }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
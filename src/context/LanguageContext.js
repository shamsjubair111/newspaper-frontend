import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'bn');
  const [filterDate, setFilterDate] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/categories`),
        fetch(`${process.env.REACT_APP_API_URL}/api/subcategories`),
      ]);
      const catData = await catRes.json();
      const subData = await subRes.json();
      if (Array.isArray(catData)) setCategories(catData);
      if (Array.isArray(subData)) setSubcategories(subData);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'bn' ? 'en' : 'bn';
      localStorage.setItem('lang', next);
      return next;
    });
  }, []);

  const clearFilter = useCallback(() => setFilterDate(null), []);

  return (
    <LanguageContext.Provider value={{
      lang, toggleLang,
      filterDate, setFilterDate, clearFilter,
      categories, subcategories, refreshCategories: fetchCategories
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
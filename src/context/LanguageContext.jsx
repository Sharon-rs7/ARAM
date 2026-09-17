import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const availableLanguages = [
  { code: "en-IN", label: "English", nativeLabel: "English" },
  { code: "ta-IN", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "hi-IN", label: "Hindi", nativeLabel: "हिंदी" }
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("aram_lang") || "en-IN";
  });

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("aram_lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: "en-IN",
      changeLanguage: () => {},
      availableLanguages
    };
  }
  return context;
};

export default LanguageContext;

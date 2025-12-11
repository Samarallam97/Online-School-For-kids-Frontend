// src/contexts/AppContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { themes, translations } from "../config/uiConfig";

// إنشاء الـ Context
export const AppContext = createContext(null);

// الـ Provider (ده اللي هيتصدر كـ default)
const AppContextProvider = ({ children }) => {
  const validPages = [
    "login",
    "register",
    "forgot-password",
    "reset-password",
    "verification-sent",
  ];

  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem("currentAuthPage");
    return validPages.includes(saved) ? saved : "register";
  });

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("appLanguage");
    return saved === "ar" ? "ar" : "en";
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("appTheme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(
    () => localStorage.setItem("currentAuthPage", currentPage),
    [currentPage]
  );
  useEffect(() => {
    localStorage.setItem("appLanguage", language);
    document.documentElement.lang = language;
    document.body.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  useEffect(() => {
    localStorage.setItem("appTheme", theme);
    theme === "dark"
      ? document.body.classList.add("dark")
      : document.body.classList.remove("dark");
  }, [theme]);

  const isRTL = language === "ar";
  const colors = themes[theme];

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        language,
        setLanguage,
        theme,
        setTheme,
        isRTL,
        colors,
        translations,
        showToast: (msg, type = "info") => console.log("Toast:", msg, type), // مؤقت
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;

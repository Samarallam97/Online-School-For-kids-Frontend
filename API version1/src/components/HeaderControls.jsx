// src/components/HeaderControls.jsx
import React, { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { AppContext } from "../contexts/AppContext";

const HeaderControls = () => {
  const { theme, setTheme, language, setLanguage, colors, isRTL } =
    useContext(AppContext);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  const toggleLanguage = () => setLanguage(language === "en" ? "ar" : "en");

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        [isRTL ? "left" : "right"]: 16,
        display: "flex",
        gap: 10,
        zIndex: 1000,
      }}
    >
      <button
        onClick={toggleTheme}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          backgroundColor: colors.cardBg || "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {theme === "light" ? (
          <Moon size={18} color={colors.primary} />
        ) : (
          <Sun size={18} color={colors.primary} />
        )}
      </button>

      <button
        onClick={toggleLanguage}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          backgroundColor: colors.cardBg || "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          color: colors.primary,
        }}
      >
        {language.toUpperCase()}
      </button>
    </div>
  );
};

export default HeaderControls;

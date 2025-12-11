import React, { useContext } from "react";
import { themes } from "../config/uiConfig";
import { AppContext } from "../contexts/AppContext";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = true,
}) => {
  const { language } = useContext(AppContext);
  const isRTL = language === "ar";
  // Use themes from config directly to avoid circular dependency via context colors
  // But prefer reading colors from context in pages; here keep simple styling
  const colors = themes.light;

  return (
    <div style={{ marginBottom: "12px", width: "100%" }}>
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          color: colors.primary,
          fontSize: "13px",
          fontWeight: "500",
          textAlign: isRTL ? "right" : "left",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          padding: "10px",
          border: `1px solid ${colors.primary}`,
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          backgroundColor: "#fff",
          color: "#111",
          direction: isRTL ? "rtl" : "ltr",
        }}
      />
    </div>
  );
};

export default Input;

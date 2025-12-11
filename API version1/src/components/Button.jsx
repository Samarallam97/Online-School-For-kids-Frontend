import React, { useContext } from "react";
import { AppContext } from "../contexts/AppContext";

const Button = ({
  children,
  onClick,
  variant = "primary",
  fullWidth = true,
}) => {
  const { colors } = useContext(AppContext);
  const stylesMap = {
    primary: {
      backgroundColor: colors.buttonBg,
      color: colors.buttonText,
      border: "none",
    },
    outline: {
      backgroundColor: "transparent",
      color: colors.text,
      border: `2px solid ${colors.primary}`,
    },
    google: {
      backgroundColor: "#fff",
      color: "#757575",
      border: "1px solid #dadce0",
    },
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...stylesMap[variant],
        width: fullWidth ? "100%" : "auto",
        padding: "14px 20px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.18s ease",
        marginTop: "8px",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.opacity = "0.95";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </button>
  );
};

export default Button;

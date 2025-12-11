// src/components/Toast.jsx
import React from "react";

const Toast = ({ message, show }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "14px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        zIndex: 1000,
        fontWeight: "500",
        minWidth: "300px",
        animation: "slideIn 0.4s ease-out, fadeOut 0.5s 4.5s forwards",
      }}
    >
      {message}
    </div>
  );
};

const style = document.createElement("style");
style.innerHTML = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeOut {
    to { opacity: 0; transform: translateY(-20px); }
  }
`;
document.head.appendChild(style);

export default Toast;

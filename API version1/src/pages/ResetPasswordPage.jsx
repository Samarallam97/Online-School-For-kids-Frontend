// src/pages/ResetPasswordPage.jsx
import React, { useState, useContext } from "react";
import { AppContext } from "../contexts/AppContext";
import { translations } from "../config/uiConfig";
import Input from "../components/Input";
import Button from "../components/Button";
import { Lock } from "lucide-react";

const ResetPasswordPage = ({ onBackToLogin }) => {
  const { colors, language, showToast, theme } = useContext(AppContext);
  const t = translations[language];
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.password) e.password = t.passwordRequired;
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = t.passwordMismatch;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showToast(t.passwordReset, "success");
      setTimeout(() => onBackToLogin(), 2000);
    } catch (err) {
      showToast("Error resetting password", "error");
    } finally {
      setLoading(false);
    }
  };

  const iconColor = theme === "dark" ? "#111" : colors.primary;
  const subtitleColor = theme === "dark" ? "#111" : colors.text;

  return (
    <div
      style={{
        padding: 32,
        maxWidth: 420,
        width: "100%",
        boxSizing: "border-box",
        animation: "fadeIn 0.5s ease-out",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            width: 80,
            height: 80,
            backgroundColor: colors.logoBackground,
            borderRadius: "50%",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 2s infinite",
          }}
        >
          <Lock size={36} color={iconColor} />
        </div>
        <h2
          style={{
            color: colors.text,
            marginBottom: 8,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {t.resetPasswordTitle}
        </h2>
        <p style={{ color: subtitleColor, opacity: 0.9, fontSize: 14 }}>
          {t.resetPasswordSubtitle}
        </p>
      </div>

      <Input
        label={t.newPassword}
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder={t.enterNewPassword}
        icon={Lock}
      />
      {errors.password && (
        <div
          style={{
            color: colors.error,
            fontSize: 12,
            marginTop: -12,
            marginBottom: 12,
          }}
        >
          {errors.password}
        </div>
      )}

      <Input
        label={t.confirmPassword}
        type="password"
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData({ ...formData, confirmPassword: e.target.value })
        }
        placeholder={t.confirmPassword}
        icon={Lock}
      />
      {errors.confirmPassword && (
        <div
          style={{
            color: colors.error,
            fontSize: 12,
            marginTop: -12,
            marginBottom: 12,
          }}
        >
          {errors.confirmPassword}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "..." : t.resetPassword}
      </Button>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button
          onClick={onBackToLogin}
          style={{
            background: "none",
            border: "none",
            color: colors.primary,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← {t.backToLogin}
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

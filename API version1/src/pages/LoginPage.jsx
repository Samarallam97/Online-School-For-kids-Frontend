// src/pages/LoginPage.jsx
import React, { useContext, useState } from "react";
import { AppContext } from "../contexts/AppContext"; // ← مهم جدًا: named export
import { translations } from "../config/uiConfig";
import Input from "../components/Input";
import Button from "../components/Button";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = ({
  onSwitchToRegister,
  onForgotPassword,
  onVerificationSent,
}) => {
  const { colors, language, theme, showToast } = useContext(AppContext); // ← هيشتغل دلوقتي
  const t = translations[language];

  const [formData, setFormData] = useState({
    email: localStorage.getItem("loginEmail") || "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!emailRegex.test(formData.email))
      e.email = t.invalidEmail || "Invalid email";
    if (!formData.password)
      e.password = t.passwordRequired || "Password required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (formData.rememberMe) {
      localStorage.setItem("loginEmail", formData.email);
    } else {
      localStorage.removeItem("loginEmail");
    }

    // محاكاة إن الحساب محتاج تفعيل
    const needsVerification = true;
    if (needsVerification) {
      onVerificationSent?.();
      showToast?.("Verification email sent!", "success");
    } else {
      showToast?.("Logged in successfully!", "success");
    }
  };

  return (
    <div
      style={{ padding: 24, maxWidth: 360, width: "100%", margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div
          style={{
            width: 90,
            height: 90,
            backgroundColor: theme === "dark" ? "#fff" : colors.logoBackground,
            borderRadius: "50%",
            margin: "0 auto 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src="/Folder 1.png"
            alt="Logo"
            style={{ width: "80%", height: "80%", objectFit: "contain" }}
          />
        </div>
        <h2 style={{ color: colors.text, fontSize: 20, fontWeight: 600 }}>
          {t.welcomeBack || "Welcome Back"}
        </h2>
      </div>

      <Input
        label={t.email || "Email"}
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="name@example.com"
      />
      {errors.email && (
        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
          {errors.email}
        </div>
      )}

      <Input
        label={t.password || "Password"}
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {errors.password && (
        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
          {errors.password}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: colors.text,
          }}
        >
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) =>
              setFormData({ ...formData, rememberMe: e.target.checked })
            }
          />
          {t.rememberMe || "Remember me"}
        </label>
        <button
          onClick={onForgotPassword}
          style={{
            background: "none",
            border: "none",
            color: colors.primary,
            fontSize: 13,
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {t.forgotPassword || "Forgot password?"}
        </button>
      </div>

      <Button onClick={handleSubmit}>{t.login || "Login"}</Button>

      <div
        style={{
          textAlign: "center",
          marginTop: 16,
          fontSize: 13,
          color: colors.text,
        }}
      >
        {t.notRegistered || "Don't have an account?"}{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitchToRegister?.();
          }}
          style={{
            color: colors.primary,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          {t.register || "Register"}
        </a>
      </div>
    </div>
  );
};

export default LoginPage;

// src/pages/ForgotPasswordPage.jsx
import React, { useState, useContext } from "react";
import { AppContext } from "../contexts/AppContext";
import { translations } from "../config/uiConfig";
import Input from "../components/Input";
import Button from "../components/Button";
import { Mail, Lock } from "lucide-react";

const ForgotPasswordPage = ({ onBackToLogin, onGoToReset }) => {
  const { colors, language, theme, showToast } = useContext(AppContext);
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const e = {};
    if (!email) {
      e.email = t.emailRequired || "البريد الإلكتروني مطلوب";
    } else if (!emailRegex.test(email)) {
      e.email = t.invalidEmail || "البريد الإلكتروني غير صحيح";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // محاكاة إرسال الرابط (هتتبدل بالـ API بعدين)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      showToast?.(
        t.resetLinkSent || "تم إرسال رابط إعادة تعيين كلمة المرور",
        "success"
      );

      // نروح لصفحة Reset Password مباشرة
      onGoToReset?.();
    } catch (error) {
      showToast?.(t.errorOccurred || "حدث خطأ، حاول مرة أخرى", "error");
    } finally {
      setLoading(false);
    }
  };

  const iconColor = theme === "dark" ? "#111" : colors.primary;

  return (
    <div
      style={{
        padding: 32,
        maxWidth: 420,
        width: "100%",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* الأيقونة والعنوان */}
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
          {t.forgotPasswordTitle || "نسيت كلمة المرور؟"}
        </h2>
        <p style={{ color: colors.text, opacity: 0.8, fontSize: 14 }}>
          {t.forgotPasswordSubtitle ||
            "أدخل بريدك الإلكتروني وسيتم إرسال رابط لإعادة تعيين كلمة المرور"}
        </p>
      </div>

      {/* حقل الإيميل */}
      <Input
        label={t.email || "البريد الإلكتروني"}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.enterEmail || "أدخل بريدك الإلكتروني"}
        icon={Mail}
      />
      {errors.email && (
        <div
          style={{
            color: colors.error || "#e74c3c",
            fontSize: 12,
            marginTop: 4,
            marginBottom: 8,
          }}
        >
          {errors.email}
        </div>
      )}

      {/* زر الإرسال */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginBottom: 16 }}
      >
        {loading ? "..." : t.sendResetLink || "إرسال رابط إعادة التعيين"}
      </Button>

      {/* زر العودة لتسجيل الدخول */}
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
            textDecoration: "underline",
          }}
        >
          ← {t.backToLogin || "العودة لتسجيل الدخول"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

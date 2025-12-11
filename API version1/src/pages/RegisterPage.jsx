import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../contexts/AppContext";
import { translations } from "../config/uiConfig";
import Button from "../components/Button";
import Toast from "../components/Toast";
import { register } from "../api/authService";

// import { Link } from "react-router-dom";
// import EmailVerificationSent from "./EmailVerificationSentPage";

// Regex
const nameRegex = /^[A-Za-z\u0600-\u06FF ]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const { colors, language, theme } = useContext(AppContext);
  const t = translations[language];

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("registerForm");
    return saved
      ? JSON.parse(saved)
      : {
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          country: "",
          phoneNumber: "+20",
          role: "",
        };
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    localStorage.setItem("registerForm", JSON.stringify(formData));
  }, [formData]);

  const showToast = (message, duration = 8000) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), duration);
  };

  const validate = () => {
    const e = {};

    // الاسم
    if (!formData.name.trim()) {
      e.name = language === "ar" ? "اكتب اسمك" : "Enter your name";
    } else if (!nameRegex.test(formData.name)) {
      e.name =
        language === "ar"
          ? "الاسم لازم حروف بس"
          : "Name should contain letters only";
    }

    // الإيميل
    if (!formData.email.trim()) {
      e.email = language === "ar" ? "اكتب إيميلك" : "Enter your email";
    } else if (!emailRegex.test(formData.email)) {
      e.email = language === "ar" ? "الإيميل مش صحيح" : "Invalid email";
    }

    // البلد
    if (!formData.country) {
      e.country = language === "ar" ? "اختار بلدك" : "Select your country";
    }

    // الدور
    if (!formData.role) {
      e.role = language === "ar" ? "اختار دورك" : "Select your role";
    }

    // كلمة المرور
    if (!formData.password) {
      e.password = language === "ar" ? "اكتب كلمة مرور" : "Enter password";
    } else if (formData.password.length < 8) {
      e.password =
        language === "ar" ? "لازم 8 أحرف على الأقل" : "At least 8 characters";
    } else if (formData.password.length > 20) {
      e.password =
        language === "ar" ? "ما ينفعش أكتر من 20 حرف" : "Max 20 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      e.password =
        language === "ar"
          ? "لازم حرف كبير (A)"
          : "Include one uppercase letter";
    } else if (!/\d/.test(formData.password)) {
      e.password =
        language === "ar" ? "لازم رقم (0-9)" : "Include at least one number";
    } else if (!/[@$!%*?&#]/.test(formData.password)) {
      e.password =
        language === "ar"
          ? "لازم رمز خاص (!@#$...)"
          : "Include one special character";
    }

    // تأكيد كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      e.confirmPassword =
        language === "ar" ? "كلمة المرور مش متطابقة" : "Passwords don't match";
    }

    // رقم الجوال: 10 أرقام فقط بعد +20
    const phoneDigits = formData.phoneNumber.replace("+20", "");
    if (!phoneDigits) {
      e.phoneNumber =
        language === "ar" ? "اكتب رقم الجوال" : "Enter phone number";
    } else if (phoneDigits.length !== 10 || !/^[0-9]{10}$/.test(phoneDigits)) {
      e.phoneNumber =
        language === "ar" ? "يجب أن يكون 10 أرقام " : "Must be  10 digits";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGoogleLogin = () => console.log("Google login");

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phoneNumber: formData.phoneNumber,
      country: formData.country === "Saudi" ? "SaudiArabia" : formData.country,
      role:
        formData.role === "student"
          ? "Student"
          : formData.role === "parent"
          ? "Parent"
          : "ServiceProvider",
      preferredLanguage: language === "ar" ? "ar-EG" : "en-US",
    };

    register(payload)
      .then((res) => {
        if (res.data.success) {
          showToast(res.data.message, 8000);
          localStorage.removeItem("registerForm");
          setTimeout(() => onRegisterSuccess?.(), 3000);
        }
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          (language === "ar" ? "فشل التسجيل" : "Registration failed");
        showToast(msg, 8000);
      });
  };

  const fieldStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: `1.5px solid ${colors.inputBorder || "#ced4da"}`,
    backgroundColor: theme === "dark" ? "#333" : "#fff",
    color: colors.text,
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const labelStyle = {
    display: "block",
    marginBottom: 8,
    fontWeight: 600,
    color: colors.text,
    fontSize: 14,
  };

  return (
    <>
      <Toast message={toast.message} show={toast.show} />

      <div
        style={{ padding: 16, maxWidth: 600, width: "100%", margin: "0 auto" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 70,
              height: 70,
              backgroundColor:
                theme === "dark" ? "#fff" : colors.logoBackground,
              borderRadius: "50%",
              margin: "0 auto 12px",
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
        </div>

        {/* Google Button */}
        <Button variant="google" onClick={handleGoogleLogin}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
              />
              <path
                fill="#34A853"
                d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
              />
              <path
                fill="#FBBC05"
                d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
              />
              <path
                fill="#EA4335"
                d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
              />
            </svg>
            {t.continueWithGoogle}
          </span>
        </Button>

        <div
          style={{
            textAlign: "center",
            margin: "16px 0",
            color: colors.secondaryText,
            fontSize: 14,
          }}
        >
          {t.orSignUpWith}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {/* Name */}
          <div style={{ flex: "1 1 48%" }}>
            <label style={labelStyle}>{t.name}</label>
            <input
              style={fieldStyle}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && (
              <div
                style={{
                  color: "#e74c3c",
                  fontSize: 13,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {errors.name}
              </div>
            )}
          </div>

          {/* Email */}
          <div style={{ flex: "1 1 48%" }}>
            <label style={labelStyle}>{t.email}</label>
            <input
              style={fieldStyle}
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            {errors.email && (
              <div
                style={{
                  color: "#e74c3c",
                  fontSize: 13,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {errors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ flex: "1 1 48%" }}>
            <label style={labelStyle}>{t.password}</label>
            <input
              style={fieldStyle}
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            {errors.password && (
              <div
                style={{
                  color: "#e74c3c",
                  fontSize: 13,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ flex: "1 1 48%" }}>
            <label style={labelStyle}>{t.confirmPassword}</label>
            <input
              style={fieldStyle}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
            {errors.confirmPassword && (
              <div
                style={{
                  color: "#e74c3c",
                  fontSize: 13,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {errors.confirmPassword}
              </div>
            )}
          </div>

          {/* Country */}
          <div style={{ flex: "1 1 48%" }}>
            <label style={labelStyle}>{t.country}</label>
            <select
              style={fieldStyle}
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            >
              <option value="">
                {language === "ar" ? "البلد" : "Country"}
              </option>
              <option value="Egypt">
                {language === "ar" ? "مصر" : "Egypt"}
              </option>
              <option value="SaudiArabia">
                {language === "ar" ? "السعودية" : "Saudi Arabia"}
              </option>
              <option value="Other">
                {language === "ar" ? "أخرى" : "Other"}
              </option>
            </select>
            {errors.country && (
              <div
                style={{
                  color: "#e74c3c",
                  fontSize: 13,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {errors.country}
              </div>
            )}
          </div>

          {/* Role */}
          <div style={{ flex: "1 1 48%" }}>
            <label style={labelStyle}>
              {language === "ar" ? "الدور" : "Role"}
            </label>
            <select
              style={fieldStyle}
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option value="">
                {language === "ar" ? "اختار الدور" : "Select role"}
              </option>
              <option value="Student">
                {language === "ar" ? "طالب/ة" : "Student"}
              </option>
              <option value="Parent">
                {language === "ar" ? "ولي أمر" : "Parent"}
              </option>
              <option value="ServiceProvider">
                {language === "ar" ? "مقدم خدمة" : "Service Provider"}
              </option>
            </select>
            {errors.role && (
              <div
                style={{
                  color: "#e74c3c",
                  fontSize: 13,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {errors.role}
              </div>
            )}
          </div>

          {/* Phone Number - 10 أرقام فقط */}
          <div style={{ flex: "1 1 48%" }}>
            <label style={labelStyle}>{t.phoneNumber}</label>
            <div
              style={{
                display: "flex",
                borderRadius: 12,
                overflow: "hidden",
                border: `1.5px solid ${
                  errors.phoneNumber
                    ? "#e74c3c"
                    : colors.inputBorder || "#ced4da"
                }`,
                backgroundColor: theme === "dark" ? "#333" : "#fff",
              }}
            >
              <div
                style={{
                  padding: "12px 10px",
                  backgroundColor: theme === "dark" ? "#444" : "#e9ecef",
                  color: colors.text,
                  fontWeight: "600",
                  fontSize: 15,
                  borderRight: `1.5px solid ${colors.inputBorder || "#ced4da"}`,
                }}
              >
                +20
              </div>
              <input
                type="text"
                value={formData.phoneNumber.replace("+20", "")}
                onChange={(e) => {
                  let num = e.target.value.replace(/[^0-9]/g, "").slice(0, 10); // 10 أرقام فقط
                  setFormData({ ...formData, phoneNumber: "+20" + num });
                }}
                placeholder="*********"
                style={{
                  ...fieldStyle,
                  border: "none",
                  borderRadius: 0,
                  flex: 1,
                }}
                maxLength={10}
              />
            </div>

            {/* رسالة الخطأ + المثال تظهر فقط عند الخطأ */}
            {errors.phoneNumber && (
              <div
                style={{
                  color: "#e74c3c",
                  fontSize: 13,
                  marginTop: 6,
                  fontWeight: 500,
                }}
              >
                {errors.phoneNumber}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div style={{ flex: "1 1 48%", alignSelf: "flex-end" }}>
            <Button
              onClick={handleSubmit}
              style={{ width: "100%", padding: "15px", fontSize: 16 }}
            >
              {t.register}
            </Button>
          </div>
        </div>

        {/* Login Link */}
        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            color: colors.secondaryText,
            fontSize: 14,
          }}
        >
          {t.alreadyHaveAccount}{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin?.();
            }}
            style={{
              color: colors.primary,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {t.login}
          </a>
        </div>

        {/* <Link to="/email-verification-sent">Verify Email</Link> */}
      </div>
    </>
  );
};

export default RegisterPage;

// src/systems/AuthenticationSys.jsx
import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../contexts/AppContext";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import EmailVerificationSentPage from "../pages/EmailVerificationSentPage";
import HeaderControls from "../components/HeaderControls";
import Toast from "../components/Toast";
import {
  containerStyle,
  layoutStyle,
  leftPanelStyle,
  headingStyle,
  imageWrapperStyle,
  rightPanelStyle,
} from "../styles/App.styles";

export default function AuthenticationSys() {
  const { currentPage, setCurrentPage, colors, translations, language, isRTL } =
    useContext(AppContext);
  const t = translations[language];

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={containerStyle(colors, isRTL, language)}>
      <HeaderControls />

      <div style={layoutStyle(isMobile, isRTL)}>
        {/* الجانب الأيسر - يظهر فقط في login و register */}
        {(currentPage === "login" || currentPage === "register") && (
          <div style={leftPanelStyle(colors, isMobile)}>
            <h2 style={headingStyle(colors)}>
              {currentPage === "login" && t.welcomeBack}
              {currentPage === "register" &&
                (t.createAccount || "Create Your Account")}
            </h2>
            <div style={imageWrapperStyle}>
              <img
                src="/folder2.png"
                alt="illustration"
                style={{ width: "80%", height: "80%" }}
              />
            </div>
          </div>
        )}

        {/* الجانب الأيمن - دايمًا موجود */}
        <div
          style={{
            ...rightPanelStyle,
            // لو الـ left panel مخفي → خلي الـ right ياخد كامل العرض
            flex:
              (currentPage === "login" || currentPage === "register") &&
              !isMobile
                ? 1
                : "1 1 100%",
            maxWidth:
              (currentPage === "login" || currentPage === "register") &&
              !isMobile
                ? "none"
                : 480,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {currentPage === "login" && (
            <LoginPage
              onSwitchToRegister={() => setCurrentPage("register")}
              onForgotPassword={() => setCurrentPage("forgot-password")}
              onVerificationSent={() => setCurrentPage("verification-sent")}
            />
          )}

          {currentPage === "register" && (
            <RegisterPage
              onSwitchToLogin={() => setCurrentPage("login")}
              onRegisterSuccess={() => setCurrentPage("login")}
            />
          )}

          {currentPage === "forgot-password" && (
            <ForgotPasswordPage
              onBackToLogin={() => setCurrentPage("login")}
              onGoToReset={() => setCurrentPage("reset-password")}
            />
          )}

          {currentPage === "reset-password" && (
            <ResetPasswordPage onBackToLogin={() => setCurrentPage("login")} />
          )}

          {currentPage === "verification-sent" && (
            <EmailVerificationSentPage
              email="user@example.com"
              onBackToLogin={() => setCurrentPage("login")}
            />
          )}
        </div>
      </div>

      <Toast message="Welcome!" show={false} />
    </div>
  );
}

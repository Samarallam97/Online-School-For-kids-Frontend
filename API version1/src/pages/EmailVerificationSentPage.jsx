// src/pages/EmailVerificationSentPage.jsx
import React, { useContext } from "react";
import { AppContext } from "../contexts/AppContext";
import { translations } from "../config/uiConfig";
import Button from "../components/Button";
import { Mail, CheckCircle } from "lucide-react";

const EmailVerificationSentPage = ({ onBackToLogin, email = "" }) => {
  const { colors, language, showToast } = useContext(AppContext);
  const t = translations[language];

  const handleResend = () => {
    // هنا لما تربطي بالـ API هتعملي resend verification
    showToast(t.verificationResent || "Verification email resent!", "success");
  };

  return (
    <div
      style={{
        padding: 32,
        maxWidth: 420,
        width: "100%",
        boxSizing: "border-box",
        margin: "0 auto",
        textAlign: "center",
        animation: "fadeInUp 0.6s ease-out",
      }}
    >
      {/* أنيميشن الـ SVG */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        .floating {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      <div className="floating" style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 100,
            height: 100,
            backgroundColor: colors.success + "20",
            borderRadius: "50%",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle size={56} color={colors.success} />
        </div>
      </div>

      <h2
        style={{
          color: colors.text,
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {t.verificationSentTitle || "Check Your Email"}
      </h2>

      <p
        style={{
          color: colors.text,
          opacity: 0.85,
          fontSize: 15,
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        {t.verificationSentSubtitle || "A verification email has been sent to"}
        <br />
        <strong style={{ color: colors.primary }}>
          {email || "your email"}
        </strong>
      </p>

      <p
        style={{
          color: colors.secondaryText || "#777",
          fontSize: 14,
          marginBottom: 32,
        }}
      >
        {t.verificationSentNote ||
          "Please click the link in the email to verify your account."}
      </p>

      <Button onClick={handleResend} style={{ marginBottom: 16 }}>
        <Mail size={18} style={{ marginRight: 8 }} />
        {t.resendVerification || "Resend Email"}
      </Button>

      <div>
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
          ← {t.backToLogin}
        </button>

        {/* بشكل مؤقت */}
        <button
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
          check verification link clicked
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationSentPage;

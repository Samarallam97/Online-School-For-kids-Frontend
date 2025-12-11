// src/config/uiConfig.js

export const themes = {
  light: {
    background: "#FFFFFF",
    primary: "#0B132B",
    text: "#0B132B",
    secondaryText: "#6c757d",
    buttonBg: "#0B132B",
    buttonText: "#FFFFFF",
    inputBorder: "#ced4da",
    inputFocusBorder: "#0B132B",
    cardBg: "#F8F9FA",
    logoBackground: "#1a295748",
    error: "#e74c3c",
    success: "#27ae60",
    placeholder: "#999999",
  },
  dark: {
    background: "#1c2541",
    primary: "#FFFFFF",
    text: "#FFFFFF",
    secondaryText: "#b0b3c1",
    buttonBg: "#FFFFFF",
    buttonText: "#1c2541",
    inputBorder: "#49557a",
    inputFocusBorder: "#FFFFFF",
    cardBg: "#2d3561",
    logoBackground: "#ffffff30",
    error: "#e74c3c",
    success: "#27ae60",
    placeholder: "#888888",
  },
};

export const translations = {
  en: {
    // عام
    hello: "Hello",
    welcomeBack: "Welcome Back!",
    loginToAccount: "Login to your account",
    createAccount: "Create an Account",
    continueWithGoogle: "Continue with Google",
    orSignInWith: "or sign in with email",
    orSignUpWith: "or sign up with email",

    // الحقول
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    newPassword: "New Password",
    name: "Full Name",
    country: "Country",
    phoneNumber: "Phone Number",
    religion: "Religion",
    parentEmail: "Parent Email (Optional)",

    // Checkboxes & Links
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    notRegistered: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    registerNow: "Register now",
    loginHere: "Login here",

    // الأزرار
    login: "Login",
    register: "Register",
    sendResetLink: "Send Reset Link",
    resetPassword: "Reset Password",
    backToLogin: "Back to Login",

    // أنواع المستخدمين
    student: "Student",
    parent: "Parent",
    admin: "Admin",
    selectUserType: "Select User Type",

    // صفحة نسيت كلمة المرور
    forgotPasswordTitle: "Forgot Your Password?",
    forgotPasswordSubtitle:
      "Don't worry! Just enter your email and we'll send you a link to reset your password.",
    enterEmail: "Enter your email address",
    invalidEmail: "Please enter a valid email address",

    // صفحة إعادة تعيين كلمة المرور (Reset Password)
    resetPasswordTitle: "Create New Password",
    resetPasswordSubtitle:
      "Your new password must be different from the previously used password.",
    enterNewPassword: "Enter your new password",
    confirmNewPassword: "Confirm your new password",

    // رسائل التحقق من الصحة
    fieldRequired: "This field is required",
    passwordTooShort: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match",

    // رسائل النجاح والخطأ
    registrationSuccess: "Registration completed successfully!",
    redirectingToLogin: "Redirecting to login page...",
    resetLinkSent: "Reset link has been sent to your email",
    passwordResetSuccess: "Your password has been changed successfully!",
    errorOccurred: "An error occurred. Please try again.",

    verificationSentTitle: "Check Your Email",
    verificationSentSubtitle: "A verification email has been sent to",
    verificationSentNote:
      "Please click the link in the email to verify your account.",
    resendVerification: "Resend Email",

    emailVerified: "Email Verified Successfully!",
    emailVerifiedMessage: "Your email has been successfully verified.",
    verificationFailed: "Verification Failed",
    verificationFailedMessage:
      "The verification link is invalid or has expired.",
    completeYourProfile: "Complete Your Profile",
  },

  ar: {
    // عام
    hello: "مرحباً",
    welcomeBack: "مرحباً بعودتك!",
    loginToAccount: "تسجيل الدخول إلى حسابك",
    createAccount: "إنشاء حساب جديد",
    continueWithGoogle: "المتابعة باستخدام جوجل",
    orSignInWith: "أو سجل الدخول بالبريد الإلكتروني",
    orSignUpWith: "أو سجل بالبريد الإلكتروني",

    // الحقول
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    newPassword: "كلمة المرور الجديدة",
    name: "الاسم الكامل",
    country: "البلد",
    phoneNumber: "رقم الهاتف",
    religion: "الديانة",
    parentEmail: "بريد ولي الأمر (اختياري)",

    // Checkboxes & Links
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    notRegistered: "ليس لديك حساب؟",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    registerNow: "سجل الآن",
    loginHere: "تسجيل الدخول من هنا",

    // الأزرار
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    sendResetLink: "إرسال رابط إعادة التعيين",
    resetPassword: "تغيير كلمة المرور",
    backToLogin: "العودة إلى تسجيل الدخول",

    // أنواع المستخدمين
    student: "طالب",
    parent: "ولي أمر",
    admin: "مسؤول",
    selectUserType: "اختر نوع المستخدم",

    // صفحة نسيت كلمة المرور
    forgotPasswordTitle: "نسيت كلمة المرور؟",
    forgotPasswordSubtitle:
      "لا تقلق! فقط أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور.",
    enterEmail: "أدخل بريدك الإلكتروني",
    invalidEmail: "الرجاء إدخال بريد إلكتروني صحيح",

    // صفحة إعادة تعيين كلمة المرور (Reset Password)
    resetPasswordTitle: "إنشاء كلمة مرور جديدة",
    resetPasswordSubtitle:
      "يجب أن تكون كلمة المرور الجديدة مختلفة عن كلمات المرور السابقة.",
    enterNewPassword: "أدخل كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",

    // رسائل التحقق من الصحة
    fieldRequired: "هذا الحقل مطلوب",
    passwordTooShort: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    passwordMismatch: "كلمتا المرور غير متطابقتين",

    // رسائل النجاح والخطأ
    registrationSuccess: "تم التسجيل بنجاح!",
    redirectingToLogin: "جاري توجيهك إلى صفحة تسجيل الدخول...",
    resetLinkSent: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك",
    passwordResetSuccess: "تم تغيير كلمة المرور بنجاح!",
    errorOccurred: "حدث خطأ، حاول مرة أخرى.",

    verificationSentTitle: "تحقق من بريدك الإلكتروني",
    verificationSentSubtitle: "تم إرسال رسالة تحقق إلى",
    verificationSentNote: "يرجى الضغط على الرابط في البريد لتفعيل حسابك.",
    resendVerification: "إعادة إرسال البريد",

    emailVerified: "تم التحقق من البريد بنجاح!",
    emailVerifiedMessage: "تم التحقق من بريدك الإلكتروني بنجاح.",
    verificationFailed: "فشل التحقق",
    verificationFailedMessage: "رابط التحقق غير صالح أو منتهي الصلاحية.",
    completeYourProfile: "أكمل ملفك الشخصي",
  },
};

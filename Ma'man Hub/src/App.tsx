// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";

// // Auth Pages
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/RegisterPage";
// import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
// import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
// import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
// import AuthCallbackPage from "./pages/auth/AuthCallbackPage.tsx";
// import CompleteProfilePage from "./pages/auth/CompleteProfilePage";
// import RegistrationPendingPage from "./pages/auth/RegistrationPendingPage";


// // Profile Pages
// import AdminProfilePage from "./pages/profile/AdminProfilePage";
// import CreatorProfilePage from "./pages/profile/CreatorProfilePage";
// import ParentProfilePage from "./pages/profile/ParentProfilePage";
// import StudentProfilePage from "./pages/profile/StudentProfilePage";

// // spcialist pages
// import SpecialistProfilePage from "./pages/profile/SpecialistProfilePage";

// // Admin Pages
// import UserManagementPage from "./pages/admin/UserManagementPage";
// import ContentModerationPage from "./pages/admin/ContentModerationPage";

// // Creator Pages
// import UploadVideoPage from "./pages/creator/UploadVideoPage";
// import CreatorDashboardPage from "./pages/creator/CreatorDashboardPage";
// import AdminUserDetailPage from "@/pages/admin/AdminUserDetailPage";

// // Dashboard Pages
// import CourseProgressPage from "./pages/dashboard/CourseProgressPage";

// // Cart & Checkout Pages
// import CartPage from "./pages/cart/CartPage";
// import CheckoutPage from "./pages/checkout/CheckoutPage";
// import OrderConfirmationPage from "./pages/checkout/OrderConfirmationPage";

// // Course Pages
// import CoursesCatalogPage from "./pages/courses/CoursesCatalogPage";
// import CourseDetailPage from "./pages/courses/CourseDetailPage";
// import CoursePlayerPage from "./pages/courses/CoursePlayerPage";

// // Quiz Pages
// import QuizPage from "./pages/quiz/QuizPage";

// // Live Session Pages
// import LiveSessionPage from "./pages/live/LiveSessionPage";
// import GoLivePage from "./pages/creator/GoLivePage";
// import AcceptInvitePage from "./pages/profile/AcceptInvitePage";
// import PublicProfilePage from "./pages/profile/PublicProfilePage";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Index />} />

//           {/* Auth Routes */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//           <Route path="/reset-password" element={<ResetPasswordPage />} />
//           <Route path="/verify-email" element={<EmailVerificationPage />} />
//           <Route path="/auth/callback" element={<AuthCallbackPage  />} />
//           <Route path="/complete-profile" element={<CompleteProfilePage   />} />
//           <Route path="/registration-pending" element={<RegistrationPendingPage />} />




//           {/* Creator Routes */}
//           <Route path="/creator" element={<CreatorDashboardPage />} />
//           <Route path="/content-creator/profile" element={<CreatorProfilePage />} />
//           <Route path="/creator/upload" element={<UploadVideoPage />} />
//           <Route path="/creator/go-live" element={<GoLivePage />} />

//           {/* Admin Routes */}
//           <Route path="/admin/users" element={<UserManagementPage />} />
//           <Route path="/admin/profile" element={<AdminProfilePage />} />
//           <Route path="/admin/moderation" element={<ContentModerationPage />} />
//           <Route path="/admin/users/:userId" element={<AdminUserDetailPage />} />
          

//           {/* Parent Routes */}
//           <Route path="/parent/profile" element={<ParentProfilePage />} />

//           <Route path="/profile/:userId" element={<PublicProfilePage />} />
          
//           {/* Specialist Routes */}
//           <Route
//             path="/specialist/profile"
//             element={<SpecialistProfilePage />}
//           />

//           {/* Student Dashboard Routes */}
//           <Route path="student/profile" element={<StudentProfilePage />} />
//           <Route path="student/accept-invite" element={<AcceptInvitePage />} />


//           {/* Cart & Checkout Routes */}
//           <Route path="/cart" element={<CartPage />} />
//           <Route path="/checkout" element={<CheckoutPage />} />
//           <Route
//             path="/order-confirmation"
//             element={<OrderConfirmationPage />}
//           />

//           {/* Live Session Routes */}
//           <Route path="/live/:sessionId" element={<LiveSessionPage />} />

//           {/* Course Routes */}
//           <Route path="/courses" element={<CoursesCatalogPage />} />
//           <Route path="/courses/:courseId" element={<CourseDetailPage />} />
//           <Route
//             path="/course/:courseId/learn"
//             element={<CoursePlayerPage />}
//           />
//           <Route
//             path="/course/:courseId/progress"
//             element={<CourseProgressPage />}
//           />
//           <Route path="/course/:courseId/quiz/:quizId" element={<QuizPage />} />

//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./ProtectedRoute.tsx";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage.tsx";
import CompleteProfilePage from "./pages/auth/CompleteProfilePage";
import RegistrationPendingPage from "./pages/auth/RegistrationPendingPage";

// Profile Pages
import AdminProfilePage from "./pages/profile/AdminProfilePage";
import CreatorProfilePage from "./pages/profile/CreatorProfilePage";
import ParentProfilePage from "./pages/profile/ParentProfilePage";
import StudentProfilePage from "./pages/profile/StudentProfilePage";
import SpecialistProfilePage from "./pages/profile/SpecialistProfilePage";

// Admin Pages
import UserManagementPage from "./pages/admin/UserManagementPage";
import ContentModerationPage from "./pages/admin/ContentModerationPage";
import AdminUserDetailPage from "@/pages/admin/AdminUserDetailPage";

// Creator Pages
import UploadVideoPage from "./pages/creator/UploadVideoPage";
import CreatorDashboardPage from "./pages/creator/CreatorDashboardPage";
import GoLivePage from "./pages/creator/GoLivePage";

// Dashboard Pages
import CourseProgressPage from "./pages/dashboard/CourseProgressPage";

// Cart & Checkout Pages
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrderConfirmationPage from "./pages/checkout/OrderConfirmationPage";

// Course Pages
import CoursesCatalogPage from "./pages/courses/CoursesCatalogPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import CoursePlayerPage from "./pages/courses/CoursePlayerPage";

// Quiz Pages
import QuizPage from "./pages/quiz/QuizPage";

// Live Session Pages
import LiveSessionPage from "./pages/live/LiveSessionPage";
import AcceptInvitePage from "./pages/profile/AcceptInvitePage";
import PublicProfilePage from "./pages/profile/PublicProfilePage";

const queryClient = new QueryClient();

const ADMIN                = ["Admin"]                                                          as const;
const CREATOR              = ["ContentCreator", "Admin"]                                        as const;
const SPECIALIST           = ["Specialist", "Admin"]                                            as const;
const PARENT               = ["Parent", "Admin"]                                                as const;
const STUDENT_FAMILY       = ["Student", "Parent", "Admin"]                                     as const;
const ALL_AUTHENTICATED    = ["Student", "Parent", "Specialist", "ContentCreator", "Admin"]     as const;
const BUYERS               = ["Student", "Parent", "Admin"]                                     as const;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>

          {/* ── Public ──────────────────────────────────────────────────────── */}
          <Route path="/"                    element={<Index />} />
          <Route path="/courses"             element={<CoursesCatalogPage />} />
          <Route path="/courses/:courseId"   element={<CourseDetailPage />} />
          <Route path="/profile/:userId"     element={<PublicProfilePage />} />

          {/* ── Auth (no protection needed) ─────────────────────────────────── */}
          <Route path="/login"                   element={<LoginPage />} />
          <Route path="/register"                element={<RegisterPage />} />
          <Route path="/forgot-password"         element={<ForgotPasswordPage />} />
          <Route path="/reset-password"          element={<ResetPasswordPage />} />
          <Route path="/verify-email"            element={<EmailVerificationPage />} />
          <Route path="/auth/callback"           element={<AuthCallbackPage />} />
          <Route path="/complete-profile"        element={<CompleteProfilePage />} />
          <Route path="/registration-pending"    element={<RegistrationPendingPage />} />

          {/* ── Admin ───────────────────────────────────────────────────────── */}
          {/* role: "Admin" */}
          <Route path="/admin/profile"
            element={<ProtectedRoute allowedRoles={[...ADMIN]} element={<AdminProfilePage />} />}
          />
          <Route path="/admin/users"
            element={<ProtectedRoute allowedRoles={[...ADMIN]} element={<UserManagementPage />} />}
          />
          <Route path="/admin/users/:userId"
            element={<ProtectedRoute allowedRoles={[...ADMIN]} element={<AdminUserDetailPage />} />}
          />
          <Route path="/admin/moderation"
            element={<ProtectedRoute allowedRoles={[...ADMIN]} element={<ContentModerationPage />} />}
          />

          {/* ── Creator ─────────────────────────────────────────────────────── */}
          {/* role: "ContentCreator" | "Admin" */}
          <Route path="/creator"
            element={<ProtectedRoute allowedRoles={[...CREATOR]} element={<CreatorDashboardPage />} />}
          />
          <Route path="/content-creator/profile"
            element={<ProtectedRoute allowedRoles={[...CREATOR]} element={<CreatorProfilePage />} />}
          />
          <Route path="/creator/upload"
            element={<ProtectedRoute allowedRoles={[...CREATOR]} element={<UploadVideoPage />} />}
          />
          <Route path="/creator/go-live"
            element={<ProtectedRoute allowedRoles={[...CREATOR]} element={<GoLivePage />} />}
          />

          {/* ── Specialist ──────────────────────────────────────────────────── */}
          {/* role: "Specialist" | "Admin" */}
          <Route path="/specialist/profile"
            element={<ProtectedRoute allowedRoles={[...SPECIALIST]} element={<SpecialistProfilePage />} />}
          />

          {/* ── Parent ──────────────────────────────────────────────────────── */}
          {/* role: "Parent" | "Admin" */}
          <Route path="/parent/profile"
            element={<ProtectedRoute allowedRoles={[...PARENT]} element={<ParentProfilePage />} />}
          />

          {/* ── Student ─────────────────────────────────────────────────────── */}
          {/* role: "Student" | "Parent" | "Admin" */}
          <Route path="student/profile"
            element={<ProtectedRoute allowedRoles={[...STUDENT_FAMILY]} element={<StudentProfilePage />} />}
          />
          <Route path="student/accept-invite"
            element={<ProtectedRoute allowedRoles={[...STUDENT_FAMILY]} element={<AcceptInvitePage />} />}
          />

          {/* ── Course learning ─────────────────────────────────────────────── */}
          {/* role: any authenticated user */}
          <Route path="/course/:courseId/learn"
            element={<ProtectedRoute allowedRoles={[...ALL_AUTHENTICATED]} element={<CoursePlayerPage />} />}
          />
          <Route path="/course/:courseId/progress"
            element={<ProtectedRoute allowedRoles={[...ALL_AUTHENTICATED]} element={<CourseProgressPage />} />}
          />
          <Route path="/course/:courseId/quiz/:quizId"
            element={<ProtectedRoute allowedRoles={[...ALL_AUTHENTICATED]} element={<QuizPage />} />}
          />

          {/* ── Live sessions ───────────────────────────────────────────────── */}
          {/* role: any authenticated user */}
          <Route path="/live/:sessionId"
            element={<ProtectedRoute allowedRoles={[...ALL_AUTHENTICATED]} element={<LiveSessionPage />} />}
          />

          {/* ── Cart & Checkout ─────────────────────────────────────────────── */}
          {/* role: "Student" | "Parent" | "Admin" */}
          <Route path="/cart"
            element={<ProtectedRoute allowedRoles={[...BUYERS]} element={<CartPage />} />}
          />
          <Route path="/checkout"
            element={<ProtectedRoute allowedRoles={[...BUYERS]} element={<CheckoutPage />} />}
          />
          <Route path="/order-confirmation"
            element={<ProtectedRoute allowedRoles={[...BUYERS]} element={<OrderConfirmationPage />} />}
          />

          {/* ── 404 ─────────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
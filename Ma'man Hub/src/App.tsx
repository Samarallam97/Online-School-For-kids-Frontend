import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";

// Profile Pages
import AdminProfilePage from "./pages/profile/AdminProfilePage";
import CreatorProfilePage from "./pages/profile/CreatorProfilePage";
import ParentProfilePage from "./pages/profile/ParentProfilePage";
import StudentProfilePage from "./pages/profile/StudentProfilePage";

// spcialist pages
import SpecialistProfilePage from "./pages/profile/SpecialistProfilePage";

// Admin Pages
import UserManagementPage from "./pages/admin/UserManagementPage";
import ContentModerationPage from "./pages/admin/ContentModerationPage";

// Creator Pages
import UploadVideoPage from "./pages/creator/UploadVideoPage";
import CreatorDashboardPage from "./pages/creator/CreatorDashboardPage";

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
import GoLivePage from "./pages/creator/GoLivePage";
import AcceptInvitePage from "./pages/profile/AcceptInvitePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />

          {/* Creator Routes */}
          <Route path="/creator" element={<CreatorDashboardPage />} />
          <Route path="/creator/profile" element={<CreatorProfilePage />} />
          <Route path="/creator/upload" element={<UploadVideoPage />} />
          <Route path="/creator/go-live" element={<GoLivePage />} />

          {/* Admin Routes */}
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          <Route path="/admin/moderation" element={<ContentModerationPage />} />

          {/* Parent Routes */}
          <Route path="/parent/profile" element={<ParentProfilePage />} />

          {/* Specialist Routes */}
          <Route
            path="/specialist/profile"
            element={<SpecialistProfilePage />}
          />

          {/* Student Dashboard Routes */}
          <Route path="student/profile" element={<StudentProfilePage />} />
          <Route path="student/accept-invite" element={<AcceptInvitePage />} />


          {/* Cart & Checkout Routes */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/order-confirmation"
            element={<OrderConfirmationPage />}
          />

          {/* Live Session Routes */}
          <Route path="/live/:sessionId" element={<LiveSessionPage />} />

          {/* Course Routes */}
          <Route path="/courses" element={<CoursesCatalogPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route
            path="/course/:courseId/learn"
            element={<CoursePlayerPage />}
          />
          <Route
            path="/course/:courseId/progress"
            element={<CourseProgressPage />}
          />
          <Route path="/course/:courseId/quiz/:quizId" element={<QuizPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

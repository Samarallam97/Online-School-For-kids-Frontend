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

// Course Pages
import CoursesCatalogPage from "./pages/courses/CoursesCatalogPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import CoursePlayerPage from "./pages/courses/CoursePlayerPage";

// Cart & Checkout Pages
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrderConfirmationPage from "./pages/checkout/OrderConfirmationPage";

// Dashboard Pages
import StudentDashboardPage from "./pages/dashboard/StudentDashboardPage";
import MyCoursesPage from "./pages/dashboard/MyCoursesPage";
import CourseProgressPage from "./pages/dashboard/CourseProgressPage";

// Quiz Pages
import QuizPage from "./pages/quiz/QuizPage";

// Messages Pages
import MessagesPage from "./pages/messages/MessagesPage";
import GroupChatPage from "./pages/messages/GroupChatPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import FinancialOverviewPage from "./pages/admin/FinancialOverviewPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import ContentModerationPage from "./pages/admin/ContentModerationPage";

// Creator Pages
import UploadVideoPage from "./pages/creator/UploadVideoPage";
import CreatorDashboardPage from "./pages/creator/CreatorDashboardPage";

// Live Session Pages
import LiveSessionPage from "./pages/live/LiveSessionPage";
import GoLivePage from "./pages/creator/GoLivePage";

// Profile Pages
import AdminProfilePage from "./pages/profile/AdminProfilePage";
import CreatorProfilePage from "./pages/profile/CreatorProfilePage";
import ParentProfilePage from "./pages/profile/ParentProfilePage";
import StudentProfilePage from "./pages/profile/StudentProfilePage";
import SpecialistProfilePage from "./pages/profile/SpecialistProfilePage";
import AcceptInvitePage from "./pages/profile/AcceptInvitePage";
import PublicProfilePage from "./pages/profile/PublicProfilePage";

// Parent Pages
import ParentDashboardPage from "./pages/parent/ParentDashboardPage";

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
          <Route
            path="/content-creator/profile"
            element={<CreatorProfilePage />}
          />
          <Route path="/creator/upload" element={<UploadVideoPage />} />
          <Route path="/creator/go-live" element={<GoLivePage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/moderation" element={<ContentModerationPage />} />
          <Route path="/admin/financial" element={<FinancialOverviewPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
          {/* Parent Routes */}
          <Route path="/parent/profile" element={<ParentProfilePage />} />
          <Route path="/parent" element={<ParentDashboardPage />} />

          <Route path="/profile/:userId" element={<PublicProfilePage />} />

          {/* Specialist Routes */}
          <Route
            path="/specialist/profile"
            element={<SpecialistProfilePage />}
          />

          {/* Student Routes */}
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/profile" element={<StudentProfilePage />} />
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

          {/* Messages Routes */}
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/groups" element={<GroupChatPage />} />

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

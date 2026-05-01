import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
interface MainLayoutProps {
  children: ReactNode;
}
import {
  BookOpen,
  Layers,
  User,
  X,
  Calendar,
  Trophy,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface MainLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Categories", href: "/categories", icon: BookOpen },
  { name: "Specialists", href: "/specialists", icon: Layers },
  { name: "Instructors", href: "/instructors", icon: User },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Feeds", href: "/feeds", icon: Calendar },
];

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16">{children}</main>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 z-50 h-full w-72 bg-card p-6"
          >
            <div className="flex justify-between mb-6">
              <h2 className="font-bold text-lg">Menu</h2>

              <X
                className="cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              />
            </div>

            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg",
                    location.pathname === item.href ? "bg-muted" : "",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              {user ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => navigate("/auth")}
                  >
                    Login
                  </Button>

                  <Button className="w-full" onClick={() => navigate("/auth")}>
                    Register
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {/* <main className="pt-16">{children}</main> */}

      {/* Footer */}
      <div className="mt-16 border-t border-background/10 pt-8 text-center text-sm text-muted-foreground">
        <Footer />
      </div>
    </div>
  );
}

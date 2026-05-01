import { useNavigate, useLocation } from "react-router-dom";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { roleHome, UserRole } from "@/ProtectedRoute";

function getStoredRole(): UserRole | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw)?.role ?? null;
  } catch {
    return null;
  }
}

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? "/";
  const role = getStoredRole();

  return (
    <MainLayout>
      <div className="container py-24 max-w-lg mx-auto text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="text-3xl font-extrabold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-1">
          You don't have permission to view this page.
        </p>
        {from && from !== "/" && (
          <p className="text-xs text-muted-foreground/70 mb-8 font-mono bg-muted inline-block px-2 py-1 rounded">
            {from}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => navigate(role ? roleHome(role) : "/")} className="gap-2">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
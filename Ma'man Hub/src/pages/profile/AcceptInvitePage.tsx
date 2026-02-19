import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { studentService } from "@/services/studentService";

enum InviteStatus {
  VALIDATING = "validating",
  SUCCESS = "success",
  ERROR = "error",
  INVALID_TOKEN = "invalid_token",
}

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<InviteStatus>(InviteStatus.VALIDATING);
  const [parentName, setParentName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [redirectProgress, setRedirectProgress] = useState(0);

  useEffect(() => {
    const acceptInvite = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus(InviteStatus.INVALID_TOKEN);
        setErrorMessage("Invalid or missing invitation token");
        return;
      }

      try {
        setStatus(InviteStatus.VALIDATING);
        const response = await studentService.acceptParentInvite(token);
        
        setParentName(response.parentName || "Your parent");
        setStatus(InviteStatus.SUCCESS);

        // Start progress animation
        const progressInterval = setInterval(() => {
          setRedirectProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 2;
          });
        }, 60);

        // Redirect to profile after 3 seconds
        setTimeout(() => {
          navigate("/student/profile", { 
            state: { showParentLinked: true, parentName: response.parentName } 
          });
        }, 3000);
      } catch (error: any) {
        setStatus(InviteStatus.ERROR);
        const message = error.response?.data?.message || "Failed to accept invitation. The link may be invalid or expired.";
        setErrorMessage(message);
        
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    };

    acceptInvite();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold">Ma'man</span>
        </Link>

        <Card>
          <CardContent className="pt-6">
            {status === InviteStatus.VALIDATING && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-4 py-8"
              >
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div>
                  <h1 className="text-2xl font-bold font-display">Processing Invitation</h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please wait while we link your account...
                  </p>
                </div>
              </motion.div>
            )}

            {status === InviteStatus.SUCCESS && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-4 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="rounded-full bg-green-100 dark:bg-green-900 p-4"
                >
                  <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold font-display">Account Linked Successfully!</h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your account has been successfully linked to <strong>{parentName}</strong>'s account.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    They can now monitor your learning progress.
                  </p>
                </div>
                <div className="w-full space-y-2 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Redirecting to your profile...
                  </p>
                  <Progress value={redirectProgress} className="h-2" />
                </div>
                <Button
                  className="w-full"
                  onClick={() => navigate("/student/profile", { 
                    state: { showParentLinked: true, parentName } 
                  })}
                >
                  Go to Profile Now
                </Button>
              </motion.div>
            )}

            {status === InviteStatus.INVALID_TOKEN && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-4 py-8"
              >
                <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-4">
                  <AlertCircle className="h-16 w-16 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-display">Invalid Invitation</h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    {errorMessage}
                  </p>
                </div>
                <div className="w-full pt-4 space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => navigate("/login")}
                  >
                    Go to Login
                  </Button>
                </div>
              </motion.div>
            )}

            {status === InviteStatus.ERROR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-4 py-8"
              >
                <div className="rounded-full bg-red-100 dark:bg-red-900 p-4">
                  <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-display">Something Went Wrong</h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    {errorMessage}
                  </p>
                </div>
                <div className="w-full pt-4 space-y-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => navigate("/student/profile")}
                  >
                    Go to Profile
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
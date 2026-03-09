import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegistrationPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950">
            <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display">Account submitted!</h1>
          <p className="text-muted-foreground leading-relaxed">
            Your profile is under review by the Ma'man team. This usually
            takes up to 24 hours. You'll receive an email at the address
            linked to your Google account once approved.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 text-left">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Check your inbox for a confirmation email. If you don't see it,
              check your spam folder.
            </p>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full h-12">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </motion.div>
    </div>
  );
}
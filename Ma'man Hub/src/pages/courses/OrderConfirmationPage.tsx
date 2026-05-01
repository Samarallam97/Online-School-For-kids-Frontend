import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  Mail,
  BookOpen,
  ArrowRight,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";

interface OrderDetails {
  orderId: string;
  customerEmail: string;
  customerName: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  courseIds: string[];
  lineItems: Array<{
    name: string;
    quantity: number;
    amount: number;
  }>;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("No session ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: invokeError } = await supabase.functions.invoke(
          "verify-payment",
          {
            body: { sessionId },
          },
        );

        if (invokeError) throw invokeError;

        if (data?.success) {
          setOrder(data.order);
          clearCart();

          // Trigger confetti celebration
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } else {
          setError(data?.message || "Payment verification failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Failed to verify payment. Please contact support.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, clearCart]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="container py-16 max-w-lg mx-auto text-center">
          <div className="bg-destructive/10 rounded-full p-4 w-fit mx-auto mb-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            {error ||
              "We couldn't verify your payment. Please contact support."}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/cart">
              <Button variant="outline">Return to Cart</Button>
            </Link>
            <Link to="/support">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-12 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="bg-success/10 rounded-full p-4 w-fit mx-auto mb-6">
            <CheckCircle className="h-16 w-16 text-success" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your purchase, {order.customerName || "learner"}!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border rounded-xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold mb-4">Order Details</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-xs">
                {order.orderId.slice(0, 20)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{order.customerEmail}</span>
            </div>
          </div>

          <div className="border-t my-4" />

          <h3 className="font-semibold mb-3">Courses Purchased</h3>
          <div className="space-y-3">
            {order.lineItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{item.name}</span>
                <span className="font-medium">${item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t my-4" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total Paid</span>
            <span>
              {order.currency} ${order.amountTotal.toFixed(2)}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-muted/30 border rounded-xl p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="bg-accent/10 rounded-full p-2">
              <Mail className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Confirmation Email Sent</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation email to {order.customerEmail} with
                your receipt and course access instructions.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/dashboard" className="flex-1">
            <Button className="w-full h-12" size="lg">
              <BookOpen className="h-5 w-5 mr-2" />
              Go to My Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Button variant="outline" className="h-12">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Need help?{" "}
          <Link to="/support" className="text-accent hover:underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </MainLayout>
  );
}

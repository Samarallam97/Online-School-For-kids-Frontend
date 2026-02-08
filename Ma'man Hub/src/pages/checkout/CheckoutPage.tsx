import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoadingOverlay } from "@/components/ui/LoadingSpinner";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, couponCode, discount, getSubtotal, getTotal, clearCart } =
    useCartStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const handleCheckout = async () => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            items: items.map((item) => ({
              id: item.id,
              title: item.title,
              price: item.price,
            })),
            couponCode: couponCode,
            successUrl: `${window.location.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/cart`,
          },
        },
      );

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description:
          "There was an error processing your checkout. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <MainLayout>
      {isLoading && (
        <LoadingOverlay message="Redirecting to secure checkout..." />
      )}

      <div className="container py-8 max-w-4xl">
        <Link
          to="/cart"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold font-display mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-2 lg:order-1"
          >
            <div className="border rounded-xl p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-success" />
                Order Summary
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-20 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {item.instructor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({couponCode})</span>
                    <span>-${(getSubtotal() * discount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-1 lg:order-2"
          >
            <div className="border rounded-xl p-6 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </h2>

              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <Lock className="h-8 w-8 mx-auto mb-3 text-success" />
                <p className="font-medium mb-1">Secure Checkout</p>
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to Stripe's secure payment page to
                  complete your purchase.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked === true)
                    }
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-accent hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-accent hover:underline">
                      Privacy Policy
                    </Link>
                    . I understand that all sales are final.
                  </Label>
                </div>

                <Button
                  className="w-full h-12 text-base"
                  onClick={handleCheckout}
                  disabled={isLoading || !termsAccepted}
                >
                  {isLoading ? (
                    "Processing..."
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Complete Purchase - ${getTotal().toFixed(2)}
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  SSL Encrypted
                </span>
                <span>•</span>
                <span>30-Day Money Back</span>
                <span>•</span>
                <span>Secure Checkout</span>
              </div>

              <div className="text-center">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=40&fit=crop"
                  alt="Payment methods"
                  className="h-8 mx-auto opacity-60"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingCart, Tag, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCartStore } from "@/stores/cartStore";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function CartPage() {
  const {
    items,
    removeItem,
    couponCode,
    discount,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getTotal,
  } = useCartStore();
  const [coupon, setCoupon] = useState("");
  const { toast } = useToast();

  const handleApplyCoupon = () => {
    if (applyCoupon(coupon)) {
      toast({
        title: "Coupon applied!",
        description: `You saved ${discount * 100}%`,
      });
      setCoupon("");
    } else {
      toast({
        title: "Invalid coupon",
        description: "Please check your code",
        variant: "destructive",
      });
    }
  };

  const [clearing, setClearing] = useState(false);

  const handleClearAll = async () => {
    if (clearing) return;
    const snapshot = { items: [...items], couponCode, discount };
    setClearing(true);
    useCartStore.setState({ items: [], couponCode: null, discount: 0 });
    try {
      await api.delete("/Cart");
      toast({ title: "Cart cleared" });
    } catch {
      useCartStore.setState(snapshot);
      toast({ title: "Could not clear cart", variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Explore our courses and find something to learn!
          </p>
          <Link to="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground mb-8">
          {items.length} course{items.length !== 1 ? "s" : ""} in your cart
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Items ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">

            {/* Clear all */}
            {items.length > 1 && (
              <div className="flex justify-end pb-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Clear all
                </Button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {items.map((item) => {
                const hasDiscount =
                  item.originalPrice != null &&
                  item.originalPrice > item.price;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                    className="flex gap-4 p-4 border rounded-xl bg-card hover:shadow-sm transition-shadow"
                  >
                    {/* Thumbnail with fallback */}
                    <Link
                      to={`/courses/${item.id}`}
                      className="shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center"
                    >
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            img.style.display = "none";
                            const fallback = img.nextSibling as HTMLElement | null;
                            fallback?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div
                        className={`flex flex-col items-center justify-center w-full h-full text-muted-foreground ${
                          item.thumbnail ? "hidden" : ""
                        }`}
                      >
                        <BookOpen className="h-8 w-8 opacity-40" />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/courses/${item.id}`}
                        className="font-semibold text-sm leading-snug hover:text-primary transition-colors line-clamp-2 block"
                      >
                        {item.title}
                      </Link>
                      {item.instructor && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.instructor}
                        </p>
                      )}
                      {item.level && (
                        <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wide bg-muted px-2 py-0.5 rounded">
                          {item.level}
                        </span>
                      )}
                    </div>

                    {/* Price + remove */}
                    <div className="shrink-0 flex flex-col items-end justify-between">
                      <div className="text-right">
                        <p className="font-bold text-base">
                          ${item.price.toFixed(2)}
                        </p>
                        {hasDiscount && (
                          <p className="text-xs text-muted-foreground line-through">
                            ${item.originalPrice!.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ── Order Summary ───────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-6 space-y-4 sticky top-24 bg-card">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})
                  </span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount * 100}%)</span>
                    <span>-${(getSubtotal() * discount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>

              {/* Coupon */}
              {!couponCode ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className="text-sm"
                  />
                  <Button variant="secondary" onClick={handleApplyCoupon} className="shrink-0">
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-2.5 rounded-lg text-sm">
                  <span className="text-green-700 font-medium">
                    🎉 {couponCode} applied
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCoupon}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </Button>
                </div>
              )}

              <Link to="/checkout">
                <Button className="w-full h-12 text-base font-semibold">
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground">
                30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
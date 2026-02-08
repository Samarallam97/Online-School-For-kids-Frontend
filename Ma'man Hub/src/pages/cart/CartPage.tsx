import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, ShoppingCart, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCartStore } from "@/stores/cartStore";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
        <h1 className="text-3xl font-bold font-display mb-8">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="flex gap-4 p-4 border rounded-xl"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-32 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <Link
                    to={`/courses/${item.id}`}
                    className="font-semibold hover:text-accent"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {item.instructor}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${item.price}</p>
                  {item.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      ${item.originalPrice}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-destructive mt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-6 space-y-4 sticky top-24">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({discount * 100}%)</span>
                    <span>-${(getSubtotal() * discount).toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              {!couponCode && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <Button variant="secondary" onClick={handleApplyCoupon}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {couponCode && (
                <div className="flex items-center justify-between bg-success/10 p-2 rounded-lg text-sm">
                  <span className="text-success font-medium">
                    {couponCode} applied
                  </span>
                  <Button variant="ghost" size="sm" onClick={removeCoupon}>
                    Remove
                  </Button>
                </div>
              )}
              <Link to="/checkout">
                <Button className="w-full h-12">
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

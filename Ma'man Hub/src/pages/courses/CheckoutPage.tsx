import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Building, Smartphone, Wallet, Tag, ArrowLeft,
  CheckCircle2, Plus, Loader2, Lock, ChevronDown, ChevronUp,
  BookOpen, Shield, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import { userService, PaymentMethod } from "@/services/userService";
import api from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

enum PaymentMethodType {
  CARD = "card",
  VODAFONE_CASH = "vodafone_cash",
  INSTAPAY = "instapay",
  FAWRY = "fawry",
  BANK_ACCOUNT = "bank_account",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const METHOD_ICON: Record<string, JSX.Element> = {
  [PaymentMethodType.CARD]: <CreditCard className="h-4 w-4" />,
  [PaymentMethodType.VODAFONE_CASH]: <Smartphone className="h-4 w-4" />,
  [PaymentMethodType.INSTAPAY]: <Wallet className="h-4 w-4" />,
  [PaymentMethodType.FAWRY]: <CreditCard className="h-4 w-4" />,
  [PaymentMethodType.BANK_ACCOUNT]: <Building className="h-4 w-4" />,
};

const METHOD_LABEL: Record<string, string> = {
  [PaymentMethodType.CARD]: "Credit / Debit Card",
  [PaymentMethodType.VODAFONE_CASH]: "Vodafone Cash",
  [PaymentMethodType.INSTAPAY]: "Instapay",
  [PaymentMethodType.FAWRY]: "Fawry",
  [PaymentMethodType.BANK_ACCOUNT]: "Bank Account",
};

// ─── New-method form state ─────────────────────────────────────────────────────

const blankForm = {
  cardNumber: "", cardholderName: "", expiryMonth: "", expiryYear: "", cvv: "",
  vodafoneNumber: "", instapayId: "", fawryNumber: "",
  accountHolderName: "", bankName: "", accountNumber: "", iban: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, couponCode, discount, applyCoupon, removeCoupon, getSubtotal, getTotal } =
    useCartStore();

  // Payment methods
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  // Add new method inline
  const [addingNew, setAddingNew] = useState(false);
  const [newType, setNewType] = useState<PaymentMethodType>(PaymentMethodType.CARD);
  const [newForm, setNewForm] = useState(blankForm);
  const [savingMethod, setSavingMethod] = useState(false);

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);

  // Checkout
  const [placingOrder, setPlacingOrder] = useState(false);

  // ── Load saved methods ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await userService.getPaymentMethods();
        setMethods(data);
        const def = data.find((m) => m.isDefault) ?? data[0];
        if (def) setSelectedMethodId(def.id);
      } catch {
        setMethods([]);
      } finally {
        setLoadingMethods(false);
      }
    })();
  }, []);

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Link to="/courses"><Button>Browse Courses</Button></Link>
        </div>
      </MainLayout>
    );
  }

  const selectedMethod = methods.find((m) => m.id === selectedMethodId) ?? null;

  // ── Coupon ───────────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      // Optimistically apply via store (which validates locally or via API)
      const ok = applyCoupon(couponInput.trim());
      if (ok) {
        toast({ title: "Coupon applied!", description: `${discount * 100}% discount added` });
        setCouponInput("");
        setCouponOpen(false);
      } else {
        toast({ title: "Invalid coupon", description: "Please check the code and try again.", variant: "destructive" });
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  // ── Save new payment method ───────────────────────────────────────────────────
  const handleSaveNewMethod = async () => {
    let payload: any = { type: newType };

    if (newType === PaymentMethodType.CARD) {
      if (!newForm.cardNumber || !newForm.cardholderName || !newForm.expiryMonth || !newForm.expiryYear || !newForm.cvv) {
        toast({ title: "Missing fields", description: "Please fill in all card details.", variant: "destructive" }); return;
      }
      payload = { ...payload, cardNumber: newForm.cardNumber.replace(/\s/g, ""), cardholderName: newForm.cardholderName, expiryMonth: +newForm.expiryMonth, expiryYear: +newForm.expiryYear, cvv: newForm.cvv };
    } else if (newType === PaymentMethodType.VODAFONE_CASH) {
      if (!newForm.vodafoneNumber) { toast({ title: "Missing fields", description: "Enter your Vodafone Cash number.", variant: "destructive" }); return; }
      payload.phoneNumber = newForm.vodafoneNumber;
    } else if (newType === PaymentMethodType.INSTAPAY) {
      if (!newForm.instapayId) { toast({ title: "Missing fields", description: "Enter your Instapay ID.", variant: "destructive" }); return; }
      payload.instapayId = newForm.instapayId;
    } else if (newType === PaymentMethodType.FAWRY) {
      if (!newForm.fawryNumber) { toast({ title: "Missing fields", description: "Enter your Fawry reference number.", variant: "destructive" }); return; }
      payload.referenceNumber = newForm.fawryNumber;
    } else if (newType === PaymentMethodType.BANK_ACCOUNT) {
      if (!newForm.accountHolderName || !newForm.bankName || !newForm.accountNumber) {
        toast({ title: "Missing fields", description: "Fill in all required bank details.", variant: "destructive" }); return;
      }
      payload = { ...payload, accountHolderName: newForm.accountHolderName, bankName: newForm.bankName, accountNumber: newForm.accountNumber, iban: newForm.iban };
    }

    try {
      setSavingMethod(true);
      const saved = await userService.addPaymentMethod(payload);
      setMethods((prev) => [...prev, saved]);
      setSelectedMethodId(saved.id);
      setAddingNew(false);
      setNewForm(blankForm);
      toast({ title: "Payment method saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message ?? "Failed to save method.", variant: "destructive" });
    } finally {
      setSavingMethod(false);
    }
  };

  // ── Place order ──────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedMethodId && !addingNew) {
      toast({ title: "Select a payment method", variant: "destructive" }); return;
    }
    try {
      setPlacingOrder(true);
      await api.post("/Order", {
        paymentMethodId: selectedMethodId,
        couponCode: couponCode ?? undefined,
        courseIds: items.map((i) => i.id),
      });
      useCartStore.getState().clearCart?.();
      toast({ title: "Order placed!", description: "You're enrolled. Happy learning!" });
      navigate("/student/my-courses");
    } catch (e: any) {
      toast({ title: "Payment failed", description: e.response?.data?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setPlacingOrder(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <MainLayout>
      <div className="container max-w-5xl py-8">

        {/* Back */}
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── Left: Payment ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Payment Method Card */}
            <section className="border rounded-xl overflow-hidden bg-card">
              <div className="px-5 py-4 border-b flex items-center gap-2 bg-muted/40">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm">Payment Method</h2>
              </div>

              <div className="p-5 space-y-4">

                {/* Loading */}
                {loadingMethods && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {/* Selected method display */}
                {!loadingMethods && selectedMethod && !addingNew && (
                  <motion.div
                    key={selectedMethod.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-lg border-2 border-primary bg-primary/5"
                  >
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                      {METHOD_ICON[selectedMethod.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{METHOD_LABEL[selectedMethod.type]}</p>
                      <p className="text-xs text-muted-foreground truncate">{selectedMethod.displayInfo}</p>
                    </div>
                    {selectedMethod.isDefault && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">Default</Badge>
                    )}
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  </motion.div>
                )}

                {/* No methods & not adding */}
                {!loadingMethods && methods.length === 0 && !addingNew && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No saved payment methods. Add one below.
                  </p>
                )}

                {/* Method picker */}
                {!loadingMethods && methods.length > 1 && !addingNew && (
                  <button
                    className="w-full text-left text-sm text-primary hover:underline flex items-center gap-1"
                    onClick={() => setShowMethodPicker((v) => !v)}
                  >
                    {showMethodPicker ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {showMethodPicker ? "Hide" : "Change"} payment method
                  </button>
                )}

                <AnimatePresence>
                  {showMethodPicker && !addingNew && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-1">
                        {methods.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => { setSelectedMethodId(m.id); setShowMethodPicker(false); }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                              m.id === selectedMethodId
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40 hover:bg-muted/40"
                            }`}
                          >
                            <div className="rounded-md bg-muted p-1.5 text-muted-foreground">
                              {METHOD_ICON[m.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{METHOD_LABEL[m.type]}</p>
                              <p className="text-xs text-muted-foreground truncate">{m.displayInfo}</p>
                            </div>
                            {m.isDefault && <Badge variant="outline" className="text-[10px]">Default</Badge>}
                            {m.id === selectedMethodId && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add new method toggle */}
                {!addingNew ? (
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => { setAddingNew(true); setShowMethodPicker(false); }}>
                    <Plus className="h-4 w-4" /> Add new payment method
                  </Button>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="border rounded-lg p-4 space-y-4 bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">New Payment Method</p>
                        <button
                          className="text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => { setAddingNew(false); setNewForm(blankForm); }}
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Type selector */}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {[
                          PaymentMethodType.CARD, PaymentMethodType.VODAFONE_CASH,
                          PaymentMethodType.INSTAPAY, PaymentMethodType.FAWRY,
                          PaymentMethodType.BANK_ACCOUNT,
                        ].map((t) => (
                          <button
                            key={t}
                            onClick={() => setNewType(t)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                              newType === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                            }`}
                          >
                            {METHOD_ICON[t]}
                            <span className="truncate">{METHOD_LABEL[t].split(" ")[0]}{METHOD_LABEL[t].split(" ")[1] ? ` ${METHOD_LABEL[t].split(" ")[1]}` : ""}</span>
                          </button>
                        ))}
                      </div>

                      {/* Dynamic fields */}
                      {newType === PaymentMethodType.CARD && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Cardholder Name *</Label>
                            <Input placeholder="John Doe" value={newForm.cardholderName}
                              onChange={(e) => setNewForm({ ...newForm, cardholderName: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Card Number *</Label>
                            <Input placeholder="1234 5678 9012 3456" maxLength={19} value={newForm.cardNumber}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, "");
                                setNewForm({ ...newForm, cardNumber: v.match(/.{1,4}/g)?.join(" ") || v });
                              }} />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Month *</Label>
                              <Input placeholder="MM" maxLength={2} value={newForm.expiryMonth}
                                onChange={(e) => setNewForm({ ...newForm, expiryMonth: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Year *</Label>
                              <Input placeholder="YYYY" maxLength={4} value={newForm.expiryYear}
                                onChange={(e) => setNewForm({ ...newForm, expiryYear: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">CVV *</Label>
                              <Input type="password" placeholder="•••" maxLength={4} value={newForm.cvv}
                                onChange={(e) => setNewForm({ ...newForm, cvv: e.target.value })} />
                            </div>
                          </div>
                        </div>
                      )}

                      {newType === PaymentMethodType.VODAFONE_CASH && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Vodafone Cash Number *</Label>
                          <Input placeholder="01XXXXXXXXX" value={newForm.vodafoneNumber}
                            onChange={(e) => setNewForm({ ...newForm, vodafoneNumber: e.target.value })} />
                        </div>
                      )}

                      {newType === PaymentMethodType.INSTAPAY && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Instapay ID *</Label>
                          <Input placeholder="Phone or email registered with Instapay" value={newForm.instapayId}
                            onChange={(e) => setNewForm({ ...newForm, instapayId: e.target.value })} />
                        </div>
                      )}

                      {newType === PaymentMethodType.FAWRY && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Fawry Reference Number *</Label>
                          <Input placeholder="Your Fawry number" value={newForm.fawryNumber}
                            onChange={(e) => setNewForm({ ...newForm, fawryNumber: e.target.value })} />
                        </div>
                      )}

                      {newType === PaymentMethodType.BANK_ACCOUNT && (
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Account Holder Name *</Label>
                            <Input placeholder="John Doe" value={newForm.accountHolderName}
                              onChange={(e) => setNewForm({ ...newForm, accountHolderName: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Bank Name *</Label>
                            <Input placeholder="e.g., National Bank of Egypt" value={newForm.bankName}
                              onChange={(e) => setNewForm({ ...newForm, bankName: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Account Number *</Label>
                            <Input placeholder="XXXXXXXXXXXX" value={newForm.accountNumber}
                              onChange={(e) => setNewForm({ ...newForm, accountNumber: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">IBAN (optional)</Label>
                            <Input placeholder="EGXXXXXXXXXXXXXXXXXXXXXXXXX" value={newForm.iban}
                              onChange={(e) => setNewForm({ ...newForm, iban: e.target.value })} />
                          </div>
                        </div>
                      )}

                      <Button className="w-full" onClick={handleSaveNewMethod} disabled={savingMethod}>
                        {savingMethod && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save & Use This Method
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </section>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> SSL Encrypted</div>
              <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Secure Payment</div>
              <div className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> 30-day refund</div>
            </div>
          </div>

          {/* ── Right: Order Summary ───────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="border rounded-xl bg-card p-5 space-y-4 sticky top-24">
              <h2 className="font-bold text-lg">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {item.thumbnail
                        ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                        : <BookOpen className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-snug line-clamp-2">{item.title}</p>
                    </div>
                    <p className="text-xs font-bold shrink-0">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon ({couponCode})</span>
                    <span>-${(getSubtotal() * discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon section */}
              {!couponCode ? (
                <div>
                  <button
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    onClick={() => setCouponOpen((v) => !v)}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {couponOpen ? "Hide coupon field" : "Have a coupon code?"}
                  </button>
                  <AnimatePresence>
                    {couponOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Enter code"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                            className="text-sm h-9"
                          />
                          <Button size="sm" onClick={handleApplyCoupon} disabled={applyingCoupon} className="shrink-0">
                            {applyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                  <span className="text-green-700 font-medium flex items-center gap-1.5">
                    🎉 <span className="font-mono">{couponCode}</span> applied
                  </span>
                  <button className="text-xs text-muted-foreground hover:text-foreground" onClick={removeCoupon}>
                    Remove
                  </button>
                </div>
              )}

              {/* CTA */}
              <Button
                className="w-full h-12 text-base font-semibold"
                onClick={handlePlaceOrder}
                disabled={placingOrder || (!selectedMethodId && !addingNew)}
              >
                {placingOrder
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                  : <><Lock className="mr-2 h-4 w-4" /> Pay ${getTotal().toFixed(2)}</>
                }
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                By completing this purchase you agree to our Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Loader2,
  Plus,
  MoreVertical,
  Trash2,
  Check,
  CheckCircle2,
  Wallet,
  Building,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService, PaymentMethod } from "@/services/userService";

enum PaymentMethodType {
  CARD = "card",
  VODAFONE_CASH = "vodafone_cash",
  INSTAPAY = "instapay",
  FAWRY = "fawry",
  BANK_ACCOUNT = "bank_account",
}

const ROLE_PAYMENT_METHODS: Record<string, PaymentMethodType[]> = {
  Student: [
    PaymentMethodType.CARD,
    PaymentMethodType.VODAFONE_CASH,
    PaymentMethodType.INSTAPAY,
    PaymentMethodType.FAWRY,
  ],
  ContentCreator: [
    PaymentMethodType.BANK_ACCOUNT,
    PaymentMethodType.VODAFONE_CASH,
    PaymentMethodType.INSTAPAY,
    PaymentMethodType.FAWRY,
  ],
  Specialist: [
    PaymentMethodType.BANK_ACCOUNT,
    PaymentMethodType.VODAFONE_CASH,
    PaymentMethodType.INSTAPAY,
    PaymentMethodType.FAWRY,
  ],
  Parent: [
    PaymentMethodType.CARD,
    PaymentMethodType.VODAFONE_CASH,
    PaymentMethodType.INSTAPAY,
    PaymentMethodType.FAWRY,
  ],
};

// ── Safe localStorage helper ──────────────────────────────────────────────────
function getCurrentUser(): { role?: string } {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    console.log(parsed);
    
    // Handle both { user: { role } } and { role } shapes
    return parsed?.user ?? parsed ?? {};
  } catch {
    return {};
  }
}

const PAYER_ROLES = ["Student", "Parent"];
const isPayer = (role?: string) => PAYER_ROLES.includes(role ?? "");

export function BillingTab() {
  const { toast } = useToast();

  // Derive user once — safe regardless of localStorage shape
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role;
  const isPayerRole = isPayer(userRole);

  const allowedPaymentMethods = ROLE_PAYMENT_METHODS[userRole ?? ""] ?? [];

  const getInitialPaymentType = (): PaymentMethodType => {
    if (allowedPaymentMethods.length === 0) return PaymentMethodType.CARD;
    return isPayerRole ? PaymentMethodType.CARD : PaymentMethodType.BANK_ACCOUNT;
  };

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethodType>(getInitialPaymentType);
  const [newPaymentData, setNewPaymentData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    vodafoneNumber: "",
    instapayId: "",
    fawryNumber: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    iban: "",
  });
  const [paymentToRemove, setPaymentToRemove] = useState<PaymentMethod | null>(null);
  const [isRemovingPayment, setIsRemovingPayment] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoadingPayments(true);
        const methods = await userService.getPaymentMethods();
        setPaymentMethods(methods);
      } catch {
        setPaymentMethods([]);
      } finally {
        setIsLoadingPayments(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Reset selected type when dialog opens to always show a valid default
  const handleOpenDialog = (open: boolean) => {
    if (open) setSelectedPaymentType(getInitialPaymentType());
    setIsAddPaymentDialogOpen(open);
  };

  const labels = {
    methodWord: isPayerRole ? "Payment" : "Payout",
    title: isPayerRole ? "Payment Methods" : "Payout Methods",
    description: isPayerRole
      ? "Manage your payment methods for course purchases"
      : "Manage how you receive your earnings",
    emptyMessage: isPayerRole
      ? "Add a payment method to purchase courses and subscriptions."
      : "Add a payout method to receive your earnings from courses.",
  };

  const resetForm = () =>
    setNewPaymentData({
      cardNumber: "", cardholderName: "", expiryMonth: "", expiryYear: "", cvv: "",
      vodafoneNumber: "", instapayId: "", fawryNumber: "",
      accountHolderName: "", bankName: "", accountNumber: "", iban: "",
    });

  const handleAddPaymentMethod = async () => {
    let paymentMethodData: any = { type: selectedPaymentType };

    switch (selectedPaymentType) {
      case PaymentMethodType.CARD:
        if (!newPaymentData.cardNumber || !newPaymentData.cardholderName ||
          !newPaymentData.expiryMonth || !newPaymentData.expiryYear || !newPaymentData.cvv) {
          toast({ title: "Validation Error", description: "Please fill in all card details", variant: "destructive" });
          return;
        }
        paymentMethodData = {
          ...paymentMethodData,
          cardNumber: newPaymentData.cardNumber.replace(/\s/g, ""),
          cardholderName: newPaymentData.cardholderName,
          expiryMonth: parseInt(newPaymentData.expiryMonth),
          expiryYear: parseInt(newPaymentData.expiryYear),
          cvv: newPaymentData.cvv,
        };
        break;
      case PaymentMethodType.VODAFONE_CASH:
        if (!newPaymentData.vodafoneNumber) {
          toast({ title: "Validation Error", description: "Please enter your Vodafone Cash number", variant: "destructive" });
          return;
        }
        paymentMethodData.phoneNumber = newPaymentData.vodafoneNumber;
        break;
      case PaymentMethodType.INSTAPAY:
        if (!newPaymentData.instapayId) {
          toast({ title: "Validation Error", description: "Please enter your Instapay ID", variant: "destructive" });
          return;
        }
        paymentMethodData.instapayId = newPaymentData.instapayId;
        break;
      case PaymentMethodType.FAWRY:
        if (!newPaymentData.fawryNumber) {
          toast({ title: "Validation Error", description: "Please enter your Fawry reference number", variant: "destructive" });
          return;
        }
        paymentMethodData.referenceNumber = newPaymentData.fawryNumber;
        break;
      case PaymentMethodType.BANK_ACCOUNT:
        if (!newPaymentData.accountHolderName || !newPaymentData.bankName || !newPaymentData.accountNumber) {
          toast({ title: "Validation Error", description: "Please fill in all required bank account details", variant: "destructive" });
          return;
        }
        paymentMethodData = {
          ...paymentMethodData,
          accountHolderName: newPaymentData.accountHolderName,
          bankName: newPaymentData.bankName,
          accountNumber: newPaymentData.accountNumber,
          iban: newPaymentData.iban,
        };
        break;
    }

    try {
      setIsAddingPayment(true);
      const newMethod = await userService.addPaymentMethod(paymentMethodData);
      setPaymentMethods(prev => [...prev, newMethod]);
      resetForm();
      setIsAddPaymentDialogOpen(false);
      toast({ title: `${labels.methodWord} Method Added`, description: `Your ${labels.methodWord.toLowerCase()} method has been added successfully.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to add payment method", variant: "destructive" });
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleSetDefaultPayment = async (paymentMethodId: string) => {
    try {
      setIsSettingDefault(paymentMethodId);
      await userService.setDefaultPaymentMethod(paymentMethodId);
      setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === paymentMethodId })));
      toast({ title: "Default Updated", description: "Your default payment method has been updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to set default", variant: "destructive" });
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handleRemovePaymentMethod = async () => {
    if (!paymentToRemove) return;
    try {
      setIsRemovingPayment(true);
      await userService.removePaymentMethod(paymentToRemove.id);
      setPaymentMethods(prev => prev.filter(m => m.id !== paymentToRemove.id));
      toast({ title: "Removed", description: "Payment method removed successfully." });
      setPaymentToRemove(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to remove", variant: "destructive" });
    } finally {
      setIsRemovingPayment(false);
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case PaymentMethodType.CARD: return <CreditCard className="h-5 w-5" />;
      case PaymentMethodType.VODAFONE_CASH: return <Smartphone className="h-5 w-5" />;
      case PaymentMethodType.INSTAPAY: return <Wallet className="h-5 w-5" />;
      case PaymentMethodType.FAWRY: return <CreditCard className="h-5 w-5" />;
      case PaymentMethodType.BANK_ACCOUNT: return <Building className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodLabel = (type: string) => {
    switch (type) {
      case PaymentMethodType.CARD: return "Credit/Debit Card";
      case PaymentMethodType.VODAFONE_CASH: return "Vodafone Cash";
      case PaymentMethodType.INSTAPAY: return "Instapay";
      case PaymentMethodType.FAWRY: return "Fawry";
      case PaymentMethodType.BANK_ACCOUNT: return "Bank Account";
      default: return "Payment Method";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {labels.title}
          </CardTitle>
          <CardDescription>{labels.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPayments ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <div key={method.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-muted p-2">
                      {getPaymentMethodIcon(method.type)}
                    </div>
                    <div>
                      <p className="font-medium">{getPaymentMethodLabel(method.type)}</p>
                      <p className="text-sm text-muted-foreground">{method.displayInfo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />Default
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefaultPayment(method.id)} disabled={isSettingDefault === method.id}>
                        {isSettingDefault === method.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set as Default"}
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!method.isDefault && (
                          <>
                            <DropdownMenuItem onClick={() => handleSetDefaultPayment(method.id)} disabled={isSettingDefault === method.id}>
                              <Check className="mr-2 h-4 w-4" />Set as Default
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setPaymentToRemove(method)}>
                          <Trash2 className="mr-2 h-4 w-4" />Remove Method
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No {labels.methodWord.toLowerCase()} methods</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">{labels.emptyMessage}</p>
            </div>
          )}

          <Dialog open={isAddPaymentDialogOpen} onOpenChange={handleOpenDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />Add {labels.methodWord} Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add {labels.methodWord} Method</DialogTitle>
                <DialogDescription>Choose a method and enter your details</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{labels.methodWord} Method Type *</Label>
                  <Select value={selectedPaymentType} onValueChange={(v) => setSelectedPaymentType(v as PaymentMethodType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedPaymentMethods.includes(PaymentMethodType.CARD) && (
                        <SelectItem value={PaymentMethodType.CARD}>
                          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Credit/Debit Card</div>
                        </SelectItem>
                      )}
                      {allowedPaymentMethods.includes(PaymentMethodType.BANK_ACCOUNT) && (
                        <SelectItem value={PaymentMethodType.BANK_ACCOUNT}>
                          <div className="flex items-center gap-2"><Building className="h-4 w-4" />Bank Account</div>
                        </SelectItem>
                      )}
                      {allowedPaymentMethods.includes(PaymentMethodType.VODAFONE_CASH) && (
                        <SelectItem value={PaymentMethodType.VODAFONE_CASH}>
                          <div className="flex items-center gap-2"><Smartphone className="h-4 w-4" />Vodafone Cash</div>
                        </SelectItem>
                      )}
                      {allowedPaymentMethods.includes(PaymentMethodType.INSTAPAY) && (
                        <SelectItem value={PaymentMethodType.INSTAPAY}>
                          <div className="flex items-center gap-2"><Wallet className="h-4 w-4" />Instapay</div>
                        </SelectItem>
                      )}
                      {allowedPaymentMethods.includes(PaymentMethodType.FAWRY) && (
                        <SelectItem value={PaymentMethodType.FAWRY}>
                          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Fawry</div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Card form */}
                {selectedPaymentType === PaymentMethodType.CARD && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Cardholder Name *</Label>
                      <Input id="cardholderName" placeholder="John Doe" value={newPaymentData.cardholderName}
                        onChange={(e) => setNewPaymentData({ ...newPaymentData, cardholderName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" maxLength={19} value={newPaymentData.cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\s/g, "");
                          setNewPaymentData({ ...newPaymentData, cardNumber: v.match(/.{1,4}/g)?.join(" ") || v });
                        }} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryMonth">Month *</Label>
                        <Input id="expiryMonth" placeholder="MM" maxLength={2} value={newPaymentData.expiryMonth}
                          onChange={(e) => setNewPaymentData({ ...newPaymentData, expiryMonth: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryYear">Year *</Label>
                        <Input id="expiryYear" placeholder="YYYY" maxLength={4} value={newPaymentData.expiryYear}
                          onChange={(e) => setNewPaymentData({ ...newPaymentData, expiryYear: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input id="cvv" type="password" placeholder="123" maxLength={4} value={newPaymentData.cvv}
                          onChange={(e) => setNewPaymentData({ ...newPaymentData, cvv: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}

                {/* Vodafone Cash */}
                {selectedPaymentType === PaymentMethodType.VODAFONE_CASH && (
                  <div className="space-y-2">
                    <Label htmlFor="vodafoneNumber">Vodafone Cash Number *</Label>
                    <Input id="vodafoneNumber" placeholder="01XXXXXXXXX" value={newPaymentData.vodafoneNumber}
                      onChange={(e) => setNewPaymentData({ ...newPaymentData, vodafoneNumber: e.target.value })} />
                  </div>
                )}

                {/* Instapay */}
                {selectedPaymentType === PaymentMethodType.INSTAPAY && (
                  <div className="space-y-2">
                    <Label htmlFor="instapayId">Instapay ID *</Label>
                    <Input id="instapayId" placeholder="Your Instapay ID" value={newPaymentData.instapayId}
                      onChange={(e) => setNewPaymentData({ ...newPaymentData, instapayId: e.target.value })} />
                    <p className="text-xs text-muted-foreground">Enter your phone number or email registered with Instapay</p>
                  </div>
                )}

                {/* Fawry */}
                {selectedPaymentType === PaymentMethodType.FAWRY && (
                  <div className="space-y-2">
                    <Label htmlFor="fawryNumber">Fawry Reference Number *</Label>
                    <Input id="fawryNumber" placeholder="Your Fawry number" value={newPaymentData.fawryNumber}
                      onChange={(e) => setNewPaymentData({ ...newPaymentData, fawryNumber: e.target.value })} />
                  </div>
                )}

                {/* Bank Account */}
                {selectedPaymentType === PaymentMethodType.BANK_ACCOUNT && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                      <Input id="accountHolderName" placeholder="John Doe" value={newPaymentData.accountHolderName}
                        onChange={(e) => setNewPaymentData({ ...newPaymentData, accountHolderName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input id="bankName" placeholder="e.g., National Bank of Egypt" value={newPaymentData.bankName}
                        onChange={(e) => setNewPaymentData({ ...newPaymentData, bankName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input id="accountNumber" placeholder="XXXXXXXXXXXX" value={newPaymentData.accountNumber}
                        onChange={(e) => setNewPaymentData({ ...newPaymentData, accountNumber: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iban">IBAN (Optional)</Label>
                      <Input id="iban" placeholder="EGXXXXXXXXXXXXXXXXXXXXXXXXX" value={newPaymentData.iban}
                        onChange={(e) => setNewPaymentData({ ...newPaymentData, iban: e.target.value })} />
                    </div>
                  </>
                )}

                <p className="text-xs text-muted-foreground">
                  🔒 Your {labels.methodWord.toLowerCase()} information is encrypted and stored securely.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { handleOpenDialog(false); resetForm(); }} disabled={isAddingPayment}>
                  Cancel
                </Button>
                <Button onClick={handleAddPaymentMethod} disabled={isAddingPayment}>
                  {isAddingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add {labels.methodWord} Method
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <AlertDialog open={!!paymentToRemove} onOpenChange={() => setPaymentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {labels.methodWord} Method?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this {labels.methodWord.toLowerCase()} method?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingPayment}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemovePaymentMethod} disabled={isRemovingPayment} className="bg-destructive hover:bg-destructive/90">
              {isRemovingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Method
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
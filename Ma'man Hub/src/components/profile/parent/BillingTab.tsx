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
import { userService , PaymentMethod} from "@/services/userService";

enum PaymentMethodType {
  VODAFONE_CASH = "vodafone_cash",
  INSTAPAY = "instapay",
  FAWRY = "fawry",
  BANK_ACCOUNT = "bank_account",
}

export function BillingTab() {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethodType>(
    PaymentMethodType.VODAFONE_CASH
  );
  const [newPaymentData, setNewPaymentData] = useState({
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
      } catch (error: any) {
        console.error("Failed to load payment methods:", error);
        setPaymentMethods([]);
      } finally {
        setIsLoadingPayments(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  const handleAddPaymentMethod = async () => {
    let paymentMethodData: any = { type: selectedPaymentType };

    switch (selectedPaymentType) {
      case PaymentMethodType.VODAFONE_CASH:
        if (!newPaymentData.vodafoneNumber) {
          toast({
            title: "Validation Error",
            description: "Please enter your Vodafone Cash number",
            variant: "destructive",
          });
          return;
        }
        paymentMethodData.phoneNumber = newPaymentData.vodafoneNumber;
        break;

      case PaymentMethodType.INSTAPAY:
        if (!newPaymentData.instapayId) {
          toast({
            title: "Validation Error",
            description: "Please enter your Instapay ID",
            variant: "destructive",
          });
          return;
        }
        paymentMethodData.instapayId = newPaymentData.instapayId;
        break;

      case PaymentMethodType.FAWRY:
        if (!newPaymentData.fawryNumber) {
          toast({
            title: "Validation Error",
            description: "Please enter your Fawry reference number",
            variant: "destructive",
          });
          return;
        }
        paymentMethodData.referenceNumber = newPaymentData.fawryNumber;
        break;

      case PaymentMethodType.BANK_ACCOUNT:
        if (!newPaymentData.accountHolderName || !newPaymentData.bankName ||
          !newPaymentData.accountNumber) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required bank account details",
            variant: "destructive",
          });
          return;
        }
        paymentMethodData.accountHolderName = newPaymentData.accountHolderName;
        paymentMethodData.bankName = newPaymentData.bankName;
        paymentMethodData.accountNumber = newPaymentData.accountNumber;
        paymentMethodData.iban = newPaymentData.iban;
        break;
    }

    try {
      setIsAddingPayment(true);
      const newPaymentMethod = await userService.addPaymentMethod(paymentMethodData);
      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      setNewPaymentData({
        vodafoneNumber: "",
        instapayId: "",
        fawryNumber: "",
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        iban: "",
      });
      setIsAddPaymentDialogOpen(false);
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setIsAddingPayment(false);
    }
  };

  const handleSetDefaultPayment = async (paymentMethodId: string) => {
    try {
      setIsSettingDefault(paymentMethodId);
      await userService.setDefaultPaymentMethod(paymentMethodId);
      setPaymentMethods(paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === paymentMethodId
      })));
      toast({
        title: "Default Payment Set",
        description: "Your default payment method has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to set default payment method",
        variant: "destructive",
      });
    } finally {
      setIsSettingDefault(null);
    }
  };

  const handleRemovePaymentMethod = async () => {
    if (!paymentToRemove) return;
    try {
      setIsRemovingPayment(true);
      await userService.removePaymentMethod(paymentToRemove.id);
      setPaymentMethods(paymentMethods.filter(method => method.id !== paymentToRemove.id));
      toast({
        title: "Payment Method Removed",
        description: "Your payment method has been removed successfully.",
      });
      setPaymentToRemove(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove payment method",
        variant: "destructive",
      });
    } finally {
      setIsRemovingPayment(false);
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case PaymentMethodType.VODAFONE_CASH:
        return <Smartphone className="h-5 w-5" />;
      case PaymentMethodType.INSTAPAY:
        return <Wallet className="h-5 w-5" />;
      case PaymentMethodType.FAWRY:
        return <CreditCard className="h-5 w-5" />;
      case PaymentMethodType.BANK_ACCOUNT:
        return <Building className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodLabel = (type: string) => {
    switch (type) {
      case PaymentMethodType.VODAFONE_CASH:
        return "Vodafone Cash";
      case PaymentMethodType.INSTAPAY:
        return "Instapay";
      case PaymentMethodType.FAWRY:
        return "Fawry";
      case PaymentMethodType.BANK_ACCOUNT:
        return "Bank Account";
      default:
        return "Payment Method";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Payments
          </CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
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
                      <p className="font-medium">
                        {getPaymentMethodLabel(method.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {method.displayInfo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Default
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultPayment(method.id)}
                        disabled={isSettingDefault === method.id}
                      >
                        {isSettingDefault === method.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Set as Default"
                        )}
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!method.isDefault && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleSetDefaultPayment(method.id)}
                              disabled={isSettingDefault === method.id}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Set as Default
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setPaymentToRemove(method)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Method
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
              <h3 className="text-lg font-semibold mb-2">
                No payment methods
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Add a payment method to manage subscriptions and purchases.
              </p>
            </div>
          )}
          <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Choose a payment method and enter your details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Payment Method Type *</Label>
                  <Select
                    value={selectedPaymentType}
                    onValueChange={(value) => setSelectedPaymentType(value as PaymentMethodType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentMethodType.VODAFONE_CASH}>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Vodafone Cash
                        </div>
                      </SelectItem>
                      <SelectItem value={PaymentMethodType.INSTAPAY}>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Instapay
                        </div>
                      </SelectItem>
                      <SelectItem value={PaymentMethodType.FAWRY}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Fawry
                        </div>
                      </SelectItem>
                      <SelectItem value={PaymentMethodType.BANK_ACCOUNT}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Bank Account
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPaymentType === PaymentMethodType.VODAFONE_CASH && (
                  <div className="space-y-2">
                    <Label htmlFor="vodafoneNumber">Vodafone Cash Number *</Label>
                    <Input
                      id="vodafoneNumber"
                      placeholder="01XXXXXXXXX"
                      value={newPaymentData.vodafoneNumber}
                      onChange={(e) =>
                        setNewPaymentData({ ...newPaymentData, vodafoneNumber: e.target.value })
                      }
                    />
                  </div>
                )}

                {selectedPaymentType === PaymentMethodType.INSTAPAY && (
                  <div className="space-y-2">
                    <Label htmlFor="instapayId">Instapay ID *</Label>
                    <Input
                      id="instapayId"
                      placeholder="Your Instapay ID"
                      value={newPaymentData.instapayId}
                      onChange={(e) =>
                        setNewPaymentData({ ...newPaymentData, instapayId: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your phone number or email registered with Instapay
                    </p>
                  </div>
                )}

                {selectedPaymentType === PaymentMethodType.FAWRY && (
                  <div className="space-y-2">
                    <Label htmlFor="fawryNumber">Fawry Reference Number *</Label>
                    <Input
                      id="fawryNumber"
                      placeholder="Your Fawry number"
                      value={newPaymentData.fawryNumber}
                      onChange={(e) =>
                        setNewPaymentData({ ...newPaymentData, fawryNumber: e.target.value })
                      }
                    />
                  </div>
                )}

                {selectedPaymentType === PaymentMethodType.BANK_ACCOUNT && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                      <Input
                        id="accountHolderName"
                        placeholder="John Doe"
                        value={newPaymentData.accountHolderName}
                        onChange={(e) =>
                          setNewPaymentData({ ...newPaymentData, accountHolderName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g., National Bank of Egypt"
                        value={newPaymentData.bankName}
                        onChange={(e) =>
                          setNewPaymentData({ ...newPaymentData, bankName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        placeholder="XXXXXXXXXXXX"
                        value={newPaymentData.accountNumber}
                        onChange={(e) =>
                          setNewPaymentData({ ...newPaymentData, accountNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iban">IBAN (Optional)</Label>
                      <Input
                        id="iban"
                        placeholder="EGXXXXXXXXXXXXXXXXXXXXXXXXX"
                        value={newPaymentData.iban}
                        onChange={(e) =>
                          setNewPaymentData({ ...newPaymentData, iban: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                <p className="text-xs text-muted-foreground">
                  🔒 Your payment information is encrypted and stored securely.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddPaymentDialogOpen(false);
                    setNewPaymentData({
                      vodafoneNumber: "",
                      instapayId: "",
                      fawryNumber: "",
                      accountHolderName: "",
                      bankName: "",
                      accountNumber: "",
                      iban: "",
                    });
                  }}
                  disabled={isAddingPayment}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddPaymentMethod} disabled={isAddingPayment}>
                  {isAddingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Payment Method
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <AlertDialog open={!!paymentToRemove} onOpenChange={() => setPaymentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? 
              This action cannot be undone and you'll need to add it again if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingPayment}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePaymentMethod}
              disabled={isRemovingPayment}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemovingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Method
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
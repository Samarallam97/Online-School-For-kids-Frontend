import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CreditCard,
  Plus,
  Trash2,
  Loader2,
  Building2,
  DollarSign,
  Smartphone,
  Wallet,
  CheckCircle2,
  Building,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService, PaymentMethod } from "@/services/userService";
import { creatorService, PayoutDto } from "@/services/creatorService";

enum PaymentMethodType {
  VODAFONE_CASH = "vodafone_cash",
  INSTAPAY = "instapay",
  FAWRY = "fawry",
  BANK_ACCOUNT = "bank_account",
}

export function CreatorPayoutSettingsTab() {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [nextPayout, setNextPayout] = useState<PayoutDto | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingSetting, setIsAddingSetting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSettingDefaultId, setIsSettingDefaultId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<string | null>(null);

  const [newSetting, setNewSetting] = useState({
    type: PaymentMethodType.VODAFONE_CASH,
    phoneNumber: "",
    instapayId: "",
    fawryNumber: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    iban: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [methods, payoutsData] = await Promise.all([
        userService.getPaymentMethods(),
        creatorService.getPayouts({ limit: 5 }),
      ]);
      setPaymentMethods(methods);
      setNextPayout(payoutsData.nextPayout || null);
      setPayoutHistory(payoutsData.payouts || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load payout data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSetting = async () => {
    try {
      setIsAddingSetting(true);

      let paymentMethodData: any = { type: newSetting.type };

      switch (newSetting.type) {
        case PaymentMethodType.VODAFONE_CASH:
          if (!newSetting.phoneNumber) {
            toast({
              title: "Validation Error",
              description: "Please enter your Vodafone Cash number",
              variant: "destructive",
            });
            return;
          }
          paymentMethodData.phoneNumber = newSetting.phoneNumber;
          break;

        case PaymentMethodType.INSTAPAY:
          if (!newSetting.instapayId) {
            toast({
              title: "Validation Error",
              description: "Please enter your Instapay ID",
              variant: "destructive",
            });
            return;
          }
          paymentMethodData.instapayId = newSetting.instapayId;
          break;

        case PaymentMethodType.FAWRY:
          if (!newSetting.fawryNumber) {
            toast({
              title: "Validation Error",
              description: "Please enter your Fawry reference number",
              variant: "destructive",
            });
            return;
          }
          paymentMethodData.referenceNumber = newSetting.fawryNumber;
          break;

        case PaymentMethodType.BANK_ACCOUNT:
          if (!newSetting.accountHolderName || !newSetting.bankName || !newSetting.accountNumber) {
            toast({
              title: "Validation Error",
              description: "Please fill in all required bank account details",
              variant: "destructive",
            });
            return;
          }
          paymentMethodData.accountHolderName = newSetting.accountHolderName;
          paymentMethodData.bankName = newSetting.bankName;
          paymentMethodData.accountNumber = newSetting.accountNumber;
          paymentMethodData.iban = newSetting.iban;
          break;
      }

      const newPaymentMethod = await userService.addPaymentMethod(paymentMethodData);
      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      setShowAddDialog(false);
      setNewSetting({
        type: PaymentMethodType.VODAFONE_CASH,
        phoneNumber: "",
        instapayId: "",
        fawryNumber: "",
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        iban: "",
      });

      toast({
        title: "Success",
        description: "Payout method added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add payout method",
        variant: "destructive",
      });
    } finally {
      setIsAddingSetting(false);
    }
  };

  const handleSetDefault = async (settingId: string) => {
    try {
      setIsSettingDefaultId(settingId);
      await userService.setDefaultPaymentMethod(settingId);
      
      setPaymentMethods(
        paymentMethods.map((method) => ({
          ...method,
          isDefault: method.id === settingId,
        }))
      );

      toast({
        title: "Success",
        description: "Default payout method updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to set default method",
        variant: "destructive",
      });
    } finally {
      setIsSettingDefaultId(null);
    }
  };

  const handleDelete = async () => {
    if (!settingToDelete) return;

    try {
      setIsDeletingId(settingToDelete);
      await userService.removePaymentMethod(settingToDelete);
      setPaymentMethods(paymentMethods.filter((s) => s.id !== settingToDelete));
      setShowDeleteDialog(false);
      setSettingToDelete(null);

      toast({
        title: "Success",
        description: "Payout method deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete payout method",
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "EGP"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getPayoutIcon = (type: string) => {
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

  const getPayoutTypeLabel = (type: string): string => {
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
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Next Payout Card */}
      {nextPayout && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Next Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Scheduled for</p>
                  <p className="text-lg font-medium">{formatDate(nextPayout.scheduledDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                    {formatCurrency(nextPayout.amount, nextPayout.currency)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {nextPayout.status}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {nextPayout.month} {nextPayout.year} earnings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Payout Methods
              </CardTitle>
              <CardDescription>Manage how you receive your earnings</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Method
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Payout Method</DialogTitle>
                  <DialogDescription>
                    Add a new payout method to receive your earnings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Type *</Label>
                    <Select
                      value={newSetting.type}
                      onValueChange={(value: PaymentMethodType) =>
                        setNewSetting({ ...newSetting, type: value })
                      }
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

                  {newSetting.type === PaymentMethodType.VODAFONE_CASH && (
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Vodafone Cash Number *</Label>
                      <Input
                        id="phoneNumber"
                        value={newSetting.phoneNumber}
                        onChange={(e) =>
                          setNewSetting({ ...newSetting, phoneNumber: e.target.value })
                        }
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                  )}

                  {newSetting.type === PaymentMethodType.INSTAPAY && (
                    <div className="space-y-2">
                      <Label htmlFor="instapayId">Instapay ID *</Label>
                      <Input
                        id="instapayId"
                        value={newSetting.instapayId}
                        onChange={(e) =>
                          setNewSetting({ ...newSetting, instapayId: e.target.value })
                        }
                        placeholder="Your Instapay ID"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your phone number or email registered with Instapay
                      </p>
                    </div>
                  )}

                  {newSetting.type === PaymentMethodType.FAWRY && (
                    <div className="space-y-2">
                      <Label htmlFor="fawryNumber">Fawry Reference Number *</Label>
                      <Input
                        id="fawryNumber"
                        value={newSetting.fawryNumber}
                        onChange={(e) =>
                          setNewSetting({ ...newSetting, fawryNumber: e.target.value })
                        }
                        placeholder="Your Fawry number"
                      />
                    </div>
                  )}

                  {newSetting.type === PaymentMethodType.BANK_ACCOUNT && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                        <Input
                          id="accountHolderName"
                          value={newSetting.accountHolderName}
                          onChange={(e) =>
                            setNewSetting({
                              ...newSetting,
                              accountHolderName: e.target.value,
                            })
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name *</Label>
                        <Input
                          id="bankName"
                          value={newSetting.bankName}
                          onChange={(e) =>
                            setNewSetting({ ...newSetting, bankName: e.target.value })
                          }
                          placeholder="e.g., National Bank of Egypt"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number *</Label>
                        <Input
                          id="accountNumber"
                          value={newSetting.accountNumber}
                          onChange={(e) =>
                            setNewSetting({ ...newSetting, accountNumber: e.target.value })
                          }
                          placeholder="XXXXXXXXXXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iban">IBAN (Optional)</Label>
                        <Input
                          id="iban"
                          value={newSetting.iban}
                          onChange={(e) =>
                            setNewSetting({ ...newSetting, iban: e.target.value })
                          }
                          placeholder="EGXXXXXXXXXXXXXXXXXXXXXXXXX"
                        />
                      </div>
                    </>
                  )}

                  <p className="text-xs text-muted-foreground">
                    🔒 Your payout information is encrypted and stored securely.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    disabled={isAddingSetting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddSetting} disabled={isAddingSetting}>
                    {isAddingSetting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Method
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No payout methods added yet</p>
              <p className="text-sm mt-1">Add a payout method to receive your earnings</p>
            </div>
          ) : (
            paymentMethods.map((method) => (
              <div
                key={method.id}
                className="rounded-lg border p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-muted rounded">
                    {getPayoutIcon(method.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">
                        {getPayoutTypeLabel(method.type)}
                      </p>
                      {method.isDefault && (
                        <Badge variant="default" className="text-xs gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {method.displayInfo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                      disabled={isSettingDefaultId === method.id}
                    >
                      {isSettingDefaultId === method.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Set Default"
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSettingToDelete(method.id);
                      setShowDeleteDialog(true);
                    }}
                    disabled={isDeletingId === method.id || method.isDefault}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
          <CardDescription>Your payout history from recent months</CardDescription>
        </CardHeader>
        <CardContent>
          {payoutHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No payout history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payoutHistory.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">
                      {payout.month} {payout.year}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payout.processedDate || payout.scheduledDate)}
                    </p>
                    <Badge
                      variant={
                        payout.status === "completed"
                          ? "default"
                          : payout.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs mt-1 capitalize"
                    >
                      {payout.status}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatCurrency(payout.amount, payout.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payout Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payout method? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSettingToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
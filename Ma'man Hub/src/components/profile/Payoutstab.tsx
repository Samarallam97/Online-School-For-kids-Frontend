import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService, PayoutDto } from "@/services/userService";

interface PayoutsTabProps {
  role?: "creator" | "specialist";
}

export function PayoutsTab({ role }: PayoutsTabProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [nextPayout, setNextPayout] = useState<PayoutDto | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutDto[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getPayouts({ limit: 10 });
        setNextPayout(data.nextPayout || null);
        setPayoutHistory(data.payouts || []);
        setTotal(data.total || 0);
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

    fetchPayouts();
  }, []);

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatCurrency = (amount: number, currency: string = "EGP"): string =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const getStatusVariant = (
    status: PayoutDto["status"]
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "completed":  return "default";
      case "failed":     return "destructive";
      case "processing": return "secondary";
      default:           return "outline";
    }
  };

  const totalEarned = payoutHistory
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const currency = payoutHistory[0]?.currency || nextPayout?.currency || "EGP";

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
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-xl font-bold">{formatCurrency(totalEarned, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payouts</p>
                <p className="text-xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/10 p-2">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Payout</p>
                <p className="text-xl font-bold">
                  {nextPayout
                    ? formatCurrency(nextPayout.amount, nextPayout.currency)
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Payout */}
      {nextPayout && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Upcoming Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Scheduled for</p>
                  <p className="text-lg font-semibold">{formatDate(nextPayout.scheduledDate)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {nextPayout.month} {nextPayout.year} earnings
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                    {formatCurrency(nextPayout.amount, nextPayout.currency)}
                  </p>
                  <Badge variant="secondary" className="mt-2 capitalize">
                    {nextPayout.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            {total > 0
              ? `${total} payout${total !== 1 ? "s" : ""} total`
              : "Your complete payout history"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payoutHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mb-3 opacity-40" />
              <p className="font-medium">No payouts yet</p>
              <p className="text-sm mt-1">
                Your payout history will appear here once you start earning.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payoutHistory.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {payout.month} {payout.year}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payout.processedDate || payout.scheduledDate)}
                    </p>
                    <Badge
                      variant={getStatusVariant(payout.status)}
                      className="text-xs capitalize"
                    >
                      {payout.status}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatCurrency(payout.amount, payout.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Save, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { specialistService } from "@/services/specialistService";
import { userService } from "@/services/userService";

export function RatesTab() {
  const { toast } = useToast();
  const [hourlyRate, setHourlyRate] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [isSavingRate, setIsSavingRate] = useState(false);
  const [originalRate, setOriginalRate] = useState("0");

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await userService.getProfile();
        const rate = profile.hourlyRate?.toString() ?? "0";
        setHourlyRate(rate);
        setOriginalRate(rate);
      } catch {
        toast({ title: "Error", description: "Failed to load rates", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveRate = async () => {
    try {
      setIsSavingRate(true);
      await specialistService.updateSessionRates({ hourlyRate: parseFloat(hourlyRate) });
      setOriginalRate(hourlyRate);
      setIsEditingRate(false);
      toast({ title: "Saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setIsSavingRate(false);
    }
  };

  const handleCancel = () => {
    setHourlyRate(originalRate);
    setIsEditingRate(false);
  };

  if (isLoading) return (
    <Card><CardContent className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Session Rates</CardTitle>
            <CardDescription>Configure your consultation pricing</CardDescription>
          </div>
          {isEditingRate ? (
            <div className="flex gap-2">
              <Button onClick={handleSaveRate} disabled={isSavingRate}>
                {isSavingRate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSavingRate}>
                <X className="mr-2 h-4 w-4" />Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditingRate(true)}>Edit Rates</Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Hourly Rate ($)</Label>
          <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} disabled={!isEditingRate} className="max-w-xs" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[{ label: "30-min Session", m: 0.5 }, { label: "60-min Session", m: 1 }, { label: "90-min Session", m: 1.5 }].map(({ label, m }) => (
            <div key={label} className="rounded-lg border p-4">
              <h4 className="font-medium text-sm text-muted-foreground">{label}</h4>
              <p className="text-3xl font-bold mt-2">${(parseFloat(hourlyRate || "0") * m).toFixed(0)}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            Platform fee: 15% per session. You'll receive <strong>${(parseFloat(hourlyRate || "0") * 0.85).toFixed(2)}</strong> per hour after fees.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
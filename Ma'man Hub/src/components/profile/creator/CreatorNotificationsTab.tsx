import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Bell, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService, NotificationPreferences } from "@/services/userService";

export function CreatorNotificationsTab() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    progressUpdates: true,
    weeklyReports: true,
    achievementAlerts: true,
    paymentReminders: true,
    courseEnrollments: true,
    studentMessages: true,
    reviewNotifications: true,
    payoutAlerts: true,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getNotificationPreferences();
      setPreferences(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await userService.updateNotificationPreferences(preferences);
      toast({
        title: "Success",
        description: "Notification preferences updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications about your courses and students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Course Management */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="courseEnrollments">New Enrollments</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when students enroll in your courses
                </p>
              </div>
              <Switch
                id="courseEnrollments"
                checked={preferences.courseEnrollments || false}
                onCheckedChange={() => handleToggle("courseEnrollments")}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="progressUpdates">Student Progress</Label>
                <p className="text-sm text-muted-foreground">
                  Updates about student progress in your courses
                </p>
              </div>
              <Switch
                id="progressUpdates"
                checked={preferences.progressUpdates}
                onCheckedChange={() => handleToggle("progressUpdates")}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="reviewNotifications">Course Reviews</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when students review your courses
                </p>
              </div>
              <Switch
                id="reviewNotifications"
                checked={preferences.reviewNotifications || false}
                onCheckedChange={() => handleToggle("reviewNotifications")}
              />
            </div>
          </div>
        </div>

        {/* Communication */}
        <div className="space-y-4">
          {/* <h3 className="font-medium">Communication</h3> */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="studentMessages">Student Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for new messages from students
                </p>
              </div>
              <Switch
                id="studentMessages"
                checked={preferences.studentMessages || false}
                onCheckedChange={() => handleToggle("studentMessages")}
              />
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="space-y-4">
          {/* <h3 className="font-medium">Financial</h3> */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="payoutAlerts">Payout Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Updates about your earnings and payout schedule
                </p>
              </div>
              <Switch
                id="payoutAlerts"
                checked={preferences.payoutAlerts || false}
                onCheckedChange={() => handleToggle("payoutAlerts")}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="paymentReminders">Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders about upcoming payouts and payment methods
                </p>
              </div>
              <Switch
                id="paymentReminders"
                checked={preferences.paymentReminders}
                onCheckedChange={() => handleToggle("paymentReminders")}
              />
            </div>
          </div>
        </div>

        {/* Reports */}
        <div className="space-y-4">
          {/* <h3 className="font-medium">Reports & Analytics</h3> */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="weeklyReports">Weekly Performance Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Summary of your course performance and earnings
                </p>
              </div>
              <Switch
                id="weeklyReports"
                checked={preferences.weeklyReports}
                onCheckedChange={() => handleToggle("weeklyReports")}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="achievementAlerts">Milestones & Achievements</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when you reach course or revenue milestones
                </p>
              </div>
              <Switch
                id="achievementAlerts"
                checked={preferences.achievementAlerts}
                onCheckedChange={() => handleToggle("achievementAlerts")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
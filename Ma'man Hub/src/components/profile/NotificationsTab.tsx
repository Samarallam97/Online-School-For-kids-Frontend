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

type UserRole = "student" | "parent" | "creator" | "specialist";

interface NotificationSection {
  title: string;
  rows: {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
  }[];
}

function getSections(role: UserRole): NotificationSection[] {
  const sections: NotificationSection[] = [];

  // ── Shared by all roles except admin ──────────────────────────────────────
  sections.push({
    title: "General",
    rows: [
      {
        key: "weeklyReports",
        label: "Weekly Reports",
        description: "Receive a weekly summary report",
      },
      {
        key: "messages",
        label: "Messages",
        description: "Notifications for new messages",
      },
      {
        key: "commentReplies",
        label: "Comment Replies",
        description: "Notifications when someone replies to your comments",
      },
    ],
  });

  // ── Student & Parent ───────────────────────────────────────────────────────
  if (role === "student" || role === "parent") {
    sections.push({
      title: "Learning",
      rows: [
        {
          key: "progressUpdates",
          label: "Progress Updates",
          description:
            role === "parent"
              ? "Updates about your child's learning progress"
              : "Updates about your learning progress",
        },
        {
          key: "achievementAlerts",
          label: "Achievement Alerts",
          description:
            role === "parent"
              ? "Notifications when your child earns achievements"
              : "Notifications when you earn achievements or reach milestones",
        },
        {
          key: "paymentReminders",
          label: "Payment Reminders",
          description: "Reminders about upcoming payments and renewals",
        },
      ],
    });
  }

  // ── Creator ────────────────────────────────────────────────────────────────
  if (role === "creator") {
    sections.push({
      title: "Course Management",
      rows: [
        {
          key: "courseEnrollments",
          label: "New Enrollments",
          description: "Get notified when students enroll in your courses",
        },
        {
          key: "reviewNotifications",
          label: "Course Reviews",
          description: "Notifications when students review your courses",
        },
      ],
    });
  }

  // ── Specialist ─────────────────────────────────────────────────────────────
  if (role === "specialist") {
    sections.push({
      title: "Sessions",
      rows: [
        {
          key: "newSessionBooking",
          label: "New Session Booking",
          description: "When a student books a session with you",
        },
        {
          key: "sessionCancellation",
          label: "Session Cancellation",
          description: "When a student cancels a booked session",
        },
        {
          key: "sessionReminder",
          label: "Session Reminders",
          description: "Reminders before upcoming sessions",
        },
        {
          key: "reviewNotifications",
          label: "Session Reviews",
          description: "When a student leaves a review after a session",
        },
      ],
    });
  }

  // ── Creator & Specialist ───────────────────────────────────────────────────
  if (role === "creator" || role === "specialist") {
    sections.push({
      title: "Payments",
      rows: [
        {
          key: "payoutAlerts",
          label: "Payout Alerts",
          description: "Updates about your earnings and payout schedule",
        },
      ],
    });
  }

  return sections;
}

function getDefaultPreferences(role: UserRole): NotificationPreferences {
  const base: NotificationPreferences = {
    weeklyReports: true,
    messages: true,
    commentReplies: true,
  };

  if (role === "student" || role === "parent") {
    base.progressUpdates = true;
    base.achievementAlerts = true;
    base.paymentReminders = true;
  }

  if (role === "creator") {
    base.courseEnrollments = true;
    base.reviewNotifications = true;
    base.payoutAlerts = true;
  }

  if (role === "specialist") {
    base.newSessionBooking = true;
    base.sessionCancellation = true;
    base.sessionReminder = true;
    base.reviewNotifications = true;
    base.payoutAlerts = true;
  }

  return base;
}

interface NotificationsTabProps {
  role: UserRole;
}

export function NotificationsTab({ role }: NotificationsTabProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    getDefaultPreferences(role)
  );

  const sections = getSections(role);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getNotificationPreferences();
        // Merge fetched prefs with role defaults so keys not returned by
        // the API still have sensible initial values.
        setPreferences((prev) => ({ ...prev, ...data }));
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message ||
            "Failed to load notification preferences",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [role]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    // Only send keys relevant to the current role
    const relevantKeys = sections.flatMap((s) => s.rows.map((r) => r.key));
    const payload: NotificationPreferences = {};
    for (const key of relevantKeys) {
      payload[key] = preferences[key];
    }

    try {
      setIsSaving(true);
      await userService.updateNotificationPreferences(payload);
      toast({
        title: "Saved",
        description: "Notification preferences updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control which notifications you receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map(({ title, rows }) => (
          <div key={title} className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {title}
            </p>
            {rows.map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex-1 space-y-0.5">
                  <Label htmlFor={key} className="cursor-pointer">
                    {label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  id={key}
                  checked={preferences[key] ?? false}
                  onCheckedChange={() => handleToggle(key)}
                />
              </div>
            ))}
          </div>
        ))}

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
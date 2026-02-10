import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Loader2, Users, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService, NotificationPreferences } from "@/services/userService";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function NotificationsTab() {
  const { toast } = useToast();
  const [studentNotifications, setStudentNotifications] = useState<NotificationPreferences>({
    progressUpdates: true,
    weeklyReports: true,
    achievementAlerts: true,
    paymentReminders: true,
  });
  const [isLoadingStudent, setIsLoadingStudent] = useState(true);

  // Fetch student notification preferences
  useEffect(() => {
    const fetchStudentPreferences = async () => {
      try {
        setIsLoadingStudent(true);
        const userData = await userService.getNotificationPreferences();
          setStudentNotifications(userData);
      } catch (error: any) {
        console.error("Failed to load student preferences:", error);
      } finally {
        setIsLoadingStudent(false);
      }
    };

    fetchStudentPreferences();
  }, []);



  const handleStudentNotificationChange = async (
    key: keyof NotificationPreferences,
    checked: boolean
  ) => {
    const updatedNotifications = { ...studentNotifications, [key]: checked };
    setStudentNotifications(updatedNotifications);

    try {
      await userService.updateNotificationPreferences(updatedNotifications);
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error: any) {
      setStudentNotifications(studentNotifications);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update preferences",
        variant: "destructive",
      });
    }
  };


  const getNotificationLabel = (key: string) => {
    const labels: Record<string, { title: string; description: string }> = {
      progressUpdates: {
        title: "Progress Updates",
        description: "Receive notifications about learning progress and milestones",
      },
      weeklyReports: {
        title: "Weekly Reports",
        description: "Get weekly summaries of learning activities and achievements",
      },
      achievementAlerts: {
        title: "Achievement Alerts",
        description: "Be notified when new achievements are earned",
      },
      paymentReminders: {
        title: "Payment Reminders",
        description: "Receive reminders for subscription and payment due dates",
      },
    };
    return labels[key] || { title: key, description: "" };
  };

  if (isLoadingStudent ) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Notification Preferences */}
      <Card>
        <CardHeader>
          {/* <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Notification Preferences
              </CardTitle>
              <CardDescription>Control how you receive updates about your own learning</CardDescription>
            </div>
            <Badge variant="secondary">Student</Badge>
          </div> */}
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(studentNotifications).map(([key, value]) => {
            const { title, description } = getNotificationLabel(key);
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) =>
                    handleStudentNotificationChange(
                      key as keyof NotificationPreferences,
                      checked
                    )
                  }
                />
              </div>
            );
          })}
        </CardContent>
      </Card>


    </div>
  );
}
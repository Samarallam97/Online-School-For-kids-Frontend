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
import { Child, parentService } from "@/services/parentService";

export function NotificationsTab() {
  const { toast } = useToast();
  const [parentNotifications, setParentNotifications] = useState<NotificationPreferences>({
    progressUpdates: true,
    weeklyReports: true,
    achievementAlerts: true,
    paymentReminders: true,
  });
  const [childrenNotifications, setChildrenNotifications] = useState<Map<string, NotificationPreferences>>(new Map());
  const [linkedChildren, setLinkedChildren] = useState<Child[]>([]);
  const [isLoadingParent, setIsLoadingParent] = useState(true);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);

  // Fetch parent notification preferences
  useEffect(() => {
    const fetchParentPreferences = async () => {
      try {
        setIsLoadingParent(true);
        const userData = await userService.getNotificationPreferences();
          setParentNotifications(userData);
      } catch (error: any) {
        console.error("Failed to load parent preferences:", error);
      } finally {
        setIsLoadingParent(false);
      }
    };

    fetchParentPreferences();
  }, []);

  // Fetch children and their notification preferences
  useEffect(() => {
    const fetchChildrenPreferences = async () => {
      try {
        setIsLoadingChildren(true);
        const children = await parentService.getLinkedChildren();
        setLinkedChildren(children);

        // Fetch notification preferences for each child
        const childPrefsMap = new Map<string, NotificationPreferences>();
        for (const child of children) {
          try {
            const prefs = await parentService.getChildNotificationPreferences(child.id);
            childPrefsMap.set(child.id, prefs);
          } catch (error) {
            // Use default preferences if fetch fails
            childPrefsMap.set(child.id, {
              progressUpdates: true,
              weeklyReports: true,
              achievementAlerts: true,
              paymentReminders: true,
            });
          }
        }
        setChildrenNotifications(childPrefsMap);
      } catch (error: any) {
        console.error("Failed to load children preferences:", error);
        setLinkedChildren([]);
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchChildrenPreferences();
  }, []);

  const handleParentNotificationChange = async (
    key: keyof NotificationPreferences,
    checked: boolean
  ) => {
    const updatedNotifications = { ...parentNotifications, [key]: checked };
    setParentNotifications(updatedNotifications);

    try {
      await userService.updateNotificationPreferences(updatedNotifications);
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error: any) {
      setParentNotifications(parentNotifications);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update preferences",
        variant: "destructive",
      });
    }
  };

  const handleChildNotificationChange = async (
    childId: string,
    key: keyof NotificationPreferences,
    checked: boolean
  ) => {
    const currentPrefs = childrenNotifications.get(childId) || {
      progressUpdates: true,
      weeklyReports: true,
      achievementAlerts: true,
      paymentReminders: true,
    };
    
    const updatedNotifications = { ...currentPrefs, [key]: checked };
    
    // Update local state
    const newMap = new Map(childrenNotifications);
    newMap.set(childId, updatedNotifications);
    setChildrenNotifications(newMap);

    try {
      await parentService.updateChildNotificationPreferences(childId, updatedNotifications);
      toast({
        title: "Preferences Updated",
        description: "Child notification preferences have been saved.",
      });
    } catch (error: any) {
      // Revert on error
      const revertMap = new Map(childrenNotifications);
      revertMap.set(childId, currentPrefs);
      setChildrenNotifications(revertMap);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update child preferences",
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

  if (isLoadingParent || isLoadingChildren) {
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
      {/* Parent Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Notification Preferences
              </CardTitle>
              <CardDescription>Control how you receive updates about your own learning</CardDescription>
            </div>
            <Badge variant="secondary">Parent</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(parentNotifications).map(([key, value]) => {
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
                    handleParentNotificationChange(
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

      {/* Children Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Children's Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage notification settings for each of your children
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkedChildren.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {linkedChildren.map((child) => {
                const childPrefs = childrenNotifications.get(child.id) || {
                  progressUpdates: true,
                  weeklyReports: true,
                  achievementAlerts: true,
                  paymentReminders: true,
                };

                return (
                  <AccordionItem key={child.id} value={child.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={child.profilePictureUrl || child.avatar}
                            alt={child.name}
                          />
                          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <p className="font-medium">{child.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Age {child.age}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-3">
                        {Object.entries(childPrefs).map(([key, value]) => {
                          const { title, description } = getNotificationLabel(key);
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between rounded-lg border p-4"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {description}
                                </p>
                              </div>
                              <Switch
                                checked={value}
                                onCheckedChange={(checked) =>
                                  handleChildNotificationChange(
                                    child.id,
                                    key as keyof NotificationPreferences,
                                    checked
                                  )
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No children linked</h3>
              <p className="text-muted-foreground max-w-sm">
                Link your children's accounts to manage their notification preferences.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Users,
  Shield,
  BookOpen,
  Trophy,
  Clock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";


// Import sub-components
import { PersonalInfoTab } from "@/components/profile/parent/PersonalInfoTab";
import { ChildrenManagementTab } from "@/components/profile/parent/ChildrenManagementTab";
import { NotificationsTab } from "@/components/profile/parent/NotificationsTab";
import { BillingTab } from "@/components/profile/parent/BillingTab";
import { CoursesTab } from "@/components/profile/parent/CoursesTab";
import { AchievementsTab } from "@/components/profile/parent/AchievementsTab";
import { userService, ProfileDto } from "@/services/userService";

export default function ParentProfilePage() {
  const { toast } = useToast();
  const [userData, setUserData] = useState<ProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getProfile();
        setUserData(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const getInitials = (): string => {
    if (!userData?.fullName) return "U";
    const parts = userData.fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
    }
    return userData.fullName.charAt(0);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={userData.profilePictureUrl}
                    alt={userData.fullName}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{userData.fullName}</h1>
                <p className="text-muted-foreground">Parent Account</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Badge variant="secondary">
                    <Users className="mr-1 h-3 w-3" />
                    {userData.childrenCount || 0} Children
                  </Badge>
                  <Badge variant="secondary">
                    <BookOpen className="mr-1 h-3 w-3" />
                    {userData.enrolledCourses || 0} Courses
                  </Badge>
                  <Badge variant="secondary">
                    <Trophy className="mr-1 h-3 w-3" />
                    {userData.achievements || 0} Achievements
                  </Badge>
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    {userData.totalHoursLearned || 0} Hours Learned
                  </Badge>
                  {/* <Badge variant="secondary">
                    <Shield className="mr-1 h-3 w-3" />
                    Parental Controls{" "}
                    {userData.parentalControlsActive ? "Active" : "Inactive"}
                  </Badge> */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <PersonalInfoTab 
              userData={userData} 
              setUserData={setUserData}
              isActive={activeTab === "profile"}
            />
          </TabsContent>

          {/* My Courses Tab */}
          <TabsContent value="courses">
            <CoursesTab />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementsTab />
          </TabsContent>

          {/* Children Tab */}
          <TabsContent value="children">
            <ChildrenManagementTab />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <BillingTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
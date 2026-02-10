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
  BookOpen,
  Trophy,
  Clock,
  Loader2,
  MessageSquare,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService, ProfileDto } from "@/services/userService";
import { Link, useLocation } from "react-router-dom";

// Import sub-components
import { PersonalInfoTab } from "@/components/profile/student/StudentPersonalInfoTab";
import { CoursesTab } from "@/components/profile/parent/CoursesTab";
import { AchievementsTab } from "@/components/profile/parent/AchievementsTab";
import { NotificationsTab } from "@/components/profile/student/StudentNotificationTab";
import { BillingTab } from "@/components/profile/parent/BillingTab";
import { ParentLinkCard } from "@/components/profile/student/ParentLinkCard";

export default function StudentProfilePage() {
  const { toast } = useToast();
  const location = useLocation();
  const [userData, setUserData] = useState<ProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("profile");

  // Check if redirected from accept invite
  const showParentLinked = location.state?.showParentLinked || false;
  const parentName = location.state?.parentName;

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

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${userData?.id}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

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
                  <AvatarImage src={userData.profilePictureUrl} alt={userData.fullName} />
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
                <p className="text-muted-foreground capitalize">{userData.role || "Student"}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
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
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/messages">
                  <Button variant="outline" size="icon">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  title="Share Profile"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="parent">Parent</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <PersonalInfoTab 
              userData={userData} 
              setUserData={setUserData}
              isActive={currentTab === "profile"}
            />
          </TabsContent>

          {/* Parent Tab */}
          <TabsContent value="parent">
            <ParentLinkCard 
              showSuccessMessage={showParentLinked}
              parentNameFromInvite={parentName}
            />
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <CoursesTab />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementsTab />
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
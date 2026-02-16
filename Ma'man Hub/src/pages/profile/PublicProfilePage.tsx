import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Trophy,
  Clock,
  Loader2,
  MapPin,
  Calendar,
  ArrowLeft,
  GraduationCap,
  Award,
  TrendingUp,
  MessageSquare,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService, PublicProfileDto } from "@/services/userService";
import { ShareProfileDialog } from "@/components/profile/ShareProfileDialog";

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<PublicProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!userId) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const data = await userService.getPublicProfile(userId);
        setProfileData(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load profile",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId, navigate, toast]);

  const getInitials = (): string => {
    if (!profileData?.fullName) return "U";
    const parts = profileData.fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
    }
    return profileData.fullName.charAt(0);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSendMessage = () => {
    // Navigate to messages page with userId as parameter
    navigate(`/messages?userId=${userId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profileData.profilePictureUrl} alt={profileData.fullName} />
                  <AvatarFallback className="text-4xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-3xl font-bold">{profileData.fullName}</h1>
                  <p className="text-muted-foreground capitalize mt-1">
                    {profileData.role}
                  </p>
                </div>

                {profileData.bio && (
                  <p className="text-muted-foreground max-w-2xl">
                    {profileData.bio}
                  </p>
                )}

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {profileData.country && (
                    <Badge variant="secondary">
                      <MapPin className="mr-1 h-3 w-3" />
                      {profileData.country}
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    <Calendar className="mr-1 h-3 w-3" />
                    Joined {formatDate(profileData.joinedDate)}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSendMessage}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <ShareProfileDialog
                    userId={profileData.id}
                    userName={profileData.fullName}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profileData.enrolledCourses || 0}</p>
                  <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profileData.achievements || 0}</p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profileData.totalHoursLearned || 0}</p>
                  <p className="text-sm text-muted-foreground">Hours Learned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements Section - Show all achievements, not just recent ones */}
        {profileData.recentAchievements && profileData.recentAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements ({profileData.recentAchievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {profileData.recentAchievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="p-2 bg-yellow-500/10 rounded-full">
                        <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(achievement.earnedDate)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State for Achievements */}
        {(!profileData.recentAchievements || profileData.recentAchievements.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No achievements yet</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">
                    Complete courses and challenges to earn achievements
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Courses Section */}
        {profileData.enrolledCoursesList && profileData.enrolledCoursesList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Current Courses ({profileData.enrolledCoursesList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileData.enrolledCoursesList.map((course, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{course.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.instructor}
                        </p>
                      </div>
                      {course.progress !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />
                            <span className="text-sm font-medium">{course.progress}%</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State for Courses */}
        {(!profileData.enrolledCoursesList || profileData.enrolledCoursesList.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Current Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No courses enrolled yet</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">
                    Start learning by enrolling in courses
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>This is a public profile on EduPlatform</p>
        </div>
      </div>
    </div>
  );
}
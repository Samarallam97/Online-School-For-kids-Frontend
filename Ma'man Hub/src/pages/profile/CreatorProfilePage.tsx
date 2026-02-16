import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Video, 
  Users, 
  DollarSign,
  Star,
  Loader2,
  MessageSquare,
  Save,
  X,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ShareProfileDialog } from "@/components/profile/ShareProfileDialog";
import { userService, ProfileDto } from "@/services/userService";
import { CreatorNotificationsTab } from "@/components/profile/creator/CreatorNotificationsTab";
import { CreatorPayoutSettingsTab } from "@/components/profile/creator/CreatorPayoutSettingsTab";
import { creatorService } from "@/services/creatorService";
import { ExperienceTab } from "@/components/profile/creator/ExperienceTab";
import { SocialLinksTab } from "@/components/profile/creator/SocialLinksTab";

const COUNTRIES = [
  "Egypt",
  "Iraq",
  "Jordan",
  "Palestine",
  "Saudi Arabia",
  "Syria",
  "Other"
];

interface CreatorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

export default function CreatorProfilePage() {
  const { toast } = useToast();
  const [userData, setUserData] = useState<ProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentTab, setCurrentTab] = useState("profile");
  const [showOtherCountryInput, setShowOtherCountryInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [creatorStats, setCreatorStats] = useState<CreatorStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    otherCountry: "",
    bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getProfile();
        setUserData(data);
        
        // Parse the profile data
        const nameParts = data.fullName?.split(" ") || ["", ""];
        const isOtherCountry = data.country && !COUNTRIES.slice(0, -1).includes(data.country);
        
        setProfile({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: data.email || "",
          phone: data.phone || "",
          country: isOtherCountry ? "Other" : (data.country || ""),
          otherCountry: isOtherCountry ? (data.country || "") : "",
          bio: data.bio || "",
        });

        setShowOtherCountryInput(isOtherCountry);

        // Use creator stats from ProfileDto
        if (data.totalCourses !== undefined) {
          setCreatorStats({
            totalCourses: data.totalCourses,
            totalStudents: data.totalStudents || 0,
            totalRevenue: data.totalRevenue || 0,
            averageRating: data.averageRating || 0,
          });
        }
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

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingImage(true);
      
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await userService.uploadProfilePicture(formData);
      
      // Update local state with new profile picture URL
      setUserData(prev => prev ? {
        ...prev,
        profilePictureUrl: response.profilePictureUrl
      } : null);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.profilePictureUrl = response.profilePictureUrl;
      localStorage.setItem("user", JSON.stringify(user));

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      
      // Determine the actual country value
      const actualCountry = profile.country === "Other" ? profile.otherCountry : profile.country;

      if (!actualCountry) {
        toast({
          title: "Validation Error",
          description: "Please select or enter a country",
          variant: "destructive",
        });
        return;
      }

      // Update profile via API
      const updateData = {
        fullName: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phone,
        country: actualCountry,
        bio: profile.bio,
      };

      const updatedProfile = await userService.updateProfile(updateData);
      
      // Update local state
      setUserData(prev => prev ? {
        ...prev,
        ...updateData,
      } : null);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.fullName = updatedProfile.fullName;
      localStorage.setItem("user", JSON.stringify(user));

      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    // Reset to original values
    if (userData) {
      const nameParts = userData.fullName?.split(" ") || ["", ""];
      const isOtherCountry = userData.country && !COUNTRIES.slice(0, -1).includes(userData.country);
      
      setProfile({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: userData.email || "",
        phone: userData.phone || "",
        country: isOtherCountry ? "Other" : (userData.country || ""),
        otherCountry: isOtherCountry ? (userData.country || "") : "",
        bio: userData.bio || "",
      });
      
      setShowOtherCountryInput(isOtherCountry);
    }
    setIsEditingProfile(false);
  };

  const handleCountryChange = (value: string) => {
    setProfile({ ...profile, country: value });
    setShowOtherCountryInput(value === "Other");
    if (value !== "Other") {
      setProfile(prev => ({ ...prev, otherCountry: "" }));
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

  const courseStats = [
    { label: "Total Courses", value: creatorStats.totalCourses.toString(), icon: Video },
    { label: "Total Students", value: creatorStats.totalStudents.toLocaleString(), icon: Users },
    { label: "Total Revenue", value: `$${creatorStats.totalRevenue.toLocaleString()}`, icon: DollarSign },
    { label: "Avg. Rating", value: creatorStats.averageRating.toFixed(1), icon: Star },
  ];

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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  onClick={handleProfilePictureClick}
                  disabled={isUploadingImage}
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold">
                    {userData.fullName}
                  </h1>
                  <Badge>Verified Creator</Badge>
                </div>
                <p className="text-muted-foreground capitalize">{userData.role || "Content Creator"}</p>
              </div>
              <div className="flex gap-2">
                <Link to="/messages">
                  <Button variant="outline" size="icon">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Link>
                <ShareProfileDialog
                  userId={userData.id}
                  userName={userData.fullName}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {courseStats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-muted/50 p-4 text-center">
                  <stat.icon className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your public creator profile</CardDescription>
                  </div>
                  {isEditingProfile ? (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                        {isSavingProfile ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancelProfile} disabled={isSavingProfile}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditingProfile(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      disabled={!isEditingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      disabled={!isEditingProfile}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9"
                      value={profile.email}
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-9"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditingProfile}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Select
                      value={profile.country}
                      onValueChange={handleCountryChange}
                      disabled={!isEditingProfile}
                    >
                      <SelectTrigger id="country" className="pl-9">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {showOtherCountryInput && (
                  <div className="space-y-2">
                    <Label htmlFor="otherCountry">Enter Country</Label>
                    <Input
                      id="otherCountry"
                      value={profile.otherCountry}
                      onChange={(e) => setProfile({ ...profile, otherCountry: e.target.value })}
                      disabled={!isEditingProfile}
                      placeholder="Enter your country"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    disabled={!isEditingProfile}
                    placeholder="Tell us about yourself and your expertise..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience">
            <ExperienceTab />
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social">
            <SocialLinksTab />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <CreatorNotificationsTab />
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment">
            <CreatorPayoutSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
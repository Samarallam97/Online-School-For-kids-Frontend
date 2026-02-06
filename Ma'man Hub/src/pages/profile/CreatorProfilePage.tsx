import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Link as LinkIcon,
  Globe,
  Twitter,
  Linkedin,
  Youtube,
  Award,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const courseStats = [
  { label: "Total Courses", value: "12", icon: Video, color: "text-blue-500" },
  {
    label: "Total Students",
    value: "2,847",
    icon: Users,
    color: "text-purple-500",
  },
  {
    label: "Total Revenue",
    value: "$24,580",
    icon: DollarSign,
    color: "text-green-500",
  },
  { label: "Avg. Rating", value: "4.8", icon: Star, color: "text-amber-500" },
];

export default function CreatorProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    bio: "Senior Software Engineer with 10+ years of experience. Passionate about teaching and sharing knowledge with the developer community.",
    expertise: "React, TypeScript, Node.js, Python",
    website: "https://johndoe.dev",
    twitter: "@johndoe",
    linkedin: "johndoe",
    youtube: "@johndoetech",
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        {/* Hero Section with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl transition-transform group-hover:scale-105">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-400 text-3xl font-bold">
                      {profile.firstName.charAt(0)}
                      {profile.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white text-purple-600 shadow-lg hover:bg-white/90"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <h1 className="text-4xl font-bold tracking-tight">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <Badge className="w-fit bg-white/20 text-white hover:bg-white/30">
                      <Award className="mr-1 h-3 w-3" />
                      Verified Creator
                    </Badge>
                  </div>
                  <p className="mt-2 text-lg text-white/90">
                    Content Creator & Educator
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.expertise.split(", ").map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards with Modern Design */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courseStats.map((stat, index) => (
            <Card
              key={stat.label}
              className="group relative overflow-hidden border-0 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, ${
                  index === 0
                    ? "#eff6ff 0%, #dbeafe 100%"
                    : index === 1
                      ? "#faf5ff 0%, #f3e8ff 100%"
                      : index === 2
                        ? "#f0fdf4 0%, #dcfce7 100%"
                        : "#fffbeb 0%, #fef3c7 100%"
                })`,
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div
                    className={`rounded-full bg-white p-3 shadow-md ${stat.color}`}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+12% from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Section with Updated Design */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-white data-[state=active]:shadow"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="data-[state=active]:bg-white data-[state=active]:shadow"
            >
              Social Links
            </TabsTrigger>
            <TabsTrigger
              value="payout"
              className="data-[state=active]:bg-white data-[state=active]:shadow"
            >
              Payout Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Manage your public creator profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-semibold"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      disabled={!isEditing}
                      className="border-2 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                      disabled={!isEditing}
                      className="border-2 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="border-2 pl-10 focus:border-primary"
                      value={profile.email}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-semibold">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    rows={5}
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    disabled={!isEditing}
                    className="border-2 resize-none focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    {profile.bio.length} / 500 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise" className="text-sm font-semibold">
                    Areas of Expertise
                  </Label>
                  <Input
                    id="expertise"
                    placeholder="React, TypeScript, Node.js..."
                    value={profile.expertise}
                    onChange={(e) =>
                      setProfile({ ...profile, expertise: e.target.value })
                    }
                    disabled={!isEditing}
                    className="border-2 focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate skills with commas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  Social Links
                </CardTitle>
                <CardDescription>
                  Connect your social media profiles to expand your reach
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                    <Input
                      className="border-2 pl-10 focus:border-primary"
                      value={profile.website}
                      onChange={(e) =>
                        setProfile({ ...profile, website: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Twitter</Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-500" />
                    <Input
                      className="border-2 pl-10 focus:border-primary"
                      value={profile.twitter}
                      onChange={(e) =>
                        setProfile({ ...profile, twitter: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">LinkedIn</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600" />
                    <Input
                      className="border-2 pl-10 focus:border-primary"
                      value={profile.linkedin}
                      onChange={(e) =>
                        setProfile({ ...profile, linkedin: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">YouTube</Label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" />
                    <Input
                      className="border-2 pl-10 focus:border-primary"
                      value={profile.youtube}
                      onChange={(e) =>
                        setProfile({ ...profile, youtube: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="@channel"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payout Tab */}
          <TabsContent value="payout">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Payout Settings
                </CardTitle>
                <CardDescription>
                  Configure how you receive your earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-green-500 p-2">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">
                          Bank Account
                        </p>
                        <p className="mt-1 text-sm text-green-700">
                          •••• •••• •••• 1234
                        </p>
                        <p className="text-xs text-green-600">Chase Bank</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Verified
                    </Badge>
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">
                        Next Payout
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        January 15, 2026
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white/80">
                        Amount
                      </p>
                      <p className="mt-1 text-3xl font-bold">$1,234.56</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-2 py-6 text-base font-semibold hover:bg-primary hover:text-white"
                >
                  Update Payout Method
                </Button>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    💡 <span className="font-medium">Tip:</span> Payouts are
                    processed on the 1st and 15th of each month for balances
                    over $50.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

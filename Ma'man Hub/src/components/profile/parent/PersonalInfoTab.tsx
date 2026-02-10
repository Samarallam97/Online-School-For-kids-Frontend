import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, MapPin, Loader2, Plus, X, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProfileDto, userService } from "@/services/userService";

const COUNTRIES = [
  "Egypt",
  "Iraq",
  "Jordan",
  "Palestine",
  "Saudi Arabia",
  "Syria",
  "Other"
];

interface PersonalInfoTabProps {
  userData: ProfileDto;
  setUserData: (data: ProfileDto) => void;
  isActive: boolean;
}

export function PersonalInfoTab({ userData, setUserData, isActive }: PersonalInfoTabProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showOtherCountryInput, setShowOtherCountryInput] = useState(false);
  const [otherCountry, setOtherCountry] = useState("");
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");

  const getNameParts = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
      };
    }
    return {
      firstName: fullName,
      lastName: "",
    };
  };

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });

  useEffect(() => {
    const parts = getNameParts(userData.fullName);
    const userCountry = userData.country || "";
    const isOtherCountry = userCountry && !COUNTRIES.slice(0, -1).includes(userCountry);

    setProfile({
      firstName: parts.firstName,
      lastName: parts.lastName,
      email: userData.email || "",
      phone: userData.phone || "",
      location: isOtherCountry ? "Other" : userCountry,
      bio: userData.bio || "",
    });

    if (isOtherCountry) {
      setShowOtherCountryInput(true);
      setOtherCountry(userCountry);
    }

      // Parse learning goals
    if (userData.learningGoals) {
      const goals = typeof userData.learningGoals === 'string'
        ? userData.learningGoals.split(',').map(g => g.trim()).filter(g => g)
        : userData.learningGoals;
      setLearningGoals(goals);
    }
  }, [userData]);

  const handleCountryChange = (value: string) => {
    setProfile({ ...profile, location: value });
    if (value === "Other") {
      setShowOtherCountryInput(true);
    } else {
      setShowOtherCountryInput(false);
      setOtherCountry("");
    }
  };

    const handleAddGoal = () => {
    if (newGoal.trim() && !learningGoals.includes(newGoal.trim())) {
      setLearningGoals([...learningGoals, newGoal.trim()]);
      setNewGoal("");
    }
  };

  const handleRemoveGoal = (goalToRemove: string) => {
    setLearningGoals(learningGoals.filter(goal => goal !== goalToRemove));
  };
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const actualCountry = profile.location === "Other" ? otherCountry : profile.location;

      if (profile.location === "Other" && !otherCountry.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter your country name",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const updateData = {
        fullName: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        phone: profile.phone,
        country: actualCountry,
        bio: profile.bio,
        learningGoals: learningGoals.join(', '),
      };

      const updatedUser = await userService.updateProfile(updateData);
      setUserData(updatedUser);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.fullName = updatedUser.fullName;
      localStorage.setItem("user", JSON.stringify(user));

      const parts = getNameParts(updatedUser.fullName);
      setProfile({
        firstName: parts.firstName,
        lastName: parts.lastName,
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        location: profile.location,
        bio: updatedUser.bio || "",
      });

      setIsEditing(false);

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
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const parts = getNameParts(userData.fullName);
    const userCountry = userData.country || "";
    const isOtherCountry = userCountry && !COUNTRIES.slice(0, -1).includes(userCountry);

    setProfile({
      firstName: parts.firstName,
      lastName: parts.lastName,
      email: userData.email || "",
      phone: userData.phone || "",
      location: isOtherCountry ? "Other" : userCountry,
      bio: userData.bio || "",
    });

    if (isOtherCountry) {
      setShowOtherCountryInput(true);
      setOtherCountry(userCountry);
    } else {
      setShowOtherCountryInput(false);
      setOtherCountry("");
    }

     // Reset learning goals
    if (userData.learningGoals) {
      const goals = typeof userData.learningGoals === 'string'
        ? userData.learningGoals.split(',').map(g => g.trim()).filter(g => g)
        : userData.learningGoals;
      setLearningGoals(goals);
    }

    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </div>
        {isActive && (
          <div className="flex gap-2">
            {isEditing && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profile.firstName}
              onChange={(e) =>
                setProfile({ ...profile, firstName: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profile.lastName}
              onChange={(e) =>
                setProfile({ ...profile, lastName: e.target.value })
              }
              disabled={!isEditing}
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
              className="pl-9 bg-muted"
              value={profile.email}
              disabled={true}
              readOnly
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Email cannot be changed
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                className="pl-9"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Country</Label>
            <Select
              value={profile.location}
              onValueChange={handleCountryChange}
              disabled={!isEditing}
            >
              <SelectTrigger id="location">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select country" />
                </div>
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
            <Label htmlFor="otherCountry">Enter Country Name</Label>
            <Input
              id="otherCountry"
              value={otherCountry}
              onChange={(e) => setOtherCountry(e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your country"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={3}
            value={profile.bio}
            onChange={(e) =>
              setProfile({ ...profile, bio: e.target.value })
            }
            disabled={!isEditing}
            placeholder="Tell us about yourself"
          />
        </div>

                <div className="space-y-2">
                  <Label>Learning Goals</Label>
                  <div className="space-y-2">
                    {learningGoals.map((goal, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-md border p-2"
                      >
                        <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="flex-1 text-sm">{goal}</span>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveGoal(goal)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          placeholder="Add a new learning goal"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddGoal();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleAddGoal}
                          disabled={!newGoal.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {!isEditing && learningGoals.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No learning goals set yet
                      </p>
                    )}
                  </div>
                </div>
      </CardContent>
    </Card>
  );
}
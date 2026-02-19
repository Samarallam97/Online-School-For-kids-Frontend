import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail, Phone, Camera, Shield, Key, Bell, Activity, Lock,
  History, AlertTriangle, Loader2, Save, X, Eye, EyeOff, MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService, ProfileDto } from "@/services/userService";
import {
  adminService,
  AdminSecuritySettingsDto,
  AdminActivityLogDto,
} from "@/services/adminService";

// ─── Security section config ──────────────────────────────────────────────────
const SECURITY_SECTIONS: {
  title: string;
  rows: {
    key: keyof AdminSecuritySettingsDto;
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    description: string;
  }[];
}[] = [
  {
    title: "Authentication",
    rows: [
      {
        key: "twoFactorEnabled",
        icon: <Lock className="h-5 w-5 text-primary" />,
        iconBg: "bg-primary/10",
        label: "Two-Factor Authentication",
        description: "Add an extra layer of security to your account",
      },
    ],
  },
  {
    title: "Alerts",
    rows: [
      {
        key: "loginNotifications",
        icon: <Bell className="h-5 w-5 text-blue-500" />,
        iconBg: "bg-blue-500/10",
        label: "Login Notifications",
        description: "Get notified via email on new logins to your account",
      },
      {
        key: "suspiciousActivityAlerts",
        icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        iconBg: "bg-yellow-500/10",
        label: "Suspicious Activity Alerts",
        description: "Get alerted when unusual activity is detected",
      },
    ],
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Profile ───────────────────────────────────────────────────────────────
  const [userData, setUserData] = useState<ProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", phone: "", email: "" });

  // ── Security ──────────────────────────────────────────────────────────────
  const [security, setSecurity] = useState<AdminSecuritySettingsDto>({
    twoFactorEnabled: false,
    loginNotifications: false,
    suspiciousActivityAlerts: false,
  });
  const [isSecurityLoading, setIsSecurityLoading] = useState(true);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // ── Change password dialog ────────────────────────────────────────────────
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ── Activity log ──────────────────────────────────────────────────────────
  const [activityLog, setActivityLog] = useState<AdminActivityLogDto[]>([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const ACTIVITY_LIMIT = 10;

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getProfile();
        setUserData(data);
        const parts = data.fullName?.split(" ") || [];
        setProfile({
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
          phone: data.phone || "",
          email: data.email || "",
        });
      } catch (e: any) {
        toast({ title: "Error", description: e.response?.data?.message || "Failed to load profile", variant: "destructive" });
      } finally { setIsLoading(false); }
    };

    const loadSecurity = async () => {
      try {
        const data = await adminService.getSecuritySettings();
        setSecurity(data);
      } catch { /* keep defaults */ }
      finally { setIsSecurityLoading(false); }
    };

    const loadActivity = async () => {
      try {
        const data = await adminService.getActivityLog({ page: 1, limit: ACTIVITY_LIMIT });
        setActivityLog(data.activities);
        setActivityTotal(data.total);
      } catch { }
      finally { setIsActivityLoading(false); }
    };

    loadProfile();
    loadSecurity();
    loadActivity();
  }, []);

  // ── Load more activity ────────────────────────────────────────────────────
  const loadMoreActivity = async () => {
    const nextPage = activityPage + 1;
    try {
      setIsActivityLoading(true);
      const data = await adminService.getActivityLog({ page: nextPage, limit: ACTIVITY_LIMIT });
      setActivityLog(prev => [...prev, ...data.activities]);
      setActivityTotal(data.total);
      setActivityPage(nextPage);
    } catch {
      toast({ title: "Error", description: "Failed to load more activity", variant: "destructive" });
    } finally { setIsActivityLoading(false); }
  };

  // ── Profile picture ───────────────────────────────────────────────────────
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast({ title: "Invalid file", variant: "destructive" });
    if (file.size > 5 * 1024 * 1024) return toast({ title: "Too large", description: "Max 5MB", variant: "destructive" });
    try {
      setIsUploadingImage(true);
      const formData = new FormData(); formData.append("profilePicture", file);
      const res = await userService.uploadProfilePicture(formData);
      setUserData(prev => prev ? { ...prev, profilePictureUrl: res.profilePictureUrl } : null);
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      u.profilePictureUrl = res.profilePictureUrl;
      localStorage.setItem("user", JSON.stringify(u));
      toast({ title: "Updated", description: "Profile picture updated." });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed to upload", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updated = await userService.updateProfile({
        fullName: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phone,
      });
      setUserData(prev => prev ? { ...prev, fullName: updated.fullName, phone: updated.phone } : null);
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      u.fullName = updated.fullName;
      localStorage.setItem("user", JSON.stringify(u));
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your admin profile has been saved." });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed to update", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleCancel = () => {
    if (userData) {
      const parts = userData.fullName?.split(" ") || [];
      setProfile({ firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "", phone: userData.phone || "", email: userData.email || "" });
    }
    setIsEditing(false);
  };

  // ── Security toggle — optimistic, auto-save ───────────────────────────────
  const handleSecurityToggle = async (key: keyof AdminSecuritySettingsDto, value: boolean) => {
    const updated = { ...security, [key]: value };
    setSecurity(updated);
    try {
      setIsSavingSecurity(true);
      await adminService.updateSecuritySettings(updated);
    } catch (e: any) {
      setSecurity(prev => ({ ...prev, [key]: !value })); // revert
      toast({ title: "Error", description: e.response?.data?.message || "Failed to update", variant: "destructive" });
    } finally { setIsSavingSecurity(false); }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword)
      return toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
    if (passwordForm.newPassword.length < 8)
      return toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
    try {
      setIsChangingPassword(true);
      await adminService.changePassword(passwordForm);
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Incorrect current password or server error", variant: "destructive" });
    } finally { setIsChangingPassword(false); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getInitials = () => {
    if (!userData?.fullName) return "A";
    const parts = userData.fullName.trim().split(" ");
    return parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0][0];
  };

  const formatActivityTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    const a = action.toLowerCase();
    if (a.includes("ban") || a.includes("delete") || a.includes("remove")) return "destructive";
    if (a.includes("approve") || a.includes("enable") || a.includes("create")) return "default";
    return "secondary";
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );

  if (!userData) return (
    <DashboardLayout>
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">

        {/* ── Header ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData.profilePictureUrl} alt={userData.fullName} />
                  <AvatarFallback className="text-2xl bg-red-500 text-white">{getInitials()}</AvatarFallback>
                </Avatar>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage}>
                  {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold">{userData.fullName}</h1>
                  <Badge variant="destructive">
                    <Shield className="mr-1 h-3 w-3" />{userData.role || "Super Admin"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">Platform Administrator</p>
                <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
                  <span className="flex items-center gap-1"><Activity className="h-4 w-4 text-green-500" />Active now</span>
                  {security.twoFactorEnabled && (
                    <span className="flex items-center gap-1"><Lock className="h-4 w-4 text-primary" />2FA Enabled</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Admin Information</CardTitle>
                    <CardDescription>Manage your admin account details</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save
                        </Button>
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                          <X className="mr-2 h-4 w-4" />Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} disabled={!isEditing} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" className="pl-9" value={profile.email} disabled />
                  </div>
                  <p className="text-xs text-muted-foreground">Admin email cannot be changed directly. Contact system admin.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" className="pl-9" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditing} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                {userData.createdAt && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      Account created on{" "}
                      <span className="font-medium text-foreground">
                        {new Date(userData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Security Tab ── */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" />Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isSecurityLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {SECURITY_SECTIONS.map(({ title, rows }) => (
                      <div key={title} className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          {title}
                        </p>
                        {rows.map(({ key, icon, iconBg, label, description }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between py-3 border-b last:border-0"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`p-2 ${iconBg} rounded-lg flex-shrink-0`}>{icon}</div>
                              <div>
                                <p className="font-medium">{label}</p>
                                <p className="text-sm text-muted-foreground">{description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {isSavingSecurity && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              )}
                              <Switch
                                checked={security[key]}
                                onCheckedChange={v => handleSecurityToggle(key, v)}
                                disabled={isSavingSecurity}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      <Key className="mr-2 h-4 w-4" />Change Password
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Activity Log Tab ── */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />Activity Log
                  {activityTotal > 0 && <Badge variant="secondary" className="ml-auto">{activityTotal} total</Badge>}
                </CardTitle>
                <CardDescription>Recent admin actions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {isActivityLoading && activityLog.length === 0 ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : activityLog.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No activity recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activityLog.map(log => (
                      <div key={log.id} className="flex items-start justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={getActionBadgeVariant(log.action)} className="text-xs">{log.action}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">{log.target}</p>
                          {log.ipAddress && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{log.ipAddress}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4 mt-0.5">
                          {formatActivityTime(log.performedAt)}
                        </span>
                      </div>
                    ))}
                    {activityLog.length < activityTotal && (
                      <Button variant="outline" className="w-full" onClick={loadMoreActivity} disabled={isActivityLoading}>
                        {isActivityLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Load More
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Change Password Dialog ── */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Key className="h-5 w-5" />Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(["current", "new", "confirm"] as const).map((field) => {
              const labels = { current: "Current Password", new: "New Password", confirm: "Confirm New Password" };
              const keys = { current: "currentPassword", new: "newPassword", confirm: "confirmPassword" } as const;
              return (
                <div key={field} className="space-y-2">
                  <Label>{labels[field]}</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords[field] ? "text" : "password"}
                      value={passwordForm[keys[field]]}
                      onChange={e => setPasswordForm({ ...passwordForm, [keys[field]]: e.target.value })}
                      placeholder={`Enter ${labels[field].toLowerCase()}`}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPasswords(p => ({ ...p, [field]: !p[field] }))}
                    >
                      {showPasswords[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {field === "new" && passwordForm.newPassword && passwordForm.newPassword.length < 8 && (
                    <p className="text-xs text-destructive">Password must be at least 8 characters</p>
                  )}
                  {field === "confirm" && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowPasswordDialog(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
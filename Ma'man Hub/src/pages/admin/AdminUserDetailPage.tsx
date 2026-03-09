import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Loader2, Ban, UserCheck, Trash2, KeyRound,
  Mail, Phone, MapPin, Calendar, Clock, Globe, Link2,
  Briefcase, Star, Users, BookOpen, Award, DollarSign,
  Shield, Activity, CreditCard, Bell, Eye, EyeOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminService, AdminUserDetailDto } from "@/services/adminService";

function getCurrentAdmin() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function AdminUserDetailPage() {
  const { userId }   = useParams<{ userId: string }>();
  const navigate     = useNavigate();
  const { toast }    = useToast();
  const currentAdmin = getCurrentAdmin();
  const isSuperAdmin = !!currentAdmin?.isSuperAdmin;

  const [user, setUser]           = useState<AdminUserDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Action states ──
  const [isActioning, setIsActioning]         = useState(false);
  const [deleteDialog, setDeleteDialog]       = useState(false);
  const [passwordDialog, setPasswordDialog]   = useState(false);
  const [newPassword, setNewPassword]         = useState("");
  const [showPassword, setShowPassword]       = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getUserById(userId);
        setUser(data);
      } catch (e: any) {
        toast({ title: "Error", description: e.response?.data?.message || "Failed to load user", variant: "destructive" });
        navigate("/admin/users");
      } finally { setIsLoading(false); }
    };
    load();
  }, [userId]);

  const handleApprove = async () => {
    if (!user) return;
    try {
      setIsActioning(true);
      const updated = await adminService.approveUser(user.id);
      setUser(prev => prev ? { ...prev, status: updated.status } : null);
      toast({ title: "User approved successfully." });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
    } finally { setIsActioning(false); }
  };

  const handleSuspend = async () => {
    if (!user) return;
    try {
      setIsActioning(true);
      const updated = await adminService.suspendUser(user.id);
      setUser(prev => prev ? { ...prev, status: updated.status } : null);
      toast({ title: "User suspended." });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
    } finally { setIsActioning(false); }
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleteDialog(false);
    try {
      setIsActioning(true);
      await adminService.deleteUser(user.id);
      toast({ title: "User deleted.", variant: "destructive" });
      navigate("/admin/users");
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
      setIsActioning(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPassword.trim()) return;
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters.", variant: "destructive" });
      return;
    }
    try {
      setIsSavingPassword(true);
      await adminService.changeUserPassword(user.id, newPassword);
      toast({ title: "Password changed successfully." });
      setPasswordDialog(false);
      setNewPassword("");
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
    } finally { setIsSavingPassword(false); }
  };

  // ── Badge helpers ──
  const statusBadge = (status: string) => {
    switch (status) {
      case "active":    return <Badge className="bg-success/10 text-success">Active</Badge>;
      case "suspended": return <Badge variant="destructive">Suspended</Badge>;
      case "pending":   return <Badge variant="secondary">Pending</Badge>;
      default:          return <Badge variant="outline">{status}</Badge>;
    }
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      Student:    "bg-accent/10 text-accent",
      Creator:    "bg-violet-500/10 text-violet-500",
      Parent:     "bg-amber-500/10 text-amber-500",
      Specialist: "bg-emerald-500/10 text-emerald-500",
      Admin:      "bg-foreground/10 text-foreground",
    };
    return <Badge className={colors[role] || ""}>{role}</Badge>;
  };

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </DashboardLayout>
  );

  if (!user) return null;

  const initials = user.name.trim().split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">

        {/* ── Back + actions header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="ghost" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Users
          </Button>
          <div className="flex gap-2 flex-wrap">
            {isSuperAdmin && (
              <Button variant="outline" size="sm" onClick={() => setPasswordDialog(true)} disabled={isActioning}>
                <KeyRound className="h-4 w-4 mr-2" />Change Password
              </Button>
            )}
            {user.status !== "active" && (
              <Button variant="outline" size="sm" onClick={handleApprove} disabled={isActioning}>
                {isActioning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}
                {user.status === "suspended" ? "Reactivate" : "Approve"}
              </Button>
            )}
            {user.status === "active" && (
              <Button variant="outline" size="sm" onClick={handleSuspend} disabled={isActioning}>
                {isActioning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ban className="h-4 w-4 mr-2" />}
                Suspend
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialog(true)} disabled={isActioning}>
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </Button>
          </div>
        </div>

        {/* ── Profile header card ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profilePictureUrl} />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {roleBadge(user.role)}
                  {statusBadge(user.status)}
                  {user.isSuperAdmin && <Badge variant="outline" className="border-yellow-500 text-yellow-600">Super Admin</Badge>}
                  {user.isVerifiedCreator && <Badge variant="outline" className="border-blue-500 text-blue-600">Verified Creator</Badge>}
                </div>
                {user.professionalTitle && <p className="text-muted-foreground">{user.professionalTitle}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{user.email}</span>
                  {user.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{user.phone}</span>}
                  {user.country && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{user.country}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Account info ── */}
        <Section title="Account Information">
          <InfoRow label="User ID"        value={user.id} />
          <InfoRow label="Email"          value={user.email} />
          <InfoRow label="Email Verified" value={user.emailVerified ? "Yes" : "No"} />
          <InfoRow label="Auth Provider"  value={user.authProvider} />
          <InfoRow label="First Login"    value={user.isFirstLogin ? "Yes" : "No"} />
          <InfoRow label="Joined"         value={new Date(user.joinedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
          <InfoRow label="Last Login"     value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : undefined} />
          {user.dateOfBirth && <InfoRow label="Date of Birth" value={new Date(user.dateOfBirth).toLocaleDateString()} />}
        </Section>

        {/* ── Bio ── */}
        {user.bio && (
          <Section title="Bio">
            <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
          </Section>
        )}

        {/* ── Student / Parent ── */}
        {(user.role === "Student" || user.role === "Parent") && (
          <Section title="Learning Info">
            <InfoRow label="Learning Goals"    value={user.learningGoals} />
            <InfoRow label="Enrolled Courses"  value={user.enrolledCourseIds?.length ?? 0} />
            <InfoRow label="Achievements"      value={user.achievementIds?.length ?? 0} />
            <InfoRow label="Total Hours"       value={user.totalHoursLearned !== undefined ? `${user.totalHoursLearned} hrs` : undefined} />
            {user.role === "Parent" && (
              <>
                <InfoRow label="Children"         value={user.childrenIds?.length ?? 0} />
                <InfoRow label="Pending Invites"  value={user.childInvitations?.length ?? 0} />
              </>
            )}
          </Section>
        )}

        {/* ── Creator ── */}
        {user.role === "Creator" && (
          <>
            <Section title="Creator Stats">
              <InfoRow label="Verified Creator"  value={user.isVerifiedCreator ? "Yes" : "No"} />
              <InfoRow label="Courses Created"   value={user.createdCourseIds?.length ?? 0} />
              <InfoRow label="Total Students"    value={user.totalStudents} />
              <InfoRow label="Total Revenue"     value={user.totalRevenue !== undefined ? `${user.totalRevenue?.toLocaleString()} EGP` : undefined} />
              <InfoRow label="Average Rating"    value={user.averageRating?.toFixed(2)} />
            </Section>
            {user.expertiseTags && user.expertiseTags.length > 0 && (
              <Section title="Expertise Tags">
                <div className="flex flex-wrap gap-2">
                  {user.expertiseTags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
              </Section>
            )}
            {user.workExperiences && user.workExperiences.length > 0 && (
              <Section title="Work Experience">
                <div className="space-y-4">
                  {user.workExperiences.map(exp => (
                    <div key={exp.id} className="border rounded-lg p-3">
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-sm text-muted-foreground">{exp.place}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exp.startDate} — {exp.isCurrentRole ? "Present" : (exp.endDate ?? "—")}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
            {user.socialLinks && user.socialLinks.length > 0 && (
              <Section title="Social Links">
                <div className="space-y-2">
                  {user.socialLinks.map(link => (
                    <div key={link.id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground capitalize">{link.name}</span>
                      <a href={link.value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <Link2 className="h-3 w-3" />{link.value}
                      </a>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* ── Specialist ── */}
        {user.role === "Specialist" && (
          <>
            <Section title="Specialist Info">
              <InfoRow label="Professional Title"  value={user.professionalTitle} />
              <InfoRow label="Years of Experience" value={user.yearsOfExperience} />
              <InfoRow label="Hourly Rate"         value={user.hourlyRate !== undefined ? `${user.hourlyRate} EGP` : undefined} />
              {user.sessionRates && (
                <>
                  <InfoRow label="30-min Session"  value={`${user.sessionRates.thirtyMinSession} EGP`} />
                  <InfoRow label="60-min Session"  value={`${user.sessionRates.sixtyMinSession} EGP`} />
                  <InfoRow label="Platform Fee"    value={`${user.sessionRates.platformFeePercentage}%`} />
                </>
              )}
            </Section>
            {user.expertiseTags && user.expertiseTags.length > 0 && (
              <Section title="Expertise Tags">
                <div className="flex flex-wrap gap-2">
                  {user.expertiseTags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
              </Section>
            )}
            {user.certifications && user.certifications.length > 0 && (
              <Section title="Certifications">
                <div className="space-y-3">
                  {user.certifications.map(cert => (
                    <div key={cert.id} className="flex items-start justify-between border rounded-lg p-3">
                      <div>
                        <p className="font-medium text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuer} · {cert.year}</p>
                      </div>
                      {cert.documentUrl && (
                        <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View</a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
            {user.availability && user.availability.length > 0 && (
              <Section title="Availability">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {user.availability.map(slot => (
                    <div key={slot.id} className="rounded-lg border p-2 text-center text-sm">
                      <p className="font-medium">{slot.day}</p>
                      <p className="text-xs text-muted-foreground">{slot.startTime} – {slot.endTime}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* ── Admin ── */}
        {user.role === "Admin" && isSuperAdmin && (
          <Section title="Admin Settings">
            <InfoRow label="Super Admin"               value={user.isSuperAdmin ? "Yes" : "No"} />
            <InfoRow label="Two-Factor Auth"           value={user.twoFactorEnabled ? "Enabled" : "Disabled"} />
            <InfoRow label="Login Notifications"       value={user.loginNotifications ? "On" : "Off"} />
            <InfoRow label="Suspicious Activity Alerts" value={user.suspiciousActivityAlerts ? "On" : "Off"} />
          </Section>
        )}

        {/* ── Shared: portfolio / CV ── */}
        {(user.portfolioUrl || user.cvLink) && (
          <Section title="Documents & Portfolio">
            {user.portfolioUrl && <InfoRow label="Portfolio" value={user.portfolioUrl} />}
            {user.cvLink && <InfoRow label="CV / Resume" value={user.cvLink} />}
          </Section>
        )}

        {/* ── Notification preferences ── */}
        {user.notificationPreferences && (
          <Section title="Notification Preferences">
            {Object.entries(user.notificationPreferences)
              .filter(([, v]) => v !== undefined && v !== null)
              .map(([key, value]) => (
                <InfoRow
                  key={key}
                  label={key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
                  value={value ? "Enabled" : "Disabled"}
                />
              ))}
          </Section>
        )}

        {/* ── Payment methods ── */}
        {user.paymentMethods && user.paymentMethods.length > 0 && (
          <Section title="Payment Methods">
            <div className="space-y-3">
              {user.paymentMethods.map(pm => (
                <div key={pm.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium capitalize">{pm.type.replace(/_/g, " ")}</p>
                      {pm.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pm.last4 ? `**** ${pm.last4}` : pm.vodafoneNumber ?? pm.instapayId ?? pm.accountNumber ?? ""}
                      {pm.brand ? ` · ${pm.brand}` : ""}
                      {pm.expiryMonth ? ` · ${pm.expiryMonth}/${pm.expiryYear}` : ""}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(pm.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Activity log (Admin only, SuperAdmin viewer) ── */}
        {user.activityLog && user.activityLog.length > 0 && isSuperAdmin && (
          <Section title="Activity Log">
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {user.activityLog.map(entry => (
                <div key={entry.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <Activity className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">{entry.details}</p>
                    {entry.ipAddress && <p className="text-xs text-muted-foreground">IP: {entry.ipAddress}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>
    </DashboardLayout>

    {/* ── Delete confirmation ── */}
    <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the account and all associated data. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* ── Change password (SuperAdmin only) ── */}
    <Dialog open={passwordDialog} onOpenChange={open => { setPasswordDialog(open); if (!open) { setNewPassword(""); setShowPassword(false); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Password for {user.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPasswordDialog(false)} disabled={isSavingPassword}>Cancel</Button>
          <Button onClick={handleChangePassword} disabled={isSavingPassword || !newPassword.trim()}>
            {isSavingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
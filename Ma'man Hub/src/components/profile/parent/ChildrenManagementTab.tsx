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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserPlus,
  Loader2,
  Search,
  Mail,
  Send,
  AlertCircle,
  CheckCircle2,
  Eye,
  Settings,
  MoreVertical,
  Trash2,
  XCircle,
  Clock,
  User,
  Lock,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parentService ,Child, ChildStatus} from "@/services/parentService";

const COUNTRIES = [
  "Egypt",
  "Iraq",
  "Jordan",
  "Palestine",
  "Saudi Arabia",
  "Syria",
  "Other"
];

enum LinkingStep {
  SEARCH_EMAIL = "search_email",
  EXISTING_FOUND = "existing_found",
  CREATE_NEW = "create_new",
  VERIFICATION_SENT = "verification_sent",
}

export function ChildrenManagementTab() {
  const { toast } = useToast();
  const [linkedChildren, setLinkedChildren] = useState<Child[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [childToRemove, setChildToRemove] = useState<Child | null>(null);
  const [isRemovingChild, setIsRemovingChild] = useState(false);
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [linkingStep, setLinkingStep] = useState<LinkingStep>(LinkingStep.SEARCH_EMAIL);
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundChild, setFoundChild] = useState<any>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [showOtherChildCountryInput, setShowOtherChildCountryInput] = useState(false);
  const [otherChildCountry, setOtherChildCountry] = useState("");
  const [newChildData, setNewChildData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    country: "",
  });

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoadingChildren(true);
        const children = await parentService.getLinkedChildren();
        setLinkedChildren(children);
      } catch (error: any) {
        console.error("Failed to load children:", error);
        setLinkedChildren([]);
      } finally {
        setIsLoadingChildren(false);
      }
    };
    fetchChildren();
  }, []);

  const handleChildCountryChange = (value: string) => {
    setNewChildData({ ...newChildData, country: value });
    setShowOtherChildCountryInput(value === "Other");
    if (value !== "Other") setOtherChildCountry("");
  };

  const handleSearchChild = async () => {
    if (!searchEmail || !searchEmail.includes("@")) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      const result = await parentService.searchChildByEmail(searchEmail);
      if (result.exists) {
        setFoundChild(result.child);
        setLinkingStep(LinkingStep.EXISTING_FOUND);
      } else {
        setLinkingStep(LinkingStep.CREATE_NEW);
        setNewChildData({ ...newChildData, email: searchEmail });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to search for child",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvite = async () => {
    try {
      setIsSendingInvite(true);
      await parentService.sendChildLinkInvite(foundChild.id);
      toast({
        title: "Invite Sent",
        description: `An invitation has been sent to ${foundChild.email}. You'll be notified when they accept.`,
      });
      resetAddChildDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send invite",
        variant: "destructive",
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleCreateChild = async () => {
    const actualChildCountry = newChildData.country === "Other" ? otherChildCountry : newChildData.country;

    if (!newChildData.fullName || !newChildData.email || !newChildData.password || 
        !newChildData.confirmPassword || !newChildData.dateOfBirth || !newChildData.country) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newChildData.country === "Other" && !otherChildCountry.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the country name",
        variant: "destructive",
      });
      return;
    }

    if (newChildData.password !== newChildData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newChildData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingChild(true);
      const childDataToSend = { ...newChildData, country: actualChildCountry };
      await parentService.createAndLinkChild(childDataToSend);
      setLinkingStep(LinkingStep.VERIFICATION_SENT);
      
      setTimeout(() => {
        toast({
          title: "Child Account Created",
          description: `${newChildData.fullName} can now log in with ${newChildData.email}`,
        });
        parentService.getLinkedChildren().then(setLinkedChildren);
        resetAddChildDialog();
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create child account",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChild(false);
    }
  };

  const resetAddChildDialog = () => {
    setIsAddChildDialogOpen(false);
    setLinkingStep(LinkingStep.SEARCH_EMAIL);
    setSearchEmail("");
    setFoundChild(null);
    setNewChildData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      country: "",
    });
    setShowOtherChildCountryInput(false);
    setOtherChildCountry("");
  };

  const handleRemoveChild = async () => {
    if (!childToRemove) return;
    try {
      setIsRemovingChild(true);
      await parentService.removeChild(childToRemove.id);
      setLinkedChildren(linkedChildren.filter(child => child.id !== childToRemove.id));
      toast({
        title: "Child Removed",
        description: `${childToRemove.name} has been unlinked from your account.`,
      });
      setChildToRemove(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove child",
        variant: "destructive",
      });
    } finally {
      setIsRemovingChild(false);
    }
  };

  const handleViewProgress = (child: Child) => {
    if (child.status === ChildStatus.EMAIL_NOT_VERIFIED) {
      toast({
        title: "Email Not Verified",
        description: "This child must verify their email before you can view their progress.",
        variant: "destructive",
      });
      return;
    }
    window.location.href = `/parent/child-progress/${child.id}`;
  };

  const getChildStatusBadge = (status: ChildStatus) => {
    switch (status) {
      case ChildStatus.ACTIVE:
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case ChildStatus.SUSPENDED:
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Suspended
          </Badge>
        );
      case ChildStatus.EMAIL_NOT_VERIFIED:
        return (
          <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="mr-1 h-3 w-3" />
            Email Not Verified
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Linked Children</CardTitle>
            <CardDescription>
              Manage your children's accounts and monitor their progress
            </CardDescription>
          </div>
          <Dialog open={isAddChildDialogOpen} onOpenChange={(open) => {
            if (!open) resetAddChildDialog();
            setIsAddChildDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Link Child
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {linkingStep === LinkingStep.SEARCH_EMAIL && "Search for Child Account"}
                  {linkingStep === LinkingStep.EXISTING_FOUND && "Child Account Found"}
                  {linkingStep === LinkingStep.CREATE_NEW && "Create Child Account"}
                  {linkingStep === LinkingStep.VERIFICATION_SENT && "Account Created Successfully"}
                </DialogTitle>
                <DialogDescription>
                  {linkingStep === LinkingStep.SEARCH_EMAIL && "Enter your child's email to search for an existing account or create a new one."}
                  {linkingStep === LinkingStep.EXISTING_FOUND && "We found an existing account. Send an invite to link this child to your account."}
                  {linkingStep === LinkingStep.CREATE_NEW && "No account found with this email. Create a new student account for your child."}
                  {linkingStep === LinkingStep.VERIFICATION_SENT && "A verification email has been sent. Your child can now log in with the provided credentials."}
                </DialogDescription>
              </DialogHeader>

              {linkingStep === LinkingStep.SEARCH_EMAIL && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="searchEmail">Child's Email Address *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="searchEmail"
                          type="email"
                          className="pl-9"
                          placeholder="child@example.com"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSearchChild()}
                        />
                      </div>
                      <Button onClick={handleSearchChild} disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the email address to search for an existing account or create a new one.
                    </p>
                  </div>
                </div>
              )}

              {linkingStep === LinkingStep.EXISTING_FOUND && foundChild && (
                <div className="space-y-4 py-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={foundChild.profilePictureUrl} />
                        <AvatarFallback>{foundChild.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{foundChild.fullName}</h4>
                        <p className="text-sm text-muted-foreground">{foundChild.email}</p>
                        <p className="text-sm text-muted-foreground">Age: {foundChild.age} • Student</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                    <div className="flex gap-3">
                      <Send className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Link Request</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          An invitation will be sent to {foundChild.email}. Once accepted, you'll be able to monitor their learning progress.
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetAddChildDialog}>Cancel</Button>
                    <Button onClick={handleSendInvite} disabled={isSendingInvite}>
                      {isSendingInvite && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Send className="mr-2 h-4 w-4" />
                      Send Invite
                    </Button>
                  </DialogFooter>
                </div>
              )}

              {linkingStep === LinkingStep.CREATE_NEW && (
                <div className="space-y-4 py-4">
                  <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-800">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">No Account Found</p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          No existing account was found with the email <strong>{searchEmail}</strong>. You can create a new account for your child below.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="fullName"
                          className="pl-9"
                          placeholder="John Doe"
                          value={newChildData.fullName}
                          onChange={(e) => setNewChildData({ ...newChildData, fullName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="childEmail">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="childEmail"
                          type="email"
                          className="pl-9"
                          value={newChildData.email}
                          onChange={(e) => setNewChildData({ ...newChildData, email: e.target.value })}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          className="pl-9"
                          placeholder="Min. 6 characters"
                          value={newChildData.password}
                          onChange={(e) => setNewChildData({ ...newChildData, password: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          className="pl-9"
                          placeholder="Re-enter password"
                          value={newChildData.confirmPassword}
                          onChange={(e) => setNewChildData({ ...newChildData, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          className="pl-9"
                          value={newChildData.dateOfBirth}
                          onChange={(e) => setNewChildData({ ...newChildData, dateOfBirth: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select value={newChildData.country} onValueChange={handleChildCountryChange}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {showOtherChildCountryInput && (
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="otherChildCountry">Enter Country Name *</Label>
                        <Input
                          id="otherChildCountry"
                          value={otherChildCountry}
                          onChange={(e) => setOtherChildCountry(e.target.value)}
                          placeholder="Enter country name"
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4">
                    <div className="flex gap-3">
                      <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Email Verification Required</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          A verification email will be sent to {newChildData.email}. Your child must verify their email before they can log in.
                        </p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setLinkingStep(LinkingStep.SEARCH_EMAIL)}>Back</Button>
                    <Button onClick={handleCreateChild} disabled={isCreatingChild}>
                      {isCreatingChild && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </DialogFooter>
                </div>
              )}

              {linkingStep === LinkingStep.VERIFICATION_SENT && (
                <div className="space-y-4 py-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                      <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Account Created Successfully!</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        A verification email has been sent to <strong>{newChildData.email}</strong>
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 w-full text-left">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Login Credentials</p>
                      <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                        <p><strong>Email:</strong> {newChildData.email}</p>
                        <p><strong>Password:</strong> (Set by you)</p>
                        <p className="mt-2 text-xs">
                          Your child can change their password after logging in for the first time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingChildren ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : linkedChildren.length > 0 ? (
            linkedChildren.map((child) => (
              <div key={child.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={child.profilePictureUrl || child.avatar} alt={child.name} />
                    <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{child.name}</h3>
                      {getChildStatusBadge(child.status || ChildStatus.ACTIVE)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Age: {child.age} • {child.courses} courses enrolled
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewProgress(child)}
                    disabled={child.status === ChildStatus.EMAIL_NOT_VERIFIED}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Progress
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setChildToRemove(child)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Child
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No children linked</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Link your children's accounts to monitor their progress and manage their learning.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!childToRemove} onOpenChange={() => setChildToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Child?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{childToRemove?.name}</strong> from your account? 
              This will unlink the account but won't delete it. You can re-link it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingChild}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveChild}
              disabled={isRemovingChild}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemovingChild && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Child
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
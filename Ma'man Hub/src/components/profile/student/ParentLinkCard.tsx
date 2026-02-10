import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  UserPlus,
  Loader2,
  ExternalLink,
  Unlink,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { studentService, ParentInfo } from "@/services/studentService";

interface ParentLinkCardProps {
  showSuccessMessage?: boolean;
  parentNameFromInvite?: string;
}

export function ParentLinkCard({ showSuccessMessage, parentNameFromInvite }: ParentLinkCardProps) {
  const { toast } = useToast();
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(showSuccessMessage || false);

  useEffect(() => {
    fetchParentInfo();
  }, []);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const fetchParentInfo = async () => {
    try {
      setIsLoading(true);
      const data = await studentService.getLinkedParent();
      setParentInfo(data);
    } catch (error: any) {
      console.error("Failed to fetch parent info:", error);
      setParentInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkParent = async () => {
    try {
      setIsUnlinking(true);
      await studentService.unlinkParent();
      
      toast({
        title: "Parent Unlinked",
        description: "Your account has been unlinked from your parent's account.",
      });
      
      setParentInfo(null);
      setShowUnlinkDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unlink parent",
        variant: "destructive",
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleVisitParentProfile = () => {
    if (parentInfo?.parentId) {
      window.open(`/profile/${parentInfo.parentId}`, '_blank');
    }
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
    }
    return name.charAt(0);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Parent Account</CardTitle>
              <CardDescription>
                Manage your parent's access to your learning progress
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showSuccessAlert && (
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-900 dark:text-green-100">
                  Your account has been successfully linked to{" "}
                  <strong>{parentNameFromInvite || parentInfo?.parentName}</strong>'s account!
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : parentInfo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={parentInfo.parentProfilePictureUrl} alt={parentInfo.parentName} />
                    <AvatarFallback>{getInitials(parentInfo.parentName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{parentInfo.parentName}</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Linked
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{parentInfo.parentEmail}</p>
                    {parentInfo.linkedSince && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Linked since {new Date(parentInfo.linkedSince).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVisitParentProfile}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUnlinkDialog(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    Unlink
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Parent Monitoring Active
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Your parent can view your course progress, achievements, and learning statistics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <UserPlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Parent Linked</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Your account is not currently linked to a parent account. Ask your parent to send you an invitation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Parent Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink <strong>{parentInfo?.parentName}</strong>'s account? 
              They will no longer be able to view your learning progress. This action can be reversed 
              by accepting a new invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnlinking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlinkParent}
              disabled={isUnlinking}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isUnlinking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unlink Parent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
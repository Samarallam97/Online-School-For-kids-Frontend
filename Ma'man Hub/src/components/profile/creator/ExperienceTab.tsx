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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Briefcase, Plus, Trash2, Edit, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { userService , WorkExperience} from "@/services/userService";

type Experience = WorkExperience;

interface FormData {
  title: string;
  place: string;
  startDate: string;
  endDate: string;
  isCurrentRole: boolean;
}

// ✅ Defined OUTSIDE ExperienceTab so it never remounts on parent re-render
interface ExperienceFormFieldsProps {
  formData: FormData;
  onChange: (data: FormData) => void;
  idPrefix: string;
}

function ExperienceFormFields({ formData, onChange, idPrefix }: ExperienceFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>
          Job Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`${idPrefix}-title`}
          value={formData.title}
          onChange={(e) => onChange({ ...formData, title: e.target.value })}
          placeholder="e.g., Senior Developer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-place`}>
          Company/Place <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`${idPrefix}-place`}
          value={formData.place}
          onChange={(e) => onChange({ ...formData, place: e.target.value })}
          placeholder="e.g., Tech Corp"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-startDate`}>
          Start Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`${idPrefix}-startDate`}
          type="month"
          value={formData.startDate}
          onChange={(e) => onChange({ ...formData, startDate: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`${idPrefix}-isCurrentRole`}
          checked={formData.isCurrentRole}
          onCheckedChange={(checked) =>
            onChange({ ...formData, isCurrentRole: checked as boolean })
          }
        />
        <Label htmlFor={`${idPrefix}-isCurrentRole`} className="cursor-pointer">
          I currently work here
        </Label>
      </div>

      {!formData.isCurrentRole && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-endDate`}>
            End Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${idPrefix}-endDate`}
            type="month"
            value={formData.endDate}
            onChange={(e) => onChange({ ...formData, endDate: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

export function ExperienceTab() {
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    place: "",
    startDate: "",
    endDate: "",
    isCurrentRole: false,
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getExperiences();
      setExperiences(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load experiences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      place: "",
      startDate: "",
      endDate: "",
      isCurrentRole: false,
    });
  };

  const handleAdd = async () => {
    if (!formData.title || !formData.place || !formData.startDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.isCurrentRole && !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please provide an end date or mark as current role",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const newExperience = await userService.addExperience({
        title: formData.title,
        place: formData.place,
        startDate: formData.startDate,
        endDate: formData.isCurrentRole ? null : formData.endDate,
        isCurrentRole: formData.isCurrentRole,
      });

      setExperiences([...experiences, newExperience]);
      setShowAddDialog(false);
      resetForm();

      toast({
        title: "Success",
        description: "Experience added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add experience",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (experience: Experience) => {
    setSelectedExperience(experience);
    setFormData({
      title: experience.title,
      place: experience.place,
      startDate: experience.startDate,
      endDate: experience.endDate || "",
      isCurrentRole: experience.isCurrentRole,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedExperience) return;

    if (!formData.title || !formData.place || !formData.startDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.isCurrentRole && !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please provide an end date or mark as current role",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const updated = await userService.updateExperience(selectedExperience.id, {
        title: formData.title,
        place: formData.place,
        startDate: formData.startDate,
        endDate: formData.isCurrentRole ? null : formData.endDate,
        isCurrentRole: formData.isCurrentRole,
      });

      setExperiences(
        experiences.map((exp) => (exp.id === selectedExperience.id ? updated : exp))
      );
      setShowEditDialog(false);
      setSelectedExperience(null);
      resetForm();

      toast({
        title: "Success",
        description: "Experience updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update experience",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExperience) return;

    try {
      setIsDeleting(true);
      await userService.deleteExperience(selectedExperience.id);
      setExperiences(experiences.filter((exp) => exp.id !== selectedExperience.id));
      setShowDeleteDialog(false);
      setSelectedExperience(null);

      toast({
        title: "Success",
        description: "Experience deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete experience",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </CardTitle>
            <CardDescription>Add and manage your professional experience</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Work Experience</DialogTitle>
                <DialogDescription>
                  Add your professional work experience
                </DialogDescription>
              </DialogHeader>
              {/* ✅ Stable component reference — won't remount on formData change */}
              <ExperienceFormFields
                formData={formData}
                onChange={setFormData}
                idPrefix="add"
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Experience
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {experiences.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No work experience added yet</p>
            <p className="text-sm mt-1">Add your professional experience to showcase your background</p>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((experience) => (
              <div
                key={experience.id}
                className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{experience.title}</h3>
                    <p className="text-muted-foreground">{experience.place}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(experience.startDate)} -{" "}
                        {experience.isCurrentRole
                          ? "Present"
                          : formatDate(experience.endDate!)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(experience)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedExperience(experience);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Work Experience</DialogTitle>
            <DialogDescription>Update your work experience details</DialogDescription>
          </DialogHeader>
          {/* ✅ Stable component reference — won't remount on formData change */}
          <ExperienceFormFields
            formData={formData}
            onChange={setFormData}
            idPrefix="edit"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedExperience(null);
                resetForm();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Experience
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work experience? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedExperience(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft, Loader2, AlertCircle, Layers, PlayCircle, Users, Star,
  Eye, EyeOff, Video, Plus, Scissors, Pencil, HelpCircle,
  FileText, ChevronRight, MoreVertical, Trash2, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import CourseSettingsTab from "@/components/ui/CourseSettingsTab";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ManagementLesson {
  id: string;
  title: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
  hasVideo: boolean;
  materialsCount: number;
  hasQuiz: boolean;
}

interface ManagementSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: ManagementLesson[];
}

interface CourseManagementDetail {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  thumbnailUrl: string;
  price: number;
  discountPrice: number | null;
  ageGroup: string;
  language: string;
  isPublished: boolean;
  rating: number;
  totalStudents: number;
  totalSections: number;
  totalLessons: number;
  createdAt: string;
  updatedAt: string | null;
  sections: ManagementSection[];
}

function formatDuration(seconds: number) {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Dialog: Add / Edit Section ────────────────────────────────────────────────

function SectionDialog({
  open,
  onClose,
  courseId,
  onSaved,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onSaved: () => void;
  existing?: ManagementSection;
}) {
  const { toast } = useToast();
  const [title, setTitle]   = useState(existing?.title ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setTitle(existing?.title ?? ""); }, [existing]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (existing) {
        await api.put(`/coursecreator/sections/${courseId}/${existing.id}`, { title });
      } else {
        await api.post("/coursecreator/sections", { courseId, title, description: "", order: 0 });
      }
      toast({ title: existing ? "Section updated" : "Section created" });
      onSaved();
      onClose();
    } catch {
      toast({ title: "Failed to save section", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Section" : "New Section"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>Section Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 1 – Foundations"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            {existing ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog: Choose how to add lesson content ──────────────────────────────────

function AddLessonDialog({
  open,
  onClose,
  courseId,
  sectionId,
  nextOrder,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  sectionId: string;
  nextOrder: number;
  onCreated: () => void;
}) {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const [title, setTitle]   = useState("");
  const [creating, setCreating] = useState(false);
  const [step, setStep]     = useState<"name" | "choose">("name");
  const [lessonId, setLessonId] = useState<string | null>(null);

  const reset = () => { setTitle(""); setStep("name"); setLessonId(null); };

  const handleClose = () => { reset(); onClose(); };

  // Step 1: create lesson shell with title
  const handleCreateShell = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await api.post("/coursecreator/lessons", {
        courseId,
        sectionId,
        title: title.trim(),
        order: nextOrder,
      });
      // Backend should return the new lessonId
      const newId: string = res.data?.data?.lessonId ?? res.data?.data?.id ?? "";
      setLessonId(newId);
      setStep("choose");
      onCreated(); // refresh parent
    } catch {
      toast({ title: "Failed to create lesson", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "name" ? "Name Your Lesson" : "Add Content"}
          </DialogTitle>
        </DialogHeader>

        {step === "name" && (
          <>
            <div className="space-y-3 py-2">
              <Label>Lesson Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Variables"
                onKeyDown={(e) => e.key === "Enter" && handleCreateShell()}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleCreateShell} disabled={creating || !title.trim()}>
                {creating && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                Next
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "choose" && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              How do you want to add content to <strong>"{title}"</strong>?
            </p>

            {/* Option A: Single lesson video */}
            <button
              onClick={() => {
                handleClose();
                navigate(
                  `/creator/courses/${courseId}/sections/${sectionId}/lessons/${lessonId ?? "new"}` +
                  `?title=${encodeURIComponent(title)}&order=${nextOrder}`
                );
              }}
              className="w-full flex items-start gap-4 border rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <div className="bg-primary/10 rounded-lg p-2.5 shrink-0">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Upload a single video</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This video becomes one lesson. The AI transcribes it and you
                  generate quizzes — all in one editor.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 ml-auto" />
            </button>

            {/* Option B: Big video → chunks */}
            <button
              onClick={() => {
                handleClose();
                navigate(`/creator/courses/${courseId}/chunk-editor`);
              }}
              className="w-full flex items-start gap-4 border rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <div className="bg-violet-100 rounded-lg p-2.5 shrink-0">
                <Scissors className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Upload a long video and chunk it</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The AI splits your video into multiple lessons. You drag cut
                  points on the timeline to adjust boundaries, then each chunk
                  becomes its own lesson.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 ml-auto" />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CourseDetailManagementPage() {
  const { courseId }  = useParams<{ courseId: string }>();
  const navigate      = useNavigate();
  const { toast }     = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [course, setCourse]   = useState<CourseManagementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const activeTab = searchParams.get("tab") ?? "overview";

  // Dialogs
  const [sectionDialog, setSectionDialog] = useState<{
    open: boolean; existing?: ManagementSection;
  }>({ open: false });

  const [lessonDialog, setLessonDialog] = useState<{
    open: boolean; sectionId: string; nextOrder: number;
  }>({ open: false, sectionId: "", nextOrder: 1 });

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCourse = () => {
    if (!courseId) return;
    setLoading(true);
    api
      .get(`/coursecreator/courses/${courseId}/management`)
      .then((res) => setCourse(res.data?.data ?? null))
      .catch(() => setError("Could not load this course."))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCourse, [courseId]);

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm("Delete this section and all its lessons?")) return;
    try {
      await api.delete(`/coursecreator/sections/${courseId}/${sectionId}`);
      toast({ title: "Section deleted" });
      fetchCourse();
    } catch {
      toast({ title: "Failed to delete section", variant: "destructive" });
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Loading course…</p>
      </div>
    </DashboardLayout>
  );

  if (error || !course) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error ?? "Course not found."}</p>
        <Button variant="outline" onClick={() => navigate("/creator/my-courses")}>
          Back to My Courses
        </Button>
      </div>
    </DashboardLayout>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Back */}
        <Button variant="ghost" size="sm" className="-ml-2"
          onClick={() => navigate("/creator/my-courses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />My Courses
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <Badge variant="secondary"
                className={course.isPublished
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"}>
                {course.isPublished
                  ? <><Eye className="h-3 w-3 mr-1" />Published</>
                  : <><EyeOff className="h-3 w-3 mr-1" />Draft</>}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Layers className="h-4 w-4" /> {course.totalSections} sections
              </span>
              <span className="flex items-center gap-1">
                <PlayCircle className="h-4 w-4" /> {course.totalLessons} lessons
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {course.totalStudents} students
              </span>
              {course.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  {course.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Preview button */}
          <Button variant="outline" onClick={() => navigate(`/creator/courses/${courseId}/preview`)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview & Publish
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(tab) => setSearchParams({ tab })} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Price</p>
                <p className="text-2xl font-bold">
                  ${(course.discountPrice ?? course.price).toFixed(2)}
                </p>
                {course.discountPrice && (
                  <p className="text-sm text-muted-foreground line-through">${course.price.toFixed(2)}</p>
                )}
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Language</p>
                <p className="text-lg font-medium">{course.language}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Age Group</p>
                <p className="text-lg font-medium">{course.ageGroup}</p>
              </div>
            </div>
          </TabsContent>

          {/* ── Curriculum ── */}
          <TabsContent value="curriculum" className="space-y-4">

            {/* Add section button */}
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setSectionDialog({ open: true })}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Section
              </Button>
            </div>

            {course.sections.length === 0 ? (
              <div className="border border-dashed rounded-xl p-10 text-center">
                <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No sections yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create sections to organize your lessons.
                </p>
                <Button onClick={() => setSectionDialog({ open: true })}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add First Section
                </Button>
              </div>
            ) : (
              <Accordion type="multiple" className="border rounded-xl">
                {course.sections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-semibold text-left">{section.title}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {section.lessons.length} lessons
                          </span>
                          {/* Section actions */}
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost" size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => setSectionDialog({ open: true, existing: section })}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              className="h-7 w-7 p-0 text-destructive"
                              onClick={() => handleDeleteSection(section.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-0">
                      {section.lessons.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                          No lessons yet.
                        </p>
                      ) : (
                        <ul className="divide-y divide-border">
                          {section.lessons.map((lesson) => (
                            <li key={lesson.id}
                              className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3">
                                {lesson.hasVideo
                                  ? <PlayCircle className="h-4 w-4 text-accent" />
                                  : <Video className="h-4 w-4 text-muted-foreground" />}
                                <span className="text-sm">{lesson.title}</span>
                                {lesson.isFree && (
                                  <Badge variant="secondary" className="text-xs">Free</Badge>
                                )}
                                {!lesson.isPublished && (
                                  <Badge variant="secondary" className="text-xs bg-muted">Draft</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {lesson.hasQuiz && (
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="h-3.5 w-3.5" /> Quiz
                                  </span>
                                )}
                                <span>{formatDuration(lesson.duration)}</span>
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => navigate(
                                    `/creator/courses/${courseId}/sections/${section.id}/lessons/${lesson.id}`
                                  )}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Add lesson button */}
                      <div className="px-4 py-3 border-t">
                        <Button
                          variant="outline" size="sm"
                          onClick={() =>
                            setLessonDialog({
                              open: true,
                              sectionId: section.id,
                              nextOrder: section.lessons.length + 1,
                            })
                          }
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Add Lesson
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>

          {/* ── Settings ── */}
          <TabsContent value="settings">
            <CourseSettingsTab course={course} onUpdated={fetchCourse} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <SectionDialog
        open={sectionDialog.open}
        onClose={() => setSectionDialog({ open: false })}
        courseId={courseId!}
        onSaved={fetchCourse}
        existing={sectionDialog.existing}
      />

      <AddLessonDialog
        open={lessonDialog.open}
        onClose={() => setLessonDialog({ open: false, sectionId: "", nextOrder: 1 })}
        courseId={courseId!}
        sectionId={lessonDialog.sectionId}
        nextOrder={lessonDialog.nextOrder}
        onCreated={fetchCourse}
      />
    </DashboardLayout>
  );
}
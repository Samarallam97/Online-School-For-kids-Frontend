import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Upload, Loader2, AlertCircle, CheckCircle2,
  Sparkles, Save, Play, FileText, HelpCircle, RefreshCw,
  Pencil, Trash2, Plus, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface DifficultyQuiz {
  difficulty: Difficulty;
  questions: QuizQuestion[];
  generating: boolean;
  generated: boolean;
}

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const DIFF_COLORS: Record<Difficulty, string> = {
  easy:   "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  hard:   "bg-red-100   text-red-700   border-red-200",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip timestamp lines like "[00:01:23]" from transcript for student display. */
function stripTimestamps(raw: string): string {
  return raw
    .split("\n")
    .map((line) => line.replace(/^\[[\d:]+\]\s*/, "").trim())
    .filter(Boolean)
    .join("\n");
}

function formatSeconds(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ── Sub-component: Quiz question editor ───────────────────────────────────────

function QuestionEditor({
  index,
  q,
  onChange,
  onDelete,
}: {
  index: number;
  q: QuizQuestion;
  onChange: (q: QuizQuestion) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 text-left text-sm font-medium"
      >
        <span>Q{index + 1}. {q.question.slice(0, 60)}{q.question.length > 60 ? "…" : ""}</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {q.options[q.correctAnswer]?.slice(0, 20) ?? "No answer"}
          </Badge>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Question</Label>
            <Textarea
              value={q.question}
              onChange={(e) => onChange({ ...q, question: e.target.value })}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Options (click ✓ to mark correct)</Label>
            {q.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => onChange({ ...q, correctAnswer: i })}
                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    q.correctAnswer === i
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-muted-foreground/30 hover:border-green-400"
                  }`}
                >
                  {q.correctAnswer === i && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <Input
                  value={opt}
                  onChange={(e) => {
                    const opts = [...q.options];
                    opts[i] = e.target.value;
                    onChange({ ...q, options: opts });
                  }}
                  className="text-sm flex-1"
                  placeholder={`Option ${i + 1}`}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Explanation</Label>
            <Textarea
              value={q.explanation}
              onChange={(e) => onChange({ ...q, explanation: e.target.value })}
              rows={2}
              className="text-sm resize-none"
              placeholder="Why is this the correct answer?"
            />
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LessonEditorPage() {
  const { courseId, sectionId, lessonId } = useParams<{
    courseId: string;
    sectionId: string;
    lessonId: string;
  }>();
  const navigate  = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isNew = lessonId === "new";

  // ── Lesson fields ─────────────────────────────────────────────────────────
  const [title, setTitle]         = useState(searchParams.get("title") ?? "");
  const [transcript, setTranscript] = useState("");
  const [videoUrl, setVideoUrl]   = useState("");
  const [duration, setDuration]   = useState(0);
  const [order, setOrder]         = useState(Number(searchParams.get("order") ?? "1"));
  const [isFree, setIsFree]       = useState(false);

  // ── Video upload ──────────────────────────────────────────────────────────
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading]           = useState(false);
  const [processing, setProcessing]         = useState(false);
  const [processStep, setProcessStep]       = useState("");
  const videoRef  = useRef<HTMLVideoElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // ── Quiz state ────────────────────────────────────────────────────────────
  const [quizzes, setQuizzes] = useState<DifficultyQuiz[]>(
    DIFFICULTIES.map((d) => ({ difficulty: d, questions: [], generating: false, generated: false }))
  );
  const [numQuestions, setNumQuestions] = useState(5);
  const [activeQuizTab, setActiveQuizTab] = useState<Difficulty>("easy");

  // ── Saving ────────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);

  // ── Load existing lesson if editing ──────────────────────────────────────
  useEffect(() => {
    if (isNew || !lessonId || !courseId || !sectionId) return;
    api
      .get(`/coursecreator/courses/${courseId}/management`)
      .then((res) => {
        const section = (res.data?.data?.sections ?? []).find((s: any) => s.id === sectionId);
        const lesson  = (section?.lessons ?? []).find((l: any) => l.id === lessonId);
        if (!lesson) return;
        setTitle(lesson.title ?? "");
        setTranscript(lesson.description ?? "");
        setVideoUrl(lesson.videoUrl ?? "");
        setDuration(lesson.duration ?? 0);
        setOrder(lesson.order ?? 1);
        setIsFree(lesson.isFree ?? false);
        if (lesson.quizzes?.length) {
          setQuizzes(
            DIFFICULTIES.map((d) => {
              const found = lesson.quizzes.find((q: any) => q.difficulty === d);
              return {
                difficulty: d,
                questions: found?.questions ?? [],
                generating: false,
                generated: !!found,
              };
            })
          );
        }
      })
      .catch(() => toast({ title: "Could not load lesson", variant: "destructive" }));
  }, [lessonId, courseId, sectionId, isNew]);

  // ── Video upload + transcript extraction ──────────────────────────────────

  const handleVideoFile = async (file: File) => {
    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    if (videoRef.current) videoRef.current.src = objectUrl;

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload to storage
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await api.post("/upload/video", form, {
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      const storedUrl: string = uploadRes.data?.data?.url ?? objectUrl;
      setVideoUrl(storedUrl);
      setUploading(false);

      // 2. Get duration from the video element
      if (videoRef.current) {
        setDuration(Math.round(videoRef.current.duration || 0));
      }

      // 3. Run single-video pipeline (transcript only, no chunking)
      setProcessing(true);
      setProcessStep("Extracting audio and transcribing…");

      const pipelineForm = new FormData();
      pipelineForm.append("file", file);
      const pipelineRes = await api.post("/videoprocessing/transcript-only", pipelineForm);
      const rawTranscript: string = pipelineRes.data?.data?.transcript ?? "";

      setTranscript(stripTimestamps(rawTranscript));
      setProcessStep("");
      setProcessing(false);

      toast({ title: "Video uploaded and transcribed ✓" });
    } catch (err: any) {
      setUploading(false);
      setProcessing(false);
      const msg = err?.response?.data?.message ?? "Upload failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  // ── Quiz generation ───────────────────────────────────────────────────────

  const generateQuiz = async (difficulty: Difficulty) => {
    if (!transcript.trim()) {
      toast({ title: "Add a transcript first", variant: "destructive" });
      return;
    }

    setQuizzes((prev) =>
      prev.map((q) => q.difficulty === difficulty ? { ...q, generating: true } : q)
    );

    try {
      const res = await api.post("/quiz/generate", {
        lessonName:   title || "Lesson",
        transcript,
        difficulty,
        numQuestions,
      });

      const questions: QuizQuestion[] = res.data?.data ?? [];
      setQuizzes((prev) =>
        prev.map((q) =>
          q.difficulty === difficulty
            ? { ...q, generating: false, generated: true, questions }
            : q
        )
      );
      toast({ title: `${difficulty} quiz generated ✓` });
    } catch (err: any) {
      setQuizzes((prev) =>
        prev.map((q) => q.difficulty === difficulty ? { ...q, generating: false } : q)
      );
      toast({ title: "Quiz generation failed", variant: "destructive" });
    }
  };

  const generateAll = async () => {
    for (const d of DIFFICULTIES) {
      await generateQuiz(d);
    }
  };

  const updateQuestion = (difficulty: Difficulty, index: number, q: QuizQuestion) => {
    setQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.difficulty === difficulty
          ? { ...quiz, questions: quiz.questions.map((old, i) => (i === index ? q : old)) }
          : quiz
      )
    );
  };

  const deleteQuestion = (difficulty: Difficulty, index: number) => {
    setQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.difficulty === difficulty
          ? { ...quiz, questions: quiz.questions.filter((_, i) => i !== index) }
          : quiz
      )
    );
  };

  const addQuestion = (difficulty: Difficulty) => {
    const blank: QuizQuestion = {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    };
    setQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.difficulty === difficulty
          ? { ...quiz, questions: [...quiz.questions, blank] }
          : quiz
      )
    );
  };

  // ── Save everything ───────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Enter a lesson title", variant: "destructive" });
      return;
    }
    const readyQuizzes = quizzes.filter((q) => q.questions.length > 0);
    if (readyQuizzes.length === 0) {
      toast({ title: "Generate at least one quiz difficulty first", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await api.post("/quiz/save-lesson", {
        courseId,
        sectionId,
        lessonId: isNew ? undefined : lessonId,
        title,
        transcript,
        videoUrl,
        duration,
        order,
        isFree,
        quizzes: readyQuizzes.map((q) => ({
          difficulty: q.difficulty,
          questions:  q.questions,
        })),
      });

      toast({ title: "Lesson saved ✓" });
      // Navigate back to course management
      navigate(`/creator/courses/${courseId}?tab=curriculum`);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Save failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const allGenerated = quizzes.every((q) => q.generated);
  const anyGenerating = quizzes.some((q) => q.generating);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6 pb-12">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/creator/courses/${courseId}?tab=curriculum`)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{isNew ? "New Lesson" : "Edit Lesson"}</h1>
          <p className="text-muted-foreground text-sm">
            Upload a video, review the transcript, generate quizzes for all difficulty levels, then save.
          </p>
        </div>

        {/* ── Step 1: Lesson basics ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Lesson Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Lesson Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Variables"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Order in Section</Label>
                <Input
                  type="number" min={1}
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isFree" className="cursor-pointer">Free preview lesson</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 2: Video upload ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="h-4 w-4" />
              Video
            </CardTitle>
            <CardDescription>
              Upload a video — it will be transcribed automatically.
              Or paste a URL if already hosted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video preview */}
            {videoUrl && (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded-lg bg-black max-h-72"
                onLoadedMetadata={(e) => setDuration(Math.round(e.currentTarget.duration))}
              />
            )}

            {/* Upload area */}
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); }}
              />
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload a video</p>
              <p className="text-xs text-muted-foreground">MP4, MOV, AVI · up to 4 GB</p>
            </div>

            {/* Upload progress */}
            {uploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}

            {/* Processing indicator */}
            {processing && (
              <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-3 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {processStep}
              </div>
            )}

            {/* Manual video URL */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Or enter video URL directly</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://…"
                className="text-sm"
              />
            </div>

            {duration > 0 && (
              <p className="text-xs text-muted-foreground">
                Duration: {formatSeconds(duration)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Step 3: Transcript ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Transcript
            </CardTitle>
            <CardDescription>
              Shown to students beneath the video. Timestamps have been stripped automatically.
              Edit freely before saving.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={12}
              className="font-mono text-sm resize-y"
              placeholder="Transcript will appear here after upload, or type/paste manually…"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {transcript.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </CardContent>
        </Card>

        {/* ── Step 4: Quiz generation ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Quizzes
            </CardTitle>
            <CardDescription>
              Generate MCQ quizzes at all difficulty levels. Students will choose their difficulty
              before starting. Review and edit every question before saving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Generation controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm shrink-0">Questions per level:</Label>
                <Input
                  type="number" min={1} max={20}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                  className="w-20 text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={generateAll}
                disabled={anyGenerating || !transcript.trim()}
              >
                {anyGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                )}
                Generate All Levels
              </Button>
            </div>

            {/* Per-difficulty tabs */}
            <Tabs value={activeQuizTab} onValueChange={(v) => setActiveQuizTab(v as Difficulty)}>
              <TabsList className="grid grid-cols-3">
                {DIFFICULTIES.map((d) => {
                  const quiz = quizzes.find((q) => q.difficulty === d)!;
                  return (
                    <TabsTrigger key={d} value={d} className="gap-1.5">
                      <span className="capitalize">{d}</span>
                      {quiz.generated && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      )}
                      {quiz.generating && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {DIFFICULTIES.map((d) => {
                const quiz = quizzes.find((q) => q.difficulty === d)!;
                return (
                  <TabsContent key={d} value={d} className="space-y-3 mt-4">
                    {/* Generate button for this level */}
                    <div className="flex items-center justify-between">
                      <Badge className={`capitalize ${DIFF_COLORS[d]}`}>{d}</Badge>
                      <div className="flex gap-2">
                        {quiz.generated && (
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => generateQuiz(d)}
                            disabled={quiz.generating}
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            Regenerate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={quiz.generated ? "outline" : "default"}
                          onClick={() => generateQuiz(d)}
                          disabled={quiz.generating || !transcript.trim()}
                        >
                          {quiz.generating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                          )}
                          {quiz.generated ? "Re-generate" : `Generate ${d} quiz`}
                        </Button>
                      </div>
                    </div>

                    {/* Question list */}
                    {quiz.questions.length === 0 && !quiz.generating && (
                      <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                        No questions yet — click Generate to create them with AI,
                        or click + to add manually.
                      </div>
                    )}

                    <div className="space-y-2">
                      {quiz.questions.map((q, i) => (
                        <QuestionEditor
                          key={i}
                          index={i}
                          q={q}
                          onChange={(updated) => updateQuestion(d, i, updated)}
                          onDelete={() => deleteQuestion(d, i)}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline" size="sm"
                      onClick={() => addQuestion(d)}
                      className="w-full"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Question Manually
                    </Button>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* ── Save ── */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            {allGenerated
              ? "✓ All difficulty levels have questions"
              : `${quizzes.filter((q) => q.generated).length}/3 difficulty levels generated`}
          </p>
          <Button size="lg" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Lesson & Quizzes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
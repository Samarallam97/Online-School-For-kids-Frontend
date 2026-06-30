import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Upload, Loader2, Play, Pause, Scissors,
  Plus, Trash2, Save, ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Chunk {
  id: string;
  title: string;
  transcript: string;   // clean, no timestamps
  startTime: number;    // seconds
  endTime: number;      // seconds
  saved: boolean;
}

interface Section {
  id: string;
  title: string;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function parseTime(str: string): number {
  const parts = str.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(str) || 0;
}

/** Strip [00:01:23] timestamps from a line. */
function stripTimestamps(raw: string): string {
  return raw
    .split("\n")
    .map((l) => l.replace(/^\[[\d:]+\]\s*/, "").trim())
    .filter(Boolean)
    .join("\n");
}

/** From a full timestamped transcript, extract lines between startSec and endSec. */
function sliceTranscript(fullRaw: string, startSec: number, endSec: number): string {
  const lines = fullRaw.split("\n");
  const inRange = lines.filter((line) => {
    const m = line.match(/^\[(\d{2}:\d{2}:\d{2})\]/);
    if (!m) return false;
    const [h, mi, s] = m[1].split(":").map(Number);
    const t = h * 3600 + mi * 60 + s;
    return t >= startSec && t < endSec;
  });
  return inRange.map((l) => l.replace(/^\[[\d:]+\]\s*/, "").trim()).filter(Boolean).join("\n");
}

// ── Timeline component ────────────────────────────────────────────────────────

interface TimelineProps {
  duration: number;
  chunks: Chunk[];
  currentTime: number;
  selectedChunkId: string | null;
  onSeek: (t: number) => void;
  onChunkSelect: (id: string) => void;
  onCutPointDrag: (chunkId: string, edge: "start" | "end", newTime: number) => void;
}

function Timeline({
  duration,
  chunks,
  currentTime,
  selectedChunkId,
  onSeek,
  onChunkSelect,
  onCutPointDrag,
}: TimelineProps) {
  const barRef  = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ chunkId: string; edge: "start" | "end" } | null>(null);

  const toX = (t: number) => (t / Math.max(duration, 1)) * 100;

  const fromEvent = (e: React.MouseEvent | MouseEvent) => {
    const bar = barRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return ratio * duration;
  };

  const handleBarClick = (e: React.MouseEvent) => {
    if (dragRef.current) return;
    onSeek(fromEvent(e));
  };

  const startDrag = (
    e: React.MouseEvent,
    chunkId: string,
    edge: "start" | "end"
  ) => {
    e.stopPropagation();
    dragRef.current = { chunkId, edge };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const t = fromEvent(ev);
      onCutPointDrag(dragRef.current.chunkId, dragRef.current.edge, t);
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const COLORS = [
    "bg-blue-400/70",   "bg-violet-400/70", "bg-green-400/70",
    "bg-amber-400/70",  "bg-rose-400/70",   "bg-cyan-400/70",
  ];

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Timeline — drag cut points to resize chunks</Label>

      {/* Main bar */}
      <div
        ref={barRef}
        onClick={handleBarClick}
        className="relative h-14 bg-muted rounded-lg overflow-visible cursor-crosshair select-none"
      >
        {/* Chunk segments */}
        {chunks.map((chunk, i) => {
          const left  = toX(chunk.startTime);
          const width = toX(chunk.endTime) - left;
          const color = COLORS[i % COLORS.length];
          const isSel = chunk.id === selectedChunkId;

          return (
            <div
              key={chunk.id}
              onClick={(e) => { e.stopPropagation(); onChunkSelect(chunk.id); }}
              className={`absolute top-1 bottom-1 rounded ${color} ${
                isSel ? "ring-2 ring-primary ring-offset-1 z-20" : "z-10"
              } cursor-pointer flex items-center justify-center overflow-hidden`}
              style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
            >
              <span className="text-white text-xs font-medium truncate px-1 drop-shadow">
                {chunk.title || `Chunk ${i + 1}`}
              </span>

              {/* Start drag handle */}
              <div
                onMouseDown={(e) => startDrag(e, chunk.id, "start")}
                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/40 hover:bg-white/70 transition-colors z-30"
              />
              {/* End drag handle */}
              <div
                onMouseDown={(e) => startDrag(e, chunk.id, "end")}
                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/40 hover:bg-white/70 transition-colors z-30"
              />
            </div>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-40 pointer-events-none"
          style={{ left: `${toX(currentTime)}%` }}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full -ml-[5px] -mt-0.5" />
        </div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-xs text-muted-foreground px-0.5">
        <span>0:00</span>
        <span>{formatTime(duration / 4)}</span>
        <span>{formatTime(duration / 2)}</span>
        <span>{formatTime((duration * 3) / 4)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VideoChunkEditorPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate     = useNavigate();
  const { toast }    = useToast();

  // ── Video ──────────────────────────────────────────────────────────────────
  const videoRef      = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc]   = useState("");
  const [duration, setDuration]   = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying]     = useState(false);

  // Raw timestamped transcript from pipeline
  const [rawTranscript, setRawTranscript] = useState("");

  // Upload state
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing]       = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Chunks ─────────────────────────────────────────────────────────────────
  const [chunks, setChunks]               = useState<Chunk[]>([]);
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [savingAll, setSavingAll]         = useState(false);

  // Section picker (to know which section the creator wants)
  const [sections, setSections] = useState<Section[]>([]);
  const [chunkSections, setChunkSections] = useState<Record<string, string>>({});
  const [chunkOrders, setChunkOrders]     = useState<Record<string, number>>({});

  const selectedChunk = chunks.find((c) => c.id === selectedId) ?? null;

  // ── Load sections ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!courseId) return;
    api
      .get(`/coursecreator/courses/${courseId}/management`)
      .then((res) => {
        const raw: { id: string; title: string }[] = res.data?.data?.sections ?? [];
        setSections(raw.map((s) => ({ id: s.id, title: s.title })));
      })
      .catch(() => {});
  }, [courseId]);

  // ── Video events ───────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => setCurrentTime(video.currentTime);
    const onMeta = () => setDuration(video.duration);
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [videoSrc]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.pause() : v.play();
  };

  const seekTo = (t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(t, duration));
  };

  // ── File upload + pipeline ─────────────────────────────────────────────────

  const handleFile = async (file: File) => {
    const local = URL.createObjectURL(file);
    setVideoSrc(local);
    if (videoRef.current) videoRef.current.src = local;

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload file
      const form = new FormData();
      form.append("file", file);
      await api.post("/upload/video", form, {
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setUploading(false);

      // 2. Run chunking pipeline
      setProcessing(true);
      const pForm = new FormData();
      pForm.append("file", file);
      const pRes = await api.post("/videoprocessing/upload", pForm);
      // The pipeline returns the jobId; we need to poll/get the job
      const jobId: string = pRes.data?.data?.jobId;
      const jobRes = await api.get(`/videoprocessing/${jobId}`);
      const jobData = jobRes.data?.data;

      setRawTranscript(jobData?.rawTranscript ?? "");

      // Build initial chunks from pipeline segments
      const initial: Chunk[] = (jobData?.chunks ?? []).map((c: any, i: number) => ({
        id:         c.id ?? String(i),
        title:      c.title ?? `Chunk ${i + 1}`,
        transcript: stripTimestamps(c.transcript ?? ""),
        startTime:  parseTime(c.startTime ?? "0:00"),
        endTime:    parseTime(c.endTime   ?? "0:00"),
        saved:      false,
      }));

      setChunks(initial);
      if (initial.length > 0) setSelectedId(initial[0].id);

      // Default section mapping (first section for all)
      const firstSectionId = sections[0]?.id ?? "";
      const sMap: Record<string, string> = {};
      const oMap: Record<string, number> = {};
      initial.forEach((c, i) => { sMap[c.id] = firstSectionId; oMap[c.id] = i + 1; });
      setChunkSections(sMap);
      setChunkOrders(oMap);

      setProcessing(false);
      toast({ title: `Video chunked into ${initial.length} lessons ✓` });
    } catch (err: any) {
      setUploading(false);
      setProcessing(false);
      toast({ title: "Processing failed", description: err?.response?.data?.message, variant: "destructive" });
    }
  };

  // ── Chunk manipulation ─────────────────────────────────────────────────────

  const addCutAtPlayhead = () => {
    if (!selectedChunk) return;
    const t = currentTime;
    if (t <= selectedChunk.startTime || t >= selectedChunk.endTime) {
      toast({ title: "Playhead must be inside the selected chunk", variant: "destructive" });
      return;
    }
    // Split selectedChunk at t
    const left: Chunk = {
      ...selectedChunk,
      endTime: t,
      transcript: sliceTranscript(rawTranscript, selectedChunk.startTime, t),
    };
    const right: Chunk = {
      id:         crypto.randomUUID(),
      title:      `${selectedChunk.title} (cont.)`,
      transcript: sliceTranscript(rawTranscript, t, selectedChunk.endTime),
      startTime:  t,
      endTime:    selectedChunk.endTime,
      saved:      false,
    };
    setChunks((prev) => {
      const idx = prev.findIndex((c) => c.id === selectedChunk.id);
      const next = [...prev];
      next.splice(idx, 1, left, right);
      return next;
    });
    setChunkSections((p) => ({ ...p, [right.id]: chunkSections[selectedChunk.id] ?? "" }));
    setChunkOrders((p) => {
      const newMap = { ...p };
      // Reindex all
      const newChunks = [...chunks];
      newChunks.splice(chunks.findIndex((c) => c.id === selectedChunk.id), 1, left, right);
      newChunks.forEach((c, i) => { newMap[c.id] = i + 1; });
      return newMap;
    });
    setSelectedId(right.id);
  };

  const deleteChunk = (id: string) => {
    setChunks((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(chunks[0]?.id ?? null);
  };

  const mergeWithNext = (id: string) => {
    const idx = chunks.findIndex((c) => c.id === id);
    if (idx < 0 || idx >= chunks.length - 1) return;
    const a = chunks[idx];
    const b = chunks[idx + 1];
    const merged: Chunk = {
      ...a,
      endTime:    b.endTime,
      transcript: [a.transcript, b.transcript].filter(Boolean).join("\n"),
    };
    setChunks((prev) => {
      const next = [...prev];
      next.splice(idx, 2, merged);
      return next;
    });
  };

  const handleCutPointDrag = (chunkId: string, edge: "start" | "end", newTime: number) => {
    setChunks((prev) => {
      const idx = prev.findIndex((c) => c.id === chunkId);
      if (idx < 0) return prev;
      const next = [...prev];
      const chunk = { ...next[idx] };

      if (edge === "start") {
        const min = idx > 0 ? next[idx - 1].startTime + 1 : 0;
        chunk.startTime = Math.max(min, Math.min(newTime, chunk.endTime - 1));
        if (idx > 0) next[idx - 1] = { ...next[idx - 1], endTime: chunk.startTime };
      } else {
        const max = idx < next.length - 1 ? next[idx + 1].endTime - 1 : duration;
        chunk.endTime = Math.min(max, Math.max(newTime, chunk.startTime + 1));
        if (idx < next.length - 1) next[idx + 1] = { ...next[idx + 1], startTime: chunk.endTime };
      }

      // Re-slice transcript based on new boundaries
      chunk.transcript = sliceTranscript(rawTranscript, chunk.startTime, chunk.endTime);
      next[idx] = chunk;
      return next;
    });
  };

  const updateChunkField = (id: string, field: keyof Chunk, value: any) => {
    setChunks((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  // ── Save all chunks as lessons ─────────────────────────────────────────────

  const handleSaveAll = async () => {
    const unsaved = chunks.filter((c) => !c.saved);
    if (unsaved.length === 0) {
      toast({ title: "All chunks already saved" });
      return;
    }

    const missingSection = unsaved.find((c) => !chunkSections[c.id]);
    if (missingSection) {
      toast({ title: `Assign a section to "${missingSection.title}" first`, variant: "destructive" });
      return;
    }

    setSavingAll(true);
    let successCount = 0;
    for (const chunk of unsaved) {
      try {
        await api.post("/quiz/save-lesson", {
          courseId,
          sectionId:  chunkSections[chunk.id],
          title:      chunk.title,
          transcript: chunk.transcript,
          videoUrl:   videoSrc,
          duration:   Math.round(chunk.endTime - chunk.startTime),
          order:      chunkOrders[chunk.id] ?? 1,
          isFree:     false,
          quizzes:    [],   // Quiz generation is done per-lesson in LessonEditorPage
        });
        setChunks((prev) => prev.map((c) => c.id === chunk.id ? { ...c, saved: true } : c));
        successCount++;
      } catch {
        toast({ title: `Failed to save "${chunk.title}"`, variant: "destructive" });
      }
    }

    setSavingAll(false);
    if (successCount > 0) {
      toast({ title: `${successCount} lessons saved ✓` });
      navigate(`/creator/courses/${courseId}?tab=curriculum`);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-5 pb-12">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/creator/courses/${courseId}?tab=curriculum`)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Video Chunk Editor</h1>
          <p className="text-muted-foreground text-sm">
            Upload a long video — the AI splits it into chunks. Drag cut points on the timeline
            to adjust boundaries, or edit start/end times manually.
          </p>
        </div>

        {/* Upload zone (shown until video loaded) */}
        {!videoSrc && (
          <Card>
            <CardContent className="pt-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-16 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-semibold">Upload your video</p>
                <p className="text-sm text-muted-foreground">MP4, MOV, AVI · up to 4 GB</p>
              </div>

              {uploading && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading…</span><span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5" />
                </div>
              )}
              {processing && (
                <div className="mt-4 flex items-center gap-3 bg-muted rounded-lg px-4 py-3 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  AI is processing and chunking your video…
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main editor (shown after upload) */}
        {videoSrc && (
          <div className="grid grid-cols-[1fr_300px] gap-5">

            {/* Left: video + timeline */}
            <div className="space-y-4">

              {/* Video player */}
              <Card>
                <CardContent className="pt-4 pb-3 space-y-3">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    className="w-full rounded-lg bg-black max-h-80"
                  />

                  {/* Player controls */}
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={togglePlay}>
                      {playing
                        ? <Pause className="h-4 w-4" />
                        : <Play  className="h-4 w-4" />}
                    </Button>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                    <Button
                      variant="outline" size="sm"
                      className="ml-auto"
                      onClick={addCutAtPlayhead}
                      disabled={!selectedChunk}
                      title="Split selected chunk at playhead position"
                    >
                      <Scissors className="h-4 w-4 mr-1.5" />
                      Cut here
                    </Button>
                  </div>

                  {/* Timeline */}
                  {duration > 0 && (
                    <Timeline
                      duration={duration}
                      chunks={chunks}
                      currentTime={currentTime}
                      selectedChunkId={selectedId}
                      onSeek={seekTo}
                      onChunkSelect={setSelectedId}
                      onCutPointDrag={handleCutPointDrag}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Selected chunk editor */}
              {selectedChunk && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Edit Chunk: {selectedChunk.title}
                    </CardTitle>
                    <CardDescription>
                      Adjust title, start/end times, and transcript.
                      Transcript updates automatically when you drag cut points.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Lesson Title</Label>
                      <Input
                        value={selectedChunk.title}
                        onChange={(e) => updateChunkField(selectedChunk.id, "title", e.target.value)}
                        placeholder="e.g. Introduction to Variables"
                      />
                    </div>

                    {/* Manual start/end time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Start Time</Label>
                        <Input
                          value={formatTime(selectedChunk.startTime)}
                          onChange={(e) => {
                            const t = parseTime(e.target.value);
                            if (!isNaN(t)) updateChunkField(selectedChunk.id, "startTime", t);
                          }}
                          className="font-mono text-sm"
                          placeholder="0:00"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">End Time</Label>
                        <Input
                          value={formatTime(selectedChunk.endTime)}
                          onChange={(e) => {
                            const t = parseTime(e.target.value);
                            if (!isNaN(t)) updateChunkField(selectedChunk.id, "endTime", t);
                          }}
                          className="font-mono text-sm"
                          placeholder="0:00"
                        />
                      </div>
                    </div>

                    {/* Seek buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => seekTo(selectedChunk.startTime)}>
                        <Play className="h-3.5 w-3.5 mr-1" /> Preview start
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => seekTo(selectedChunk.endTime - 3)}>
                        <Play className="h-3.5 w-3.5 mr-1" /> Preview end
                      </Button>
                    </div>

                    {/* Transcript */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Transcript (student-facing, no timestamps)</Label>
                      <Textarea
                        value={selectedChunk.transcript}
                        onChange={(e) => updateChunkField(selectedChunk.id, "transcript", e.target.value)}
                        rows={8}
                        className="font-mono text-sm resize-y"
                        placeholder="Transcript for this chunk…"
                      />
                    </div>

                    {/* Section + order */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Section</Label>
                        {sections.length > 0 ? (
                          <select
                            value={chunkSections[selectedChunk.id] ?? ""}
                            onChange={(e) =>
                              setChunkSections((p) => ({ ...p, [selectedChunk.id]: e.target.value }))
                            }
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                          >
                            <option value="">— choose section —</option>
                            {sections.map((s) => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-xs text-muted-foreground border rounded-md px-3 py-2 bg-muted/40">
                            No sections — create them in course management first.
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Lesson Order</Label>
                        <Input
                          type="number" min={1}
                          value={chunkOrders[selectedChunk.id] ?? 1}
                          onChange={(e) =>
                            setChunkOrders((p) => ({ ...p, [selectedChunk.id]: parseInt(e.target.value) || 1 }))
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>

                    {/* Chunk actions */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => mergeWithNext(selectedChunk.id)}
                        disabled={chunks.indexOf(selectedChunk) >= chunks.length - 1}
                      >
                        Merge with next
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="text-destructive ml-auto"
                        onClick={() => deleteChunk(selectedChunk.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete chunk
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: chunk list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Chunks ({chunks.length})
                </p>
                <Button
                  variant="outline" size="sm"
                  onClick={() => {
                    const last = chunks[chunks.length - 1];
                    const newChunk: Chunk = {
                      id:         crypto.randomUUID(),
                      title:      `Chunk ${chunks.length + 1}`,
                      transcript: "",
                      startTime:  last ? last.endTime : 0,
                      endTime:    duration,
                      saved:      false,
                    };
                    setChunks((p) => [...p, newChunk]);
                    setSelectedId(newChunk.id);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                {chunks.map((chunk, i) => (
                  <button
                    key={chunk.id}
                    onClick={() => { setSelectedId(chunk.id); seekTo(chunk.startTime); }}
                    className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors flex items-start gap-2 ${
                      chunk.id === selectedId ? "bg-primary text-primary-foreground" : "hover:bg-muted border"
                    }`}
                  >
                    <span className="shrink-0 mt-0.5">
                      {chunk.saved
                        ? <span className="text-green-400">✓</span>
                        : <span className="opacity-50">{i + 1}.</span>}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{chunk.title}</p>
                      <p className={`text-xs ${chunk.id === selectedId ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatTime(chunk.startTime)} → {formatTime(chunk.endTime)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t">
                <Button
                  className="w-full"
                  onClick={handleSaveAll}
                  disabled={savingAll || chunks.length === 0}
                >
                  {savingAll
                    ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    : <Save className="h-4 w-4 mr-2" />}
                  Save All as Lessons
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {chunks.filter((c) => c.saved).length}/{chunks.length} saved
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
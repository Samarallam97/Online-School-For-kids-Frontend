import api from "./api.ts";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VideoChunk {
  id: string;
  index: number;
  title: string;
  summary: string;
  transcript: string;
  startTime: string;
  endTime: string;
  sectionId?: string;
  lessonTitle?: string;
  isSaved: boolean;
  lessonId?: string;
}

/** Course-level metadata returned by the AI pipeline's "description" object. */
export interface PipelineDescription {
  summary: string;
  targetAudience: string;
  toneAndStyle: string;
  seoTags: string[];
}

export interface VideoProcessingJob {
  id: string;
  courseId: string;
  sourceType: string;
  sourceUrl: string;
  status: "pending" | "processing" | "awaiting_review" | "completed" | "failed";
  errorMessage?: string;
  rawTranscript?: string;
  /** Null when the pipeline did not return a description object. */
  description?: PipelineDescription | null;
  chunks: VideoChunk[];
}

// ── Service ───────────────────────────────────────────────────────────────────

export const videoProcessingService = {
  /** Submit a YouTube URL for processing. Returns the jobId. */
  processYoutube: async (courseId: string, youtubeUrl: string): Promise<string> => {
    const res = await api.post("/videoprocessing/youtube", { courseId, youtubeUrl });
    return res.data.data.jobId as string;
  },

  /** Upload a video file for processing. Returns the jobId. */
  processUpload: async (
    courseId: string,
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<string> => {
    const form = new FormData();
    form.append("courseId", courseId);
    form.append("file", file);

    // Do NOT set Content-Type manually — the browser must generate the boundary.
    const res = await api.post("/videoprocessing/upload", form, {
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
    return res.data.data.jobId as string;
  },

  /** Get a job by ID (status + chunks + description). */
  getJob: async (jobId: string): Promise<VideoProcessingJob> => {
    const res = await api.get(`/videoprocessing/${jobId}`);
    return res.data.data as VideoProcessingJob;
  },

  /** Auto-save edits to a chunk's title and transcript. */
  updateChunk: async (
    jobId: string,
    chunkId: string,
    title: string,
    transcript: string
  ): Promise<void> => {
    await api.patch(`/videoprocessing/${jobId}/chunks/${chunkId}`, { title, transcript });
  },

  /** Save a reviewed chunk as a lesson inside a section. */
  saveChunk: async (
    jobId: string,
    chunkId: string,
    payload: {
      courseId: string;
      sectionId: string;
      title: string;
      transcript: string;
      order: number;
    }
  ): Promise<string> => {
    const res = await api.post(
      `/videoprocessing/${jobId}/chunks/${chunkId}/save`,
      payload
    );
    return res.data.data.lessonId as string;
  },
};

/** Create a new section directly on a course (used during video review). */
export const createSection = async (
  courseId: string,
  title: string,
  description?: string
): Promise<void> => {
  await api.post("/coursecreator/sections", {
    courseId,
    title,
    description: description ?? "",
    order: 0, // backend can auto-assign based on existing count
  });
};
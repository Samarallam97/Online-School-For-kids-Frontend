import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, Clock, BookOpen, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import api from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnrolledCourse {
  enrollmentId:     string;
  courseId:         string;
  title:            string;
  instructor:       string;
  thumbnail:        string | null;
  progress:         number;
  lastAccessedAt:   string | null;
  totalLessons:     number;
  completedLessons: number;
  duration:         string;
  status:           "not_started" | "in_progress" | "completed";
  enrolledAt:       string;
  isCompleted:      boolean;
  completedAt:      string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyCoursesPage() {
  const [courses, setCourses]         = useState<EnrolledCourse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy]           = useState<string>("recent");

  // ── Fetch enrollments ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/student/enrollments");
        setCourses(res.data?.data ?? []);
      } catch (e: any) {
        setError(e.response?.data?.message ?? "Failed to load your courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = courses
    .filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "progress":
          return b.progress - a.progress;
        case "recent":
        default:
          return (b.lastAccessedAt ?? b.enrolledAt).localeCompare(
                  a.lastAccessedAt ?? a.enrolledAt);
      }
    });

  // ── Status counts for summary ─────────────────────────────────────────────
  const counts = {
    total:       courses.length,
    inProgress:  courses.filter((c) => c.status === "in_progress").length,
    completed:   courses.filter((c) => c.status === "completed").length,
    notStarted:  courses.filter((c) => c.status === "not_started").length,
  };

  // ── Status badge ──────────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-success/10 text-success">
            <CheckCircle className="h-3 w-3" /> Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
            <BookOpen className="h-3 w-3" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
            <Clock className="h-3 w-3" /> Not Started
          </span>
        );
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your courses…</p>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display">My Courses</h1>
          <p className="text-muted-foreground">Continue learning from where you left off</p>
        </div>

        {/* Summary stats */}
        {counts.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",       value: counts.total,      color: "text-foreground" },
              { label: "In Progress", value: counts.inProgress, color: "text-accent" },
              { label: "Completed",   value: counts.completed,  color: "text-success" },
              { label: "Not Started", value: counts.notStarted, color: "text-muted-foreground" },
            ].map(({ label, value, color }) => (
              <div key={label} className="border rounded-lg p-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your courses…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Accessed</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, index) => (
              <motion.div
                key={course.enrollmentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/course/${course.courseId}/progress`}>
                  <div className="group border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(course.status)}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-accent transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{course.instructor}</p>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </span>
                        {course.lastAccessedAt ? (
                          <span>Last: {new Date(course.lastAccessedAt).toLocaleDateString()}</span>
                        ) : (
                          <span>Enrolled {new Date(course.enrolledAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            {courses.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Enrol in a course to start learning
                </p>
                <Link to="/courses"><Button>Browse Courses</Button></Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
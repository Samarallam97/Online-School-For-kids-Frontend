import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, Clock, BookOpen, CheckCircle } from "lucide-react";
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

// Mock enrolled courses data

const enrolledCourses = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    instructor: "Dr. Angela Yu",
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    progress: 65,
    lastAccessed: "2024-01-25",
    totalLessons: 120,
    completedLessons: 78,
    duration: "40h",
    status: "in_progress" as const,
  },
  {
    id: "2",
    title: "Machine Learning A-Z",
    instructor: "Kirill Eremenko",
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
    progress: 100,
    lastAccessed: "2024-01-20",
    totalLessons: 85,
    completedLessons: 85,
    duration: "32h",
    status: "completed" as const,
  },
  {
    id: "3",
    title: "React - The Complete Guide",
    instructor: "Maximilian Schwarzmüller",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    progress: 0,
    lastAccessed: null,
    totalLessons: 95,
    completedLessons: 0,
    duration: "28h",
    status: "not_started" as const,
  },
  {
    id: "4",
    title: "Python for Data Science",
    instructor: "Jose Portilla",
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
    progress: 32,
    lastAccessed: "2024-01-22",
    totalLessons: 60,
    completedLessons: 19,
    duration: "20h",
    status: "in_progress" as const,
  },
];

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const filteredCourses = enrolledCourses
    .filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || course.status === statusFilter;
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
          return (b.lastAccessed || "").localeCompare(a.lastAccessed || "");
      }
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-success/10 text-success">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
            <BookOpen className="h-3 w-3" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
            <Clock className="h-3 w-3" />
            Not Started
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">My Courses</h1>
          <p className="text-muted-foreground">
            Continue learning from where you left off
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your courses..."
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

        {/* Course Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/course/${course.id}/progress`}>
                <div className="group border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-video">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(course.status)}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-accent transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {course.completedLessons}/{course.totalLessons}{" "}
                          lessons
                        </span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                      {course.lastAccessed && (
                        <span>
                          Last:{" "}
                          {new Date(course.lastAccessed).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Link to="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

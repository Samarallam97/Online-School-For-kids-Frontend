import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Loader2, Search, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { studentService } from "@/services/studentService";

interface Course {
  id: string;
  title: string;
  progress: number;
  instructor: string;
  thumbnail?: string;
}

export function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await studentService.getEnrolledCourses();
        setCourses(response);
      } catch (error: any) {
        console.error("Failed to load courses:", error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Enrolled Courses</CardTitle>
        <CardDescription>Track your personal learning progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      by {course.instructor}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{course.progress}%</Badge>
              </div>
              <Progress value={course.progress} className="mt-3 h-2" />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start your learning journey by exploring our course catalog and enrolling in courses that interest you.
            </p>
            <Button asChild>
              <Link to="/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Courses
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
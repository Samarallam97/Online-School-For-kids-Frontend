import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Users, Star, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { creatorService, CreatorCourse } from "@/services/creatorService";

export function CoursesTab() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<CreatorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingCourseId, setTogglingCourseId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await creatorService.getCreatorCourses();
        setCourses(data);
      } catch {
        toast({ title: "Error", description: "Failed to load courses", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleCourseVisibility = async (courseId: string, currentVisibility: boolean) => {
    try {
      setTogglingCourseId(courseId);
      const newVisibility = !currentVisibility;
      await creatorService.toggleCourseProfileVisibility(courseId, newVisibility);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, isPublishedOnProfile: newVisibility } : c));
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed to update", variant: "destructive" });
    } finally {
      setTogglingCourseId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />My Courses</CardTitle>
        <CardDescription>Toggle which courses appear on your public profile</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No courses yet</p>
            <p className="text-sm mt-1">Your published courses will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map(course => (
              <div key={course.id} className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${!course.isPublishedOnProfile ? "opacity-60" : ""}`}>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="h-14 w-20 rounded-md object-cover flex-shrink-0" />
                ) : (
                  <div className="h-14 w-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{course.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.studentsCount.toLocaleString()} students</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500" />{course.rating.toFixed(1)}</span>
                    <Badge variant="outline" className="text-xs">{course.category}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {course.isPublishedOnProfile
                      ? <span className="text-sm text-muted-foreground flex items-center gap-1"><Eye className="h-3.5 w-3.5" />Visible</span>
                      : <span className="text-sm text-muted-foreground flex items-center gap-1"><EyeOff className="h-3.5 w-3.5" />Hidden</span>}
                    <Switch
                      checked={course.isPublishedOnProfile}
                      onCheckedChange={() => handleToggleCourseVisibility(course.id, course.isPublishedOnProfile)}
                      disabled={togglingCourseId === course.id}
                    />
                  </div>
                  {togglingCourseId === course.id && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">Only visible courses will appear on your public profile page.</p>
      </CardContent>
    </Card>
  );
}
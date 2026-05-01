import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  Play,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const mockCourses = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    progress: 65,
    lastAccessed: "2 hours ago",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
  },
  {
    id: "2",
    title: "Machine Learning A-Z",
    progress: 32,
    lastAccessed: "1 day ago",
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400",
  },
];

const stats = [
  { label: "Hours Learned", value: "48", icon: Clock, color: "text-info" },
  {
    label: "Courses Completed",
    value: "5",
    icon: BookOpen,
    color: "text-success",
  },
  { label: "Achievements", value: "12", icon: Trophy, color: "text-warning" },
  {
    label: "Current Streak",
    value: "7 days",
    icon: Target,
    color: "text-accent",
  },
];

export default function StudentDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Welcome back! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Continue your learning journey
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}
                    >
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Continue Learning */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Continue Learning</h2>
            <Link to="/my-courses">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {mockCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden course-card-hover"
              >
                <div className="flex">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-32 h-full object-cover"
                  />
                  <CardContent className="flex-1 p-4">
                    <h3 className="font-semibold line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last accessed: {course.lastAccessed}
                    </p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{course.progress}% complete</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <Link to={`/course/${course.id}/learn`}>
                      <Button size="sm" className="mt-3">
                        <Play className="h-4 w-4 mr-1" />
                        Continue
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Achievements</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {["Fast Learner", "Week Warrior", "Quiz Master"].map((badge, i) => (
              <motion.div
                key={badge}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 text-center"
              >
                <div className="h-16 w-16 rounded-full gradient-accent flex items-center justify-center mb-2 mx-auto">
                  <Award className="h-8 w-8 text-accent-foreground" />
                </div>
                <p className="text-sm font-medium">{badge}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

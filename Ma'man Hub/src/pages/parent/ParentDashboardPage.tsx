import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  Eye,
  Plus,
  ArrowRight,
  Star,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const children = [
  {
    id: 1,
    name: "Emma Johnson",
    age: 12,
    avatar: "",
    coursesEnrolled: 3,
    hoursThisWeek: 8.5,
    overallProgress: 72,
    streak: 7,
    recentActivity: "Completed: React Basics Quiz",
  },
  {
    id: 2,
    name: "Liam Johnson",
    age: 9,
    avatar: "",
    coursesEnrolled: 2,
    hoursThisWeek: 5.2,
    overallProgress: 45,
    streak: 3,
    recentActivity: "Started: Python for Kids",
  },
];

const weeklyProgress = [
  { day: "Mon", emma: 1.5, liam: 1.0 },
  { day: "Tue", emma: 2.0, liam: 0.5 },
  { day: "Wed", emma: 1.0, liam: 1.5 },
  { day: "Thu", emma: 1.5, liam: 0.8 },
  { day: "Fri", emma: 1.2, liam: 0.7 },
  { day: "Sat", emma: 0.8, liam: 0.5 },
  { day: "Sun", emma: 0.5, liam: 0.2 },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Live Coding Session",
    child: "Emma",
    date: "Today, 4:00 PM",
    type: "live",
  },
  {
    id: 2,
    title: "Math Quiz Due",
    child: "Liam",
    date: "Tomorrow, 6:00 PM",
    type: "quiz",
  },
  {
    id: 3,
    title: "Parent-Teacher Meeting",
    child: "Both",
    date: "Jan 30, 3:00 PM",
    type: "meeting",
  },
];

const achievements = [
  {
    id: 1,
    child: "Emma",
    title: "Quiz Master",
    description: "Scored 100% on 3 quizzes",
    icon: "🏆",
  },
  {
    id: 2,
    child: "Liam",
    title: "Fast Learner",
    description: "Completed 5 lessons in one day",
    icon: "🚀",
  },
  {
    id: 3,
    child: "Emma",
    title: "7-Day Streak",
    description: "Learning for a full week",
    icon: "🔥",
  },
];

export default function ParentDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Parent Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your children's learning progress
            </p>
          </div>
          <Button asChild>
            <Link to="/parent/add-child">
              <Plus className="mr-2 h-4 w-4" />
              Add Child
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Children
                  </p>
                  <p className="text-2xl font-bold">{children.length}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <div className="rounded-full bg-blue-500/10 p-3">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Hours This Week
                  </p>
                  <p className="text-2xl font-bold">13.7</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold">{achievements.length}</p>
                </div>
                <div className="rounded-full bg-yellow-500/10 p-3">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Children Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={child.avatar} />
                      <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Age: {child.age}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/parent/child/${child.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <BookOpen className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-1 text-lg font-bold">
                      {child.coursesEnrolled}
                    </p>
                    <p className="text-xs text-muted-foreground">Courses</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <Clock className="mx-auto h-5 w-5 text-blue-500" />
                    <p className="mt-1 text-lg font-bold">
                      {child.hoursThisWeek}h
                    </p>
                    <p className="text-xs text-muted-foreground">This Week</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <Star className="mx-auto h-5 w-5 text-yellow-500" />
                    <p className="mt-1 text-lg font-bold">{child.streak}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">
                      {child.overallProgress}%
                    </span>
                  </div>
                  <Progress value={child.overallProgress} className="h-2" />
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Recent Activity
                  </p>
                  <p className="text-sm font-medium">{child.recentActivity}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Events */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Weekly Progress Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Learning Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProgress}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="emma"
                      name="Emma"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="liam"
                      name="Liam"
                      fill="hsl(var(--primary)/0.5)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div
                    className={`rounded-full p-2 ${
                      event.type === "live"
                        ? "bg-red-500/10"
                        : event.type === "quiz"
                          ? "bg-yellow-500/10"
                          : "bg-blue-500/10"
                    }`}
                  >
                    {event.type === "live" ? (
                      <Bell className="h-4 w-4 text-red-500" />
                    ) : event.type === "quiz" ? (
                      <Target className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Users className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.child}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {event.date}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
            <Button variant="link" size="sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <span className="text-3xl">{achievement.icon}</span>
                  <div>
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {achievement.child}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

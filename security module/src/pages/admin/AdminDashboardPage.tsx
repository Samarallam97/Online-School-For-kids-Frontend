import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Mock stats
const stats = [
  {
    title: "Total Users",
    value: "12,458",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Active Users",
    value: "8,234",
    change: "+8%",
    trend: "up",
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Total Revenue",
    value: "$284,590",
    change: "+23%",
    trend: "up",
    icon: DollarSign,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Total Courses",
    value: "342",
    change: "+5",
    trend: "up",
    icon: BookOpen,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
];

// Mock chart data
const userRegistrations = [
  { month: "Jan", users: 400 },
  { month: "Feb", users: 520 },
  { month: "Mar", users: 680 },
  { month: "Apr", users: 890 },
  { month: "May", users: 1100 },
  { month: "Jun", users: 1350 },
  { month: "Jul", users: 1580 },
];

const revenueData = [
  { month: "Jan", revenue: 12400 },
  { month: "Feb", revenue: 18500 },
  { month: "Mar", revenue: 22300 },
  { month: "Apr", revenue: 28900 },
  { month: "May", revenue: 35600 },
  { month: "Jun", revenue: 42100 },
  { month: "Jul", revenue: 48200 },
];

const enrollmentData = [
  { name: "Web Dev", enrollments: 2340 },
  { name: "Data Science", enrollments: 1890 },
  { name: "Design", enrollments: 1560 },
  { name: "Marketing", enrollments: 980 },
  { name: "Business", enrollments: 720 },
];

const roleDistribution = [
  { name: "Students", value: 8500, color: "hsl(var(--accent))" },
  { name: "Parents", value: 2100, color: "hsl(var(--success))" },
  { name: "Creators", value: 1200, color: "hsl(220, 80%, 60%)" },
  { name: "Specialists", value: 658, color: "hsl(280, 70%, 60%)" },
];

// Mock recent transactions
const recentTransactions = [
  { id: "1", user: "John Smith", course: "React Masterclass", amount: 89.99, date: "2024-01-25", status: "completed" },
  { id: "2", user: "Sarah Chen", course: "Python Bootcamp", amount: 129.99, date: "2024-01-25", status: "completed" },
  { id: "3", user: "Mike Wilson", course: "UI/UX Design", amount: 79.99, date: "2024-01-24", status: "pending" },
  { id: "4", user: "Emma Brown", course: "Data Science A-Z", amount: 149.99, date: "2024-01-24", status: "completed" },
];

// Mock recent users
const recentUsers = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Student", date: "2024-01-25" },
  { id: "2", name: "Bob Williams", email: "bob@example.com", role: "Creator", date: "2024-01-25" },
  { id: "3", name: "Carol Davis", email: "carol@example.com", role: "Parent", date: "2024-01-24" },
];

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of platform performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/moderation">
                <AlertCircle className="h-4 w-4 mr-2" />
                5 Pending Reviews
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                      {stat.change}
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollments by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="enrollments" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/financial">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{tx.user}</p>
                      <p className="text-sm text-muted-foreground">{tx.course}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${tx.amount}</p>
                      <p className={`text-xs ${tx.status === "completed" ? "text-success" : "text-amber-500"}`}>
                        {tx.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Registrations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Registrations</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/users">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{user.role}</p>
                      <p className="text-xs text-muted-foreground">{user.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

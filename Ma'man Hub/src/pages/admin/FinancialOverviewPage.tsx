import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock financial stats
const stats = [
  {
    title: "Total Revenue",
    value: "$284,590",
    change: "+23%",
    icon: DollarSign,
  },
  {
    title: "Monthly Revenue",
    value: "$42,100",
    change: "+12%",
    icon: TrendingUp,
  },
  {
    title: "Pending Payouts",
    value: "$18,450",
    change: "5 creators",
    icon: Clock,
  },
  { title: "Transactions", value: "1,234", change: "+8%", icon: CreditCard },
];

// Mock revenue data
const dailyRevenue = [
  { date: "Jan 1", revenue: 1200 },
  { date: "Jan 5", revenue: 1800 },
  { date: "Jan 10", revenue: 2400 },
  { date: "Jan 15", revenue: 3100 },
  { date: "Jan 20", revenue: 2800 },
  { date: "Jan 25", revenue: 3500 },
  { date: "Jan 30", revenue: 4200 },
];

const monthlyRevenue = [
  { month: "Jul", revenue: 22000 },
  { month: "Aug", revenue: 28000 },
  { month: "Sep", revenue: 32000 },
  { month: "Oct", revenue: 35000 },
  { month: "Nov", revenue: 38000 },
  { month: "Dec", revenue: 42000 },
  { month: "Jan", revenue: 48000 },
];

// Mock transactions
const transactions = [
  {
    id: "tx1",
    user: "John Smith",
    course: "React Masterclass",
    amount: 89.99,
    date: "2024-01-25",
    status: "completed",
    type: "purchase",
  },
  {
    id: "tx2",
    user: "Sarah Chen",
    course: "Python Bootcamp",
    amount: 129.99,
    date: "2024-01-25",
    status: "completed",
    type: "purchase",
  },
  {
    id: "tx3",
    user: "Creator Payout - Alex Turner",
    course: "",
    amount: -450.0,
    date: "2024-01-24",
    status: "pending",
    type: "payout",
  },
  {
    id: "tx4",
    user: "Mike Wilson",
    course: "UI/UX Design",
    amount: 79.99,
    date: "2024-01-24",
    status: "refunded",
    type: "refund",
  },
  {
    id: "tx5",
    user: "Emma Brown",
    course: "Data Science A-Z",
    amount: 149.99,
    date: "2024-01-24",
    status: "completed",
    type: "purchase",
  },
  {
    id: "tx6",
    user: "Creator Payout - Maria Santos",
    course: "",
    amount: -820.0,
    date: "2024-01-23",
    status: "completed",
    type: "payout",
  },
  {
    id: "tx7",
    user: "David Lee",
    course: "JavaScript Fundamentals",
    amount: 59.99,
    date: "2024-01-23",
    status: "completed",
    type: "purchase",
  },
];

// Mock pending payouts
const pendingPayouts = [
  {
    id: "p1",
    creator: "Alex Turner",
    amount: 450.0,
    courses: 3,
    earnings: "Last 30 days",
  },
  {
    id: "p2",
    creator: "Maria Santos",
    amount: 820.0,
    courses: 5,
    earnings: "Last 30 days",
  },
  {
    id: "p3",
    creator: "James Wilson",
    amount: 325.0,
    courses: 2,
    earnings: "Last 30 days",
  },
];

export default function FinancialOverviewPage() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("monthly");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const chartData = timeframe === "daily" ? dailyRevenue : monthlyRevenue;
  const xDataKey = timeframe === "daily" ? "date" : "month";

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const handleProcessPayout = (payoutId: string) => {
    toast({
      title: "Payout processed",
      description: "The creator has been paid successfully.",
    });
  };

  const handleExportCSV = () => {
    toast({
      title: "Export started",
      description: "Your CSV file will download shortly.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/10 text-success">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "refunded":
        return <Badge variant="destructive">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">
              Financial Overview
            </h1>
            <p className="text-muted-foreground">
              Monitor revenue and manage payouts
            </p>
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <stat.icon className="h-6 w-6 text-accent" />
                    </div>
                    <span className="flex items-center text-sm text-success">
                      {stat.change}
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue Overview</CardTitle>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--accent))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--accent))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey={xDataKey} className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(value) =>
                      `$${value >= 1000 ? `${value / 1000}k` : value}`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Transactions Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.user}</p>
                            {tx.course && (
                              <p className="text-sm text-muted-foreground">
                                {tx.course}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            tx.amount < 0 ? "text-destructive" : "text-success"
                          }`}
                        >
                          {tx.amount < 0 ? "-" : "+"}$
                          {Math.abs(tx.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Payouts */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingPayouts.map((payout) => (
                <div
                  key={payout.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{payout.creator}</p>
                    <p className="text-lg font-bold">
                      ${payout.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{payout.courses} courses</span>
                    <span>{payout.earnings}</span>
                  </div>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleProcessPayout(payout.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Process Payout
                  </Button>
                </div>
              ))}

              {pendingPayouts.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle className="h-10 w-10 mx-auto text-success mb-2" />
                  <p className="text-sm text-muted-foreground">
                    All payouts processed!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

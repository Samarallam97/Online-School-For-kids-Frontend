import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  MessageSquare,
  Trash2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

// Mock pending courses
const pendingCourses = [
  {
    id: "pc1",
    title: "Advanced JavaScript Patterns",
    instructor: "Alex Turner",
    category: "Web Development",
    submittedDate: "2024-01-24",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
    description: "Deep dive into advanced JavaScript patterns including factory functions, modules, and more.",
    lessons: 24,
    duration: "8h 30m",
  },
  {
    id: "pc2",
    title: "Machine Learning with Python",
    instructor: "Dr. Maria Santos",
    category: "Data Science",
    submittedDate: "2024-01-23",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
    description: "Comprehensive course on ML algorithms, neural networks, and practical applications.",
    lessons: 36,
    duration: "12h",
  },
];

// Mock reported content
const reportedContent = [
  {
    id: "rc1",
    type: "comment",
    content: "This is inappropriate spam content that violates guidelines...",
    reportedBy: "John Smith",
    reason: "Spam",
    course: "React Masterclass",
    date: "2024-01-25",
    reportCount: 5,
  },
  {
    id: "rc2",
    type: "review",
    content: "Terrible course, the instructor doesn't know what they're talking about. Complete waste of money.",
    reportedBy: "Sarah Chen",
    reason: "Harassment",
    course: "Python Bootcamp",
    date: "2024-01-24",
    reportCount: 3,
  },
  {
    id: "rc3",
    type: "message",
    content: "Hey, check out my website for free courses...",
    reportedBy: "Mike Wilson",
    reason: "Promotional Content",
    course: "N/A",
    date: "2024-01-23",
    reportCount: 8,
  },
];

// Mock comments for moderation
const pendingComments = [
  {
    id: "cm1",
    user: "Emily Davis",
    content: "Great explanation! But I think there's an error in lesson 5.",
    course: "Web Development Bootcamp",
    date: "2024-01-25",
    flagged: true,
  },
  {
    id: "cm2",
    user: "Robert Chen",
    content: "Can someone help me understand the async/await concept?",
    course: "JavaScript Fundamentals",
    date: "2024-01-25",
    flagged: false,
  },
];

export default function ContentModerationPage() {
  const { toast } = useToast();
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; courseId?: string }>({ open: false });
  const [rejectReason, setRejectReason] = useState("");
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; course?: typeof pendingCourses[0] }>({ open: false });

  const handleApproveCourse = (courseId: string) => {
    toast({ title: "Course approved", description: "The course is now live on the platform." });
  };

  const handleRejectCourse = () => {
    if (!rejectReason.trim()) {
      toast({ title: "Reason required", description: "Please provide a reason for rejection.", variant: "destructive" });
      return;
    }
    toast({ title: "Course rejected", description: "The instructor has been notified." });
    setRejectDialog({ open: false });
    setRejectReason("");
  };

  const handleReportAction = (reportId: string, action: "dismiss" | "delete" | "warn") => {
    const messages = {
      dismiss: "Report dismissed",
      delete: "Content deleted",
      warn: "Warning sent to user",
    };
    toast({ title: messages[action], description: "Action completed successfully." });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Content Moderation</h1>
          <p className="text-muted-foreground">Review and moderate platform content</p>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses" className="relative">
              Pending Courses
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {pendingCourses.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reported" className="relative">
              Reported Content
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                {reportedContent.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          {/* Pending Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            {pendingCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-bold">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {course.instructor} • {course.category}
                          </p>
                        </div>
                        <p className="text-sm line-clamp-2">{course.description}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{course.lessons} lessons</span>
                          <span>{course.duration}</span>
                          <span>Submitted: {new Date(course.submittedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setPreviewDialog({ open: true, course })}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button onClick={() => handleApproveCourse(course.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setRejectDialog({ open: true, courseId: course.id })}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {pendingCourses.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
                <h3 className="text-lg font-semibold">All caught up!</h3>
                <p className="text-muted-foreground">No pending courses to review.</p>
              </div>
            )}
          </TabsContent>

          {/* Reported Content Tab */}
          <TabsContent value="reported" className="space-y-4">
            {reportedContent.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">
                            {report.type}
                          </Badge>
                          <Badge variant="destructive">
                            <Flag className="h-3 w-3 mr-1" />
                            {report.reportCount} reports
                          </Badge>
                          <Badge variant="secondary">{report.reason}</Badge>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm">{report.content}</p>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Course: {report.course}</span>
                          <span>Reported by: {report.reportedBy}</span>
                          <span>Date: {new Date(report.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReportAction(report.id, "dismiss")}
                        >
                          Dismiss
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReportAction(report.id, "warn")}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Warn
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReportAction(report.id, "delete")}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            {pendingComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{comment.user}</p>
                          {comment.flagged && (
                            <Badge variant="secondary">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground">
                          On: {comment.course} • {new Date(comment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-6">
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Course</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this course. The instructor will be notified.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog({ open: false })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectCourse}>
                <Send className="h-4 w-4 mr-2" />
                Send Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewDialog.open} onOpenChange={(open) => setPreviewDialog({ open })}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewDialog.course?.title}</DialogTitle>
              <DialogDescription>
                by {previewDialog.course?.instructor}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={previewDialog.course?.thumbnail}
                alt={previewDialog.course?.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <p>{previewDialog.course?.description}</p>
              <div className="flex gap-4 text-sm">
                <Badge variant="outline">{previewDialog.course?.category}</Badge>
                <span>{previewDialog.course?.lessons} lessons</span>
                <span>{previewDialog.course?.duration}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewDialog({ open: false })}>
                Close
              </Button>
              <Button onClick={() => {
                handleApproveCourse(previewDialog.course!.id);
                setPreviewDialog({ open: false });
              }}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoControls } from "@/components/video/VideoControls";
import { LiveChat } from "@/components/video/LiveChat";
import { Whiteboard } from "@/components/video/Whiteboard";
import { useVideoCall } from "@/hooks/useVideoCall";
import { useLiveSession } from "@/hooks/useLiveSession";
import {
  Radio,
  Users,
  Calendar,
  Clock,
  Copy,
  ExternalLink,
  Circle,
  PenTool,
  Video,
  Wifi,
  WifiOff,
  MessageCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function GoLivePage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const videoCall = useVideoCall();

  const [isLive, setIsLive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [streamSettings, setStreamSettings] = useState({
    title: "",
    description: "",
    category: "",
    isScheduled: false,
    scheduleDate: "",
    scheduleTime: "",
    allowChat: true,
    allowQuestions: true,
  });

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({ id: user.id, email: user.email || "Host" });
      }
    };
    getUser();
  }, []);

  // Use realtime hook for chat and presence (only when live)
  const liveSession = useLiveSession({
    sessionId: sessionId || "",
    userId: currentUser?.id || "host",
    username: currentUser?.email?.split("@")[0] || "Host",
    isHost: true,
  });

  // Elapsed time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGoLive = async () => {
    if (!streamSettings.title) {
      toast({
        title: "Missing Title",
        description: "Please enter a title for your stream.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Not Authenticated",
          description: "Please log in to start a live session.",
          variant: "destructive",
        });
        return;
      }

      // Create live session in database
      const channelName = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data: session, error } = await supabase
        .from("live_sessions")
        .insert({
          host_id: user.id,
          title: streamSettings.title,
          description: streamSettings.description,
          category: streamSettings.category,
          channel_name: channelName,
          status: "live",
          started_at: new Date().toISOString(),
          allow_chat: streamSettings.allowChat,
          allow_questions: streamSettings.allowQuestions,
          scheduled_at: streamSettings.isScheduled
            ? `${streamSettings.scheduleDate}T${streamSettings.scheduleTime}:00`
            : null,
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(session.id);

      // Join the video call
      await videoCall.joinChannel(channelName, user.id);

      setIsLive(true);
      setElapsedTime(0);

      toast({
        title: "You're Live!",
        description: "Your stream has started. Good luck!",
      });
    } catch (error) {
      console.error("Failed to start live session:", error);
      toast({
        title: "Failed to Start",
        description: "Could not start live session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStopStream = async () => {
    try {
      if (sessionId) {
        await supabase
          .from("live_sessions")
          .update({
            status: "ended",
            ended_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
      }

      await videoCall.leaveChannel();
      setIsLive(false);
      setSessionId(null);
      setElapsedTime(0);

      toast({
        title: "Stream Ended",
        description: "Your live stream has ended successfully.",
      });
    } catch (error) {
      console.error("Failed to end session:", error);
    }
  };

  const copyStreamLink = () => {
    const link = sessionId
      ? `${window.location.origin}/live/${sessionId}`
      : "Stream not started yet";
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Stream link copied to clipboard.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">
              {isLive ? "Live Now" : "Go Live"}
            </h1>
            <p className="text-muted-foreground">
              {isLive
                ? "You're streaming to your audience"
                : "Start a live session with your students"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isLive && liveSession.isConnected && (
              <Badge variant="secondary" className="gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                Connected
              </Badge>
            )}
            {isLive && (
              <Badge variant="destructive" className="animate-pulse gap-2">
                <Circle className="h-3 w-3 fill-current" />
                LIVE
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Stream Preview */}
          <div className="space-y-4 lg:col-span-2">
            {/* Video/Whiteboard Tabs */}
            <Card className="overflow-hidden">
              <Tabs defaultValue="video" className="w-full">
                <div className="flex items-center justify-between border-b px-4 py-2">
                  <TabsList>
                    <TabsTrigger value="video" className="gap-2">
                      <Video className="h-4 w-4" />
                      Video
                    </TabsTrigger>
                    <TabsTrigger value="whiteboard" className="gap-2">
                      <PenTool className="h-4 w-4" />
                      Whiteboard
                    </TabsTrigger>
                  </TabsList>

                  {isLive && (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="gap-1">
                        <Users className="h-3 w-3" />
                        {liveSession.viewerCount} viewers
                      </Badge>
                      <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(elapsedTime)}
                      </Badge>
                    </div>
                  )}
                </div>

                <TabsContent value="video" className="m-0">
                  <div className="relative aspect-video bg-muted">
                    <VideoPlayer
                      stream={videoCall.localStream}
                      muted
                      mirrored
                      isLocal
                      isVideoEnabled={videoCall.isVideoEnabled}
                      username="You"
                      className="h-full w-full"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="whiteboard" className="m-0">
                  <div className="aspect-video">
                    <Whiteboard isHost className="h-full" />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Controls */}
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-4">
                  {isLive ? (
                    <VideoControls
                      isAudioEnabled={videoCall.isAudioEnabled}
                      isVideoEnabled={videoCall.isVideoEnabled}
                      isScreenSharing={videoCall.isScreenSharing}
                      onToggleAudio={videoCall.toggleAudio}
                      onToggleVideo={videoCall.toggleVideo}
                      onToggleScreenShare={
                        videoCall.isScreenSharing
                          ? videoCall.stopScreenShare
                          : videoCall.startScreenShare
                      }
                      onLeave={handleStopStream}
                      showExtendedControls={false}
                    />
                  ) : (
                    <Button
                      size="lg"
                      className="h-12 gap-2 rounded-full px-8"
                      onClick={handleGoLive}
                    >
                      <Radio className="h-5 w-5" />
                      Go Live
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stream Settings */}
            {!isLive && (
              <Card>
                <CardHeader>
                  <CardTitle>Stream Settings</CardTitle>
                  <CardDescription>Configure your live session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Stream Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter your stream title"
                      value={streamSettings.title}
                      onChange={(e) =>
                        setStreamSettings({
                          ...streamSettings,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What will you be teaching?"
                      rows={3}
                      value={streamSettings.description}
                      onChange={(e) =>
                        setStreamSettings({
                          ...streamSettings,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={streamSettings.category}
                      onValueChange={(value) =>
                        setStreamSettings({
                          ...streamSettings,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="q&a">Q&A Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Schedule for Later</p>
                        <p className="text-sm text-muted-foreground">
                          Set a specific date and time
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={streamSettings.isScheduled}
                      onCheckedChange={(checked) =>
                        setStreamSettings({
                          ...streamSettings,
                          isScheduled: checked,
                        })
                      }
                    />
                  </div>

                  {streamSettings.isScheduled && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={streamSettings.scheduleDate}
                          onChange={(e) =>
                            setStreamSettings({
                              ...streamSettings,
                              scheduleDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={streamSettings.scheduleTime}
                          onChange={(e) =>
                            setStreamSettings({
                              ...streamSettings,
                              scheduleTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label>Allow Chat</Label>
                      <Switch
                        checked={streamSettings.allowChat}
                        onCheckedChange={(checked) =>
                          setStreamSettings({
                            ...streamSettings,
                            allowChat: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Allow Q&A</Label>
                      <Switch
                        checked={streamSettings.allowQuestions}
                        onCheckedChange={(checked) =>
                          setStreamSettings({
                            ...streamSettings,
                            allowQuestions: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Chat & Viewers */}
          <div className="space-y-4">
            {/* Stream Link */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Stream Link</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={
                      sessionId
                        ? `${window.location.host}/live/${sessionId.slice(0, 8)}...`
                        : "Start stream to get link"
                    }
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyStreamLink}
                    disabled={!isLive}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" disabled={!isLive}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Viewers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Viewers ({liveSession.viewerCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-32">
                  <div className="space-y-3">
                    {liveSession.viewers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {isLive
                          ? "Waiting for viewers..."
                          : "Start streaming to see viewers"}
                      </p>
                    ) : (
                      liveSession.viewers.map((viewer) => (
                        <div
                          key={viewer.id}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={viewer.avatarUrl} />
                            <AvatarFallback>
                              {viewer.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 truncate text-sm font-medium">
                            {viewer.username}
                          </span>
                          {viewer.isHost && (
                            <Badge variant="secondary" className="text-xs">
                              Host
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card className="flex h-[400px] flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Live Chat
                  </span>
                  {isLive && liveSession.isConnected && (
                    <span className="flex items-center gap-1 text-xs font-normal text-green-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                      Live
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <LiveChat
                  messages={liveSession.messages}
                  onSendMessage={(content) => liveSession.sendMessage(content)}
                  currentUserId={currentUser?.id || "host"}
                  disabled={!streamSettings.allowChat || !isLive}
                  placeholder={
                    !isLive
                      ? "Start streaming to chat"
                      : streamSettings.allowChat
                        ? "Send a message..."
                        : "Chat is disabled"
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

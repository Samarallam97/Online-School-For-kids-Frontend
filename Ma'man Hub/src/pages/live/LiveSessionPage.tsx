import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { LiveChat } from "@/components/video/LiveChat";
import { Whiteboard } from "@/components/video/Whiteboard";
import { useVideoCall } from "@/hooks/useVideoCall";
import { useLiveSession } from "@/hooks/useLiveSession";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Clock,
  Circle,
  ArrowLeft,
  ThumbsUp,
  Share2,
  Hand,
  Volume2,
  VolumeX,
  Video,
  PenTool,
  MessageCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  host_id: string;
  channel_name: string;
  status: string | null;
  viewer_count: number | null;
  allow_chat: boolean | null;
  allow_questions: boolean | null;
  started_at: string | null;
}

export default function LiveSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoCall = useVideoCall();

  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showViewers, setShowViewers] = useState(false);

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({ id: user.id, email: user.email || "Anonymous" });
      }
    };
    getUser();
  }, []);

  // Use realtime hook for chat and presence
  const liveSession = useLiveSession({
    sessionId: sessionId || "",
    userId: currentUser?.id || "anonymous",
    username: currentUser?.email?.split("@")[0] || "Guest",
    isHost: false,
  });

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from("live_sessions")
          .select("*")
          .eq("id", sessionId)
          .single();

        if (error) throw error;

        if (data.status === "ended") {
          toast({
            title: "Session Ended",
            description: "This live session has already ended.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setSession(data);

        // Join the video channel
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && data.channel_name) {
          await videoCall.joinChannel(data.channel_name, user.id);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        toast({
          title: "Session Not Found",
          description: "Could not find this live session.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Elapsed time counter
  useEffect(() => {
    if (!session?.started_at) return;

    const startTime = new Date(session.started_at).getTime();

    const updateElapsed = () => {
      const now = Date.now();
      setElapsedTime(Math.floor((now - startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [session?.started_at]);

  // Subscribe to session status updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session_status_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const updated = payload.new as LiveSession;
          if (updated.status === "ended") {
            toast({
              title: "Session Ended",
              description: "The host has ended this live session.",
            });
            navigate("/");
          } else {
            setSession(updated);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRaiseHand = () => {
    if (!isHandRaised) {
      liveSession.raiseHand();
    }
    setIsHandRaised(!isHandRaised);
    toast({
      title: isHandRaised ? "Hand Lowered" : "Hand Raised",
      description: isHandRaised
        ? "You've lowered your hand"
        : "The host will see your raised hand",
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: session?.title || "Live Session",
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Session link copied to clipboard",
      });
    }
  };

  const handleLeave = async () => {
    await videoCall.leaveChannel();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleLeave}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold">{session.title}</h1>
            <p className="text-sm text-muted-foreground">{session.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <Badge
            variant={liveSession.isConnected ? "secondary" : "outline"}
            className="gap-1"
          >
            {liveSession.isConnected ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-destructive" />
            )}
          </Badge>

          <Badge variant="destructive" className="animate-pulse gap-1">
            <Circle className="h-2 w-2 fill-current" />
            LIVE
          </Badge>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowViewers(!showViewers)}
          >
            <Users className="h-3 w-3" />
            {liveSession.viewerCount}
          </Button>

          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(elapsedTime)}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex flex-1 flex-col">
          <div className="relative flex-1 bg-black">
            <Tabs defaultValue="video" className="flex h-full flex-col">
              <div className="absolute left-4 top-4 z-10">
                <TabsList className="bg-background/80 backdrop-blur-sm">
                  <TabsTrigger value="video" className="gap-1.5">
                    <Video className="h-3 w-3" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="whiteboard" className="gap-1.5">
                    <PenTool className="h-3 w-3" />
                    Board
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="video" className="m-0 flex-1">
                <div className="flex h-full items-center justify-center">
                  <VideoPlayer
                    username="Host"
                    isVideoEnabled={true}
                    className="h-full w-full max-h-[80vh]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="whiteboard" className="m-0 flex-1">
                <Whiteboard readOnly className="h-full" />
              </TabsContent>
            </Tabs>

            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              {session.allow_questions && (
                <Button
                  variant={isHandRaised ? "default" : "secondary"}
                  size="icon"
                  className="rounded-full"
                  onClick={handleRaiseHand}
                >
                  <Hand className="h-4 w-4" />
                </Button>
              )}

              <Button variant="secondary" size="icon" className="rounded-full">
                <ThumbsUp className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Viewers Panel */}
            {showViewers && (
              <div className="absolute right-4 top-4 z-10 w-64 rounded-lg border bg-background/95 p-4 backdrop-blur-sm">
                <h3 className="mb-3 flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4" />
                  Viewers ({liveSession.viewerCount})
                </h3>
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {liveSession.viewers.map((viewer) => (
                      <div key={viewer.id} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={viewer.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {viewer.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 truncate text-sm">
                          {viewer.username}
                        </span>
                        {viewer.isHost && (
                          <Badge variant="secondary" className="text-xs">
                            Host
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Description */}
          {session.description && (
            <div className="border-t p-4">
              <p className="text-sm text-muted-foreground">
                {session.description}
              </p>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="hidden w-80 border-l lg:flex lg:flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <MessageCircle className="h-4 w-4" />
              Live Chat
            </h2>
            {liveSession.isConnected && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                Connected
              </span>
            )}
          </div>
          <div className="flex-1">
            <LiveChat
              messages={liveSession.messages}
              onSendMessage={(content) => liveSession.sendMessage(content)}
              currentUserId={currentUser?.id || "anonymous"}
              disabled={!session.allow_chat}
              placeholder={
                session.allow_chat ? "Send a message..." : "Chat is disabled"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

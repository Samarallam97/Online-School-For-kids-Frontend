import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { User, Video, VideoOff } from "lucide-react";

interface VideoPlayerProps {
  stream?: MediaStream | null;
  muted?: boolean;
  mirrored?: boolean;
  username?: string;
  isLocal?: boolean;
  isVideoEnabled?: boolean;
  className?: string;
}

export function VideoPlayer({
  stream,
  muted = false,
  mirrored = false,
  username,
  isLocal = false,
  isVideoEnabled = true,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-lg bg-muted",
        className
      )}
    >
      {stream && isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={cn(
            "h-full w-full object-cover",
            mirrored && "scale-x-[-1]"
          )}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted-foreground/20">
            {isVideoEnabled ? (
              <User className="h-8 w-8 text-muted-foreground" />
            ) : (
              <VideoOff className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          {username && (
            <span className="text-sm text-muted-foreground">{username}</span>
          )}
        </div>
      )}

      {/* Username label */}
      {username && stream && (
        <div className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
          {username} {isLocal && "(You)"}
        </div>
      )}

      {/* Local indicator */}
      {isLocal && (
        <div className="absolute right-2 top-2 rounded bg-primary/80 px-2 py-0.5 text-xs font-medium text-primary-foreground">
          You
        </div>
      )}
    </div>
  );
}

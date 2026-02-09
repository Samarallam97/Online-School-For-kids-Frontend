import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  Hand,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
  onOpenChat?: () => void;
  onOpenParticipants?: () => void;
  onRaiseHand?: () => void;
  onOpenSettings?: () => void;
  isHandRaised?: boolean;
  showExtendedControls?: boolean;
  className?: string;
}

export function VideoControls({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeave,
  onOpenChat,
  onOpenParticipants,
  onRaiseHand,
  onOpenSettings,
  isHandRaised = false,
  showExtendedControls = true,
  className,
}: VideoControlsProps) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-full bg-background/95 p-2 shadow-lg backdrop-blur-sm",
          className
        )}
      >
        {/* Audio Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isAudioEnabled ? "secondary" : "destructive"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onToggleAudio}
            >
              {isAudioEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isAudioEnabled ? "Mute" : "Unmute"}
          </TooltipContent>
        </Tooltip>

        {/* Video Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isVideoEnabled ? "secondary" : "destructive"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onToggleVideo}
            >
              {isVideoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          </TooltipContent>
        </Tooltip>

        {/* Screen Share Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onToggleScreenShare}
            >
              {isScreenSharing ? (
                <MonitorOff className="h-5 w-5" />
              ) : (
                <Monitor className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isScreenSharing ? "Stop sharing" : "Share screen"}
          </TooltipContent>
        </Tooltip>

        {showExtendedControls && (
          <>
            {/* Raise Hand */}
            {onRaiseHand && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isHandRaised ? "default" : "secondary"}
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={onRaiseHand}
                  >
                    <Hand className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isHandRaised ? "Lower hand" : "Raise hand"}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Participants */}
            {onOpenParticipants && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={onOpenParticipants}
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Participants</TooltipContent>
              </Tooltip>
            )}

            {/* Chat */}
            {onOpenChat && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={onOpenChat}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chat</TooltipContent>
              </Tooltip>
            )}

            {/* Settings */}
            {onOpenSettings && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={onOpenSettings}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            )}
          </>
        )}

        {/* Leave Call */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onLeave}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Leave call</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

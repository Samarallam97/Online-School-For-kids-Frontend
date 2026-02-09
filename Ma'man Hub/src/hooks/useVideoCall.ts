import { useState, useCallback, useRef, useEffect } from "react";

// Mock Agora credentials for testing - replace with real ones later
const MOCK_APP_ID = "mock_agora_app_id";

export interface VideoCallState {
  isJoined: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  remoteUsers: string[];
  localStream: MediaStream | null;
  error: string | null;
}

export interface UseVideoCallReturn extends VideoCallState {
  joinChannel: (channelName: string, userId?: string) => Promise<void>;
  leaveChannel: () => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement>;
}

export function useVideoCall(): UseVideoCallReturn {
  const [state, setState] = useState<VideoCallState>({
    isJoined: false,
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
    remoteUsers: [],
    localStream: null,
    error: null,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Initialize local media stream
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setState(prev => ({ ...prev, localStream: stream, error: null }));
      return stream;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to access camera/microphone";
      setState(prev => ({ ...prev, error }));
      throw err;
    }
  }, []);

  // Join a channel (mock implementation for testing)
  const joinChannel = useCallback(async (channelName: string, userId?: string) => {
    try {
      console.log(`[Mock Agora] Joining channel: ${channelName} as user: ${userId || 'anonymous'}`);
      console.log(`[Mock Agora] App ID: ${MOCK_APP_ID}`);
      
      // Initialize local stream
      await initLocalStream();
      
      // Simulate joining delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate some remote users joining
      const mockRemoteUsers = ["user_123", "user_456"];
      
      setState(prev => ({
        ...prev,
        isJoined: true,
        remoteUsers: mockRemoteUsers,
        error: null,
      }));
      
      console.log(`[Mock Agora] Successfully joined channel: ${channelName}`);
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to join channel";
      setState(prev => ({ ...prev, error }));
      throw err;
    }
  }, [initLocalStream]);

  // Leave channel
  const leaveChannel = useCallback(async () => {
    console.log("[Mock Agora] Leaving channel...");
    
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    setState({
      isJoined: false,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      remoteUsers: [],
      localStream: null,
      error: null,
    });
    
    console.log("[Mock Agora] Left channel successfully");
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({ ...prev, isAudioEnabled: audioTrack.enabled }));
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState(prev => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
      }
    }
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      
      screenStreamRef.current = stream;
      
      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        setState(prev => ({ ...prev, isScreenSharing: false }));
        screenStreamRef.current = null;
      };
      
      setState(prev => ({ ...prev, isScreenSharing: true }));
      console.log("[Mock Agora] Screen sharing started");
    } catch (err) {
      console.log("[Mock Agora] Screen sharing cancelled or failed");
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setState(prev => ({ ...prev, isScreenSharing: false }));
    console.log("[Mock Agora] Screen sharing stopped");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    ...state,
    joinChannel,
    leaveChannel,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    localVideoRef,
  };
}

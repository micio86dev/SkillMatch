import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { io, Socket } from "socket.io-client";

interface VideoCallProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
  isIncoming?: boolean;
  callId?: string;
}

interface CallState {
  isConnected: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

export function VideoCall({ recipientId, recipientName, onClose, isIncoming = false, callId }: VideoCallProps) {
  const { user } = useAuth();
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isMuted: false,
    isVideoEnabled: true,
    isScreenSharing: false,
  });
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentCallIdRef = useRef<string>(callId || `call_${Date.now()}_${Math.random()}`);

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const initializeSocket = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketRef.current = io(wsUrl, {
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('call-offer', async (data: { offer: RTCSessionDescriptionInit, from: string, callId: string }) => {
      if (data.callId === currentCallIdRef.current && data.from === recipientId) {
        await handleReceiveOffer(data.offer);
      }
    });

    socket.on('call-answer', async (data: { answer: RTCSessionDescriptionInit, from: string, callId: string }) => {
      if (data.callId === currentCallIdRef.current && data.from === recipientId) {
        await handleReceiveAnswer(data.answer);
      }
    });

    socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit, from: string, callId: string }) => {
      if (data.callId === currentCallIdRef.current && data.from === recipientId) {
        await handleReceiveIceCandidate(data.candidate);
      }
    });

    socket.on('call-end', (data: { from: string, callId: string }) => {
      if (data.callId === currentCallIdRef.current && data.from === recipientId) {
        handleEndCall();
      }
    });

    return socket;
  }, [recipientId]);

  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          to: recipientId,
          callId: currentCallIdRef.current,
        });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setCallState(prev => ({ ...prev, isConnected: true }));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        handleEndCall();
      }
    };

    return pc;
  }, [recipientId]);

  const getUserMedia = useCallback(async (video: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 640, height: 480 } : false,
        audio: true,
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  const startCall = useCallback(async () => {
    try {
      const stream = await getUserMedia();
      const pc = initializePeerConnection();
      
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit('call-offer', {
          offer,
          to: recipientId,
          callId: currentCallIdRef.current,
        });
      }
    } catch (error) {
      console.error('Error starting call:', error);
    }
  }, [getUserMedia, initializePeerConnection, recipientId]);

  const handleReceiveOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      const stream = await getUserMedia();
      const pc = initializePeerConnection();
      
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit('call-answer', {
          answer,
          to: recipientId,
          callId: currentCallIdRef.current,
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [getUserMedia, initializePeerConnection, recipientId]);

  const handleReceiveAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  const handleReceiveIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  const handleEndCall = useCallback(() => {
    // Send end call signal
    if (socketRef.current) {
      socketRef.current.emit('call-end', {
        to: recipientId,
        callId: currentCallIdRef.current,
      });
    }

    // Clean up local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clean up remote stream
    remoteStreamRef.current = null;

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Close socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    onClose();
  }, [recipientId, onClose]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = callState.isMuted;
      });
      setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  }, [callState.isMuted]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !callState.isVideoEnabled;
      });
      setCallState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
    }
  }, [callState.isVideoEnabled]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!callState.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        if (peerConnectionRef.current && localStreamRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
          
          // Update local video
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          
          videoTrack.onended = () => {
            setCallState(prev => ({ ...prev, isScreenSharing: false }));
            // Switch back to camera
            if (localStreamRef.current) {
              getUserMedia().then(cameraStream => {
                const cameraVideoTrack = cameraStream.getVideoTracks()[0];
                if (sender) {
                  sender.replaceTrack(cameraVideoTrack);
                }
                if (localVideoRef.current) {
                  localVideoRef.current.srcObject = cameraStream;
                }
              });
            }
          };
        }
        
        setCallState(prev => ({ ...prev, isScreenSharing: true }));
      } else {
        // Switch back to camera
        const stream = await getUserMedia();
        if (peerConnectionRef.current) {
          const videoTrack = stream.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        setCallState(prev => ({ ...prev, isScreenSharing: false }));
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [callState.isScreenSharing, getUserMedia]);

  useEffect(() => {
    initializeSocket();
    
    if (!isIncoming) {
      // Start outgoing call
      startCall();
    }

    return () => {
      handleEndCall();
    };
  }, [initializeSocket, isIncoming, startCall, handleEndCall]);

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 md:p-6">
          {/* Header */}
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {callState.isConnected ? 'Connected' : (isIncoming ? 'Incoming Call' : 'Calling')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300">{recipientName}</p>
          </div>

          {/* Video Container */}
          <div className="relative bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden mb-4 md:mb-6" style={{ aspectRatio: '16/9' }}>
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              aria-label={`Video call with ${recipientName}`}
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-2 right-2 md:top-4 md:right-4 w-24 h-18 md:w-48 md:h-36 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-600">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                aria-label="Your video feed"
              />
            </div>

            {/* Connection Status */}
            {!callState.isConnected && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 dark:bg-slate-800/90">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-700 dark:text-slate-200">
                    {isIncoming ? 'Connecting...' : 'Waiting for answer...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
            <Button
              onClick={toggleMute}
              variant={callState.isMuted ? "destructive" : "secondary"}
              size="lg"
              className="rounded-full w-12 h-12 md:w-14 md:h-14"
              aria-label={callState.isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {callState.isMuted ? <MicOff className="h-5 w-5 md:h-6 md:w-6" /> : <Mic className="h-5 w-5 md:h-6 md:w-6" />}
            </Button>

            <Button
              onClick={toggleVideo}
              variant={callState.isVideoEnabled ? "secondary" : "destructive"}
              size="lg"
              className="rounded-full w-12 h-12 md:w-14 md:h-14"
              aria-label={callState.isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {callState.isVideoEnabled ? <Video className="h-5 w-5 md:h-6 md:w-6" /> : <VideoOff className="h-5 w-5 md:h-6 md:w-6" />}
            </Button>

            <Button
              onClick={toggleScreenShare}
              variant={callState.isScreenSharing ? "default" : "secondary"}
              size="lg"
              className="rounded-full w-12 h-12 md:w-14 md:h-14"
              aria-label={callState.isScreenSharing ? "Stop screen sharing" : "Start screen sharing"}
            >
              {callState.isScreenSharing ? <MonitorOff className="h-5 w-5 md:h-6 md:w-6" /> : <Monitor className="h-5 w-5 md:h-6 md:w-6" />}
            </Button>

            <Button
              onClick={handleEndCall}
              variant="destructive"
              size="lg"
              className="rounded-full w-12 h-12 md:w-14 md:h-14"
              aria-label="End call"
            >
              <PhoneOff className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Copy, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';

interface VideoCallProps {}

export function VideoCall({}: VideoCallProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const { toast } = useToast();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [remoteUserConnected, setRemoteUserConnected] = useState(false);

  const callUrl = `${window.location.origin}/call/${roomId}`;

  useEffect(() => {
    if (!roomId) return;

    initializeCall();
    return () => {
      cleanup();
    };
  }, [roomId]);

  const initializeCall = async () => {
    try {
      setIsConnecting(true);
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Setup Socket.IO connection
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}`;
      
      socketRef.current = io(wsUrl, {
        path: '/socket.io'
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to signaling server');
        socketRef.current?.emit('join-room', roomId, 'user-' + Date.now());
        setIsCallActive(true);
        setIsConnecting(false);
      });

      // Setup WebRTC peer connection
      setupPeerConnection();

      // Socket event handlers
      socketRef.current.on('user-joined', handleUserJoined);
      socketRef.current.on('existing-users', handleExistingUsers);
      socketRef.current.on('offer', handleOffer);
      socketRef.current.on('answer', handleAnswer);
      socketRef.current.on('ice-candidate', handleIceCandidate);
      socketRef.current.on('user-left', handleUserLeft);

    } catch (error) {
      console.error('Error initializing call:', error);
      toast({
        title: "Camera/Microphone Error",
        description: "Could not access camera or microphone. Please check permissions.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const setupPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setRemoteUserConnected(true);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          to: 'broadcast',
          candidate: event.candidate,
          roomId
        });
      }
    };

    pcRef.current = pc;
  };

  const handleUserJoined = async (data: { userId: string, socketId: string }) => {
    console.log('User joined:', data);
    if (pcRef.current) {
      try {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        
        socketRef.current?.emit('offer', {
          to: data.socketId,
          offer: offer,
          roomId
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  };

  const handleExistingUsers = async (users: string[]) => {
    console.log('Existing users:', users);
    // If there are existing users, we'll wait for their offer
  };

  const handleOffer = async (data: { from: string, offer: RTCSessionDescriptionInit }) => {
    console.log('Received offer from:', data.from);
    if (pcRef.current) {
      try {
        await pcRef.current.setRemoteDescription(data.offer);
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        
        socketRef.current?.emit('answer', {
          to: data.from,
          answer: answer,
          roomId
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    }
  };

  const handleAnswer = async (data: { from: string, answer: RTCSessionDescriptionInit }) => {
    console.log('Received answer from:', data.from);
    if (pcRef.current) {
      try {
        await pcRef.current.setRemoteDescription(data.answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  };

  const handleIceCandidate = async (data: { from: string, candidate: RTCIceCandidateInit }) => {
    console.log('Received ICE candidate from:', data.from);
    if (pcRef.current) {
      try {
        await pcRef.current.addIceCandidate(data.candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const handleUserLeft = (socketId: string) => {
    console.log('User left:', socketId);
    setRemoteUserConnected(false);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    cleanup();
    window.history.back();
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (pcRef.current) {
      pcRef.current.close();
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    setIsCallActive(false);
    setIsConnecting(false);
    setRemoteUserConnected(false);
  };

  const copyCallUrl = async () => {
    try {
      await navigator.clipboard.writeText(callUrl);
      toast({
        title: "Link Copied!",
        description: "Call link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const shareCall = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my video call on VibeSync',
          text: 'Join my video call',
          url: callUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      copyCallUrl();
    }
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Connecting to call...</h2>
          <p className="text-gray-300">Please allow camera and microphone access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-lg font-semibold">Video Call</h1>
          <span className="text-gray-300 text-sm">Room: {roomId}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyCallUrl}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={shareCall}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${!remoteUserConnected ? 'hidden' : ''}`}
        />
        
        {/* Waiting for others */}
        {!remoteUserConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <div className="mb-4">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Waiting for others to join</h2>
              <p className="text-gray-300 mb-6">Share the link to invite others to this call</p>
              
              <div className="bg-gray-700 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-300 mb-2">Call Link:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={callUrl}
                    readOnly
                    className="flex-1 bg-gray-600 text-white text-sm p-2 rounded border-none"
                  />
                  <Button size="sm" onClick={copyCallUrl} className="bg-blue-600 hover:bg-blue-700">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Local Video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex justify-center items-center space-x-4">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12 p-0"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12 p-0"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
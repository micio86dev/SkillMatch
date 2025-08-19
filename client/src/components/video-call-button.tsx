import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { VideoCall } from '@/components/video-call';
import { IncomingCallModal } from '@/components/incoming-call-modal';
import { useAuth } from '@/hooks/useAuth';

interface VideoCallButtonProps {
  recipientId?: string;
  recipientName?: string;
  recipientImageUrl?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function VideoCallButton({ 
  recipientId,
  recipientName,
  recipientImageUrl,
  variant = "default", 
  size = "default", 
  className = "" 
}: VideoCallButtonProps) {
  const { user } = useAuth();
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    callerName: string;
    callerImageUrl?: string;
    callId: string;
  } | null>(null);

  const handleStartCall = () => {
    if (!recipientId || !recipientName) {
      console.error('Recipient information missing');
      return;
    }
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  const handleAcceptIncomingCall = () => {
    if (incomingCall) {
      setIsCallActive(true);
      setIncomingCall(null);
    }
  };

  const handleDeclineIncomingCall = () => {
    setIncomingCall(null);
  };

  return (
    <>
      <Button
        onClick={handleStartCall}
        disabled={!recipientId || !recipientName}
        variant={variant}
        size={size}
        className={`${className} font-medium shadow-sm transition-all`}
        aria-label={size === "sm" || size === "icon" ? "Start video call" : undefined}
      >
        <Video className={`h-4 w-4 ${size === "sm" || size === "icon" ? "" : "mr-2"}`} />
        {size !== "sm" && size !== "icon" && <span>Video Call</span>}
        {size === "sm" && <span className="sr-only">Video Call</span>}
        {size === "icon" && <span className="sr-only">Video Call</span>}
      </Button>

      {/* Active Video Call */}
      {isCallActive && recipientId && recipientName && (
        <VideoCall
          recipientId={recipientId}
          recipientName={recipientName}
          onClose={handleEndCall}
        />
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          callerImageUrl={incomingCall.callerImageUrl}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />
      )}
    </>
  );
}
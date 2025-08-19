import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface VideoCallButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function VideoCallButton({ 
  variant = "default", 
  size = "default", 
  className = "" 
}: VideoCallButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const startCall = async () => {
    try {
      setIsCreating(true);
      
      const response = await fetch('/api/calls/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create call');
      }

      const { roomId, callUrl } = await response.json();
      
      toast({
        title: "Call Created!",
        description: "Redirecting to your video call...",
      });

      // Navigate to the call page
      setLocation(`/call/${roomId}`);
      
    } catch (error) {
      console.error('Error creating call:', error);
      toast({
        title: "Error",
        description: "Failed to create video call. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={startCall}
      disabled={isCreating}
      variant={variant}
      size={size}
      className={`${className} font-medium shadow-sm transition-all`}
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating Call...
        </>
      ) : (
        <>
          <Video className="h-4 w-4 mr-2" />
          Start Call
        </>
      )}
    </Button>
  );
}
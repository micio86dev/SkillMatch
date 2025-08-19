import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, PhoneOff, User } from "lucide-react";

interface IncomingCallModalProps {
  callerName: string;
  callerImageUrl?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCallModal({ callerName, callerImageUrl, onAccept, onDecline }: IncomingCallModalProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6 md:p-8 text-center">
          {/* Caller Avatar */}
          <div className="mb-4 md:mb-6">
            {callerImageUrl ? (
              <img 
                src={callerImageUrl} 
                alt={`${callerName}'s profile picture`}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto object-cover"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto">
                <User className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
            )}
          </div>

          {/* Caller Info */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Incoming Call</h2>
            <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg">{callerName}</p>
          </div>

          {/* Ringing Animation */}
          <div className="mb-6 md:mb-8">
            <div className={`mx-auto w-4 h-4 bg-green-500 rounded-full ${isAnimating ? 'animate-pulse' : ''}`} aria-label="Incoming call indicator"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center items-center gap-8 mb-4">
            <Button
              onClick={onDecline}
              variant="destructive"
              size="lg"
              className="rounded-full w-14 h-14 md:w-16 md:h-16"
              aria-label="Decline call"
            >
              <PhoneOff className="h-6 w-6 md:h-8 md:w-8" />
            </Button>

            <Button
              onClick={onAccept}
              className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              size="lg"
              aria-label="Accept call"
            >
              <Phone className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Accept to start video call
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
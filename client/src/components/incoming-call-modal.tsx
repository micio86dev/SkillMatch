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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-slate-900 border-slate-700">
        <CardContent className="p-8 text-center">
          {/* Caller Avatar */}
          <div className="mb-6">
            {callerImageUrl ? (
              <img 
                src={callerImageUrl} 
                alt={callerName}
                className="w-24 h-24 rounded-full mx-auto object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>

          {/* Caller Info */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Incoming Call</h2>
            <p className="text-slate-300 text-lg">{callerName}</p>
          </div>

          {/* Ringing Animation */}
          <div className="mb-8">
            <div className={`mx-auto w-4 h-4 bg-green-500 rounded-full ${isAnimating ? 'animate-pulse' : ''}`}></div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6">
            <Button
              onClick={onDecline}
              variant="destructive"
              size="lg"
              className="rounded-full w-16 h-16"
            >
              <PhoneOff className="h-8 w-8" />
            </Button>

            <Button
              onClick={onAccept}
              className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Phone className="h-8 w-8" />
            </Button>
          </div>

          <p className="text-slate-400 text-sm mt-4">
            Accept to start video call
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
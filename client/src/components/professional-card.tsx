import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, User, MapPin, Clock, MessageSquare, CheckCircle, UserPlus } from "lucide-react";
import { ProfessionalProfile, User as UserType } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface ProfessionalCardProps {
  professional: ProfessionalProfile & { user: UserType };
  onConnect?: () => void;
  onMessage?: () => void;
}

export function ProfessionalCard({ professional, onConnect, onMessage }: ProfessionalCardProps) {
  const { user } = professional;
  const { isAuthenticated } = useAuth();
  
  // Check connection status with this professional
  const { data: connectionStatus } = useQuery({
    queryKey: [`/api/connections/status/${user.id}`],
    enabled: isAuthenticated && !!user.id,
  });
  
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-400';
      case 'partially_available':
        return 'bg-yellow-400';
      case 'unavailable':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'partially_available':
        return 'Partially Available';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-slate-700 dark:text-slate-300">{professional.title}</p>
            <div className="flex items-center space-x-1 mt-1">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300">4.9 (127)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {professional.skills?.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {(professional.skills?.length || 0) > 3 && (
              <Badge variant="outline" className="text-xs">
                +{(professional.skills?.length || 0) - 3} more
              </Badge>
            )}
          </div>

          {/* Bio */}
          {professional.bio && (
            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
              {professional.bio}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(professional.availability || 'available')}`} />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {getAvailabilityText(professional.availability || 'available')}
              </span>
            </div>
            {professional.hourlyRate && (
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                ${professional.hourlyRate}/hr
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2 pt-2">
            {connectionStatus?.connected ? (
              connectionStatus.status === 'accepted' ? (
                <Button 
                  size="sm" 
                  className="flex-1"
                  variant="outline"
                  disabled
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Connected
                </Button>
              ) : connectionStatus.status === 'pending' ? (
                <Button 
                  size="sm" 
                  className="flex-1"
                  variant="outline"
                  disabled
                >
                  <Clock className="h-4 w-4 mr-1" />
                  {connectionStatus.isRequester ? 'Request Sent' : 'Request Received'}
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={onConnect}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              )
            ) : (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={onConnect}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Connect
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={onMessage}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

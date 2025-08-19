import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, X, User, DollarSign, Clock, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ApplicationManagerProps {
  projectId: string;
  projectTitle: string;
}

export function ApplicationManager({ projectId, projectTitle }: ApplicationManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: [`/api/projects/${projectId}/applications`],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/applications`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json();
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      return apiRequest(`/api/applications/${applicationId}/accept`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Application Accepted",
        description: "The professional has been notified of your decision.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/applications`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/accepted-count`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept application",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      return apiRequest(`/api/applications/${applicationId}/reject`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Application Rejected",
        description: "The professional has been notified of your decision.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/applications`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject application",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applications for: {projectTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applications for: {projectTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-slate-600 dark:text-slate-400">
              When professionals apply to your project, they'll appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications for: {projectTitle}</CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {applications.map((application: any, index: number) => (
            <div key={application.id}>
              {index > 0 && <Separator className="my-6" />}
              
              <div className="space-y-4">
                {/* Header with user info and status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={application.user.profileImageUrl} />
                      <AvatarFallback>
                        {application.user.firstName?.[0]}{application.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">
                        {application.user.firstName} {application.user.lastName}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Mail className="h-4 w-4" />
                        {application.user.email}
                      </div>
                    </div>
                  </div>
                  
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>

                {/* Application details */}
                <div className="space-y-3">
                  {application.proposedRate && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">Proposed Rate:</span>
                      <span className="font-semibold">${application.proposedRate}/hour</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">Applied:</span>
                    <span>{formatDistanceToNow(new Date(application.appliedAt))} ago</span>
                  </div>

                  {application.coverLetter && (
                    <div>
                      <h5 className="font-medium mb-2">Cover Letter:</h5>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-sm">
                        {application.coverLetter}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {application.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptMutation.mutate(application.id)}
                      disabled={acceptMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectMutation.mutate(application.id)}
                      disabled={rejectMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
                
                {application.status !== 'pending' && application.respondedAt && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {application.status === 'accepted' ? 'Accepted' : 'Rejected'} {formatDistanceToNow(new Date(application.respondedAt))} ago
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
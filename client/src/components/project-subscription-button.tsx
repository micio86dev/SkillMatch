import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProjectSubscriptionButtonProps {
  projectId: string;
  projectStatus: string;
  className?: string;
}

export function ProjectSubscriptionButton({ 
  projectId, 
  projectStatus, 
  className = "" 
}: ProjectSubscriptionButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only show to professional users for open projects
  if (user?.userType !== 'professional' || projectStatus !== 'open') {
    return null;
  }

  const { data: subscriptionStatus, isLoading } = useQuery<{ isSubscribed: boolean }>({
    queryKey: [`/api/projects/${projectId}/subscription-status`],
    enabled: !!projectId && !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/projects/${projectId}/subscribe`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Subscription Added",
        description: "You will receive notifications about project updates.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/subscription-status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscriptions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to subscribe to project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/projects/${projectId}/subscribe`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Unsubscribed",
        description: "You will no longer receive notifications about this project.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/subscription-status`] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscriptions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Unsubscribe Failed",
        description: error.message || "Failed to unsubscribe from project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscriptionToggle = () => {
    if (subscriptionStatus?.isSubscribed) {
      unsubscribeMutation.mutate();
    } else {
      subscribeMutation.mutate();
    }
  };

  const isProcessing = subscribeMutation.isPending || unsubscribeMutation.isPending;

  if (isLoading) {
    return (
      <Button disabled size="sm" variant="outline" className={className}>
        <Bell className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSubscriptionToggle}
      disabled={isProcessing}
      size="sm"
      variant={subscriptionStatus?.isSubscribed ? "default" : "outline"}
      className={className}
    >
      {subscriptionStatus?.isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          {isProcessing ? "Unsubscribing..." : "Unsubscribe"}
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          {isProcessing ? "Subscribing..." : "Subscribe"}
        </>
      )}
    </Button>
  );
}

// Compact version for use in project cards
export function CompactSubscriptionButton({ projectId, projectStatus }: {
  projectId: string;
  projectStatus: string;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only show to professional users for open projects
  if (user?.userType !== 'professional' || projectStatus !== 'open') {
    return null;
  }

  const { data: subscriptionStatus } = useQuery<{ isSubscribed: boolean }>({
    queryKey: [`/api/projects/${projectId}/subscription-status`],
    enabled: !!projectId && !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/projects/${projectId}/subscribe`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "Subscribed",
        description: "You'll receive updates about this project.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/subscription-status`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe.",
        variant: "destructive",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/projects/${projectId}/subscribe`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Unsubscribed",
        description: "You'll no longer receive updates.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/subscription-status`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unsubscribe.",
        variant: "destructive",
      });
    },
  });

  const handleClick = () => {
    if (subscriptionStatus?.isSubscribed) {
      unsubscribeMutation.mutate();
    } else {
      subscribeMutation.mutate();
    }
  };

  const isProcessing = subscribeMutation.isPending || unsubscribeMutation.isPending;

  return (
    <Button
      onClick={handleClick}
      disabled={isProcessing}
      size="sm"
      variant="ghost"
      className="h-8 w-8 p-0"
    >
      {subscriptionStatus?.isSubscribed ? (
        <BellOff className="h-4 w-4 text-primary" />
      ) : (
        <Bell className="h-4 w-4 text-slate-500 hover:text-primary" />
      )}
    </Button>
  );
}
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Send, CheckCircle, Clock, XCircle } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";

const applicationSchema = z.object({
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
  proposedRate: z.string().optional(),
});

interface ProjectApplyButtonProps {
  projectId: string;
  projectTitle: string;
  isProjectFull?: boolean;
}

interface UserApplication {
  id: string;
  projectId: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  project: {
    title: string;
  };
}

export function ProjectApplyButton({ projectId, projectTitle, isProjectFull }: ProjectApplyButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const { t } = useTranslation();

  // Check if user has already applied
  const { data: userApplications = [] } = useQuery<any[]>({
    queryKey: ["/api/user/applications"],
    enabled: isAuthenticated,
  });

  const existingApplication = userApplications.find((app: any) => app.projectId === projectId);

  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
      proposedRate: "",
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Submitting application data:', data);
      // Ensure proposedRate is sent as string or undefined
      const cleanData = {
        ...data,
        proposedRate: data.proposedRate ? String(data.proposedRate) : undefined
      };
      console.log('Cleaned application data:', cleanData);
      try {
        const result = await apiRequest("POST", `/api/projects/${projectId}/apply`, cleanData);
        console.log('Application submitted successfully:', result);
        return result;
      } catch (error) {
        console.error('Application submission failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: t('projects.applicationSubmitted'),
        description: t('projects.applicationSubmittedDesc'),
        style: {
          backgroundColor: '#10B981',
          border: '1px solid #059669',
          color: 'white'
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/applications"] });
      setShowDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error('Application mutation error:', error);
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Show different UI for different user states
  if (!isAuthenticated) {
    return (
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={() => {
          window.location.href = "/login";
        }}
      >
        <Send className="h-4 w-4" />
        {t('projects.loginToApply')}
      </Button>
    );
  }

  // Allow all authenticated users to apply to projects

  if (isProjectFull) {
    return (
      <Button disabled variant="outline" className="flex items-center gap-2">
        <XCircle className="h-4 w-4" />
        {t('projects.projectFull')}
      </Button>
    );
  }

  if (existingApplication) {
    const getStatusIcon = () => {
      switch (existingApplication.status) {
        case 'accepted':
          return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'rejected':
          return <XCircle className="h-4 w-4 text-red-600" />;
        default:
          return <Clock className="h-4 w-4 text-yellow-600" />;
      }
    };

    const getStatusText = () => {
      switch (existingApplication.status) {
        case 'accepted':
          return t('projects.applicationAccepted');
        case 'rejected':
          return t('projects.applicationRejected');
        default:
          return t('projects.applicationPending');
      }
    };

    return (
      <Button disabled variant="outline" className="flex items-center gap-2">
        {getStatusIcon()}
        {getStatusText()}
      </Button>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Apply for Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply to: {projectTitle}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => applyMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell the company why you're the perfect fit for this project..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="proposedRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposed Rate ($/hour) - Optional</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="Your hourly rate"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={applyMutation.isPending}>
                {applyMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
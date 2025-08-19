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

const applicationSchema = z.object({
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
  proposedRate: z.number().min(1, "Proposed rate must be greater than 0").optional(),
});

interface ProjectApplyButtonProps {
  projectId: string;
  projectTitle: string;
  isProjectFull?: boolean;
}

export function ProjectApplyButton({ projectId, projectTitle, isProjectFull }: ProjectApplyButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);

  // Check if user has already applied
  const { data: userApplications = [] } = useQuery({
    queryKey: ["/api/user/applications"],
    enabled: isAuthenticated && user?.userType === 'professional',
  });

  const existingApplication = userApplications.find((app: any) => app.projectId === projectId);

  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
      proposedRate: undefined,
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/projects/${projectId}/apply`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been sent to the company.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/applications"] });
      setShowDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || user?.userType !== 'professional') {
    return null;
  }

  if (isProjectFull) {
    return (
      <Button disabled variant="outline" className="flex items-center gap-2">
        <XCircle className="h-4 w-4" />
        Project Full
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
          return 'Application Accepted';
        case 'rejected':
          return 'Application Rejected';
        default:
          return 'Application Pending';
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
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
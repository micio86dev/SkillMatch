import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/like-button";
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Briefcase,
  Star,
  Calendar,
  User,
  Share,
  Bell,
  BellOff
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Project, User as UserType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ProjectApplyButton } from "@/components/project-apply-button";
import { ApplicationManager } from "@/components/application-manager";
import { useTranslation } from "react-i18next";
import { PageShare, usePageShare } from "@/components/page-share";

interface ProjectWithCompany extends Project {
  company: UserType;
  teamMembers?: UserType[];
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: project, isLoading, error } = useQuery<ProjectWithCompany>({
    queryKey: [`/api/projects/${id}`],
  });
  
  const pageShareData = usePageShare('project', {
    data: project,
    title: project?.title ? `${project.title} - Project Details` : 'Project Details',
    description: project?.description || 'Discover this project opportunity on DevConnect',
    hashtags: ['Project', ...(project?.requiredSkills?.slice(0, 3) || []), 'DevConnect', 'TechJobs']
  });

  const { data: subscriptionStatus } = useQuery<{ isSubscribed: boolean }>({
    queryKey: [`/api/projects/${id}/subscription-status`],
    enabled: !!isAuthenticated && !!id,
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const subscriptionMutation = useMutation({
    mutationFn: async ({ projectId, action }: { projectId: string; action: 'subscribe' | 'unsubscribe' }) => {
      if (action === 'subscribe') {
        await apiRequest('POST', `/api/projects/${projectId}/subscribe`, {});
      } else {
        await apiRequest('DELETE', `/api/projects/${projectId}/subscribe`, {});
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/subscription-status`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/subscriptions'] });
      toast({
        title: "Success",
        description: action === 'subscribe' 
          ? "Successfully subscribed to project updates!" 
          : "Successfully unsubscribed from project updates!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/auth/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubscription = () => {
    if (!isAuthenticated || !project?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to project updates.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/auth/login";
      }, 1000);
      return;
    }

    const action = subscriptionStatus?.isSubscribed ? 'unsubscribe' : 'subscribe';
    subscriptionMutation.mutate({ projectId: project.id, action });
  };

  const handleShareProject = async () => {
    if (!project) return;
    const projectUrl = `${window.location.origin}/projects/${project.id}`;
    try {
      await navigator.clipboard.writeText(projectUrl);
      toast({
        title: "Success",
        description: "Project link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error || !project || !project.company) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Project Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/projects">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/projects">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {project.title}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <Badge className={getStatusColor(project.status || 'open')}>
                  {(project.status || 'open').replace('_', ' ')}
                </Badge>
                <span className="text-slate-500 dark:text-slate-400">
                  Posted {formatDistanceToNow(new Date(project.createdAt || new Date()), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareProject}
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <LikeButton
                itemType="projects"
                itemId={project.id}
                initialLikeCount={project.likesCount || 0}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            {/* Required Skills */}
            {project.requiredSkills && project.requiredSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Members */}
            {project.teamMembers && project.teamMembers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Team Members ({project.teamMembers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        {member.profileImageUrl ? (
                          <img 
                            src={member.profileImageUrl} 
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {member.firstName || ''} {member.lastName || ''}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {member.email || ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Company
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.company?.id ? (
                  <Link href={`/companies/${project.company.id}`}>
                    <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      {project.company.profileImageUrl ? (
                        <img 
                          src={project.company.profileImageUrl} 
                          alt={project.company.firstName || 'Company'}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          {project.company.firstName || 'Company'}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          View company profile
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center space-x-3 p-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {project.company?.firstName || 'Company'}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Company information unavailable
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {project.location}
                      {project.isRemote && " (Remote available)"}
                    </span>
                  </div>
                )}

                {project.contractType && (
                  <div className="flex items-center text-sm">
                    <Briefcase className="h-4 w-4 mr-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {project.contractType === 'hourly' ? 'Hourly' : 'Project-based'}
                    </span>
                  </div>
                )}

                {(project.budgetMin || project.budgetMax) && (
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {project.budgetMin && project.budgetMax 
                        ? `$${project.budgetMin.toLocaleString()} - $${project.budgetMax.toLocaleString()}`
                        : project.budgetMin 
                        ? `$${project.budgetMin.toLocaleString()}+`
                        : project.budgetMax 
                        ? `Up to $${project.budgetMax.toLocaleString()}`
                        : 'Budget to be discussed'
                      }
                    </span>
                  </div>
                )}

                {project.estimatedHours && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      ~{project.estimatedHours} hours estimated
                    </span>
                  </div>
                )}

                {project.teamSize && (
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      Team size: {project.teamSize}
                    </span>
                  </div>
                )}

                {project.seniorityLevel && (
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 mr-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {project.seniorityLevel} level required
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Apply for Project Section */}
        {project.status === 'open' && (
          <div className="mt-8">
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  {t('projects.readyToWork')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {t('projects.submitApplication')}
                </p>
                <ProjectApplyButton 
                  projectId={project.id}
                  projectTitle={project.title}
                  isProjectFull={false}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Application Manager for Project Owners */}
        {isAuthenticated && user && project.companyUserId === user.id && (
          <div className="mt-8">
            <ApplicationManager 
              projectId={project.id}
              projectTitle={project.title}
            />
          </div>
        )}
      </div>
      
      {/* Page Share */}
      <PageShare {...pageShareData} variant="floating" />
    </Layout>
  );
}
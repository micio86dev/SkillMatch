import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Plus, Building, Eye, Users, Clock, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ApplicationManager } from "@/components/application-manager";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { PageShare, usePageShare } from "@/components/page-share";

export default function MyProjects() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const pageShareData = usePageShare('custom', {
    title: 'My Projects - Company Dashboard',
    description: 'Manage your company projects, view applications, and track project progress on DevConnect.',
    hashtags: ['MyProjects', 'CompanyDashboard', 'ProjectManagement', 'DevConnect']
  });

  // Redirect if not authenticated or not a company
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.userType !== 'company')) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in as a company to view this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/");
      }, 1000);
    }
  }, [isAuthenticated, isLoading, user?.userType, toast, setLocation]);

  const { data: projects = [], isLoading: projectsLoading, error } = useQuery({
    queryKey: ["/api/projects", { companyUserId: user?.id }],
    queryFn: async () => {
      const response = await fetch(`/api/projects?companyUserId=${user?.id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
    enabled: isAuthenticated && user?.userType === 'company' && !!user?.id,
  });

  // Handle unauthorized error
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 500);
    }
  }, [error, toast]);

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

  const openProjects = projects.filter((p: any) => p.status === 'open');
  const assignedProjects = projects.filter((p: any) => p.status === 'assigned');
  const completedProjects = projects.filter((p: any) => p.status === 'completed');

  if (isLoading || projectsLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || user?.userType !== 'company') {
    return null; // Will be redirected via useEffect
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                My Projects
              </h1>
              <p className="text-slate-700 dark:text-slate-300">
                Manage your posted projects and review applications
              </p>
            </div>
            <Link href="/projects">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post New Project
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({openProjects.length})</TabsTrigger>
            <TabsTrigger value="assigned">Assigned ({assignedProjects.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Start by posting your first project to find talented professionals.
                  </p>
                  <Link href="/projects">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Post Your First Project
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {projects.map((project: any) => (
                  <ProjectManagementCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="open">
            <div className="grid gap-6">
              {openProjects.map((project: any) => (
                <ProjectManagementCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assigned">
            <div className="grid gap-6">
              {assignedProjects.map((project: any) => (
                <ProjectManagementCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid gap-6">
              {completedProjects.map((project: any) => (
                <ProjectManagementCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Page Share */}
      <PageShare {...pageShareData} variant="floating" />
    </Layout>
  );
}

function ProjectManagementCard({ project }: { project: any }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Posted {formatDistanceToNow(new Date(project.createdAt))} ago
              </div>
              {project.teamSize && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {project.teamSize} {project.teamSize === 1 ? 'professional' : 'professionals'}
                </div>
              )}
              {(project.budgetMin || project.budgetMax) && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {project.budgetMin && project.budgetMax
                    ? `$${project.budgetMin} - $${project.budgetMax}`
                    : project.budgetMin
                    ? `$${project.budgetMin}+`
                    : `Up to $${project.budgetMax}`
                  }
                </div>
              )}
            </div>
          </div>
          <Badge className={`${getStatusColor(project.status)} border-0`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
            {project.description}
          </p>
        )}
        
        {project.requiredSkills && project.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.requiredSkills.slice(0, 5).map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {project.requiredSkills.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{project.requiredSkills.length - 5} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Link href={`/projects/${project.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Application Management */}
        <div className="mt-6 pt-4 border-t">
          <ApplicationManager 
            projectId={project.id} 
            projectTitle={project.title}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: string) {
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
}
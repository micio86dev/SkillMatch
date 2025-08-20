import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project-card";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Inbox } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Project, User } from "@shared/schema";

export default function Subscriptions() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated && user === null) {
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
  }, [isAuthenticated, user, toast]);

  const { data: subscriptions = [], isLoading } = useQuery<(Project & { company: User })[]>({
    queryKey: ["/api/user/subscriptions"],
    enabled: isAuthenticated && user?.userType === 'professional',
  });

  // Only show to professional users
  if (user?.userType !== 'professional') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h2 className="text-xl font-semibold mb-2">{t('subscriptions.title')}</h2>
              <p className="text-slate-600 dark:text-slate-400">
                {t('subscriptions.onlyForProfessionals')}
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <Bell className="h-8 w-8 mr-3" />
            {t('subscriptions.title')}
          </h1>
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Bell className="h-8 w-8 mr-3" />
          My Subscriptions
        </h1>
        
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Stay updated with projects you're following. You'll receive notifications when these projects are updated.
        </p>

        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Inbox className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h2 className="text-xl font-semibold mb-2">No Subscriptions Yet</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                You haven't subscribed to any projects yet. Browse open projects and click the bell icon to follow them.
              </p>
              <button 
                onClick={() => window.location.href = '/projects'}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Browse Projects
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {subscriptions.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
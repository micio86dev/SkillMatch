import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import "@/lib/i18n";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Projects from "@/pages/projects";
import Professionals from "@/pages/professionals";
import Messages from "@/pages/messages";
import { VideoCall } from "@/pages/video-call";
import PublicProfile from "@/pages/public-profile";
import ProfessionalProfile from "@/pages/professional-profile";
import Companies from "@/pages/companies";
import CompanyDetail from "@/pages/company-detail";
import ProjectDetail from "@/pages/project-detail";
import CareerInsights from "@/pages/career-insights";
import Subscriptions from "@/pages/subscriptions";
import Preventives from "@/pages/preventives";
import MyProjects from "@/pages/my-projects";
import Login from "@/pages/login";
import Register from "@/pages/register";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Initialize real-time notifications
  useRealtimeNotifications();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          {/* Allow access to public pages when not logged in */}
          <Route path="/professionals" component={Professionals} />
          <Route path="/projects" component={Projects} />
          <Route path="/companies" component={Companies} />
          <Route path="/companies/:id" component={CompanyDetail} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/professionals/:id" component={ProfessionalProfile} />
          <Route path="/profile/:userId" component={PublicProfile} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/projects" component={Projects} />
          <Route path="/professionals" component={Professionals} />
          <Route path="/companies" component={Companies} />
          <Route path="/companies/:id" component={CompanyDetail} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/career-insights" component={CareerInsights} />
          <Route path="/subscriptions" component={Subscriptions} />
          <Route path="/preventives" component={Preventives} />
          <Route path="/my-projects" component={MyProjects} />
          <Route path="/messages" component={Messages} />
          <Route path="/call/:roomId" component={VideoCall} />
          <Route path="/professionals/:id" component={ProfessionalProfile} />
        </>
      )}
      {/* These routes are handled above based on auth state */}
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="devconnect-theme">
        <TooltipProvider>
          <LanguageProvider>
            <Toaster />
            <Router />
          </LanguageProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

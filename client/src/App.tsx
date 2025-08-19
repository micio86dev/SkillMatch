import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Initialize real-time notifications
  useRealtimeNotifications();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/signup" component={Signup} />
          <Route path="/" component={Login} />
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
          <Route path="/messages" component={Messages} />
          <Route path="/call/:roomId" component={VideoCall} />
          <Route path="/professionals/:id" component={ProfessionalProfile} />
        </>
      )}
      {/* Public routes available to everyone */}
      <Route path="/professionals" component={Professionals} />
      <Route path="/projects" component={Projects} />
      <Route path="/profile/:userId" component={PublicProfile} />
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
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

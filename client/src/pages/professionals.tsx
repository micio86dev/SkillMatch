import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { ProfessionalCard } from "@/components/professional-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { PageShare, usePageShare } from "@/components/page-share";

export default function Professionals() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    skills: "",
    availability: "any",
    seniorityLevel: "any",
    minRate: "",
    maxRate: "",
  });
  
  const pageShareData = usePageShare('custom', {
    title: 'Browse IT Professionals',
    description: 'Discover and connect with talented IT professionals in our community. Find experts in software development, data science, cybersecurity, and more.',
    hashtags: ['Developers', 'ITTalent', 'TechExperts', 'Hiring']
  });

  const queryFilters = {
    ...filters,
    availability: filters.availability === "any" ? "" : filters.availability,
    seniorityLevel: filters.seniorityLevel === "any" ? "" : filters.seniorityLevel
  };
  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ["/api/professionals/search", queryFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (queryFilters.skills) params.append('skills', queryFilters.skills);
      if (queryFilters.availability) params.append('availability', queryFilters.availability);
      if (queryFilters.seniorityLevel) params.append('seniorityLevel', queryFilters.seniorityLevel);
      if (queryFilters.minRate) params.append('minRate', queryFilters.minRate);
      if (queryFilters.maxRate) params.append('maxRate', queryFilters.maxRate);
      const url = `/api/professionals/search${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch professionals');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  const handleConnect = async (professional: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect with professionals.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    try {
      const professionalUserId = professional.user?.id || professional.userId;
      if (!professionalUserId) {
        toast({
          title: "Error",
          description: "Unable to send connection request. Professional information is incomplete.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ addresseeId: professionalUserId }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 400 && error.status) {
          toast({
            title: "Connection Status",
            description: `Connection ${error.status}. ${error.message}`,
            variant: error.status === 'accepted' ? 'default' : 'destructive',
          });
        } else {
          throw new Error(error.message || 'Failed to send connection request');
        }
        return;
      }

      toast({
        title: "Connection Request Sent",
        description: `Your connection request has been sent to ${professional.user?.firstName || 'the professional'}!`,
      });
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      console.error('Connection request error:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMessage = (professional: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start messaging.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    try {
      // Navigate to messages page with the professional's user ID as conversation parameter
      const professionalUserId = professional.user?.id || professional.userId;
      if (!professionalUserId) {
        toast({
          title: "Error",
          description: "Unable to start conversation. Professional information is incomplete.",
          variant: "destructive",
        });
        return;
      }
      
      // Store the conversation info in sessionStorage for the messages page to pick up
      sessionStorage.setItem('startConversation', JSON.stringify({
        userId: professionalUserId,
        name: `${professional.user?.firstName || ''} ${professional.user?.lastName || ''}`.trim(),
        title: professional.title || 'Professional',
        profileImageUrl: professional.user?.profileImageUrl
      }));
      
      // Navigate to messages page
      setLocation('/messages');
      
      toast({
        title: "Starting Conversation",
        description: `Opening chat with ${professional.user?.firstName || 'Professional'}...`,
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      skills: "",
      availability: "any",
      seniorityLevel: "any",
      minRate: "",
      maxRate: "",
    });
  };

  const hasActiveFilters = filters.skills !== "" || filters.availability !== "any" || filters.seniorityLevel !== "any" || filters.minRate !== "" || filters.maxRate !== "";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            IT Professionals
          </h1>
          <p className="text-slate-700 dark:text-slate-300">
            Discover and connect with talented developers, designers, and tech experts
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Filter Professionals</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Skills
                  </label>
                  <Input
                    placeholder="e.g. React, Node.js"
                    value={filters.skills}
                    onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Availability
                  </label>
                  <Select 
                    value={filters.availability} 
                    onValueChange={(value) => setFilters({ ...filters, availability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="partially_available">Partially Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Seniority Level
                  </label>
                  <Select 
                    value={filters.seniorityLevel} 
                    onValueChange={(value) => setFilters({ ...filters, seniorityLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid-Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Min Rate ($/hr)
                  </label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={filters.minRate}
                    onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Max Rate ($/hr)
                  </label>
                  <Input
                    type="number"
                    placeholder="150"
                    value={filters.maxRate}
                    onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {filters.skills && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Skills: {filters.skills}
                      <button
                        onClick={() => setFilters({ ...filters, skills: "" })}
                        className="ml-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.availability && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Availability: {filters.availability.replace('_', ' ')}
                      <button
                        onClick={() => setFilters({ ...filters, availability: "" })}
                        className="ml-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.seniorityLevel && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Level: {filters.seniorityLevel}
                      <button
                        onClick={() => setFilters({ ...filters, seniorityLevel: "" })}
                        className="ml-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {(filters.minRate || filters.maxRate) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Rate: {filters.minRate || '0'} - {filters.maxRate || '∞'} $/hr
                      <button
                        onClick={() => setFilters({ ...filters, minRate: "", maxRate: "" })}
                        className="ml-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                        <div className="w-24 h-3 bg-slate-300 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                      <div className="w-3/4 h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : professionals && professionals.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-600 dark:text-slate-400">
                Found {professionals.length} professional{professionals.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((professional: any) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onConnect={() => handleConnect(professional)}
                  onMessage={() => handleMessage(professional)}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No professionals found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more results."
                  : "Be the first to create a professional profile and join our community!"
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      <PageShare
        title={pageShareData.title}
        description={pageShareData.description}
        hashtags={pageShareData.hashtags}
        variant="floating"
      />
    </Layout>
  );
}

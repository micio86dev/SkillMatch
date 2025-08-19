import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Filter, Briefcase, Search } from "lucide-react";
import { useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Projects() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects", { ...filters, status: filters.status === "all" ? "" : filters.status }],
    refetchOnWindowFocus: false,
  });

  const createProjectForm = useForm({
    resolver: zodResolver(insertProjectSchema.omit({ companyUserId: true })),
    defaultValues: {
      title: "",
      description: "",
      requiredSkills: [],
      seniorityLevel: "mid",
      contractType: "project_based",
      estimatedHours: 0,
      budgetMin: 0,
      budgetMax: 0,
      location: "",
      isRemote: true,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowCreateDialog(false);
      createProjectForm.reset();
      toast({
        title: "Success",
        description: "Project posted successfully!",
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
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = (data: any) => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    createProjectMutation.mutate(data);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      search: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Projects
              </h1>
              <p className="text-slate-700 dark:text-slate-300">
                Discover exciting opportunities or post your own project
              </p>
            </div>
            
            {isAuthenticated && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Post Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Post a New Project</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...createProjectForm}>
                    <form onSubmit={createProjectForm.handleSubmit(handleCreateProject)} className="space-y-6">
                      <FormField
                        control={createProjectForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Senior React Developer for E-commerce Platform" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createProjectForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your project, requirements, and what you're looking for..."
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={createProjectForm.control}
                          name="seniorityLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Required Seniority Level</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="junior">Junior</SelectItem>
                                  <SelectItem value="mid">Mid-Level</SelectItem>
                                  <SelectItem value="senior">Senior</SelectItem>
                                  <SelectItem value="lead">Lead</SelectItem>
                                  <SelectItem value="principal">Principal</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createProjectForm.control}
                          name="contractType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contract Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="hourly">Hourly</SelectItem>
                                  <SelectItem value="project_based">Project-based</SelectItem>
                                  <SelectItem value="full_time">Full-time</SelectItem>
                                  <SelectItem value="part_time">Part-time</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={createProjectForm.control}
                          name="estimatedHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Hours</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="120"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createProjectForm.control}
                          name="budgetMin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Budget ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="5000"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createProjectForm.control}
                          name="budgetMax"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Budget ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="10000"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={createProjectForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location (if not fully remote)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. San Francisco, CA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createProjectMutation.isPending}
                        >
                          {createProjectMutation.isPending ? "Posting..." : "Post Project"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Filter Projects</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {filters.search && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: {filters.search}
                      <button
                        onClick={() => setFilters({ ...filters, search: "" })}
                        className="ml-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.status && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Status: {filters.status}
                      <button
                        onClick={() => setFilters({ ...filters, status: "" })}
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
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-slate-300 dark:bg-slate-700 rounded-lg"></div>
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
        ) : projects && projects.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-600 dark:text-slate-400">
                Found {projects.length} project{projects.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more results."
                  : "Be the first to post a project and find talented professionals!"
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                {isAuthenticated ? (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Post Your First Project
                  </Button>
                ) : (
                  <Button onClick={() => window.location.href = "/api/login"}>
                    Sign In to Post Project
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { ProjectCard } from "@/components/project-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Filter, Briefcase, Search } from "lucide-react";
import { useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { PreventivesButton } from "@/components/preventives-button";
import { useTranslation } from "react-i18next";
import { PageShare, usePageShare } from "@/components/page-share";

export default function Projects() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const pageShareData = usePageShare("custom", {
    title: t("projects.pageTitle"),
    description: t("projects.pageDescription"),
    hashtags: ["ITProjects", "Freelance", "TechJobs", "ProjectOpportunities"],
  });
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  const queryFilters = {
    ...filters,
    status: filters.status === "all" ? "" : filters.status,
  };
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects", queryFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (queryFilters.status) params.append("status", queryFilters.status);
      if (queryFilters.search) params.append("search", queryFilters.search);
      const url = `/api/projects${params.toString() ? "?" + params.toString() : ""}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  const createProjectForm = useForm({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      requiredSkills: [],
      seniorityLevel: "mid",
      contractType: "project_based",
      teamSize: 1,
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
        title: t("common.success"),
        description: t("projects.postSuccess"),
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("projects.unauthorizedTitle"),
          description: t("projects.unauthorizedMessage"),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 500);
        return;
      }
      toast({
        title: t("projects.createErrorTitle"),
        description: t("projects.createError"),
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = (data: any) => {
    if (!isAuthenticated) {
      window.location.href = "/auth/login";
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

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {t("projects.title")}
              </h1>
              <p className="text-slate-700 dark:text-slate-300">
                {t("projects.subtitle")}
              </p>
            </div>

            {isAuthenticated && (
              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("projects.postProject")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("projects.postNewProject")}</DialogTitle>
                  </DialogHeader>

                  <Form {...createProjectForm}>
                    <form
                      onSubmit={createProjectForm.handleSubmit(
                        handleCreateProject,
                      )}
                      className="space-y-6"
                    >
                      <FormField
                        control={createProjectForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("projects.projectTitle")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("projects.projectTitlePlaceholder")}
                                {...field}
                              />
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
                            <FormLabel>{t("projects.projectDescription")}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("projects.projectDescriptionPlaceholder")}
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={createProjectForm.control}
                          name="seniorityLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("projects.requiredSeniorityLevel")}</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t("projects.selectLevel")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="junior">{t("projects.junior")}</SelectItem>
                                  <SelectItem value="mid">{t("projects.midLevel")}</SelectItem>
                                  <SelectItem value="senior">{t("projects.senior")}</SelectItem>
                                  <SelectItem value="lead">{t("projects.lead")}</SelectItem>
                                  <SelectItem value="principal">
                                    {t("projects.principal")}
                                  </SelectItem>
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
                              <FormLabel>{t("projects.contractType")}</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t("projects.selectType")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="hourly">{t("projects.hourly")}</SelectItem>
                                  <SelectItem value="project_based">
                                    {t("projects.projectBased")}
                                  </SelectItem>
                                  <SelectItem value="full_time">
                                    {t("projects.fullTime")}
                                  </SelectItem>
                                  <SelectItem value="part_time">
                                    {t("projects.partTime")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createProjectForm.control}
                          name="teamSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("projects.teamSizeRequired")}</FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(parseInt(value))
                                }
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t("projects.howManyProfessionals")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">
                                    {t("projects.oneProfessional")}
                                  </SelectItem>
                                  <SelectItem value="2">
                                    {t("projects.twoProfessionals")}
                                  </SelectItem>
                                  <SelectItem value="3">
                                    {t("projects.threeProfessionals")}
                                  </SelectItem>
                                  <SelectItem value="4">
                                    {t("projects.fourProfessionals")}
                                  </SelectItem>
                                  <SelectItem value="5">
                                    {t("projects.fiveProfessionals")}
                                  </SelectItem>
                                  <SelectItem value="6">
                                    {t("projects.sixPlusProfessionals")}
                                  </SelectItem>
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
                              <FormLabel>{t("projects.estimatedHours")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={t("projects.estimatedHoursPlaceholder")}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
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
                              <FormLabel>{t("projects.minBudget")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={t("projects.budgetPlaceholder")}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
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
                              <FormLabel>{t("projects.maxBudget")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={t("projects.budgetMaxPlaceholder")}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
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
                            <FormLabel>
                              {t("projects.locationIfNotRemote")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("projects.locationPlaceholder")}
                                {...field}
                              />
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
                          {t("common.cancel")}
                        </Button>
                        <Button
                          type="submit"
                          disabled={createProjectMutation.isPending}
                        >
                          {createProjectMutation.isPending
                            ? t("projects.posting")
                            : t("projects.postProject")}
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
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {t("projects.filterProjectsTitle")}
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    {t("projects.clearAll")}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("projects.search")}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder={t("projects.searchPlaceholder")}
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("projects.status")}
                  </label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("projects.allStatuses")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("projects.allStatuses")}</SelectItem>
                      <SelectItem value="open">{t("projects.open")}</SelectItem>
                      <SelectItem value="in_review">{t("projects.inReview")}</SelectItem>
                      <SelectItem value="assigned">{t("projects.assigned")}</SelectItem>
                      <SelectItem value="completed">{t("projects.completed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {filters.search && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {t("projects.searchPrefix")} {filters.search}
                      <button
                        onClick={() => setFilters({ ...filters, search: "" })}
                        className="ml-1 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {filters.status && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {t("projects.statusPrefix")} {filters.status}
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
                {t(projects.length === 1 ? "projects.foundResults_one" : "projects.foundResults_other", { count: projects.length })}
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
                {t("projects.noProjectsFound")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {hasActiveFilters
                  ? t("projects.tryAdjustingFilters")
                  : t("projects.beFirstToPost")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    {t("projects.clearFilters")}
                  </Button>
                )}
                {isAuthenticated ? (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("projects.postYourFirstProject")}
                  </Button>
                ) : (
                  <Button onClick={() => (window.location.href = "/auth/login")}>
                    {t("projects.signInToPostProject")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Page Share */}
      <PageShare {...pageShareData} variant="floating" />
    </Layout>
  );
}

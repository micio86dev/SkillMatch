import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectPreventiveSchema, type ProjectPreventive } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Shield, Wand2, Trash2, Edit, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const createPreventiveSchema = insertProjectPreventiveSchema.extend({
  validationRule: z.string().min(1, "validation.validationRuleRequired"),
});

export default function Preventives() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [editingPreventive, setEditingPreventive] = useState<ProjectPreventive | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: preventives = [], isLoading } = useQuery<ProjectPreventive[]>({
    queryKey: ["/api/preventives", categoryFilter === "all" ? "" : categoryFilter],
    queryFn: async () => {
      const params = categoryFilter !== "all" ? `?category=${categoryFilter}` : "";
      const response = await fetch(`/api/preventives${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch preventives');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const createForm = useForm({
    resolver: zodResolver(createPreventiveSchema),
    defaultValues: {
      title: "",
      description: "",
      validationRule: "",
      errorMessage: "",
      category: "general",
      isActive: true,
    },
  });

  const generateForm = useForm({
    resolver: zodResolver(z.object({
      category: z.string().min(1, "validation.categoryRequired"),
      projectContext: z.string().optional(),
    })),
    defaultValues: {
      category: "general",
      projectContext: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/preventives", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Preventive Created",
        description: "Your preventive measure has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/preventives"] });
      setShowCreateDialog(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create preventive",
        variant: "destructive",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/preventives/generate", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Preventive Generated",
        description: "AI has generated a new preventive measure for you.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/preventives"] });
      setShowGenerateDialog(false);
      generateForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate preventive",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/preventives/${id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Preventive Updated",
        description: "Your preventive measure has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/preventives"] });
      setEditingPreventive(null);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update preventive",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/preventives/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Preventive Deleted",
        description: "The preventive measure has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/preventives"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete preventive",
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (data: any) => {
    if (editingPreventive) {
      updateMutation.mutate({ id: editingPreventive.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (preventive: ProjectPreventive) => {
    setEditingPreventive(preventive);
    createForm.reset({
      title: preventive.title,
      description: preventive.description || "",
      validationRule: preventive.validationRule,
      errorMessage: preventive.errorMessage,
      category: preventive.category || "general",
      isActive: preventive.isActive ?? true,
    });
    setShowCreateDialog(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'budget': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'timeline': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'team': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'skills': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Please log in to manage your project preventives.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              Project Preventives
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Create and manage validation rules to ensure project quality and consistency.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Generate with AI
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Preventive with AI</DialogTitle>
                </DialogHeader>
                <Form {...generateForm}>
                  <form onSubmit={generateForm.handleSubmit((data) => generateMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={generateForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="budget">Budget</SelectItem>
                              <SelectItem value="timeline">Timeline</SelectItem>
                              <SelectItem value="team">Team</SelectItem>
                              <SelectItem value="skills">Skills</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generateForm.control}
                      name="projectContext"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Context (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your project type or specific requirements..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowGenerateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={generateMutation.isPending}>
                        {generateMutation.isPending ? "Generating..." : "Generate"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateDialog} onOpenChange={(open) => {
              setShowCreateDialog(open);
              if (!open) {
                setEditingPreventive(null);
                createForm.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Preventive
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPreventive ? "Edit Preventive" : "Create New Preventive"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief descriptive title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Explain why this preventive is important..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="budget">Budget</SelectItem>
                              <SelectItem value="timeline">Timeline</SelectItem>
                              <SelectItem value="team">Team</SelectItem>
                              <SelectItem value="skills">Skills</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="validationRule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Validation Rule (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder='{"field": "budgetMax", "operator": "lessThan", "value": 100000}'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="errorMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Error Message</FormLabel>
                          <FormControl>
                            <Input placeholder="Message shown when validation fails" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingPreventive ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="skills">Skills</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : preventives.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h2 className="text-xl font-semibold mb-2">No Preventives Yet</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first preventive measure to ensure project quality.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Your First Preventive
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {preventives.map((preventive) => (
              <Card key={preventive.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{preventive.title}</CardTitle>
                      <Badge className={`mt-2 ${getCategoryColor(preventive.category || 'general')}`}>
                        {preventive.category}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(preventive)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(preventive.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {preventive.description}
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded text-xs">
                    <strong>Error:</strong> {preventive.errorMessage}
                  </div>
                  {preventive.isGlobal && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Global Rule
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
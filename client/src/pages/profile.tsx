import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertProfessionalProfileSchema, insertCompanyProfileSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Building, Star, MapPin, Globe, Github, Linkedin, Upload, Edit3, Bell } from "lucide-react";
import { NotificationPreferences } from "@/components/notification-preferences";
import { useState, useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileType, setProfileType] = useState<"professional" | "company">("professional");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: professionalProfile, isLoading: professionalLoading } = useQuery({
    queryKey: ["/api/profile/professional", user?.id],
    enabled: !!user?.id,
    retry: false,
  });

  const { data: companyProfile, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/profile/company", user?.id],
    enabled: !!user?.id,
    retry: false,
  });

  const { data: feedback } = useQuery({
    queryKey: ["/api/feedback", user?.id],
    enabled: !!user?.id,
  });

  const professionalForm = useForm({
    resolver: zodResolver(insertProfessionalProfileSchema.partial()),
    defaultValues: {
      title: "",
      bio: "",
      skills: [],
      seniorityLevel: "mid",
      hourlyRate: "",
      availability: "available",
      portfolioUrl: "",
      githubUrl: "",
      linkedinUrl: "",
    },
  });

  const companyForm = useForm({
    resolver: zodResolver(insertCompanyProfileSchema.partial()),
    defaultValues: {
      companyName: "",
      description: "",
      industry: "",
      websiteUrl: "",
      linkedinUrl: "",
      location: "",
      companySize: "11-50",
    },
  });

  useEffect(() => {
    if (professionalProfile) {
      professionalForm.reset({
        title: professionalProfile.title || "",
        bio: professionalProfile.bio || "",
        skills: professionalProfile.skills || [],
        seniorityLevel: professionalProfile.seniorityLevel || "mid",
        hourlyRate: professionalProfile.hourlyRate || "",
        availability: professionalProfile.availability || "available",
        portfolioUrl: professionalProfile.portfolioUrl || "",
        githubUrl: professionalProfile.githubUrl || "",
        linkedinUrl: professionalProfile.linkedinUrl || "",
      });
      setProfileType("professional");
    } else if (companyProfile) {
      companyForm.reset({
        companyName: companyProfile.companyName || "",
        description: companyProfile.description || "",
        industry: companyProfile.industry || "",
        websiteUrl: companyProfile.websiteUrl || "",
        linkedinUrl: companyProfile.linkedinUrl || "",
        location: companyProfile.location || "",
        companySize: companyProfile.companySize || "11-50",
      });
      setProfileType("company");
    }
  }, [professionalProfile, companyProfile]);

  const createProfessionalMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = professionalProfile ? 'PUT' : 'POST';
      await apiRequest(endpoint, "/api/profile/professional", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile/professional"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Professional profile updated successfully!",
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = companyProfile ? 'PUT' : 'POST';
      await apiRequest(endpoint, "/api/profile/company", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile/company"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Company profile updated successfully!",
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProfessionalSubmit = (data: any) => {
    createProfessionalMutation.mutate(data);
  };

  const handleCompanySubmit = (data: any) => {
    createCompanyMutation.mutate(data);
  };

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasProfile = professionalProfile || companyProfile;
  const currentProfile = professionalProfile || companyProfile;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    {profileType === "company" ? (
                      <Building className="w-10 h-10 text-primary" />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {companyProfile?.companyName || `${user?.firstName} ${user?.lastName}` || "Your Profile"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {professionalProfile?.title || companyProfile?.industry || "Complete your profile to get started"}
                </p>
                {feedback && feedback.length > 0 && (
                  <div className="flex items-center space-x-1 mt-2">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      4.9 ({feedback.length} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {!hasProfile && !isEditing ? (
          /* Welcome Screen for New Users */
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Welcome to DevConnect!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Complete your profile to start connecting with opportunities and other professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button
                  onClick={() => {
                    setProfileType("professional");
                    setIsEditing(true);
                  }}
                  className="flex-1"
                >
                  <User className="mr-2 h-4 w-4" />
                  I'm a Professional
                </Button>
                <Button
                  onClick={() => {
                    setProfileType("company");
                    setIsEditing(true);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Building className="mr-2 h-4 w-4" />
                  I'm a Company
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="feedback">Reviews ({feedback?.length || 0})</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {isEditing ? (
                /* Edit Mode */
                profileType === "professional" ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Professional Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...professionalForm}>
                        <form onSubmit={professionalForm.handleSubmit(handleProfessionalSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={professionalForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Senior Full-Stack Developer" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={professionalForm.control}
                              name="seniorityLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Seniority Level</FormLabel>
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
                          </div>

                          <FormField
                            control={professionalForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us about yourself, your experience, and what you're passionate about..."
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
                              control={professionalForm.control}
                              name="hourlyRate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hourly Rate (USD)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. 85" type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={professionalForm.control}
                              name="availability"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Availability</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select availability" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="available">Available</SelectItem>
                                      <SelectItem value="partially_available">Partially Available</SelectItem>
                                      <SelectItem value="unavailable">Unavailable</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                              control={professionalForm.control}
                              name="portfolioUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Portfolio URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://yourportfolio.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={professionalForm.control}
                              name="githubUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>GitHub URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://github.com/username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={professionalForm.control}
                              name="linkedinUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>LinkedIn URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://linkedin.com/in/username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              disabled={createProfessionalMutation.isPending}
                            >
                              {createProfessionalMutation.isPending ? "Saving..." : "Save Profile"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...companyForm}>
                        <form onSubmit={companyForm.handleSubmit(handleCompanySubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={companyForm.control}
                              name="companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. TechCorp Inc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={companyForm.control}
                              name="industry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Industry</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. FinTech, E-commerce, Healthcare" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={companyForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us about your company, mission, and what you're building..."
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
                              control={companyForm.control}
                              name="location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. San Francisco, CA" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={companyForm.control}
                              name="companySize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Size</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select company size" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1-10">1-10 employees</SelectItem>
                                      <SelectItem value="11-50">11-50 employees</SelectItem>
                                      <SelectItem value="51-200">51-200 employees</SelectItem>
                                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                                      <SelectItem value="1000+">1000+ employees</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={companyForm.control}
                              name="websiteUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Website URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://yourcompany.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={companyForm.control}
                              name="linkedinUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>LinkedIn URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://linkedin.com/company/yourcompany" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              disabled={createCompanyMutation.isPending}
                            >
                              {createCompanyMutation.isPending ? "Saving..." : "Save Profile"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )
              ) : (
                /* View Mode */
                <div className="space-y-6">
                  {/* Profile Info */}
                  <Card>
                    <CardContent className="p-6">
                      {professionalProfile ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Seniority Level</h3>
                              <Badge variant="secondary" className="capitalize">
                                {professionalProfile.seniorityLevel}
                              </Badge>
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Hourly Rate</h3>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                ${professionalProfile.hourlyRate}/hr
                              </p>
                            </div>
                          </div>

                          {professionalProfile.bio && (
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">About</h3>
                              <p className="text-slate-600 dark:text-slate-400">{professionalProfile.bio}</p>
                            </div>
                          )}

                          {professionalProfile.skills && professionalProfile.skills.length > 0 && (
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Skills</h3>
                              <div className="flex flex-wrap gap-2">
                                {professionalProfile.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4">
                            {professionalProfile.portfolioUrl && (
                              <a 
                                href={professionalProfile.portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:underline"
                              >
                                <Globe className="h-4 w-4" />
                                <span>Portfolio</span>
                              </a>
                            )}
                            {professionalProfile.githubUrl && (
                              <a 
                                href={professionalProfile.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:underline"
                              >
                                <Github className="h-4 w-4" />
                                <span>GitHub</span>
                              </a>
                            )}
                            {professionalProfile.linkedinUrl && (
                              <a 
                                href={professionalProfile.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:underline"
                              >
                                <Linkedin className="h-4 w-4" />
                                <span>LinkedIn</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ) : companyProfile ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Industry</h3>
                              <p className="text-slate-600 dark:text-slate-400">{companyProfile.industry}</p>
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Company Size</h3>
                              <Badge variant="secondary">
                                {companyProfile.companySize} employees
                              </Badge>
                            </div>
                          </div>

                          {companyProfile.location && (
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Location</h3>
                              <p className="text-slate-600 dark:text-slate-400 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {companyProfile.location}
                              </p>
                            </div>
                          )}

                          {companyProfile.description && (
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">About</h3>
                              <p className="text-slate-600 dark:text-slate-400">{companyProfile.description}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-4">
                            {companyProfile.websiteUrl && (
                              <a 
                                href={companyProfile.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:underline"
                              >
                                <Globe className="h-4 w-4" />
                                <span>Website</span>
                              </a>
                            )}
                            {companyProfile.linkedinUrl && (
                              <a 
                                href={companyProfile.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:underline"
                              >
                                <Linkedin className="h-4 w-4" />
                                <span>LinkedIn</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              {feedback && feedback.length > 0 ? (
                <div className="space-y-4">
                  {feedback.map((review: any) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                {review.fromUser.firstName} {review.fromUser.lastName}
                              </h4>
                              <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= review.rating ? 'fill-current' : ''}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Star className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Complete projects and collaborate with others to receive feedback and build your reputation.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationPreferences />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  DollarSign, 
  BarChart3, 
  Lightbulb,
  GraduationCap,
  Award,
  ArrowRight,
  Loader2,
  Sparkles
} from "lucide-react";
import { useEffect } from "react";

interface CareerInsight {
  skillsGapAnalysis: {
    currentSkills: string[];
    inDemandSkills: string[];
    missingSkills: string[];
    skillLevel: string;
  };
  careerProgression: {
    currentLevel: string;
    nextLevel: string;
    progressionPath: string[];
    timeToNextLevel: string;
  };
  learningRecommendations: {
    courses: Array<{
      title: string;
      provider: string;
      duration: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    certifications: string[];
    projects: string[];
  };
  marketInsights: {
    averageSalary: string;
    salaryRange: string;
    demandLevel: string;
    trendingTechnologies: string[];
  };
  profileOptimization: {
    completeness: number;
    suggestions: string[];
  };
}

export default function CareerInsights() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: insights, isLoading, error, refetch } = useQuery<CareerInsight>({
    queryKey: ["/api/career-insights"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
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
  }, [isAuthenticated, toast]);

  if (error && isUnauthorizedError(error)) {
    return null; // Will redirect to login
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand.toLowerCase()) {
      case 'high':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Analyzing Your Career Path
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We're generating personalized insights based on your profile and market trends...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Lightbulb className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Unable to Generate Insights
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We couldn't generate your career insights at the moment. Please try again.
              </p>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!insights) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Complete Your Profile
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                To receive personalized career insights, please complete your professional profile first.
              </p>
              <Button onClick={() => window.location.href = "/profile"}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Career Growth Insights
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Personalized recommendations to accelerate your career
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Current Level</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {insights.careerProgression.currentLevel}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Next Level</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {insights.careerProgression.nextLevel}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Market Salary</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {insights.marketInsights.averageSalary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Profile Score</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {insights.profileOptimization.completeness}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Career Progression Path */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Career Progression Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Estimated time to next level: {insights.careerProgression.timeToNextLevel}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 overflow-x-auto">
                    {insights.careerProgression.progressionPath.map((level, index) => (
                      <div key={level} className="flex items-center space-x-2 min-w-fit">
                        <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          index === 0 
                            ? 'bg-primary text-primary-foreground' 
                            : index === 1
                            ? 'bg-primary/20 text-primary border-2 border-primary'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {level}
                        </div>
                        {index < insights.careerProgression.progressionPath.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Skills Gap Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                    Your Current Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.skillsGapAnalysis.currentSkills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                    High-Demand Skills in Your Field
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.skillsGapAnalysis.inDemandSkills.map((skill) => (
                      <Badge key={skill} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                    Skills to Develop (Priority)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.skillsGapAnalysis.missingSkills.map((skill) => (
                      <Badge key={skill} className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Recommended Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.learningRecommendations.courses.map((course, index) => (
                      <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {course.title}
                          </h4>
                          <Badge className={getPriorityColor(course.priority)}>
                            {course.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          {course.provider}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                          Duration: {course.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Valuable Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.learningRecommendations.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        <span className="text-slate-900 dark:text-slate-100">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Practice Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.learningRecommendations.projects.map((project, index) => (
                    <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        {project}
                      </h4>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Salary Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Average Salary</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {insights.marketInsights.averageSalary}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Salary Range</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {insights.marketInsights.salaryRange}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Market Demand</p>
                    <p className={`text-lg font-semibold ${getDemandColor(insights.marketInsights.demandLevel)}`}>
                      {insights.marketInsights.demandLevel} Demand
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Trending Technologies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.marketInsights.trendingTechnologies.map((tech, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{tech}</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Profile Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Profile Completeness
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {insights.profileOptimization.completeness}%
                    </span>
                  </div>
                  <Progress value={insights.profileOptimization.completeness} className="h-2" />
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                    Optimization Suggestions
                  </h4>
                  <div className="space-y-3">
                    {insights.profileOptimization.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
                        <span className="text-slate-900 dark:text-slate-100">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Ready to Level Up Your Career?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Start implementing these recommendations and track your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.href = "/profile"}>
                Update My Profile
              </Button>
              <Button variant="outline" onClick={() => refetch()}>
                Refresh Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
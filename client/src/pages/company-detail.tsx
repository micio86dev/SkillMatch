import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Users, 
  Calendar,
  Briefcase,
  DollarSign,
  Clock,
  Star,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface Company {
  id: string;
  companyName: string;
  description: string;
  industry: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  location?: string;
  companySize?: string;
  createdAt: string;
  user: {
    email: string;
    profileImageUrl?: string;
  };
  projects: Project[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  seniorityLevel: string;
  contractType: string;
  budgetMin?: number;
  budgetMax?: number;
  status: string;
  location?: string;
  isRemote: boolean;
  likesCount: number;
  createdAt: string;
  estimatedHours?: number;
}

export default function CompanyDetail() {
  const { id } = useParams();

  const { data: company, isLoading, error } = useQuery<Company>({
    queryKey: [`/api/companies/${id}`],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error || !company) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Company Not Found
            </h1>
            <Link href="/companies">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${min} - $${max}`;
    if (min) return `From $${min}`;
    if (max) return `Up to $${max}`;
    return null;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/companies">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
          </Link>
        </div>

        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                {company.user.profileImageUrl ? (
                  <img
                    src={company.user.profileImageUrl}
                    alt={company.companyName}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {company.companyName}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {company.industry && (
                    <Badge variant="secondary" className="text-sm">
                      {company.industry}
                    </Badge>
                  )}
                  {company.location && (
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {company.companySize && (
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{company.companySize} employees</span>
                    </div>
                  )}
                </div>

                {company.description && (
                  <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    {company.description}
                  </p>
                )}

                <div className="flex items-center space-x-4">
                  {company.websiteUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(company.websiteUrl, '_blank')}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                  {company.linkedinUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(company.linkedinUrl, '_blank')}
                    >
                      LinkedIn
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Active Projects ({company.projects?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {company.projects && company.projects.length > 0 ? (
              <div className="space-y-6">
                {company.projects.map((project) => (
                  <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                          {project.title}
                        </h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          {project.likesCount}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {project.seniorityLevel && (
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {project.seniorityLevel} level
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {project.contractType.replace('_', ' ')}
                        </span>
                      </div>

                      {project.estimatedHours && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {project.estimatedHours} hours
                          </span>
                        </div>
                      )}

                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {project.isRemote ? 'Remote' : project.location || 'On-site'}
                        </span>
                      </div>

                      {formatBudget(project.budgetMin, project.budgetMax) && (
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {formatBudget(project.budgetMin, project.budgetMax)}
                          </span>
                        </div>
                      )}
                    </div>

                    {project.requiredSkills && project.requiredSkills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Required Skills:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.requiredSkills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="outline" size="sm">
                          View Project Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No Active Projects
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  This company doesn't have any active projects at the moment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
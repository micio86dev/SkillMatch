import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Building, DollarSign } from "lucide-react";
import { Project, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { LikeButton } from "@/components/like-button";

interface ProjectCardProps {
  project: Project & { company: User };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { company } = project;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_review':
        return 'In Review';
      case 'assigned':
        return 'Assigned';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getContractTypeIcon = (type: string) => {
    switch (type) {
      case 'hourly':
        return <Clock className="h-4 w-4" />;
      case 'project_based':
        return <Building className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-6">
        {/* Company header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Building className="text-white h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {company.firstName || 'Company Name'}
            </h3>
            {project.location && (
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {project.location}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Project title */}
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            {project.title}
          </h4>

          {/* Description */}
          {project.description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
              {project.description}
            </p>
          )}

          {/* Skills */}
          {project.requiredSkills && project.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {project.requiredSkills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.requiredSkills.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Project details */}
          <div className="space-y-2">
            {project.estimatedHours && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Est. {project.estimatedHours} hours
                </span>
              </div>
            )}

            {(project.budgetMin || project.budgetMax) && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Budget
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {project.budgetMin && project.budgetMax
                    ? `$${project.budgetMin} - $${project.budgetMax}`
                    : project.budgetMin
                    ? `$${project.budgetMin}+`
                    : project.budgetMax
                    ? `Up to $${project.budgetMax}`
                    : 'TBD'
                  }
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Posted {formatDistanceToNow(new Date(project.createdAt || ''))} ago
            </span>
            <Badge className={`text-xs ${getStatusColor(project.status || 'open')}`}>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-current rounded-full" />
                <span>{getStatusText(project.status || 'open')}</span>
              </div>
            </Badge>
          </div>
        </div>
        
        {/* Like button for projects */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <LikeButton
            itemType="projects"
            itemId={project.id}
            initialLikeCount={project.likesCount || 0}
          />
        </div>
      </CardContent>
    </Card>
  );
}

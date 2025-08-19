import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  MapPin, 
  Globe, 
  Github, 
  Linkedin, 
  Twitter, 
  MessageSquare,
  Star,
  ExternalLink
} from "lucide-react";
import { FeedbackDisplay } from "@/components/feedback-display";
import { FeedbackForm } from "@/components/feedback-form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProfessionalProfileData {
  id: string;
  title: string;
  bio: string;
  skills: string[];
  seniorityLevel: string;
  hourlyRate: number;
  availability: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
    userType: string;
  };
}

export default function ProfessionalProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const { data: professional, isLoading, error } = useQuery<ProfessionalProfileData>({
    queryKey: [`/api/profile/professional/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto space-y-8">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-24 h-24 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-32"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !professional) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Professional Not Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                The professional profile you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?.id === professional.user.id;
  const canLeaveFeedback = currentUser?.userType === 'company' && !isOwnProfile;

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-400';
      case 'partially_available':
        return 'bg-yellow-400';
      case 'unavailable':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'partially_available':
        return 'Partially Available';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  const getSeniorityLevel = (level: string) => {
    const levels = {
      junior: 'Junior',
      mid: 'Mid-Level',
      senior: 'Senior',
      lead: 'Lead',
      principal: 'Principal'
    };
    return levels[level as keyof typeof levels] || level;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Main Profile Card */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
              <div className="flex items-start space-x-6 mb-6 lg:mb-0">
                <Avatar className="w-24 h-24">
                  {professional.user.profileImageUrl ? (
                    <AvatarImage src={professional.user.profileImageUrl} alt={professional.user.firstName} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      <User className="w-10 h-10" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {professional.user.firstName} {professional.user.lastName}
                  </h1>
                  <p className="text-xl text-slate-700 dark:text-slate-300 mb-3">
                    {professional.title}
                  </p>
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge variant="secondary">
                      {getSeniorityLevel(professional.seniorityLevel)}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(professional.availability)}`} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {getAvailabilityText(professional.availability)}
                      </span>
                    </div>
                    {professional.hourlyRate && (
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">
                        ${professional.hourlyRate}/hr
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 lg:flex-shrink-0">
                {!isOwnProfile && (
                  <>
                    <Button size="lg" className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Message</span>
                    </Button>
                    {canLeaveFeedback && (
                      <FeedbackForm
                        professionalId={professional.user.id}
                        professionalName={`${professional.user.firstName} ${professional.user.lastName}`}
                        professionalImage={professional.user.profileImageUrl}
                      />
                    )}
                  </>
                )}
                {isOwnProfile && (
                  <Button variant="outline" size="lg">
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            {professional.bio && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  About
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {professional.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {professional.skills && professional.skills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {professional.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Links
              </h3>
              <div className="flex flex-wrap gap-4">
                {professional.websiteUrl && (
                  <a
                    href={professional.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {professional.portfolioUrl && (
                  <a
                    href={professional.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Portfolio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {professional.githubUrl && (
                  <a
                    href={professional.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {professional.linkedinUrl && (
                  <a
                    href={professional.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {professional.twitterUrl && (
                  <a
                    href={professional.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <FeedbackDisplay userId={professional.user.id} showAll={true} />
      </div>
    </Layout>
  );
}
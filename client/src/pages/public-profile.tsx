import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { User, Building, Star, MapPin, Globe, Github, Linkedin, ExternalLink, MessageSquare, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function PublicProfile() {
  const [, params] = useRoute("/profile/:userId");
  const userId = params?.userId;
  const { user: currentUser } = useAuth();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user", userId],
    enabled: !!userId,
  });

  const { data: professionalProfile } = useQuery({
    queryKey: ["/api/profile/professional", userId],
    enabled: !!userId,
  });

  const { data: companyProfile } = useQuery({
    queryKey: ["/api/profile/company", userId],
    enabled: !!userId,
  });

  const { data: posts } = useQuery({
    queryKey: ["/api/posts", { userId, isPublic: true }],
    enabled: !!userId,
  });

  const { data: feedback } = useQuery({
    queryKey: ["/api/feedback", userId],
    enabled: !!userId,
  });

  if (!userId || !user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Profile Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400">The profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const profile = professionalProfile || companyProfile;
  const profileType = professionalProfile ? "professional" : "company";

  const displayName = companyProfile?.companyName || 
    (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 
     user.firstName || "Professional");

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-400';
      case 'partially_available': return 'bg-yellow-400';
      default: return 'bg-red-400';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'partially_available': return 'Partially Available';
      default: return 'Unavailable';
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="relative">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    {profileType === "company" ? (
                      <Building className="w-12 h-12 text-primary" />
                    ) : (
                      <User className="w-12 h-12 text-primary" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {displayName}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                  {professionalProfile?.title || companyProfile?.industry}
                </p>
                
                {companyProfile?.location && (
                  <div className="flex items-center text-slate-600 dark:text-slate-400 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {companyProfile.location}
                  </div>
                )}

                {professionalProfile?.availability && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(professionalProfile.availability)}`} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {getAvailabilityText(professionalProfile.availability)}
                    </span>
                    {professionalProfile.hourlyRate && (
                      <span className="text-lg font-semibold text-slate-900 dark:text-white ml-4">
                        ${professionalProfile.hourlyRate}/hr
                      </span>
                    )}
                  </div>
                )}

                {feedback && feedback.length > 0 && (
                  <div className="flex items-center space-x-1 mb-4">
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

                {/* Social Links */}
                <div className="flex items-center space-x-4">
                  {(professionalProfile?.portfolioUrl || companyProfile?.websiteUrl) && (
                    <a
                      href={professionalProfile?.portfolioUrl || companyProfile?.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Portfolio
                    </a>
                  )}
                  {professionalProfile?.githubUrl && (
                    <a
                      href={professionalProfile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                      <Github className="h-4 w-4 mr-1" />
                      GitHub
                    </a>
                  )}
                  {(professionalProfile?.linkedinUrl || companyProfile?.linkedinUrl) && (
                    <a
                      href={professionalProfile?.linkedinUrl || companyProfile?.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-4 w-4 mr-1" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {!isOwnProfile && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {(professionalProfile?.bio || companyProfile?.description) && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {professionalProfile?.bio || companyProfile?.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Skills Section - Professional Only */}
            {professionalProfile?.skills && professionalProfile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {professionalProfile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Posts */}
            {posts && posts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {posts.slice(0, 3).map((post: any) => (
                    <div key={post.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                      <p className="text-slate-700 dark:text-slate-300 mb-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-4">
                          <span>{post.likesCount || 0} likes</span>
                          <span>{post.commentsCount || 0} comments</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info - Company Only */}
            {companyProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companyProfile.companySize && (
                    <div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Company Size</span>
                      <p className="text-slate-900 dark:text-white">{companyProfile.companySize} employees</p>
                    </div>
                  )}
                  {companyProfile.industry && (
                    <div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Industry</span>
                      <p className="text-slate-900 dark:text-white">{companyProfile.industry}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Professional Info - Professional Only */}
            {professionalProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Professional Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {professionalProfile.seniorityLevel && (
                    <div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Experience Level</span>
                      <p className="text-slate-900 dark:text-white capitalize">
                        {professionalProfile.seniorityLevel.replace('_', ' ')}
                      </p>
                    </div>
                  )}
                  {professionalProfile.cvUrl && (
                    <div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Resume</span>
                      <div className="mt-1">
                        <Button variant="outline" size="sm" asChild>
                          <a href={professionalProfile.cvUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Resume
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Reviews */}
            {feedback && feedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedback.slice(0, 2).map((review: any) => (
                    <div key={review.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center space-x-1 mb-2">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {review.rating}/5
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                          "{review.comment}"
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        by {review.fromUser?.firstName || 'Anonymous'}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
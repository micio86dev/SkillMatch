import { SocialShare } from "@/components/social-share";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { useState } from "react";

interface PageShareProps {
  title: string;
  description: string;
  hashtags?: string[];
  variant?: "floating" | "embedded" | "button";
  className?: string;
}

export function PageShare({
  title,
  description,
  hashtags = [],
  variant = "floating",
  className = "",
}: PageShareProps) {
  const [showShare, setShowShare] = useState(false);
  const currentUrl = window.location.href;

  if (variant === "embedded") {
    return (
      <Card className={`border-0 shadow-none ${className}`}>
        <CardContent className="p-0">
          <SocialShare
            title={title}
            content={description}
            url={currentUrl}
            hashtags={hashtags}
            variant="grid"
          />
        </CardContent>
      </Card>
    );
  }

  if (variant === "button") {
    return (
      <SocialShare
        title={title}
        content={description}
        url={currentUrl}
        hashtags={hashtags}
        variant="button"
      />
    );
  }

  // Floating variant (default)
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Button
        onClick={() => setShowShare(!showShare)}
        className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 text-white"
        size="lg"
      >
        <Share className="h-6 w-6" />
      </Button>
      
      {showShare && (
        <div className="absolute bottom-16 right-0 w-80 mb-2">
          <Card className="shadow-xl border-0">
            <CardContent className="p-4">
              <SocialShare
                title={title}
                content={description}
                url={currentUrl}
                hashtags={hashtags}
                variant="grid"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Hook for generating page metadata for social sharing
export function usePageShare(
  pageType: 'professional' | 'project' | 'company' | 'home' | 'custom',
  data?: any
) {
  const generateTitle = () => {
    switch (pageType) {
      case 'professional':
        return `${data?.firstName} ${data?.lastName} - Professional Profile | DevConnect`;
      case 'project':
        return `${data?.title} - Project | DevConnect`;
      case 'company':
        return `${data?.name} - Company Profile | DevConnect`;
      case 'home':
        return 'DevConnect - Professional IT Networking Platform';
      case 'custom':
        return data?.title || 'DevConnect - Professional IT Networking Platform';
      default:
        return 'DevConnect - Professional IT Networking Platform';
    }
  };

  const generateDescription = () => {
    switch (pageType) {
      case 'professional':
        return `Connect with ${data?.firstName} ${data?.lastName}, ${data?.title || 'IT Professional'} on DevConnect. ${data?.bio?.substring(0, 150) || 'Explore their skills and experience in the tech industry.'}`;
      case 'project':
        return `${data?.description?.substring(0, 150) || 'Discover this exciting project'} - Join the DevConnect community to explore more tech projects and opportunities.`;
      case 'company':
        return `${data?.description?.substring(0, 150) || `Learn about ${data?.name}`} - Connect with this company and explore career opportunities on DevConnect.`;
      case 'home':
        return 'Connect with IT professionals, discover career opportunities, and grow your network. Join DevConnect today!';
      case 'custom':
        return data?.description || 'Connect with IT professionals, discover career opportunities, and grow your network. Join DevConnect today!';
      default:
        return 'Connect with IT professionals, discover career opportunities, and grow your network. Join DevConnect today!';
    }
  };

  const generateHashtags = () => {
    const baseHashtags = ['DevConnect', 'ITJobs', 'TechCommunity', 'Networking'];
    
    switch (pageType) {
      case 'professional':
        return [...baseHashtags, 'Developer', 'TechTalent', ...(data?.skills?.slice(0, 3) || [])];
      case 'project':
        return [...baseHashtags, 'TechProjects', 'Innovation', 'Development'];
      case 'company':
        return [...baseHashtags, 'TechCompany', 'Career', 'Jobs'];
      case 'home':
        return baseHashtags;
      default:
        return data?.hashtags || baseHashtags;
    }
  };

  return {
    title: generateTitle(),
    description: generateDescription(),
    hashtags: generateHashtags(),
  };
}
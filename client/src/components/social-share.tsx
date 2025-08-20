import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Share,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Copy,
  Link,
  Mail,
  Send,
} from "lucide-react";
import { 
  SiReddit,
  SiTelegram,
  SiWhatsapp,
  SiInstagram,
  SiPinterest,
} from "react-icons/si";

interface SocialShareProps {
  title: string;
  content: string;
  url?: string;
  hashtags?: string[];
  author?: string;
  size?: "sm" | "default" | "lg";
  variant?: "button" | "dropdown" | "grid";
}

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  shareUrl: (data: {
    url: string;
    title: string;
    content: string;
    hashtags?: string;
    via?: string;
  }) => string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    name: "Facebook",
    icon: <Facebook className="h-5 w-5" />,
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
    shareUrl: ({ url, title, content }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${title}\n\n${content}`)}`,
  },
  {
    name: "Twitter",
    icon: <Twitter className="h-5 w-5" />,
    color: "bg-sky-500",
    hoverColor: "hover:bg-sky-600",
    shareUrl: ({ url, title, content, hashtags, via }) => {
      const text = `${title}\n\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`;
      const hashtagString = hashtags ? `&hashtags=${hashtags}` : '';
      const viaString = via ? `&via=${via}` : '';
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}${hashtagString}${viaString}`;
    },
  },
  {
    name: "LinkedIn",
    icon: <Linkedin className="h-5 w-5" />,
    color: "bg-blue-700",
    hoverColor: "hover:bg-blue-800",
    shareUrl: ({ url, title, content }) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(content.substring(0, 200))}`,
  },
  {
    name: "WhatsApp",
    icon: <SiWhatsapp className="h-5 w-5" />,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    shareUrl: ({ url, title, content }) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${content}\n\n${url}`)}`,
  },
  {
    name: "Telegram",
    icon: <SiTelegram className="h-5 w-5" />,
    color: "bg-sky-400",
    hoverColor: "hover:bg-sky-500",
    shareUrl: ({ url, title, content }) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${title}\n\n${content}`)}`,
  },
  {
    name: "Reddit",
    icon: <SiReddit className="h-5 w-5" />,
    color: "bg-orange-600",
    hoverColor: "hover:bg-orange-700",
    shareUrl: ({ url, title, content }) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&text=${encodeURIComponent(content)}`,
  },
  {
    name: "Pinterest",
    icon: <SiPinterest className="h-5 w-5" />,
    color: "bg-red-600",
    hoverColor: "hover:bg-red-700",
    shareUrl: ({ url, title, content }) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(`${title}\n\n${content}`)}`,
  },
  {
    name: "Email",
    icon: <Mail className="h-5 w-5" />,
    color: "bg-gray-600",
    hoverColor: "hover:bg-gray-700",
    shareUrl: ({ url, title, content }) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${content}\n\nRead more: ${url}`)}`,
  },
];

export function SocialShare({
  title,
  content,
  url = window.location.href,
  hashtags = [],
  author,
  size = "sm",
  variant = "button",
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const shareData = {
    url,
    title,
    content,
    hashtags: hashtags.join(','),
    via: author,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: content,
          url,
        });
        setIsOpen(false);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: t('share.linkCopied'),
        description: t('share.linkCopied'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handlePlatformShare = (platform: SocialPlatform) => {
    const shareUrl = platform.shareUrl(shareData);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  if (variant === "button") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            <Share className="h-4 w-4" />
            <span>{t('projects.share')}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl w-full max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>{t('share.title')}</DialogTitle>
            <DialogDescription>
              {t('share.chooseHow')}
            </DialogDescription>
          </DialogHeader>
          <ShareContent
            platforms={socialPlatforms}
            onPlatformShare={handlePlatformShare}
            onCopyLink={handleCopyLink}
            onNativeShare={handleNativeShare}
            copied={copied}
            url={url}
            t={t}
          />
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === "grid") {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            {t('share.title')}
          </h3>
          <ShareContent
            platforms={socialPlatforms}
            onPlatformShare={handlePlatformShare}
            onCopyLink={handleCopyLink}
            onNativeShare={handleNativeShare}
            copied={copied}
            url={url}
            t={t}
          />
        </CardContent>
      </Card>
    );
  }

  return null;
}

interface ShareContentProps {
  platforms: SocialPlatform[];
  onPlatformShare: (platform: SocialPlatform) => void;
  onCopyLink: () => void;
  onNativeShare: () => void;
  copied: boolean;
  url: string;
  t: (key: string) => string;
}

function ShareContent({
  platforms,
  onPlatformShare,
  onCopyLink,
  onNativeShare,
  copied,
  url,
  t,
}: ShareContentProps) {
  return (
    <div className="space-y-4">
      {/* Native Share (if supported) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <Button
          onClick={onNativeShare}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Send className="h-4 w-4 mr-2" />
          {t('share.shareViaDevice')}
        </Button>
      )}

      {/* Social Platforms Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {platforms.map((platform) => (
          <Button
            key={platform.name}
            onClick={() => onPlatformShare(platform)}
            className={`flex items-center justify-center space-x-2 text-white ${platform.color} ${platform.hoverColor} border-0`}
            size="sm"
          >
            {platform.icon}
            <span className="text-xs sm:text-sm">{platform.name}</span>
          </Button>
        ))}
      </div>

      {/* Copy Link */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('share.copyLinkLabel')}
        </label>
        <div className="flex space-x-2">
          <Input
            value={url}
            readOnly
            className="flex-1 text-sm"
          />
          <Button
            onClick={onCopyLink}
            variant="outline"
            size="sm"
            className={copied ? "bg-green-50 border-green-200 text-green-700" : ""}
          >
            {copied ? (
              <>
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('share.copied')}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                {t('share.copy')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
        <Button
          onClick={() => onPlatformShare(platforms[0])} // Facebook
          variant="outline"
          size="sm"
          className="flex-1"
        >
          {t('share.quickShare')}
        </Button>
        <Button
          onClick={() => onPlatformShare(platforms[1])} // Twitter
          variant="outline"
          size="sm"
          className="flex-1"
        >
          {t('share.tweet')}
        </Button>
      </div>
    </div>
  );
}

// Hook for easy sharing
export function useSocialShare() {
  const { toast } = useToast();

  const shareToSocial = async (
    platform: string,
    data: {
      title: string;
      content: string;
      url: string;
      hashtags?: string[];
    }
  ) => {
    const platformConfig = socialPlatforms.find(p => p.name.toLowerCase() === platform.toLowerCase());
    if (!platformConfig) {
      toast({
        title: "Platform not supported",
        description: `Sharing to ${platform} is not currently supported.`,
        variant: "destructive",
      });
      return;
    }

    const shareUrl = platformConfig.shareUrl({
      url: data.url,
      title: data.title,
      content: data.content,
      hashtags: data.hashtags?.join(','),
    });

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return {
    shareToSocial,
    copyToClipboard,
  };
}
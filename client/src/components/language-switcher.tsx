import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateLanguageMutation = useMutation({
    mutationFn: async (language: string) => {
      if (isAuthenticated) {
        // Update user preference in database
        await apiRequest("PUT", "/api/auth/user/language", { language });
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        // Invalidate user query to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update language preference",
        variant: "destructive",
      });
      console.error("Failed to update language:", error);
    },
  });

  const handleLanguageChange = async (language: string) => {
    console.log('=== LANGUAGE CHANGE START ===');
    console.log('Requested language:', language);
    console.log('Current i18n language before:', i18n.language);
    
    // Force language change immediately
    await i18n.changeLanguage(language);
    
    console.log('i18n language after change:', i18n.language);
    
    // Store in localStorage
    localStorage.setItem('vibesync-language', language);
    
    // Save to user profile
    if (isAuthenticated) {
      updateLanguageMutation.mutate(language);
    }
    
    console.log('=== LANGUAGE CHANGE COMPLETE ===');
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={className}>
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-fit min-w-[120px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{currentLanguage.flag}</span>
              <span className="hidden sm:inline">{currentLanguage.name}</span>
              <span className="sm:hidden">{currentLanguage.flag}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-96">
          {SUPPORTED_LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center gap-2">
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
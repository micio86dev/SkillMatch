import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Globe } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface LanguageSelectorProps {
  userId?: string;
  currentLanguage: string;
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export function LanguageSelector({ userId, currentLanguage }: LanguageSelectorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const updateLanguageMutation = useMutation({
    mutationFn: async (language: string) => {
      await apiRequest('PUT', '/api/auth/user/language', { language });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Success",
        description: "Language preference updated successfully!",
        variant: "success",
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
          window.location.href = "/api/auth/login";
        }, 500);
        return;
      }
      toast({
        title: "Error", 
        description: "Failed to update language preference. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleSave = () => {
    if (selectedLanguage !== currentLanguage) {
      updateLanguageMutation.mutate(selectedLanguage);
    }
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);
  const selectedLang = languages.find(lang => lang.code === selectedLanguage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Language Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language-select">Interface Language</Label>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your preferred language">
                {selectedLang && (
                  <span className="flex items-center space-x-2">
                    <span>{selectedLang.flag}</span>
                    <span>{selectedLang.name}</span>
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  <span className="flex items-center space-x-2">
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedLanguage !== currentLanguage && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Language will be changed from {currentLang?.flag} {currentLang?.name} to {selectedLang?.flag} {selectedLang?.name}
              </span>
            </div>
            <Button
              onClick={handleSave}
              disabled={updateLanguageMutation.isPending}
              size="sm"
            >
              {updateLanguageMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        )}

        <p className="text-sm text-slate-600 dark:text-slate-400">
          This will change the language for the entire interface. The change will take effect immediately.
        </p>
      </CardContent>
    </Card>
  );
}
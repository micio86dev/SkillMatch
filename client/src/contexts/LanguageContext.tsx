import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface LanguageContextType {
  changeLanguage: (language: string) => Promise<void>;
  currentLanguage: string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const updateLanguageMutation = useMutation({
    mutationFn: async (language: string) => {
      if (isAuthenticated) {
        await apiRequest('PUT', '/api/user/language', { language });
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      }
    }
  });

  // Initialize language based on user preference or browser locale
  useEffect(() => {
    const initializeLanguage = async () => {
      let targetLanguage = 'en'; // default

      if (isAuthenticated && user?.language) {
        // Use user's saved language preference
        targetLanguage = user.language;
      } else {
        // Use browser locale for non-authenticated users
        const browserLanguage = navigator.language.split('-')[0];
        const supportedLanguages = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'hi'];
        targetLanguage = supportedLanguages.includes(browserLanguage) ? browserLanguage : 'en';
      }

      if (i18n.language !== targetLanguage) {
        await i18n.changeLanguage(targetLanguage);
      }
    };

    initializeLanguage();
  }, [i18n, user, isAuthenticated]);

  const changeLanguage = async (language: string) => {
    // Change language immediately in i18n
    await i18n.changeLanguage(language);
    
    // Store in localStorage for browser persistence
    localStorage.setItem('i18nextLng', language);
    
    // If user is authenticated, save to their profile
    if (isAuthenticated) {
      updateLanguageMutation.mutate(language);
    }
  };

  return (
    <LanguageContext.Provider value={{
      changeLanguage,
      currentLanguage: i18n.language
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
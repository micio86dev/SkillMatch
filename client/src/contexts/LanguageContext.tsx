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
        await apiRequest('PUT', '/api/auth/user/language', { language });
      }
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      }
    }
  });

  // Initialize language on app start
  useEffect(() => {
    const initializeLanguage = async () => {
      // Check for manually saved language first
      const savedLanguage = localStorage.getItem('vibesync-language');
      
      let targetLanguage = 'en'; // default
      
      if (savedLanguage) {
        // Use manually selected language (highest priority)
        targetLanguage = savedLanguage;
        console.log('Using manually saved language:', targetLanguage);
      } else if (isAuthenticated && user?.language) {
        // Use user profile language as fallback
        targetLanguage = user.language;
        console.log('Using user profile language:', targetLanguage);
      }
      
      console.log('Initializing language to:', targetLanguage);
      await i18n.changeLanguage(targetLanguage);
    };

    initializeLanguage();
  }, [i18n, user, isAuthenticated]);

  const changeLanguage = async (language: string) => {
    console.log('LanguageContext: Changing language to:', language);
    
    // Change language immediately in i18n
    await i18n.changeLanguage(language);
    
    // Store in localStorage for browser persistence
    localStorage.setItem('vibesync-language', language);
    
    // If user is authenticated, save to their profile
    if (isAuthenticated) {
      updateLanguageMutation.mutate(language);
    }
    
    console.log('LanguageContext: Language changed to:', i18n.language);
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
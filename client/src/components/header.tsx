import { Code, User, Briefcase, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useState } from "react";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
            <Code className="text-white h-4 w-4" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            VibeSync
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/professionals" className="text-sm font-medium transition-colors hover:text-primary">
            {t('nav.professionals')}
          </Link>
          <Link href="/projects" className="text-sm font-medium transition-colors hover:text-primary">
            {t('nav.projects')}
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/messages" className="text-sm font-medium transition-colors hover:text-primary">
                {t('nav.messages')}
              </Link>
              <Link href="/profile" className="text-sm font-medium transition-colors hover:text-primary">
                {t('nav.profile')}
              </Link>
              <Link href="/preventives" className="text-sm font-medium transition-colors hover:text-primary">
                {t('nav.preventives')}
              </Link>
              {user?.userType === 'company' && (
                <Link href="/my-projects" className="text-sm font-medium transition-colors hover:text-primary">
                  {t('nav.myProjects')}
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          <ThemeToggle />
          {!isLoading && !isAuthenticated && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = "/auth/login"}
              >
                {t('auth.login')}
              </Button>
              <Button 
                size="sm"
                onClick={() => window.location.href = "/auth/login"}
              >
                <User className="mr-2 h-4 w-4" />
                {t('auth.signup')}
              </Button>
            </div>
          )}
          {isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
            >
              {t('auth.logout')}
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <LanguageSwitcher className="w-8" />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="h-9 w-9"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="sr-only">{t('common.toggleMenu')}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/professionals" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.professionals')}
              </Link>
              <Link 
                href="/projects" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.projects')}
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    href="/messages" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.messages')}
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Actions */}
            <div className="border-t pt-4 space-y-2">
              {!isLoading && !isAuthenticated && (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      window.location.href = "/auth/login";
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t('auth.login')}
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    onClick={() => {
                      window.location.href = "/auth/login";
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t('auth.signup')}
                  </Button>
                </>
              )}
              {isAuthenticated && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    window.location.href = "/api/logout";
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
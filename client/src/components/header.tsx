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
      <div className="navbar-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="navbar-brand flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
            <Code className="text-white h-4 w-4" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            VibeSync
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <Link href="/professionals" className="navbar-item text-foreground dark:text-white transition-colors hover:text-primary">
            {t('nav.professionals')}
          </Link>
          <Link href="/projects" className="navbar-item text-foreground dark:text-white transition-colors hover:text-primary">
            {t('nav.projects')}
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/messages" className="navbar-item text-foreground dark:text-white transition-colors hover:text-primary">
                {t('nav.messages')}
              </Link>
              <Link href="/profile" className="navbar-item text-foreground dark:text-white transition-colors hover:text-primary">
                {t('nav.profile')}
              </Link>
              <Link href="/preventives" className="navbar-item text-foreground dark:text-white transition-colors hover:text-primary">
                {t('nav.preventives')}
              </Link>
              {user?.userType === 'company' && (
                <Link href="/my-projects" className="navbar-item text-foreground dark:text-white transition-colors hover:text-primary">
                  {t('nav.myProjects')}
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
          <LanguageSwitcher />
          <ThemeToggle />
          {!isLoading && !isAuthenticated && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = "/login"}
                className="text-foreground dark:text-white"
              >
                {t('auth.login')}
              </Button>
              <Button 
                size="sm"
                onClick={() => window.location.href = "/login"}
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
              className="text-foreground dark:text-white border-border dark:border-slate-600"
            >
              {t('auth.logout')}
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center navbar-mobile-actions">
          <LanguageSwitcher className="w-8" />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="h-9 w-9 text-foreground dark:text-white"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="sr-only">{t('common.toggleMenu')}</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="navbar-mobile-menu">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/professionals" 
                className="mobile-menu-item text-foreground dark:text-white transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.professionals')}
              </Link>
              <Link 
                href="/projects" 
                className="mobile-menu-item text-foreground dark:text-white transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.projects')}
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    href="/messages" 
                    className="mobile-menu-item text-foreground dark:text-white transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.messages')}
                  </Link>
                  <Link 
                    href="/profile" 
                    className="mobile-menu-item text-foreground dark:text-white transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link 
                    href="/preventives" 
                    className="mobile-menu-item text-foreground dark:text-white transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.preventives')}
                  </Link>
                  {user?.userType === 'company' && (
                    <Link 
                      href="/my-projects" 
                      className="mobile-menu-item text-foreground dark:text-white transition-colors hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.myProjects')}
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Mobile Actions */}
            <div className="border-t pt-4 mt-4 space-y-3">
              {!isLoading && !isAuthenticated && (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-foreground dark:text-white"
                    onClick={() => {
                      window.location.href = "/login";
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t('auth.login')}
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    onClick={() => {
                      window.location.href = "/login";
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
                  className="w-full justify-start text-foreground dark:text-white border-border dark:border-slate-600"
                  onClick={() => {
                    window.location.href = "/api/logout";
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t('auth.logout')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
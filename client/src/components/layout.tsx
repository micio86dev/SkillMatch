import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Code, Menu, X, Bell, MessageSquare, User, Briefcase, Users, Home, Building2, ChevronDown, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications";

interface LayoutProps {
  children: React.ReactNode;
}

// Unread messages badge component
function UnreadMessagesBadge() {
  const { data: unreadCount } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const count = (unreadCount as any)?.count || 0;
  if (!count || count === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-1">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navigation = isAuthenticated ? [
    { name: t('nav.professionals'), href: '/professionals', icon: Users },
    { name: t('nav.projects'), href: '/projects', icon: Briefcase },
    ...(user?.userType === 'professional' ? [{ name: t('nav.subscriptions'), href: '/subscriptions', icon: Bell }] : []),
    { name: t('nav.companies'), href: '/companies', icon: Building2 },
    { name: t('nav.careerInsights'), href: '/career-insights', icon: Code },
    { name: t('nav.messages'), href: '/messages', icon: MessageSquare },
  ] : [
    { name: t('nav.professionals'), href: '/professionals' },
    { name: t('nav.projects'), href: '/projects' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto navbar-container">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="navbar-brand flex items-center space-x-3">
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 32 32" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="url(#logoGradient)" />
                <path 
                  d="M8 12a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2v-8zM18 12a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2v-8z" 
                  fill="white" 
                  opacity="0.9"
                />
                <circle cx="12" cy="16" r="2" fill="white" />
                <circle cx="22" cy="16" r="2" fill="white" />
                <path 
                  d="M14 16h4" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VibeSync
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "navbar-item font-medium transition-colors relative",
                    location === item.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-foreground dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  {item.name}
                  {item.href === '/messages' && <UnreadMessagesBadge />}
                </Link>
              ))}
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-3 lg:space-x-4">
              {/* Notifications (only for authenticated users) */}
              {isAuthenticated && <NotificationBell />}
              
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="p-2 text-foreground dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-secondary transition-colors"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 text-foreground dark:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>

              {/* Auth buttons */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-foreground dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-secondary transition-colors">
                        {user?.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span className="hidden lg:block max-w-24 truncate">{user?.firstName || user?.email}</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center space-x-2 text-foreground dark:text-white">
                          <User className="h-4 w-4" />
                          <span>{t('nav.profile')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        onClick={() => window.location.href = "/api/logout"}
                        className="text-red-600 dark:text-red-400"
                      >
                        {t('auth.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild className="text-foreground dark:text-white">
                    <Link href="/login">{t('auth.login')}</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">{t('auth.signup')}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-card">
              <div className="navbar-mobile-menu">
                <div className="space-y-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "mobile-menu-item block transition-colors",
                        location === item.href
                          ? "text-blue-600 dark:text-blue-400 font-medium"
                          : "text-foreground dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Mobile auth section */}
                {!isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-foreground dark:text-white"
                      asChild
                    >
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        {t('auth.login')}
                      </Link>
                    </Button>
                    <Button
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        {t('auth.signup')}
                      </Link>
                    </Button>
                  </div>
                )}

                {isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <Link 
                      href="/profile" 
                      className="mobile-menu-item block text-foreground dark:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.profile')}
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 dark:text-red-400"
                      onClick={() => {
                        window.location.href = "/api/logout";
                        setMobileMenuOpen(false);
                      }}
                    >
                      {t('auth.logout')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  );
}
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Code, Menu, X, Bell, MessageSquare, User, Briefcase, Users, Home, Building2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navigation = isAuthenticated ? [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Professionals', href: '/professionals', icon: Users },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
  ] : [
    { name: 'Browse Talent', href: '/professionals' },
    { name: 'Find Projects', href: '/projects' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
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
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "font-medium transition-colors",
                    location === item.href
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Notifications (only for authenticated users) */}
              {isAuthenticated && <NotificationBell />}
              
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="p-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>


              {/* Auth buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/auth/logout', {
                          method: 'POST',
                          credentials: 'include',
                        });
                        if (response.ok) {
                          window.location.href = '/auth/login';
                        }
                      } catch (error) {
                        console.error('Logout failed:', error);
                      }
                    }}
                    className="text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = "/auth/login"}
                    className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = "/auth/signup"}
                    className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 font-medium shadow-sm transition-colors"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-4 py-2 font-medium transition-colors rounded-lg",
                      location === item.href
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}

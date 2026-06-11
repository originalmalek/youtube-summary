'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Settings,
  FileText,
  LogOut,
  LogIn,
  UserPlus,
  Plus,
  Archive,
  Coins
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuthStore } from '@/lib/stores/auth-store';
import { ModeToggle } from '@/components/mode-toggle';
import { getUserUsage, UsageStats } from '@/lib/api/user';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const handleSummariesClick = () => {
    if (pathname === '/summaries') {
      // Dispatch custom event to trigger data refresh
      window.dispatchEvent(new CustomEvent('refreshSummaries'));
    } else {
      router.push('/summaries');
    }
  };

  const handleMobileSummariesClick = () => {
    setIsMobileMenuOpen(false);
    handleSummariesClick();
  };

  const handleMobileArchivedClick = (e: React.MouseEvent) => {
    setIsMobileMenuOpen(false);
    if (pathname === '/archived') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('refreshArchivedSummaries'));
    }
  };

  // Fetch usage stats when authenticated
  useEffect(() => {
    const fetchUsage = async () => {
      if (!isAuthenticated) {
        setUsage(null);
        return;
      }

      setIsLoadingUsage(true);
      try {
        const data = await getUserUsage();
        setUsage(data);
      } catch (error) {
        console.error('Failed to fetch usage stats:', error);
        // Set fallback usage data
        setUsage({
          used: 0,
          limit: 0,
          remaining: 0,
          reset_date: new Date().toISOString(),
          percentage: 0,
          user_type: 'free'
        });
      } finally {
        setIsLoadingUsage(false);
      }
    };

    fetchUsage();

    // Listen for usage updates
    const handleUsageUpdate = () => {
      fetchUsage();
    };

    window.addEventListener('usageUpdated', handleUsageUpdate);
    return () => window.removeEventListener('usageUpdated', handleUsageUpdate);
  }, [isAuthenticated]);

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <img 
                  src="/images/logo.png" 
                  alt="Summar.me Logo" 
                  className="w-8 h-8 object-contain"
                />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  SummarMe
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">

            {isAuthenticated ? (
              <>
                {/* Authenticated Navigation */}

                {/* Usage Display */}
                {usage && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isLoadingUsage ? '...' : `${usage.remaining} points left`}
                    </span>
                  </div>
                )}

                <Link href="/create-summary">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Summary</span>
                  </Button>
                </Link>

                <Button
                  variant={pathname === '/summaries' ? 'secondary' : 'ghost'}
                  className="flex items-center space-x-2"
                  onClick={handleSummariesClick}
                >
                  <FileText className="h-4 w-4" />
                  <span>Summaries</span>
                </Button>

                {/* Theme Toggle */}
                <ModeToggle />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/archived" 
                        className="flex items-center space-x-2"
                        onClick={(e) => {
                          if (pathname === '/archived') {
                            e.preventDefault();
                            window.dispatchEvent(new CustomEvent('refreshArchivedSummaries'));
                          }
                        }}
                      >
                        <Archive className="h-4 w-4" />
                        <span>Archived Summaries</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Unauthenticated Navigation */}
                <ModeToggle />
                
                <Link href="/login">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                
                <Link href="/register">
                  <Button className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile header actions */}
          <div className="md:hidden flex items-center space-x-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">

            {isAuthenticated ? (
              <>
                {/* Authenticated Mobile Navigation */}

                {/* Usage Display */}
                {usage && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md mx-2">
                    <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isLoadingUsage ? '...' : `${usage.remaining} points left`}
                    </span>
                  </div>
                )}

                <Link href="/create-summary" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Summary</span>
                  </Button>
                </Link>
                
                <Button 
                  variant={pathname === '/summaries' ? 'secondary' : 'ghost'} 
                  className="w-full justify-start space-x-2"
                  onClick={handleMobileSummariesClick}
                >
                  <FileText className="h-4 w-4" />
                  <span>Summaries</span>
                </Button>
                
                <Link href="/archived" onClick={handleMobileArchivedClick}>
                  <Button 
                    variant={pathname === '/archived' ? 'secondary' : 'ghost'} 
                    className="w-full justify-start space-x-2"
                  >
                    <Archive className="h-4 w-4" />
                    <span>Archived Summaries</span>
                  </Button>
                </Link>
                
                <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                </Link>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Unauthenticated Mobile Navigation */}
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-start space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Register</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
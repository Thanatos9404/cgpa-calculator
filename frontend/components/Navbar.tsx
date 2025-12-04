'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Moon, Sun, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

interface NavbarProps {
  isDark?: boolean;
  onThemeToggle?: () => void;
}

export default function Navbar({ isDark = false, onThemeToggle }: NavbarProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const getBreadcrumbs = () => {
    if (!pathname) return ['Dashboard'];

    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return label;
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
  };

  return (
    <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-neutral-400">/</span>}
            <span
              className={
                index === breadcrumbs.length - 1
                  ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-600 dark:text-neutral-400'
              }
            >
              {crumb}
            </span>
          </div>
        ))}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search courses..."
            className="pl-10 pr-4 py-2 w-64 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>

        {/* Theme Toggle */}
        {onThemeToggle && (
          <button
            onClick={onThemeToggle}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>
        )}

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'G'}
              </div>
            )}
          </button>

          {showProfileMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-2 z-20">
                <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {isAuthenticated ? user?.full_name : 'Guest User'}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {isAuthenticated ? user?.email : 'Not logged in'}
                  </p>
                </div>

                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Settings</span>
                </Link>

                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-primary-600 dark:text-primary-400"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


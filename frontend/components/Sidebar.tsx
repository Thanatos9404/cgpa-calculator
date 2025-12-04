'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Users, label: 'Compare', href: '/dashboard/compare' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                CGPA Calculator
              </h1>
              <span className="text-xs shimmer-text font-medium">by Y.T</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          )}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <User className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            {!collapsed && (
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Guest Mode
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Not logged in
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      {isAuthenticated && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      )}
    </motion.aside>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearSession } from '@/lib/storage';

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [scale, setScale] = useState('10');

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('auto');
    }

    const savedScale = localStorage.getItem('grading-scale');
    if (savedScale) {
      setScale(savedScale);
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Trigger a storage event to sync with other components
    window.dispatchEvent(new Event('storage'));
  };

  const handleScaleChange = (newScale: string) => {
    setScale(newScale);
    localStorage.setItem('grading-scale', newScale);
  };

  const handleExportJSON = () => {
    const session = localStorage.getItem('cgpa-session');
    if (!session) {
      alert('No data to export');
      return;
    }

    const blob = new Blob([session], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cgpa-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          const parsed = JSON.parse(json);
          localStorage.setItem('cgpa-session', json);
          alert('Data imported successfully! Refreshing...');
          window.location.href = '/dashboard';
        } catch (error) {
          alert('Failed to import file. Please check the format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearSession();
      alert('All data cleared! Redirecting...');
      router.push('/dashboard');
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Grading Scale */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold mb-4">Grading Scale</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Default Scale
                </label>
                <select
                  value={scale}
                  onChange={(e) => handleScaleChange(e.target.value)}
                  className="w-full p-3 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg"
                >
                  <option value="10">10-Point Scale (BIT Mesra)</option>
                  <option value="4">4-Point Scale (GPA)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold mb-4">Data Management</h2>
            <div className="space-y-3">
              <button
                onClick={handleExportJSON}
                className="w-full p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors text-left font-medium"
              >
                📥 Export All Data (JSON)
              </button>
              <button
                onClick={handleImport}
                className="w-full p-3 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors text-left font-medium"
              >
                📤 Import from File
              </button>
              <button
                onClick={handleClearAll}
                className="w-full p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-left font-medium"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-3 rounded-lg font-medium transition-all ${theme === 'light'
                        ? 'bg-primary-600 text-white ring-2 ring-primary-500'
                        : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                      }`}
                  >
                    ☀️ Light
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-3 rounded-lg font-medium transition-all ${theme === 'dark'
                        ? 'bg-primary-600 text-white ring-2 ring-primary-500'
                        : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                      }`}
                  >
                    🌙 Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange('auto')}
                    className={`p-3 rounded-lg font-medium transition-all ${theme === 'auto'
                        ? 'bg-primary-600 text-white ring-2 ring-primary-500'
                        : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                      }`}
                  >
                    🔄 Auto
                  </button>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {theme === 'auto'
                    ? 'Theme follows your system preferences'
                    : `Currently using ${theme} mode`}
                </p>
              </div>
            </div>
          </div>

          {/* Account (Guest Mode) */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <div className="p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Currently using: <strong>Guest Mode</strong>
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                Your data is stored locally on this device only. Use Export/Import to transfer data between devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

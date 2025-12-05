'use client';

import { Session } from '@/types/schema';
import { calculateStatistics } from '@/lib/statistics';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export default function StatisticsPanel({ session }: { session: Session }) {
  const stats = calculateStatistics(session);

  // Count semesters with data (either courses or manual)
  const semestersWithData = session.semesters.filter(s =>
    s.courses.length > 0 || (s.manualGPA !== null && s.manualGPA !== undefined)
  ).length;

  const trendColor = stats.trendDirection === 'improving'
    ? 'text-green-600 dark:text-green-400'
    : stats.trendDirection === 'declining'
      ? 'text-red-600 dark:text-red-400'
      : 'text-neutral-600 dark:text-neutral-400';

  const trendIcon = stats.trendDirection === 'improving' ? '📈' : stats.trendDirection === 'declining' ? '📉' : '📊';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card p-6 rounded-xl mb-8"
    >
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        Academic Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {stats.totalCourses > 0 ? 'Total Courses' : 'Semesters'}
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {stats.totalCourses > 0 ? stats.totalCourses : semestersWithData}
          </p>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Credits</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalCredits}</p>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Highest Semester</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.highestSemesterGPA?.toFixed(2) ?? 'N/A'}
          </p>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Lowest Semester</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.lowestSemesterGPA?.toFixed(2) ?? 'N/A'}
          </p>
        </div>
      </div>

      <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg mb-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Performance Trend</p>
        <p className={`text-lg font-semibold flex items-center gap-2 ${trendColor}`}>
          <span>{trendIcon}</span>
          {stats.trendDirection.charAt(0).toUpperCase() + stats.trendDirection.slice(1)}
        </p>
      </div>

      {Object.keys(stats.gradeDistribution).length > 0 ? (
        <div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Grade Distribution</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {grade}: {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : semestersWithData > 0 ? (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-300">
          ⚡ Using manual GPA entries - add courses for detailed grade breakdown
        </div>
      ) : null}
    </motion.div>
  );
}


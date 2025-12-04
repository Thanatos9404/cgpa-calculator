'use client';

import { useState, useEffect } from 'react';
import { Session } from '@/types/schema';
import { loadSession } from '@/lib/storage';
import {
  getCGPATimeline,
  getGradeDistribution,
  getCreditsBreakdown,
  getSemesterComparison,
  getTopCourses,
  getProgressMetrics
} from '@/lib/chartData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function AnalyticsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'semester'>('all');

  useEffect(() => {
    const loaded = loadSession();
    if (loaded) {
      setSession(loaded);
    }
  }, []);

  if (!session || session.semesters.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Analytics & Charts
          </h1>

          <div className="bg-white dark:bg-neutral-800 p-12 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 text-center">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              No Data to Display
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Add some semesters and courses to see beautiful analytics
            </p>
            <a href="/dashboard" className="btn-primary inline-block">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const cgpaTimeline = getCGPATimeline(session);
  const gradeDistribution = getGradeDistribution(session);
  const creditsBreakdown = getCreditsBreakdown(session);
  const semesterComparison = getSemesterComparison(session);
  const topCourses = getTopCourses(session, 10);
  const progressMetrics = getProgressMetrics(session);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Analytics & Insights
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Visual analysis of your academic performance
          </p>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl text-white shadow-lg">
            <p className="text-primary-100 text-sm mb-1">Degree Progress</p>
            <p className="text-4xl font-bold">{progressMetrics.percentage}%</p>
            <p className="text-primary-100 text-xs mt-2">
              {progressMetrics.completedCredits} / {progressMetrics.totalCredits} credits
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-1">Total Semesters</p>
            <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              {session.semesters.length}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-1">Courses Completed</p>
            <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              {progressMetrics.coursesCompleted}
            </p>
            <p className="text-neutral-500 text-xs mt-2">
              of {progressMetrics.totalCourses} total
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-1">Credits Earned</p>
            <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              {progressMetrics.completedCredits}
            </p>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CGPA Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700"
          >
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              CGPA Timeline
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cgpaTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  domain={[0, session.metadata.scale || 10]}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="CGPA"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Semester GPA"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Grade Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700"
          >
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Grade Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Credits Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700"
          >
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Credits Progress
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="90%"
                data={[{
                  name: 'Progress',
                  value: progressMetrics.percentage,
                  fill: '#6366f1'
                }]}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-4xl font-bold fill-neutral-900 dark:fill-neutral-100"
                >
                  {progressMetrics.percentage}%
                </text>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {progressMetrics.completedCredits} of {progressMetrics.totalCredits} credits completed
              </p>
            </div>
          </motion.div>

          {/* Semester Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700"
          >
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Semester Comparison
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={semesterComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  domain={[0, session.metadata.scale || 10]}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="GPA" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Courses */}
          {topCourses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 lg:col-span-2"
            >
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Top Performing Courses
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCourses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    type="number"
                    domain={[0, session.metadata.scale || 10]}
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={200}
                    stroke="#9ca3af"
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="Grade Point" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

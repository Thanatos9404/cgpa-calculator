'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Target, BarChart3, Award, Zap, Lock, Globe, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Calculator className="w-8 h-8" />,
      title: 'Smart CGPA Calculation',
      description: 'Automatic GPA calculation with 10-point and 4-point scale support',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Visual Analytics',
      description: 'Beautiful charts showing your academic progress over time',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Target Planning',
      description: 'Calculate what grades you need to achieve your target CGPA',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Performance Tracking',
      description: 'Track trends, identify strengths, and improve weak areas',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Peer Comparison',
      description: 'Compare your performance with classmates anonymously',
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Privacy First',
      description: 'Your data stays on your device - 100% offline capable',
    },
  ];

  const steps = [
    {
      step: '1',
      title: 'Add Your Semesters',
      description: 'Create semesters and add courses with grades or marks',
    },
    {
      step: '2',
      title: 'Track Performance',
      description: 'View your CGPA, charts, and detailed analytics',
    },
    {
      step: '3',
      title: 'Plan Ahead',
      description: 'Use target calculators to plan your academic goals',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-100 dark:from-neutral-950 dark:via-primary-950/20 dark:to-neutral-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary-500/20 to-primary-700/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                Track Your Academic
              </span>
              <br />
              <span className="text-neutral-900 dark:text-neutral-100">
                Journey with Ease
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-3xl mx-auto">
              The most powerful CGPA calculator designed for students. Beautiful charts, smart planning, and complete privacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Continue as Guest
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/auth"
                className="px-8 py-4 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-neutral-200 dark:border-neutral-700"
              >
                Sign Up / Login
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>No Ads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span>Privacy First</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Powerful features to manage and improve your academic performance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-neutral-200 dark:border-neutral-700"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-300" />
                  )}
                </div>
                <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Excel in Your Studies?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of students tracking their academic journey
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-900 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-neutral-400">
            <p className="mb-2">© 2025 CGPA Calculator. All rights reserved.</p>
            <p className="text-sm">Privacy-first academic tracking for students everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

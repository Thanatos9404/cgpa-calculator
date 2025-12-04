'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Plus, BarChart3, Target, Download, HelpCircle } from 'lucide-react';

const ONBOARDING_KEY = 'cgpa_onboarding_complete';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to CGPA Calculator! 👋',
    description: 'Track your academic performance, calculate your CGPA, and analyze your progress across semesters.',
    icon: <div className="text-4xl">📊</div>,
    tip: 'Your data is saved automatically in your browser - no account needed!',
  },
  {
    title: 'Add Semesters & Courses',
    description: 'Click "Add Semester" to create a new semester, then add your courses with grades or marks.',
    icon: <Plus className="w-12 h-12 text-primary-500" />,
    tip: 'You can enter grades as letters (A, B, C) or marks (0-100).',
  },
  {
    title: 'View Statistics',
    description: 'See your total courses, credits, highest/lowest semesters, and performance trends.',
    icon: <BarChart3 className="w-12 h-12 text-primary-500" />,
    tip: 'Check Analytics page for detailed charts and graphs!',
  },
  {
    title: 'Set Target CGPA',
    description: 'Calculate what grades you need in future semesters to achieve your target CGPA.',
    icon: <Target className="w-12 h-12 text-primary-500" />,
    tip: 'Great for planning your study strategy!',
  },
  {
    title: 'Export Your Data',
    description: 'Export your data as JSON or CSV for backup or to use in spreadsheets.',
    icon: <Download className="w-12 h-12 text-primary-500" />,
    tip: 'You can also import data from your backup files.',
  },
];

export default function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      setHasSeenOnboarding(false);
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOpenTutorial = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  return (
    <>
      {/* Help Button - Fixed bottom right */}
      <button
        onClick={handleOpenTutorial}
        className="fixed bottom-6 right-6 z-40 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
        title="Show Tutorial"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleSkip}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>

              {/* Content */}
              <div className="p-6 pt-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center"
                  >
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      {steps[currentStep].icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      {steps[currentStep].title}
                    </h2>

                    {/* Description */}
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      {steps[currentStep].description}
                    </p>

                    {/* Tip */}
                    {steps[currentStep].tip && (
                      <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm p-3 rounded-lg">
                        💡 {steps[currentStep].tip}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 py-4">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentStep
                        ? 'bg-primary-600 w-6'
                        : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${currentStep === 0
                      ? 'text-neutral-400 cursor-not-allowed'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <button onClick={handleSkip} className="text-neutral-500 text-sm hover:underline">
                  Skip
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  {currentStep === steps.length - 1 ? (
                    'Get Started'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

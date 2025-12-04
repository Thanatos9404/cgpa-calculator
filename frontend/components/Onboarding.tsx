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
    title: 'Welcome! 👋',
    description: 'Track your CGPA, analyze progress across semesters.',
    icon: <div className="text-3xl">📊</div>,
    tip: 'Data saved in browser - no account needed!',
  },
  {
    title: 'Add Courses',
    description: 'Click "Add Semester" then add courses with grades.',
    icon: <Plus className="w-10 h-10 text-primary-500" />,
    tip: 'Enter letters (A, B) or marks (0-100).',
  },
  {
    title: 'Statistics',
    description: 'View total credits, trends, and performance.',
    icon: <BarChart3 className="w-10 h-10 text-primary-500" />,
    tip: 'Check Analytics for detailed charts!',
  },
  {
    title: 'Target CGPA',
    description: 'Calculate grades needed for your target.',
    icon: <Target className="w-10 h-10 text-primary-500" />,
    tip: 'Great for study planning!',
  },
  {
    title: 'Export Data',
    description: 'Export as JSON or CSV for backup.',
    icon: <Download className="w-10 h-10 text-primary-500" />,
    tip: 'Import from backup anytime.',
  },
];

export default function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
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
        className="fixed bottom-4 right-4 z-40 p-2.5 sm:p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
        title="Show Tutorial"
      >
        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
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

            {/* Modal - Mobile optimized */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden
                         inset-4 sm:inset-auto
                         sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                         sm:max-w-sm sm:w-full
                         flex flex-col max-h-[calc(100vh-2rem)]"
            >
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-2 right-2 p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 pt-8 sm:p-6 sm:pt-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center"
                  >
                    {/* Icon */}
                    <div className="flex justify-center mb-3">
                      {steps[currentStep].icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                      {steps[currentStep].title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      {steps[currentStep].description}
                    </p>

                    {/* Tip */}
                    {steps[currentStep].tip && (
                      <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs p-2 rounded-lg">
                        💡 {steps[currentStep].tip}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 py-2 border-t border-neutral-100 dark:border-neutral-800">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === currentStep
                        ? 'bg-primary-600 w-4'
                        : 'bg-neutral-300 dark:bg-neutral-600 w-1.5'
                      }`}
                  />
                ))}
              </div>

              {/* Navigation - Always visible */}
              <div className="flex items-center justify-between p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${currentStep === 0
                      ? 'text-neutral-400 cursor-not-allowed'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>

                <button onClick={handleSkip} className="text-neutral-500 text-xs hover:underline px-2">
                  Skip
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  {currentStep === steps.length - 1 ? (
                    "Let's Go!"
                  ) : (
                    <>
                      <span className="hidden sm:inline">Next</span>
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

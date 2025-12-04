// Add these components at the end of page.tsx (after CourseForm component)

// Statistics Panel Component
function StatisticsPanel({ session }: { session: Session }) {
  const stats = calculateStatistics(session);

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
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Courses</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.totalCourses}</p>
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

      <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Performance Trend</p>
        <p className={`text-lg font-semibold flex items-center gap-2 ${trendColor}`}>
          <span>{trendIcon}</span>
          {stats.trendDirection.charAt(0).toUpperCase() + stats.trendDirection.slice(1)}
        </p>
      </div>

      <div className="mt-4">
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
    </motion.div>
  );
}

// Target Calculator Panel Component
function TargetCalculatorPanel({ session }: { session: Session }) {
  const [targetCGPA, setTargetCGPA] = useState('');
  const [remainingCredits, setRemainingCredits] = useState('');
  const [result, setResult] = useState<ReturnType<typeof calculateTargetGPA> | null>(null);

  const handleCalculate = () => {
    const target = parseFloat(targetCGPA);
    const credits = parseFloat(remainingCredits);

    if (isNaN(target) || isNaN(credits) || target <= 0 || credits <= 0) {
      alert('Please enter valid positive numbers');
      return;
    }

    const maxScale = session.metadata.scale || 10;
    if (target > maxScale) {
      alert(`Target CGPA cannot exceed ${maxScale}`);
      return;
    }

    const calculation = calculateTargetGPA(session, target, credits);
    setResult(calculation);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card p-6 rounded-xl mb-8"
    >
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        Target CGPA Calculator
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm text-neutral-600 dark:text-neutral-400">Target CGPA</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={session.metadata.scale || 10}
            value={targetCGPA}
            onChange={(e) => setTargetCGPA(e.target.value)}
            className="input-field"
            placeholder="9.0"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-600 dark:text-neutral-400">Remaining Credits</label>
          <input
            type="number"
            step="1"
            min="0"
            value={remainingCredits}
            onChange={(e) => setRemainingCredits(e.target.value)}
            className="input-field"
            placeholder="40"
          />
        </div>
        <div className="flex items-end">
          <button onClick={handleCalculate} className="btn-primary w-full">
            Calculate
          </button>
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Current CGPA</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {result.currentCGPA.toFixed(2)}
              </p>
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Required GPA</p>
              <p className={`text-2xl font-bold ${result.feasible ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'}`}>
                {result.requiredGPA.toFixed(2)}
              </p>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${result.feasible
              ? 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700'
              : 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700'
            }`}>
            <p className={`text-sm font-medium ${result.feasible
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
              }`}>
              {result.message}
            </p>
          </div>

          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            <p>Credits completed: {result.creditsCompleted}</p>
            <p>Credits remaining: {result.creditsRemaining}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

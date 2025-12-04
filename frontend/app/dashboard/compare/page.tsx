'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, Plus, Trash2, Trophy, TrendingUp, Award } from 'lucide-react';

interface PeerData {
  id: string;
  name: string;
  cgpa: number;
  semesters: Array<{
    name: string;
    gpa: number;
  }>;
}

export default function ComparePage() {
  const [peers, setPeers] = useState<PeerData[]>([]);
  const [isAddingPeer, setIsAddingPeer] = useState(false);
  const [myData, setMyData] = useState<PeerData | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const storedPeers = localStorage.getItem('peer-comparison-data');
    if (storedPeers) {
      setPeers(JSON.parse(storedPeers));
    }

    // Load user's data
    const session = localStorage.getItem('cgpa-session');
    if (session) {
      const parsed = JSON.parse(session);
      const myCGPA = calculateCGPA(parsed.semesters);
      const mySemesters = parsed.semesters.map((sem: any, idx: number) => ({
        name: sem.name || `Semester ${idx + 1}`,
        gpa: calculateSemesterGPA(sem.courses) || 0,
      }));

      setMyData({
        id: 'me',
        name: 'You',
        cgpa: myCGPA,
        semesters: mySemesters,
      });
    }
  }, []);

  // Save peers when they change
  useEffect(() => {
    localStorage.setItem('peer-comparison-data', JSON.stringify(peers));
  }, [peers]);

  const calculateCGPA = (semesters: any[]): number => {
    if (!semesters || semesters.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    semesters.forEach(sem => {
      sem.courses.forEach((course: any) => {
        if (course.gradePoint !== null && course.gradePoint !== undefined) {
          totalPoints += course.gradePoint * course.credits;
          totalCredits += course.credits;
        }
      });
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const calculateSemesterGPA = (courses: any[]): number => {
    if (!courses || courses.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      if (course.gradePoint !== null && course.gradePoint !== undefined) {
        totalPoints += course.gradePoint * course.credits;
        totalCredits += course.credits;
      }
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const addPeer = (peer: PeerData) => {
    setPeers([...peers, peer]);
    setIsAddingPeer(false);
  };

  const deletePeer = (id: string) => {
    setPeers(peers.filter(p => p.id !== id));
  };

  // Calculate rankings
  const allData = myData ? [myData, ...peers] : peers;
  const sortedByRank = [...allData].sort((a, b) => b.cgpa - a.cgpa);
  const myRank = myData ? sortedByRank.findIndex(p => p.id === 'me') + 1 : null;

  // Prepare semester comparison data
  const maxSemesters = Math.max(...allData.map(p => p.semesters.length), 0);
  const semesterComparisonData = Array.from({ length: maxSemesters }, (_, i) => {
    const dataPoint: any = { name: `Sem ${i + 1}` };
    allData.forEach(peer => {
      if (peer.semesters[i]) {
        dataPoint[peer.name] = peer.semesters[i].gpa;
      }
    });
    return dataPoint;
  });

  if (allData.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Compare with Peers
          </h1>

          <div className="bg-white dark:bg-neutral-800 p-12 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 text-center">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>

            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              No Data Yet
            </h2>

            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Add some courses in your dashboard first, then come back here to compare!
            </p>

            <a href="/dashboard" className="btn-primary inline-block">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Peer Comparison
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Compare your performance with friends
            </p>
          </div>

          <button
            onClick={() => setIsAddingPeer(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Peer
          </button>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl text-white shadow-lg"
          >
            <Trophy className="w-8 h-8 mb-2" />
            <p className="text-primary-100 text-sm mb-1">Your Rank</p>
            <p className="text-4xl font-bold">{myRank ? `#${myRank}` : 'N/A'}</p>
            <p className="text-primary-100 text-xs mt-2">out of {allData.length}</p>
          </motion.div>

          {myData && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <Award className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-2" />
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">Your CGPA</p>
                <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                  {myData.cgpa.toFixed(2)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-1">Top Performer</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {sortedByRank[0].name}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {sortedByRank[0].cgpa.toFixed(2)} CGPA
                </p>
              </motion.div>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* CGPA Comparison */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              CGPA Rankings
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedByRank} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis type="number" domain={[0, 10]} stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" width={100} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="cgpa" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Semester-wise Comparison */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Semester-wise Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={semesterComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis domain={[0, 10]} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                {allData.map((peer, idx) => (
                  <Line
                    key={peer.id}
                    type="monotone"
                    dataKey={peer.name}
                    stroke={peer.id === 'me' ? '#6366f1' : `hsl(${idx * 360 / allData.length}, 70%, 50%)`}
                    strokeWidth={peer.id === 'me' ? 3 : 2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peer List */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            All Peers
          </h2>

          <div className="space-y-3">
            {sortedByRank.map((peer, idx) => (
              <div
                key={peer.id}
                className="flex items-center justify-between p-4 bg-neutral-100 dark:bg-neutral-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {peer.name}
                      {peer.id === 'me' && (
                        <span className="ml-2 text-xs bg-primary-600 text-white px-2 py-1 rounded">You</span>
                      )}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {peer.semesters.length} semesters
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {peer.cgpa.toFixed(2)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">CGPA</p>
                  </div>

                  {peer.id !== 'me' && (
                    <button
                      onClick={() => deletePeer(peer.id)}
                      className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Peer Modal */}
        {isAddingPeer && (
          <AddPeerModal
            onAdd={addPeer}
            onCancel={() => setIsAddingPeer(false)}
          />
        )}
      </div>
    </div>
  );
}

function AddPeerModal({
  onAdd,
  onCancel,
}: {
  onAdd: (peer: PeerData) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [semesters, setSemesters] = useState<Array<{ name: string; gpa: string }>>([
    { name: 'Semester 1', gpa: '' },
  ]);

  const addSemester = () => {
    setSemesters([...semesters, { name: `Semester ${semesters.length + 1}`, gpa: '' }]);
  };

  const updateSemester = (index: number, field: 'name' | 'gpa', value: string) => {
    const updated = [...semesters];
    updated[index][field] = value;
    setSemesters(updated);
  };

  const handleSubmit = () => {
    if (!name || !cgpa) {
      alert('Please enter peer name and CGPA');
      return;
    }

    const parsedCGPA = parseFloat(cgpa);
    if (isNaN(parsedCGPA) || parsedCGPA < 0 || parsedCGPA > 10) {
      alert('Please enter valid CGPA (0-10)');
      return;
    }

    const parsedSemesters = semesters
      .filter(s => s.gpa)
      .map(s => ({
        name: s.name,
        gpa: parseFloat(s.gpa) || 0,
      }));

    onAdd({
      id: `peer-${Date.now()}`,
      name,
      cgpa: parsedCGPA,
      semesters: parsedSemesters,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Add Peer
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Peer Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                CGPA *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="input-field"
                placeholder="8.50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Semester GPAs (Optional)
                </label>
                <button onClick={addSemester} className="btn-secondary text-xs p-2">
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {semesters.map((sem, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={sem.name}
                      onChange={(e) => updateSemester(idx, 'name', e.target.value)}
                      className="input-field flex-1"
                      placeholder="Semester name"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={sem.gpa}
                      onChange={(e) => updateSemester(idx, 'gpa', e.target.value)}
                      className="input-field w-24"
                      placeholder="GPA"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSubmit} className="btn-primary flex-1">
              Add Peer
            </button>
            <button onClick={onCancel} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

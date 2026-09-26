import React, { useEffect, useState } from 'react';
import { API_URL } from '../api';

export default function PerformanceAnalytics({ username }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    if (!username) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/api/performance/report/${encodeURIComponent(username)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Failed to load performance report.'
        );
      }

      setReport(data);
    } catch (err) {
      console.error('Performance report error:', err);

      setError(
        err.message || 'Could not load performance analytics.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [username]);

  if (loading) {
    return (
      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6">
        <p className="text-xs text-[#a8a29e]">
          Loading performance analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1c1917] border border-red-900/50 rounded-2xl p-6">
        <p className="text-xs text-red-400">
          ⚠️ {error}
        </p>

        <button
          onClick={fetchReport}
          className="mt-4 bg-[#c29b61] text-[#141210] font-bold px-4 py-2 rounded-xl text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6">
        <p className="text-xs text-[#a8a29e]">
          No performance data available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <section className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xs font-bold text-[#c29b61] uppercase tracking-wider">
              Performance Analytics
            </h2>

            <p className="text-[11px] text-[#a8a29e] mt-1">
              Your fitness performance report
            </p>
          </div>

          <button
            onClick={fetchReport}
            className="text-xs bg-[#221f1d] border border-[#292524] px-3 py-2 rounded-xl hover:bg-[#292524]"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <div className="bg-[#221f1d] border border-[#292524] rounded-xl p-4">
            <p className="text-[10px] text-[#a8a29e]">
              Average Score
            </p>

            <p className="text-xl font-bold text-[#c29b61] mt-1">
              {report.average_score ?? 0}
            </p>
          </div>

          <div className="bg-[#221f1d] border border-[#292524] rounded-xl p-4">
            <p className="text-[10px] text-[#a8a29e]">
              Motion Efficiency
            </p>

            <p className="text-xl font-bold text-[#c29b61] mt-1">
              {report.average_motion_efficiency ?? 0}
            </p>
          </div>

          <div className="bg-[#221f1d] border border-[#292524] rounded-xl p-4">
            <p className="text-[10px] text-[#a8a29e]">
              Total Reps
            </p>

            <p className="text-xl font-bold text-[#c29b61] mt-1">
              {report.total_reps ?? 0}
            </p>
          </div>

          <div className="bg-[#221f1d] border border-[#292524] rounded-xl p-4">
            <p className="text-[10px] text-[#a8a29e]">
              Workouts
            </p>

            <p className="text-xl font-bold text-[#c29b61] mt-1">
              {report.total_workouts ?? 0}
            </p>
          </div>

        </div>
      </section>

      {Array.isArray(report.exercise_breakdown) &&
        report.exercise_breakdown.length > 0 && (

          <section className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

            <h3 className="text-xs font-bold text-[#c29b61] uppercase tracking-wider mb-4">
              Exercise Breakdown
            </h3>

            <div className="space-y-3">

              {report.exercise_breakdown.map((exercise, index) => (

                <div
                  key={index}
                  className="bg-[#221f1d] border border-[#292524] rounded-xl p-4"
                >

                  <div className="flex justify-between items-center">

                    <p className="text-xs font-bold">
                      {exercise.exercise || 'Exercise'}
                    </p>

                    <p className="text-[10px] text-[#a8a29e]">
                      {exercise.reps ?? 0} reps
                    </p>

                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">

                    <div>
                      <p className="text-[9px] text-[#78716c]">
                        Score
                      </p>

                      <p className="text-xs font-bold text-[#c29b61]">
                        {exercise.average_score ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-[#78716c]">
                        Motion Efficiency
                      </p>

                      <p className="text-xs font-bold text-[#c29b61]">
                        {exercise.average_motion_efficiency ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] text-[#78716c]">
                        Sessions
                      </p>

                      <p className="text-xs font-bold text-[#c29b61]">
                        {exercise.sessions ?? 0}
                      </p>
                    </div>

                  </div>

                </div>

              ))}

            </div>

          </section>
        )}

      {Array.isArray(report.recent_performance) &&
        report.recent_performance.length > 0 && (

          <section className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

            <h3 className="text-xs font-bold text-[#c29b61] uppercase tracking-wider mb-4">
              Recent Performance
            </h3>

            <div className="space-y-3">

              {report.recent_performance.map((item, index) => (

                <div
                  key={index}
                  className="bg-[#221f1d] border border-[#292524] rounded-xl p-4"
                >

                  <div className="flex justify-between items-center">

                    <div>
                      <p className="text-xs font-bold">
                        {item.exercise || 'Exercise'}
                      </p>

                      <p className="text-[10px] text-[#78716c] mt-1">
                        {item.completed_reps ?? 0} reps
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-[#c29b61]">
                        Score {item.score ?? 0}
                      </p>

                      <p className="text-[10px] text-[#a8a29e]">
                        Efficiency {item.motion_efficiency ?? 0}
                      </p>
                    </div>

                  </div>

                  {item.feedback && (
                    <p className="text-[11px] text-[#a8a29e] mt-3">
                      {item.feedback}
                    </p>
                  )}

                </div>

              ))}

            </div>

          </section>
        )}

    </div>
  );
}
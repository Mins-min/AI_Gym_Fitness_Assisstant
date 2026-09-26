import React, { useEffect, useState } from 'react';

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
        `/api/performance/report/${encodeURIComponent(username)}`
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          'Failed to load performance report.'
        );
      }

      setReport(data);

    } catch (err) {

      console.error(
        'Performance report error:',
        err
      );

      setError(
        err.message ||
        'Could not load performance analytics.'
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
      <div className="max-w-6xl mx-auto bg-[#1c1917] border border-[#292524] rounded-2xl p-8 text-center text-xs text-[#a8a29e]">
        Loading performance analytics...
      </div>
    );
  }

  if (error) {

    return (
      <div className="max-w-6xl mx-auto bg-red-950/30 border border-red-500/30 rounded-2xl p-6 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!report) {

    return (
      <div className="max-w-6xl mx-auto bg-[#1c1917] border border-[#292524] rounded-2xl p-8 text-center text-xs text-[#a8a29e]">
        No performance data available yet.
      </div>
    );
  }

  const records = Array.isArray(report.records)
    ? report.records
    : [];

  return (

    <div className="max-w-6xl mx-auto space-y-6 pb-12 text-[#e7e5e4]">

      {/* Header */}

      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <span className="text-[11px] font-semibold text-[#c29b61] uppercase tracking-wider">
          Pose-to-Performance Analyzer
        </span>

        <h2 className="text-base font-bold mt-1">
          Performance Analytics
        </h2>

        <p className="text-[11px] text-[#a8a29e] mt-1">
          Workout performance history for {username}.
        </p>

      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-5">

          <span className="text-[10px] text-[#a8a29e] uppercase">
            Total Workouts
          </span>

          <p className="text-2xl font-bold text-[#c29b61] mt-2">
            {report.total_workouts ?? 0}
          </p>

        </div>

        <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-5">

          <span className="text-[10px] text-[#a8a29e] uppercase">
            Average Score
          </span>

          <p className="text-2xl font-bold text-[#c29b61] mt-2">
            {Number(
              report.average_score ?? 0
            ).toFixed(1)}
          </p>

        </div>

        <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-5">

          <span className="text-[10px] text-[#a8a29e] uppercase">
            Motion Efficiency
          </span>

          <p className="text-2xl font-bold text-[#c29b61] mt-2">
            {Number(
              report.average_motion_efficiency ?? 0
            ).toFixed(1)}
            %
          </p>

        </div>

        <div className="bg-[#1c1917] border border-[#292524] rounded-xl p-5">

          <span className="text-[10px] text-[#a8a29e] uppercase">
            Total Reps
          </span>

          <p className="text-2xl font-bold text-[#c29b61] mt-2">
            {report.total_reps ?? 0}
          </p>

        </div>

      </div>

      {/* Records */}

      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <div className="flex justify-between items-center mb-4">

          <h3 className="text-xs font-bold uppercase tracking-wider">
            Workout History
          </h3>

          <button
            onClick={fetchReport}
            className="text-[10px] bg-[#221f1d] border border-[#292524] px-3 py-1.5 rounded-lg text-[#c29b61] hover:bg-[#292524]"
          >
            Refresh
          </button>

        </div>

        {records.length === 0 ? (

          <div className="text-center py-10 text-xs text-[#a8a29e]">
            No workout records yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-xs">

              <thead>

                <tr className="border-b border-[#292524] text-[#a8a29e]">

                  <th className="text-left py-3 px-2">
                    Exercise
                  </th>

                  <th className="text-left py-3 px-2">
                    Score
                  </th>

                  <th className="text-left py-3 px-2">
                    Efficiency
                  </th>

                  <th className="text-left py-3 px-2">
                    Reps
                  </th>

                  <th className="text-left py-3 px-2">
                    Feedback
                  </th>

                  <th className="text-left py-3 px-2">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {records.map((record, index) => (

                  <tr
                    key={record.id ?? index}
                    className="border-b border-[#292524] hover:bg-[#221f1d]"
                  >

                    <td className="py-3 px-2 font-semibold">
                      {record.exercise || '-'}
                    </td>

                    <td className="py-3 px-2 text-[#c29b61]">
                      {Number(
                        record.score ?? 0
                      ).toFixed(1)}
                    </td>

                    <td className="py-3 px-2">
                      {Number(
                        record.motion_efficiency ?? 0
                      ).toFixed(1)}
                      %
                    </td>

                    <td className="py-3 px-2">
                      {record.completed_reps ?? 0}
                    </td>

                    <td className="py-3 px-2 text-[#a8a29e] max-w-xs">
                      {record.feedback || '-'}
                    </td>

                    <td className="py-3 px-2 text-[#78716c]">
                      {record.created_at
                        ? new Date(
                            record.created_at
                          ).toLocaleString()
                        : '-'}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}
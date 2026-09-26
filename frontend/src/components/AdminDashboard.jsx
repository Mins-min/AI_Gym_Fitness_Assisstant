import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/dashboard");

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(
        "Unable to load admin analytics. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#e7e5e4]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#c29b61] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#a8a29e]">
            Loading admin analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <div className="bg-[#1c1917] border border-red-900/50 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>

          <h2 className="text-lg font-bold text-[#e7e5e4] mb-2">
            Admin Dashboard Unavailable
          </h2>

          <p className="text-sm text-[#a8a29e] mb-6">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="px-5 py-2.5 rounded-xl bg-[#c29b61] text-[#110703] font-bold text-xs hover:bg-[#b08852]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = data.statistics || {};
  const nutrition = data.nutrition || {};
  const habits = data.habits || {};
  const performance = data.performance || {};
  const system = data.system || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 text-[#e7e5e4]">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <span className="text-[11px] font-semibold text-[#c29b61] uppercase tracking-wider">
              Trivion AI
            </span>

            <h1 className="text-2xl font-bold mt-1">
              Admin Dashboard
            </h1>

            <p className="text-xs text-[#a8a29e] mt-2">
              System-wide fitness analytics and platform monitoring
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#221f1d] border border-[#292524]">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>

              <span className="text-xs text-[#a8a29e]">
                Backend Online
              </span>
            </div>

            <button
              onClick={fetchDashboard}
              className="px-4 py-2.5 rounded-xl bg-[#c29b61] text-[#110703] font-bold text-xs hover:bg-[#b08852] transition"
            >
              ↻ Refresh
            </button>

          </div>
        </div>
      </div>


      {/* ===================================================== */}
      {/* MAIN STATISTICS */}
      {/* ===================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          icon="👥"
          title="Total Users"
          value={stats.total_users}
          subtitle={`${stats.active_users || 0} active users`}
        />

        <StatCard
          icon="🍽️"
          title="Meals Logged"
          value={stats.total_meals}
          subtitle={`${nutrition.total_calories || 0} total calories`}
        />

        <StatCard
          icon="🏋️"
          title="Performance Records"
          value={stats.total_performance_records}
          subtitle={`${performance.total_reps || 0} reps recorded`}
        />

        <StatCard
          icon="💬"
          title="AI Conversations"
          value={stats.total_chat_messages}
          subtitle="Messages processed"
        />

      </div>


      {/* ===================================================== */}
      {/* PERFORMANCE ANALYTICS */}
      {/* ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

          <div className="flex justify-between items-start mb-6">

            <div>
              <span className="text-[10px] text-[#c29b61] uppercase tracking-wider font-bold">
                Pose-to-Performance
              </span>

              <h2 className="text-base font-bold mt-1">
                Performance Analytics
              </h2>
            </div>

            <span className="text-xl">📊</span>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <Metric
              label="Average Score"
              value={`${formatNumber(performance.average_score)} / 100`}
            />

            <Metric
              label="Motion Efficiency"
              value={`${formatNumber(performance.average_motion_efficiency)}%`}
            />

            <Metric
              label="Total Reps"
              value={performance.total_reps || 0}
            />

            <Metric
              label="Exercises"
              value={performance.unique_exercises || 0}
            />

          </div>

        </div>


        {/* ================================================= */}
        {/* HABITS */}
        {/* ================================================= */}

        <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

          <div className="flex justify-between items-start mb-6">

            <div>
              <span className="text-[10px] text-[#c29b61] uppercase tracking-wider font-bold">
                Behavioral AI
              </span>

              <h2 className="text-base font-bold mt-1">
                Habit Analytics
              </h2>
            </div>

            <span className="text-xl">🧠</span>

          </div>

          <div className="grid grid-cols-2 gap-4">

            <Metric
              label="Total Habits"
              value={habits.total_habits || 0}
            />

            <Metric
              label="Completed"
              value={habits.completed_habits || 0}
            />

            <Metric
              label="Completion Rate"
              value={`${formatNumber(habits.completion_rate)}%`}
            />

            <Metric
              label="Pending"
              value={habits.pending_habits || 0}
            />

          </div>

        </div>

      </div>


      {/* ===================================================== */}
      {/* NUTRITION */}
      {/* ===================================================== */}

      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <div className="flex justify-between items-start mb-6">

          <div>
            <span className="text-[10px] text-[#c29b61] uppercase tracking-wider font-bold">
              AI Dietician
            </span>

            <h2 className="text-base font-bold mt-1">
              Nutrition Overview
            </h2>
          </div>

          <span className="text-xl">🥗</span>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Metric
            label="Total Calories"
            value={`${formatNumber(nutrition.total_calories)} kcal`}
          />

          <Metric
            label="Protein"
            value={`${formatNumber(nutrition.total_protein)} g`}
          />

          <Metric
            label="Carbohydrates"
            value={`${formatNumber(nutrition.total_carbs)} g`}
          />

          <Metric
            label="Fats"
            value={`${formatNumber(nutrition.total_fats)} g`}
          />

        </div>

      </div>


      {/* ===================================================== */}
      {/* EXERCISE STATISTICS */}
      {/* ===================================================== */}

      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <div className="flex justify-between items-center mb-5">

          <div>
            <span className="text-[10px] text-[#c29b61] uppercase tracking-wider font-bold">
              AI Gym Trainer
            </span>

            <h2 className="text-base font-bold mt-1">
              Exercise Performance
            </h2>
          </div>

          <span className="text-xl">🏋️</span>

        </div>

        {performance.exercise_breakdown &&
        performance.exercise_breakdown.length > 0 ? (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-[#292524]">

                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-[#a8a29e]">
                    Exercise
                  </th>

                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-[#a8a29e]">
                    Sessions
                  </th>

                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-[#a8a29e]">
                    Avg Score
                  </th>

                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-[#a8a29e]">
                    Avg Efficiency
                  </th>

                  <th className="py-3 px-3 text-[10px] uppercase tracking-wider text-[#a8a29e]">
                    Reps
                  </th>

                </tr>
              </thead>

              <tbody>

                {performance.exercise_breakdown.map(
                  (exercise, index) => (

                    <tr
                      key={index}
                      className="border-b border-[#292524]/70 hover:bg-[#221f1d] transition"
                    >

                      <td className="py-3 px-3 text-xs font-semibold">
                        {exercise.exercise}
                      </td>

                      <td className="py-3 px-3 text-xs text-[#a8a29e]">
                        {exercise.sessions}
                      </td>

                      <td className="py-3 px-3 text-xs">
                        {formatNumber(exercise.average_score)}
                      </td>

                      <td className="py-3 px-3 text-xs">
                        {formatNumber(
                          exercise.average_motion_efficiency
                        )}%
                      </td>

                      <td className="py-3 px-3 text-xs">
                        {exercise.total_reps}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <EmptyState text="No performance data recorded yet." />

        )}

      </div>


      {/* ===================================================== */}
      {/* RECENT USERS */}
      {/* ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

          <div className="flex justify-between items-center mb-5">

            <div>
              <span className="text-[10px] text-[#c29b61] uppercase tracking-wider font-bold">
                Platform
              </span>

              <h2 className="text-base font-bold mt-1">
                Recent Users
              </h2>
            </div>

            <span className="text-xl">👤</span>

          </div>

          {data.recent_users &&
          data.recent_users.length > 0 ? (

            <div className="space-y-2">

              {data.recent_users.map((user, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between bg-[#221f1d] border border-[#292524] rounded-xl px-4 py-3"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-lg bg-[#c29b61]/10 border border-[#c29b61]/20 flex items-center justify-center">
                      👤
                    </div>

                    <div>
                      <p className="text-xs font-bold">
                        {user.username}
                      </p>

                      <p className="text-[10px] text-[#78716c]">
                        User ID #{user.id}
                      </p>
                    </div>

                  </div>

                  <span className="text-[10px] text-green-400">
                    Registered
                  </span>

                </div>

              ))}

            </div>

          ) : (

            <EmptyState text="No registered users yet." />

          )}

        </div>


        {/* ================================================= */}
        {/* RECENT PERFORMANCE */}
        {/* ================================================= */}

        <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

          <div className="flex justify-between items-center mb-5">

            <div>
              <span className="text-[10px] text-[#c29b61] uppercase tracking-wider font-bold">
                Activity
              </span>

              <h2 className="text-base font-bold mt-1">
                Recent Performance
              </h2>
            </div>

            <span className="text-xl">⚡</span>

          </div>

          {data.recent_performance &&
          data.recent_performance.length > 0 ? (

            <div className="space-y-2">

              {data.recent_performance.map(
                (item, index) => (

                  <div
                    key={index}
                    className="bg-[#221f1d] border border-[#292524] rounded-xl px-4 py-3"
                  >

                    <div className="flex justify-between">

                      <div>
                        <p className="text-xs font-bold">
                          {item.exercise}
                        </p>

                        <p className="text-[10px] text-[#78716c] mt-1">
                          {item.username}
                        </p>
                      </div>

                      <div className="text-right">

                        <p className="text-xs font-bold text-[#c29b61]">
                          {formatNumber(item.score)}
                        </p>

                        <p className="text-[9px] text-[#78716c]">
                          {item.completed_reps} reps
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <EmptyState text="No recent performance records." />

          )}

        </div>

      </div>


      {/* ===================================================== */}
      {/* SYSTEM STATUS */}
      {/* ===================================================== */}

      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <div className="flex justify-between items-center mb-5">

          <div>
            <span className="text-[10px] text-[#c29b61] uppercase tracking-wider font-bold">
              System
            </span>

            <h2 className="text-base font-bold mt-1">
              Trivion AI Platform Status
            </h2>
          </div>

          <span className="text-xl">⚙️</span>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <SystemStatus
            name="FastAPI Backend"
            status={system.backend}
          />

          <SystemStatus
            name="Database"
            status={system.database}
          />

          <SystemStatus
            name="AI Service"
            status={system.ai_service}
          />

          <SystemStatus
            name="Analytics"
            status={system.analytics}
          />

        </div>

      </div>


      {/* ===================================================== */}
      {/* MODULE COVERAGE */}
      {/* ===================================================== */}

      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl">

        <div className="mb-5">

          <span className="text-[10px] text-[#c29b61] uppercase tracking-wider font-bold">
            AI Ecosystem
          </span>

          <h2 className="text-base font-bold mt-1">
            Module Status
          </h2>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          <ModuleStatus
            icon="🏋️"
            name="AI Gym Trainer"
          />

          <ModuleStatus
            icon="🥗"
            name="AI Dietician"
          />

          <ModuleStatus
            icon="🤖"
            name="Smart Gym IoT"
          />

          <ModuleStatus
            icon="🧠"
            name="Habit Tracker"
          />

          <ModuleStatus
            icon="💬"
            name="Virtual Gym Buddy"
          />

          <ModuleStatus
            icon="📈"
            name="Performance Analyzer"
          />

          <ModuleStatus
            icon="📍"
            name="Gym Recommender"
          />

          <ModuleStatus
            icon="📊"
            name="Analytics Engine"
          />

        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* COMPONENTS */
/* ========================================================= */

function StatCard({
  icon,
  title,
  value,
  subtitle
}) {
  return (
    <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-5 shadow-xl">

      <div className="flex justify-between items-start">

        <div className="w-10 h-10 rounded-xl bg-[#221f1d] border border-[#292524] flex items-center justify-center text-lg">
          {icon}
        </div>

        <span className="text-[9px] text-green-400 uppercase tracking-wider font-bold">
          Live
        </span>

      </div>

      <p className="text-[10px] text-[#a8a29e] uppercase tracking-wider mt-4">
        {title}
      </p>

      <h3 className="text-2xl font-bold mt-1">
        {value ?? 0}
      </h3>

      <p className="text-[10px] text-[#78716c] mt-1">
        {subtitle}
      </p>

    </div>
  );
}


function Metric({ label, value }) {
  return (
    <div className="bg-[#221f1d] border border-[#292524] rounded-xl p-4">

      <p className="text-[10px] text-[#a8a29e] uppercase tracking-wider">
        {label}
      </p>

      <p className="text-lg font-bold mt-1">
        {value ?? 0}
      </p>

    </div>
  );
}


function SystemStatus({ name, status }) {
  const online =
    String(status || "").toLowerCase() === "online";

  return (
    <div className="bg-[#221f1d] border border-[#292524] rounded-xl p-4">

      <div className="flex items-center gap-2">

        <span
          className={`w-2 h-2 rounded-full ${
            online ? "bg-green-500" : "bg-red-500"
          }`}
        ></span>

        <span className="text-xs font-semibold">
          {name}
        </span>

      </div>

      <p
        className={`text-[10px] mt-2 ${
          online ? "text-green-400" : "text-red-400"
        }`}
      >
        {status || "Unknown"}
      </p>

    </div>
  );
}


function ModuleStatus({ icon, name }) {
  return (
    <div className="flex items-center gap-3 bg-[#221f1d] border border-[#292524] rounded-xl p-3">

      <div className="w-9 h-9 rounded-lg bg-[#1c1917] flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold">
          {name}
        </p>

        <p className="text-[9px] text-green-400 mt-0.5">
          Operational
        </p>
      </div>

    </div>
  );
}


function EmptyState({ text }) {
  return (
    <div className="py-8 text-center">

      <p className="text-xs text-[#78716c]">
        {text}
      </p>

    </div>
  );
}


function formatNumber(value) {
  const number = Number(value || 0);

  if (Number.isInteger(number)) {
    return number;
  }

  return number.toFixed(1);
}
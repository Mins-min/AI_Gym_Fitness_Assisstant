import React, { useState, useEffect } from 'react';
import { API_URL } from '../api';

export default function BehaviorHabitTracker() {
  const [habitsData, setHabitsData] = useState({
    consistency_score: 0,
    weekly_streak: 0,
    habits: []
  });

  useEffect(() => {
    async function fetchHabits() {
      try {
        const res = await fetch('http://localhost:8000/api/habit-tracker');
        const data = await res.json();
        setHabitsData(data);
      } catch (err) {
        console.error("Error fetching habits:", err);
      }
    }
    fetchHabits();
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/habit-tracker/toggle/${id}`, {
        method: 'POST'
      });
      const updatedHabit = await res.json();

      setHabitsData(prev => ({
        ...prev,
        habits: prev.habits.map(h => h.id === id ? { ...h, completed: updatedHabit.completed } : h)
      }));
    } catch (err) {
      console.error("Error toggling habit:", err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <h2 className="text-base font-bold text-green-400 flex items-center gap-2">
          ⚡ Behavior & Habit Tracker (Database Connected)
        </h2>
        <span className="text-xs bg-slate-800 text-green-400 px-2.5 py-1 rounded-full font-mono border border-green-500/20">
          Streak: {habitsData.weekly_streak} Days 🔥
        </span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Consistency Score</p>
          <div className="text-2xl font-extrabold text-white flex items-baseline gap-2">
            {habitsData.consistency_score}% <span className="text-xs text-green-400 font-normal">Optimal Routine</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Skip Risk Predictor</p>
          <div className="text-sm font-bold text-green-400 mt-1">Low Risk</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Great adherence! Keep your streak alive today.</p>
        </div>
      </div>

      {/* Habit Checklist */}
      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Daily Routine Check-In
        </h3>
        <div className="space-y-2">
          {habitsData.habits.map((habit) => (
            <div 
              key={habit.id} 
              onClick={() => handleToggle(habit.id)}
              className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-all ${
                habit.completed 
                  ? 'bg-green-950/20 border-green-500/30 text-green-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-medium">{habit.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-mono ${habit.completed ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                {habit.completed ? 'Completed ✓' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
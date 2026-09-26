import React, { useState } from "react";

import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";

import GymRecommenderPlanner from "./components/GymRecommenderPlanner";
import DietMacroPlanner from "./components/DietMacroPlanner";
import SkipPredictorWidget from "./components/SkipPredictorWidget";
import SmartGymIoT from "./components/SmartGymIoT";
import RepCounterFeed from "./components/RepCounterFeed";
import PerformanceAnalytics from "./components/PerformanceAnalytics";
import GymBuddyChat from "./components/GymBuddyChat";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("gyms");

  if (!user) {
    return (
      <LoginModal
        onLoginSuccess={(username) => {
          setUser({
            username,
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#110703] text-[#e7e5e4] flex flex-col font-sans">

      <Navbar
        username={user.username}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => setUser(null)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ===================================================== */}
        {/* GYM PLANNER */}
        {/* ===================================================== */}

        {activeTab === "gyms" && (
          <GymRecommenderPlanner
            username={user.username}
          />
        )}

        {/* ===================================================== */}
        {/* DIET */}
        {/* ===================================================== */}

        {activeTab === "diet" && (
          <DietMacroPlanner
            username={user.username}
          />
        )}

        {/* ===================================================== */}
        {/* HABITS */}
        {/* ===================================================== */}

        {activeTab === "habits" && (
          <SkipPredictorWidget
            username={user.username}
          />
        )}

        {/* ===================================================== */}
        {/* SMART GYM */}
        {/* ===================================================== */}

        {activeTab === "iot" && (
          <SmartGymIoT
            username={user.username}
          />
        )}

        {/* ===================================================== */}
        {/* REP COUNTER */}
        {/* ===================================================== */}

        {activeTab === "counter" && (
          <RepCounterFeed
            username={user.username}
          />
        )}

        {/* ===================================================== */}
        {/* PERFORMANCE ANALYTICS */}
        {/* ===================================================== */}

        {activeTab === "analytics" && (
          <PerformanceAnalytics
            username={user.username}
          />
        )}

        {/* ===================================================== */}
        {/* VIRTUAL GYM BUDDY */}
        {/* ===================================================== */}

        {activeTab === "chat" && (
          <GymBuddyChat
            username={user.username}
          />
        )}

        {/* ===================================================== */}
        {/* ADMIN DASHBOARD */}
        {/* ===================================================== */}

        {activeTab === "admin" && (
          <AdminDashboard />
        )}

      </main>

    </div>
  );
}
import React from "react";

export default function Navbar({
  username,
  activeTab,
  setActiveTab,
  onLogout
}) {
  const navigation = [
    {
      id: "gyms",
      label: "Gym Planner",
      icon: "🏋️"
    },
    {
      id: "diet",
      label: "Diet",
      icon: "🥗"
    },
    {
      id: "habits",
      label: "Habits",
      icon: "🧠"
    },
    {
      id: "iot",
      label: "Smart Gym",
      icon: "🤖"
    },
    {
      id: "counter",
      label: "Rep Counter",
      icon: "🔢"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "📈"
    },
    {
      id: "chat",
      label: "Gym Buddy",
      icon: "💬"
    },
    {
      id: "admin",
      label: "Admin",
      icon: "⚙️"
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#110703]/95 backdrop-blur-md border-b border-[#292524]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16">

          {/* ================================================= */}
          {/* LOGO */}
          {/* ================================================= */}

          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab("gyms")}
          >

            <div className="w-10 h-10 rounded-xl bg-[#1c1917] border border-[#292524] flex items-center justify-center shadow-lg">
              <span className="text-lg">
                ⚡
              </span>
            </div>

            <div className="hidden sm:block">

              <h1 className="text-sm font-bold tracking-wider text-[#e7e5e4]">
                <span className="text-[#c29b61]">
                  AI
                </span>
              </h1>

              <p className="text-[8px] text-[#78716c] uppercase tracking-[0.2em]">
                Fitness Intelligence
              </p>

            </div>

          </div>


          {/* ================================================= */}
          {/* NAVIGATION */}
          {/* ================================================= */}

          <div className="hidden lg:flex items-center gap-1 ml-6 flex-1">

            {navigation.map((item) => (

              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  flex items-center gap-2
                  px-3 py-2
                  rounded-lg
                  text-[11px]
                  font-semibold
                  transition-all
                  whitespace-nowrap
                  ${
                    activeTab === item.id
                      ? "bg-[#c29b61] text-[#110703] shadow-md"
                      : "text-[#a8a29e] hover:text-[#e7e5e4] hover:bg-[#1c1917]"
                  }
                `}
              >

                <span className="text-sm">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

              </button>

            ))}

          </div>


          {/* ================================================= */}
          {/* USER SECTION */}
          {/* ================================================= */}

          <div className="flex items-center gap-3 ml-3 shrink-0">

            {/* User */}

            <div className="hidden md:flex items-center gap-2">

              <div className="w-8 h-8 rounded-lg bg-[#1c1917] border border-[#292524] flex items-center justify-center">
                <span className="text-xs">
                  👤
                </span>
              </div>

              <div className="hidden xl:block">

                <p className="text-[10px] text-[#78716c]">
                  Signed in as
                </p>

                <p className="text-xs font-semibold text-[#e7e5e4] max-w-[100px] truncate">
                  {username || "User"}
                </p>

              </div>

            </div>


            {/* Logout */}

            <button
              onClick={onLogout}
              className="
                px-3 py-2
                rounded-lg
                border border-[#292524]
                bg-[#1c1917]
                text-[#a8a29e]
                hover:text-red-400
                hover:border-red-900/50
                hover:bg-red-950/20
                text-[10px]
                font-semibold
                transition-all
              "
            >
              Logout
            </button>

          </div>

        </div>


        {/* ================================================= */}
        {/* MOBILE NAVIGATION */}
        {/* ================================================= */}

        <div className="lg:hidden overflow-x-auto pb-3">

          <div className="flex gap-1 min-w-max">

            {navigation.map((item) => (

              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  flex items-center gap-1.5
                  px-3 py-2
                  rounded-lg
                  text-[10px]
                  font-semibold
                  whitespace-nowrap
                  transition-all
                  ${
                    activeTab === item.id
                      ? "bg-[#c29b61] text-[#110703]"
                      : "bg-[#1c1917] text-[#a8a29e] border border-[#292524]"
                  }
                `}
              >

                <span>
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

              </button>

            ))}

          </div>

        </div>

      </div>

    </nav>
  );
}
import React, { useState } from 'react';

export default function LoginModal({ onLoginSuccess }) {

  const [username, setUsername] = useState('Meera');

  const [password, setPassword] = useState('••••');

  const handleLogin = (e) => {

    e.preventDefault();

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      return;
    }

    if (onLoginSuccess) {
      onLoginSuccess(cleanUsername);
    }
  };

  return (
    <div className="min-h-screen bg-[#110703] flex items-center justify-center p-4 text-[#e7e5e4]">

      <div className="w-full max-w-md bg-[#1c1917] border border-[#292524] rounded-2xl p-8 shadow-2xl space-y-6">

        {/* Header */}

        <div className="flex flex-col items-center text-center space-y-2">

          <div className="w-12 h-12 rounded-xl bg-[#221f1d] border border-[#292524] flex items-center justify-center text-xl shadow-inner">
            ⚡
          </div>

          <div>

            <h1 className="text-lg font-bold text-[#e7e5e4] tracking-wide">
              Welcome Back
            </h1>

            <p className="text-xs text-[#a8a29e] mt-0.5">
              AI Gym & Fitness Assistant Platform
            </p>

          </div>

        </div>

        {/* Login Form */}

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          {/* Username */}

          <div>

            <label className="block text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wider mb-1.5">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#221f1d] border border-[#292524] focus:border-[#c29b61] text-[#e7e5e4] text-xs px-3.5 py-2.5 rounded-xl outline-none transition-colors"
              placeholder="Enter username"
            />

          </div>

          {/* Password */}

          <div>

            <label className="block text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wider mb-1.5">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#221f1d] border border-[#292524] focus:border-[#c29b61] text-[#e7e5e4] text-xs px-3.5 py-2.5 rounded-xl outline-none transition-colors"
              placeholder="Enter password"
            />

          </div>

          {/* Login Button */}

          <button
            type="submit"
            className="w-full bg-[#c29b61] hover:bg-[#b08852] text-[#110703] font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-lg mt-2"
          >
            Log In
          </button>

        </form>

        {/* Footer */}

        <p className="text-center text-xs text-[#a8a29e]">

          Don't have an account?{' '}

          <a
            href="#signup"
            className="text-[#c29b61] font-semibold hover:underline"
          >
            Sign Up
          </a>

        </p>

      </div>

    </div>
  );
}
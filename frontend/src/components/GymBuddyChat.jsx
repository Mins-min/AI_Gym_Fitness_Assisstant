import React, { useState } from "react";
import { API_URL } from "../api";

export default function GymBuddyChat({ username = "guest" }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hey ${username}! 👋 I'm your AI Gym Buddy. I can help with workouts, motivation, nutrition, recovery, and your fitness progress. What are we working on today?`,
    },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username || "guest",
          message: message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || `Server error: ${response.status}`
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "I couldn't generate a response right now.",
        },
      ]);
    } catch (error) {
      console.error("Gym Buddy AI error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ I couldn't connect to the AI service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#1c1917] border border-[#292524] rounded-2xl shadow-xl flex flex-col h-[650px] text-[#e7e5e4]">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#292524]">

          <div>
            <div className="flex items-center gap-2">

              <span className="text-xl">
                🤖
              </span>

              <h2 className="text-sm font-bold uppercase tracking-wider text-[#c29b61]">
                Virtual Gym Buddy
              </h2>

            </div>

            <p className="text-[10px] text-[#78716c] mt-1">
              Powered by AI • Llama 3.2
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-green-400">

            <span className="w-2 h-2 rounded-full bg-green-400"></span>

            AI ONLINE

          </div>

        </div>


        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {messages.map((message, index) => (

            <div
              key={index}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                  message.role === "user"
                    ? "bg-[#c29b61] text-[#141210] rounded-br-md"
                    : "bg-[#221f1d] border border-[#292524] text-[#e7e5e4] rounded-bl-md"
                }`}
              >

                {message.content}

              </div>

            </div>

          ))}


          {loading && (

            <div className="flex justify-start">

              <div className="bg-[#221f1d] border border-[#292524] px-4 py-3 rounded-2xl rounded-bl-md text-xs text-[#a8a29e]">

                <span className="animate-pulse">
                  Gym Buddy is thinking...
                </span>

              </div>

            </div>

          )}

        </div>


        {/* INPUT */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-[#292524] flex gap-2"
        >

          <input
            type="text"
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            placeholder="Ask your AI Gym Buddy..."
            disabled={loading}
            className="flex-1 bg-[#221f1d] border border-[#292524] focus:border-[#c29b61] rounded-xl px-4 py-3 text-xs text-[#e7e5e4] outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#c29b61] hover:bg-[#b08852] disabled:opacity-40 text-[#141210] font-bold px-6 rounded-xl text-xs transition-colors"
          >

            {loading ? "..." : "Send"}

          </button>

        </form>

      </div>
    </div>
  );
}
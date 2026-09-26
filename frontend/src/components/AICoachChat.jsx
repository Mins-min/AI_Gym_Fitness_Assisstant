import React, { useState } from 'react';
import { askOllama } from '../utils/ollama';

export default function AICoachChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your local AI fitness coach powered by Ollama (Llama 3.2). Ask me for form tips, workout routines, or nutrition advice!' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const aiResponse = await askOllama(userMessage);

    setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    setLoading(false);
  };

  return (
    <div className="bg-[#1c1917] border border-[#292524] rounded-2xl p-6 shadow-xl flex flex-col h-[500px]">
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-[#292524]">
        <span className="text-lg">⚡</span>
        <h3 className="text-sm font-bold text-[#e7e5e4] uppercase tracking-wider">Local AI Fitness Coach & Companion</h3>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 text-xs">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`p-3.5 rounded-xl max-w-[85%] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#c29b61] text-[#110703] ml-auto font-medium shadow-md' 
                : 'bg-[#221f1d] border border-[#292524] text-[#e7e5e4]'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="p-3.5 rounded-xl bg-[#221f1d] border border-[#292524] text-[#a8a29e] text-xs animate-pulse">
            Coach is thinking...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for workout advice, form corrections, or meal ideas..."
          className="flex-1 bg-[#221f1d] border border-[#292524] focus:border-[#c29b61] text-[#e7e5e4] text-xs px-4 py-3 rounded-xl outline-none transition-colors"
        />
        <button 
          type="submit"
          className="bg-[#c29b61] hover:bg-[#b08852] text-[#110703] font-bold px-5 py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import ResultView from "@/components/ResultView";
import { MOCK_COURSE } from "@/lib/mockData";

export default function Home() {
  const [showResult, setShowResult] = useState(false);
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    if (!destination.trim()) return;

    setIsLoading(true);
    // Simulate AI generation delay
    setTimeout(() => {
      setIsLoading(false);
      setShowResult(true);
    }, 1500);
  };

  if (showResult) {
    return <ResultView course={MOCK_COURSE} onReset={() => setShowResult(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <main className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Sparkles className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Travel AI</h1>
          <p className="text-gray-500">
            Enter a destination to generate your perfect travel course.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="e.g., Seoul, Busan, Jeju"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !destination.trim()}
            className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center
              ${isLoading || !destination.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2" size={20} />
                Generate Course
              </>
            )}
          </button>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Powered by AI • Domestic Travel Only
          </p>
        </div>
      </main>
    </div>
  );
}

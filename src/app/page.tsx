'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Settings } from 'lucide-react';
import { Tab } from '@/types';
import HeroSection from '@/components/home/HeroSection';
import TravelCategories from '@/components/home/TravelCategories';
import PopularDestinations from '@/components/home/PopularDestinations';
import PlannerView from '@/components/planner/PlannerView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [showResult, setShowResult] = useState(false);
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 20); };
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleGenerate = () => {
    if (!destination.trim()) {
      alert("여행지를 입력해주세요!"); // 간단한 유효성 검사
      return;
    }
    setIsLoading(true);
    // AI 생성 흉내 (1.5초 딜레이)
    setTimeout(() => {
      setIsLoading(false);
      setShowResult(true);
      setActiveTab('plan'); // 플래너 탭으로 이동하며 결과 보여주기
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100">

      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setActiveTab('home'); setShowResult(false); }}>
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
              <MapPin size={22} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">TripMaker</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-600 hover:text-indigo-600 transition-all">
              <Search size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-indigo-600 transition-colors shadow-md">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {activeTab === 'home' ? (
          <>
            <HeroSection
              destination={destination}
              setDestination={setDestination}
              handleGenerate={handleGenerate}
              isLoading={isLoading}
            />
            <TravelCategories />
            <PopularDestinations />
          </>
        ) : (
          <PlannerView isResult={showResult} destination={destination} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-bold text-xl tracking-tight">TripMaker</span>
            <p className="text-slate-400 text-sm mt-1 opacity-70">당신의 여행을 디자인합니다.</p>
          </div>
          <p className="text-xs text-slate-500 font-medium">© 2024 TripMaker Korea. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

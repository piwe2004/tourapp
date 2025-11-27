'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/home/HeroSection';
import TravelCategories from '@/components/home/TravelCategories';
import PopularDestinations from '@/components/home/PopularDestinations';
import PlannerView from '@/components/planner/PlannerView';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tab } from '@/types';

export default function Home() {
  const [destination, setDestination] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  

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
      <Header 
        setShowResult={setShowResult}
        setActiveTab={setActiveTab}
      />
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
      <Footer />
    </div>
  );
}

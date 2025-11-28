'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tab } from '@/types';
import PlannerView from './(pages)/planner/page';
import HomeView from './(pages)/(home)/page';

export default function Home() {
  const [destination, setDestination] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');




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
          <HomeView
            destination={destination}
            setDestination={setDestination}
            setShowResult={setShowResult}
            setActiveTab={setActiveTab}
          />
        ) : (
          <PlannerView isResult={showResult} destination={destination} />
        )}
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}

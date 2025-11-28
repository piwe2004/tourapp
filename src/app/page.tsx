'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PlannerView from './(pages)/planner/page';
import HomeView from './(pages)/(home)/page';
import { useRouter } from 'next/navigation';
import { Tab } from '@/types';

export default function Main() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tabName, setTabName] = useState<Tab>('home');

  const handleGenerate = (validDestination: string) =>{
    setIsLoading(true);

    setTimeout(() => {
      router.push(`/result?destination=${encodeURIComponent(validDestination)}`);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main>
        {destination === '' ? (
          <HomeView
            destination={destination}
            setDestination={setDestination}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
        ) : (
          <PlannerView destination={destination} />
        )}
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}

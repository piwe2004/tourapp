'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PlannerView from './(pages)/planner/page';
import HomeView from './(pages)/(home)/page';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [destination, setDestination] = useState("");

  const router = useRouter();

  router.push(`/planner`);

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

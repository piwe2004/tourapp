'use client';

import { useState } from 'react';
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
  );
}

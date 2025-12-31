'use client';

import TravelInputForm from '@/components/home/TravelInputForm';
import { Suspense } from 'react';

// Separate component to handle useSearchParams which requires Suspense
function SurveyContent() {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[80vh]">
      <TravelInputForm />
    </div>
  );
}

export default function SurveyPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none"></div>
             <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none"></div>

             <Suspense fallback={<div className="flex justify-center items-center h-screen text-teal-600 animate-pulse">Loading...</div>}>
                <SurveyContent />
             </Suspense>
        </main>
    )
}

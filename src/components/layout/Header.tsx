'use client'; // 👈 이 한 줄이 핵심입니다!

import { useEffect, useState } from "react";
import { MapPin, Search, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { usePlannerStore } from '@/store/plannerStore';

export default function Header() {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  // Planner Store
  const { destination, dateRange, guests, setActiveEditor } = usePlannerStore();
  const guestCount = guests.adult + guests.child + guests.teen;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Planner Page Header
  if (pathname === '/planner') {
    return (
      <>
        {/* Global Header (Fixed) for Planner */}
        <header className="h-[64px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-50 sticky w-full top-0">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                <div className="w-8 h-8 bg-[#4338CA] rounded-lg flex items-center justify-center text-white text-lg shadow-md hover:scale-105 transition-transform">
                    <i className="fa-solid fa-plane transform -rotate-45 text-[18px]"></i>
                </div>
                <span className="text-xl lg:text-2xl font-black text-[#4338CA] tracking-tight">Planny</span>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center w-full max-w-[200px] lg:max-w-none pointer-events-none">
                {/* [PC View] Detailed & Static Title */}
                <div className="hidden lg:flex flex-col items-center pointer-events-auto">
                    <h2 className="text-lg font-bold text-gray-900">{destination} 여행</h2>

                    <div className="flex items-center gap-3 mt-1 text-[12px] font-medium text-gray-500">
                        {/* Region */}
                        <button onClick={() => setActiveEditor('dest')} className="flex items-center gap-1.5 hover:text-[#4338CA] transition">
                            <i className="fa-solid fa-location-dot text-gray-400 text-[12px]"></i>
                            {destination}
                        </button>
                        <div className="w-[1px] h-2.5 bg-gray-200"></div>

                        {/* Schedule */}
                        <button onClick={() => setActiveEditor('date')} className="flex items-center gap-1.5 hover:text-[#4338CA] transition">
                            <i className="fa-solid fa-calendar-days text-gray-400 text-[12px]"></i>
                            {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                        </button>
                        <div className="w-[1px] h-2.5 bg-gray-200"></div>

                        {/* Guests */}
                        <button onClick={() => setActiveEditor('guest')} className="flex items-center gap-1.5 hover:text-[#4338CA] transition">
                            <i className="fa-solid fa-user-group text-gray-400 text-[12px]"></i>
                            {guestCount}명
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="hidden md:flex items-center px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition gap-2">
                    <i className="fa-solid fa-share-nodes text-[16px]"></i>초대
                </button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1 hidden md:block"></div>
                <button className="px-4 py-2 text-sm font-bold text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-lg shadow-md transition transform active:scale-95 flex items-center gap-2">
                    저장
                </button>
                <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 ml-1 cursor-pointer overflow-hidden hover:ring-2 hover:ring-[#4338CA] transition-all" onClick={() => setActiveEditor('guest')}>
                    <img src={`https://ui-avatars.com/api/?name=${guestCount}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>
        </header>

         {/* [Mobile Only] Custom Day Focus Header - Only Visible on Mobile */}
         {/* Note: In common layout, we usually return just the header. The mobile sub-header might need to be in page.tsx or handled here if it's truly global. 
             Since the user said "Use common layout Header", putting this here makes sense for cohesion. 
         */}
         <div className="lg:hidden bg-white px-4 pt-4 pb-2 shrink-0 z-40 fixed top-[64px] w-full border-b border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-start justify-between flex-col gap-1.5">
                <button onClick={() => setActiveEditor('date')} className="text-xs font-medium text-gray-400 tracking-tight">
                    {dateRange.start.toLocaleDateString()} ~ {dateRange.end.toLocaleDateString()}
                </button>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setActiveEditor('dest')}
                        className="bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 active:bg-gray-100 transition"
                    >
                        {destination} · {guestCount}명 
                        <i className="fa-solid fa-chevron-down text-[9px] text-gray-400"></i>
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="bg-[#FFF7ED] text-[#F97316] px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm border border-[#FFEDD5]">
                    <i className="fa-solid fa-sun text-[10px]"></i> 24°
                </div>
                <button className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm active:scale-95 transition">
                    <i className="fa-solid fa-share-nodes text-[12px]"></i>
                </button>
            </div>
        </div>
      </>
    );
  }

  // Default Header
  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-md py-4"
          : "bg-transparent py-6"
        }`}
    >
      <div className="mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* 로고 영역 */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
            <MapPin size={22} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900">
            Planni
          </h1>
        </Link>

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
  );
}

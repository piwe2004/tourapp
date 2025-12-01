'use client'; // 👈 이 한 줄이 핵심입니다!

import { useEffect, useState } from "react";
import { MapPin, Search, Settings } from "lucide-react";
import Link from "next/link"; // 로고 클릭 시 홈으로 이동하기 위해 추가 권장

export default function Header() {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // useEffect는 클라이언트에서만 실행되므로 typeof window 체크가 사실상 불필요하지만,
    // 안전하게 두셔도 무방합니다.
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-md py-4"
          : "bg-transparent py-6"
        }`}
    >
      <div className="mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* 로고 영역: 클릭 시 홈으로 이동하도록 Link 태그 사용 권장 */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
            <MapPin size={22} fill="currentColor" />
          </div>
          {/* 브랜드명 변경: TripMaker -> Planni */}
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

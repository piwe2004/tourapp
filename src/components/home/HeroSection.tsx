'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HeroSection() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/planner?destination=${encodeURIComponent(query)}`);
    };

    return (
        <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center gap-12 overflow-hidden lg:flex-row lg:justify-between lg:pt-40 lg:pb-32">

            {/* Left Column: Text & Input */}
            <div className="flex-1 w-full max-w-[600px] flex flex-col items-start z-10 text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-tint text-primary font-medium text-sm mb-6 animate-fade-in-up">
                    <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                    <span>당신의 AI 여행 메이트</span>
                </div>

                {/* Main Title */}
                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] mb-6 tracking-tight opacity-0 animate-fade-in-up [animation-delay:0.1s]">
                    단 한 문장으로<br />
                    여행 계획을<br />
                    완성하세요
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-[480px] opacity-0 animate-fade-in-up [animation-delay:0.2s]">
                    어디로, 누구와 갈지만 말씀해주세요.<br />
                    나머지는 AI가 알아서 처리합니다.
                </p>

                {/* Search Form */}
                <div className="w-full relative opacity-0 animate-fade-in-up [animation-delay:0.3s]">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <i className="fa-solid fa-compass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none"></i>
                        <input
                            type="text"
                            placeholder="예) 이번 주말 부산에서 로맨틱한 데이트 코스"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-14 pl-14 pr-36 rounded-full border-2 border-slate-200 bg-white text-lg font-medium text-slate-900 shadow-lg transition-all duration-200 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/25"
                        />
                        <button type="submit" className="absolute right-2 top-2 bottom-2 bg-primary text-white rounded-full px-8 font-bold text-base flex items-center gap-2 transition-colors duration-200 shadow-lg hover:bg-primary-hover">
                            생성하기
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </form>
                </div>

                {/* Quick Tags */}
                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm opacity-0 animate-fade-in-up [animation-delay:0.4s]">
                    <span className="text-slate-400 font-medium">Try:</span>
                    <button onClick={() => setQuery('제주도 2박 3일 힐링 여행')} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 transition-colors duration-200 hover:bg-slate-200">
                        🗻 제주도 2박 3일 힐링
                    </button>
                    <button onClick={() => setQuery('부산 맛집 데이트 코스')} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 transition-colors duration-200 hover:bg-slate-200">
                        🌊 부산 맛집 데이트
                    </button>
                </div>
            </div>

            {/* Right Column: Destination Card (Visual) */}
            <div className="flex-1 w-full max-w-[500px] relative opacity-0 animate-fade-in-right [animation-delay:0.2s]">
                {/* Decorative Elements */}
                <div className="absolute pointer-events-none top-10 -left-10 w-20 h-20 bg-yellow-400 rounded-full blur-[60px] opacity-40"></div>
                <div className="absolute pointer-events-none bottom-10 -right-10 w-32 h-32 bg-primary rounded-full blur-[80px] opacity-30"></div>

                {/* Main Card */}
                <div className="relative aspect-4/3 rounded-[32px] bg-gradient-card shadow-2xl p-6 flex flex-col justify-between overflow-hidden transition-transform duration-500 cursor-default hover:scale-[1.02] group">

                    {/* Top Row: Badges */}
                    <div className="flex justify-between items-start">
                        {/* Popular Badge */}
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg flex flex-col items-center leading-none">
                            <span className="text-2xl mb-1">🔥</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">인기 급상승</span>
                            <span className="text-sm font-bold text-secondary">+450% ↑</span>
                        </div>

                        {/* Weather Widget */}
                        <div className="bg-white/90 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-lg flex flex-row items-center gap-3">
                            <i className="fa-solid fa-sun text-2xl text-amber-500 animate-spin-slow"></i>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-medium">날씨</span>
                                <span className="text-lg text-slate-900 font-bold">맑음 24°C</span>
                            </div>
                        </div>
                    </div>

                    {/* Center: 3D Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center">
                        <div className="text-[7.5rem] drop-shadow-[0_20px_30px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] animate-bounce-slow group-hover:rotate-12 group-hover:scale-110">
                            🏝️
                        </div>
                        <h2 className="text-4xl font-black text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.2)] mt-4">제주도</h2>
                    </div>

                    {/* Bottom: Interactive Hint */}
                    <div className="w-full text-center opacity-0 translate-y-[10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        <span className="inline-block bg-white/15 backdrop-blur-md border border-white/20 px-4 py-1 rounded-full text-white/90 text-sm font-medium">지금 바로 떠나보세요</span>
                    </div>

                    {/* Floating Elements (Background UI Lines) */}
                    <div className="absolute -z-10 w-[120%] h-[120%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-dashed border-indigo-200/50 rounded-full animate-spin-veryslow"></div>
                </div>
            </div>
        </section>
    );
}


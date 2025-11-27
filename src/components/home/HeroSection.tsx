import React from 'react';
import { MapPin, Calendar, ArrowRight, Loader2, Sun } from 'lucide-react';

interface HeroSectionProps {
    destination: string;
    setDestination: (val: string) => void;
    handleGenerate: () => void;
    isLoading: boolean;
}

export default function HeroSection({
    destination,
    setDestination,
    handleGenerate,
    isLoading
}: HeroSectionProps) {
    return (
        <section className="relative pt-32 min-h-[700px] grid md:grid-cols-2 overflow-hidden border-b border-slate-200 bg-white">
            <div className="flex flex-col justify-center px-6 md:px-16 lg:px-24 z-10 pb-16 md:pb-0">
                <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-8 border border-indigo-100 animate-fade-in-up">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    국내 여행 가이드
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                    떠나볼까요?<br />
                    <span className="relative inline-block text-indigo-600">
                        대한민국
                        <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                    </span> 어디든.
                </h1>
                <p className="text-slate-500 text-lg mb-12 max-w-md font-medium leading-relaxed">
                    복잡한 계획은 내려놓고 가볍게 시작하세요.<br />
                    당신의 취향을 저격할 여행지가 기다리고 있습니다.
                </p>

                {/* Search Box with Logic */}
                <div className="bg-white p-3 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border-2 border-slate-100 max-w-md transform transition-transform hover:-translate-y-1">
                    <div className="space-y-2">
                        <div className="flex items-center px-5 py-4 bg-slate-50 rounded-[1.5rem] border border-slate-200 hover:border-indigo-300 hover:bg-white transition-colors group cursor-text">
                            <div className="bg-white p-2.5 rounded-full text-slate-400 group-hover:text-indigo-600 shadow-sm border border-slate-100 transition-colors">
                                <MapPin size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="어디로 갈까요? (예: 제주도)"
                                className="flex-1 bg-transparent outline-none text-slate-900 font-bold ml-3 text-base placeholder-slate-400"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            />
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 flex items-center px-5 py-4 bg-slate-50 rounded-[1.5rem] border border-slate-200 hover:border-indigo-300 hover:bg-white transition-colors cursor-pointer group">
                                <div className="bg-white p-2.5 rounded-full text-slate-400 group-hover:text-indigo-600 shadow-sm border border-slate-100 transition-colors">
                                    <Calendar size={20} />
                                </div>
                                <span className="ml-3 text-sm font-bold text-slate-500 group-hover:text-slate-900">날짜 선택</span>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-[1.5rem] px-8 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 flex items-center justify-center group"
                            >
                                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Visuals */}
            <div className="relative bg-slate-50 min-h-[500px] flex items-center justify-center overflow-hidden border-l border-slate-200">
                <div className="absolute inset-0 opacity-[0.6]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '32px 32px' }} />
                <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-[60px] opacity-60 animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-[60px] opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 transform hover:scale-105 transition-transform duration-500 cursor-pointer">
                    <div className="relative w-[340px] md:w-[480px] aspect-[4/3] rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[6px] border-white">
                        <img src="https://images.unsplash.com/photo-1544836756-3c7d6d15a31a?auto=format&fit=crop&w=1000&q=80" alt="Jeju Island" className="w-full h-full object-cover scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold mb-2 inline-block">Must Visit</span>
                            <h3 className="text-3xl font-black">Jeju Island</h3>
                        </div>
                    </div>
                    <div className="absolute -left-8 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                        <div className="bg-orange-100 p-2.5 rounded-full text-orange-600"><Sun size={24} fill="currentColor" /></div>
                        <div><p className="text-xs text-slate-400 font-bold uppercase">Weather</p><p className="text-base font-extrabold text-slate-800">Sunny 24°</p></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

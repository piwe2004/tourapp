'use client'; // [필수] 이제 이 컴포넌트는 스스로 동작합니다.

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 페이지 이동용
import { ArrowRight, Loader2, Sun, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HeroSection() {
  // [변경] Props로 받던 것들을 내부 상태(State)로 가져옵니다.
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // [변경] 검색 처리 함수 (Form 전송 방식)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 중요: 새로고침 방지

    if (!destination.trim()) return; // 빈 값 방지

    setIsLoading(true);

    // 약간의 딜레이 후 이동 (UX용)
    setTimeout(() => {
      // URL 쿼리로 목적지 정보를 넘기며 페이지 이동
      router.push(`/planner?destination=${encodeURIComponent(destination)}`);
    }, 1000);
  };

  return (
    <section className="relative pt-24 min-h-screen flex items-center bg-white overflow-hidden">
      {/* 배경 장식 요소 (기존 디자인 유지) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-slate-50 -skew-x-12 translate-x-1/4 z-0"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 grid lg:grid-cols-12 gap-12 relative z-10">
        
        {/* 왼쪽: 텍스트 및 입력 영역 */}
        <div className="lg:col-span-7 flex flex-col justify-center items-start text-left pt-10 lg:pt-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-6 border border-indigo-100 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            나만의 여행 플래너
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] mb-6 tracking-tight">
            <span className="text-indigo-600">어떤 여행</span>을<br />
            꿈꾸고 계신가요?
          </h1>

          <p className="text-slate-500 text-lg mb-8 max-w-2xl font-medium leading-relaxed">
            복잡한 검색은 그만!<br />"12월에 남자친구와 데이트", "조용한 힐링 여행" 처럼 원하는 여행 스타일을 친구에게 말하듯 적어주세요.
          </p>

          {/* [핵심 변경] div -> form 태그로 변경하여 엔터키 이슈 해결 */}
          <div className="bg-white p-2 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border-2 border-slate-100 w-full max-w-2xl transform transition-transform hover:-translate-y-1">
            <form 
              onSubmit={handleSubmit}
              className="flex items-center px-4 py-3 bg-slate-50 rounded-[1.5rem] border border-slate-200 hover:border-indigo-300 hover:bg-white transition-colors group cursor-text h-16"
            >
              <div className="bg-white p-2.5 rounded-full text-indigo-600 shadow-sm border border-slate-100 transition-colors shrink-0">
                <Sparkles size={20} className={isLoading ? "animate-spin" : ""} />
              </div>
              
              <input
                type="text"
                placeholder="예: 이번 주말 부모님과 함께 갈 편안한 여행지 추천해줘"
                className="flex-1 bg-transparent outline-none text-slate-900 font-bold ml-4 text-base placeholder-slate-400 w-full min-w-0"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                // onKeyDown 삭제: form onSubmit이 알아서 처리함
              />
              
              <button
                type="submit" // onClick 대신 submit 타입 사용
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-full p-3 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 shrink-0 ml-2 cursor-pointer"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
              </button>
            </form>
          </div>
        </div>

        {/* 오른쪽: 이미지 영역 (기존 디자인 유지) */}
        <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative">
          <div className="relative w-full max-w-lg aspect-[4/5] lg:aspect-[3/4]">
            {/* 메인 이미지 */}
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[8px] border-white rotate-3 hover:rotate-0 transition-transform duration-700 z-10">
              <img src="https://images.unsplash.com/photo-1544836756-3c7d6d15a31a?auto=format&fit=crop&w=800&q=80" alt="Jeju Island" className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold mb-2 inline-block">Must Visit</span>
                <h3 className="text-3xl font-black">Jeju Island</h3>
              </div>
            </div>

            {/* 플로팅 카드 1 */}
            <div className="absolute -left-8 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce z-20" style={{ animationDuration: '3s' }}>
              <div className="bg-orange-100 p-2.5 rounded-full text-orange-600"><Sun size={24} fill="currentColor" /></div>
              <div><p className="text-xs text-slate-400 font-bold uppercase">Weather</p><p className="text-base font-extrabold text-slate-800">Sunny 24°</p></div>
            </div>

            {/* 플로팅 카드 2 */}
            <div className="absolute -right-4 bottom-20 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce z-20" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="bg-indigo-100 p-2.5 rounded-full text-indigo-600"><CheckCircle2 size={24} /></div>
              <div><p className="text-xs text-slate-400 font-bold uppercase">Booking</p><p className="text-base font-extrabold text-slate-800">Confirmed</p></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

import { ArrowRight, Loader2, Sun, Sparkles, CheckCircle2 } from 'lucide-react';

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
    // min-h-screen으로 변경하여 화면을 꽉 채우고, flex items-center로 수직 중앙 정렬
    <section className="relative pt-24 min-h-screen flex items-center bg-white overflow-hidden">

      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-slate-50 -skew-x-12 translate-x-1/4 z-0"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* 컨테이너: 너비를 최대로 넓힘 (왼쪽 정렬 기준) */}
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 grid lg:grid-cols-12 gap-12 relative z-10">

        {/* 왼쪽: 텍스트 영역 (7칸 차지) - 왼쪽 정렬(items-start, text-left) */}
        <div className="lg:col-span-7 flex flex-col justify-center items-start text-left pt-10 lg:pt-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-6 border border-indigo-100 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            나만의 여행 플래너
          </div>

          {/* 글자 크기 조정됨 (너무 크지 않게) */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] mb-6 tracking-tight">
            <span className="text-indigo-600">어떤 여행</span>을<br />
            꿈꾸고 계신가요?
          </h1>

          {/* 설명 글자 크기 및 간격 조정 */}
          <p className="text-slate-500 text-lg mb-8 max-w-2xl font-medium leading-relaxed">
            복잡한 검색은 그만!<br />"12월에 남자친구와 데이트", "조용한 힐링 여행" 처럼 원하는 여행 스타일을 친구에게 말하듯 적어주세요.
          </p>

          {/* 입력창: 왼쪽 정렬 기준에 맞춰 배치 & 최대 너비 확장 */}
          <div className="bg-white p-2 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border-2 border-slate-100 w-full max-w-2xl transform transition-transform hover:-translate-y-1">
            <div className="flex items-center px-4 py-3 bg-slate-50 rounded-[1.5rem] border border-slate-200 hover:border-indigo-300 hover:bg-white transition-colors group cursor-text h-16">
              <div className="bg-white p-2.5 rounded-full text-indigo-600 shadow-sm border border-slate-100 transition-colors shrink-0">
                <Sparkles size={20} className={isLoading ? "animate-spin" : ""} />
              </div>
              <input
                type="text"
                placeholder="예: 이번 주말 부모님과 함께 갈 편안한 여행지 추천해줘"
                className="flex-1 bg-transparent outline-none text-slate-900 font-bold ml-4 text-base placeholder-slate-400 w-full min-w-0"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-full p-3 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 shrink-0 ml-2"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽: 이미지 영역 (5칸 차지) */}
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

            {/* 둥둥 떠다니는 카드 1 */}
            <div className="absolute -left-8 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce z-20" style={{ animationDuration: '3s' }}>
              <div className="bg-orange-100 p-2.5 rounded-full text-orange-600"><Sun size={24} fill="currentColor" /></div>
              <div><p className="text-xs text-slate-400 font-bold uppercase">Weather</p><p className="text-base font-extrabold text-slate-800">Sunny 24°</p></div>
            </div>

            {/* 둥둥 떠다니는 카드 2 */}
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
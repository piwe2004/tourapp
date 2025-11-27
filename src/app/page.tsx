'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Calendar, ArrowRight, 
  Utensils, Camera, Baby, User, Mountain, 
  Train, Music, Sun, CheckCircle2, Settings, Loader2
} from 'lucide-react';

// --- Types ---
type Tab = 'home' | 'plan';
type RegionKey = '전체' | '제주' | '강원' | '부산/경상' | '전라' | '서울/경기';

interface Destination {
  id: number;
  city: string;
  subTitle: string;
  image: string;
  rating: number;
  reviews: number;
  desc: string;
  region: RegionKey;
  tags: string[];
}

interface ScheduleItem {
  id: number;
  time: string;
  activity: string;
  type: 'stay' | 'food' | 'sightseeing' | 'cafe';
  icon: React.ReactNode;
  memo?: string;
}

// --- Mock Data ---
const TRAVEL_TYPES = [
  { label: '아이와 함께', icon: <Baby size={24} /> },
  { label: '부모님 효도', icon: <User size={24} /> },
  { label: '커플 데이트', icon: <Sun size={24} /> },
  { label: '혼자 여행', icon: <User size={24} /> },
  { label: '맛집 투어', icon: <Utensils size={24} /> },
  { label: '휴양/힐링', icon: <Sun size={24} /> },
  { label: '문화/역사', icon: <Music size={24} /> },
  { label: '액티비티', icon: <Mountain size={24} /> },
];

const DESTINATIONS_DB: Destination[] = [
  { id: 1, city: "제주도", subTitle: "서귀포/애월", image: "https://images.unsplash.com/photo-1544836756-3c7d6d15a31a?auto=format&fit=crop&w=800&q=80", rating: 4.9, reviews: 5400, desc: "야자수와 푸른 바다의 조화", region: '제주', tags: ['#오름', '#바다', '#귤'] },
  { id: 2, city: "부산", subTitle: "해운대/광안리", image: "https://images.unsplash.com/photo-1616239103038-79659b9101d2?auto=format&fit=crop&w=800&q=80", rating: 4.8, reviews: 3200, desc: "낭만적인 바다와 야경", region: '부산/경상', tags: ['#야경', '#국밥', '#카페'] },
  { id: 3, city: "여수", subTitle: "전라남도", image: "https://images.unsplash.com/photo-1635327918995-1811a43697e8?auto=format&fit=crop&w=800&q=80", rating: 4.7, reviews: 1800, desc: "여수 밤바다의 낭만", region: '전라', tags: ['#낭만포차', '#케이블카'] },
  { id: 4, city: "전주", subTitle: "한옥마을", image: "https://images.unsplash.com/photo-1616053648085-3b9875df5462?auto=format&fit=crop&w=800&q=80", rating: 4.6, reviews: 1500, desc: "고즈넉한 한옥 산책", region: '전라', tags: ['#한옥', '#비빔밥', '#경기전'] },
  { id: 5, city: "서울", subTitle: "종로/강남", image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80", rating: 4.8, reviews: 4100, desc: "전통과 현대의 조화", region: '서울/경기', tags: ['#궁궐', '#한강', '#쇼핑'] },
  { id: 6, city: "강릉", subTitle: "강원도", image: "https://images.unsplash.com/photo-1549416878-b9ca95e2f6b1?auto=format&fit=crop&w=800&q=80", rating: 4.7, reviews: 2300, desc: "커피 향 가득한 바다", region: '강원', tags: ['#안목해변', '#순두부'] },
  { id: 7, city: "가평", subTitle: "경기도", image: "https://images.unsplash.com/photo-1627885489066-e8d1a4987569?auto=format&fit=crop&w=800&q=80", rating: 4.5, reviews: 1100, desc: "가까운 근교 힐링", region: '서울/경기', tags: ['#남이섬', '#글램핑'] },
  { id: 8, city: "경주", subTitle: "경상북도", image: "https://images.unsplash.com/photo-1627918536868-b3917d235882?auto=format&fit=crop&w=800&q=80", rating: 4.8, reviews: 2100, desc: "지붕 없는 박물관", region: '부산/경상', tags: ['#첨성대', '#황리단길'] },
];

const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: 1, time: "11:00", activity: "제주공항 도착", type: "sightseeing", icon: <Train size={16}/>, memo: "셔틀버스 탑승장 이동" },
  { id: 2, time: "12:30", activity: "애월 해안도로 드라이브", type: "sightseeing", icon: <Camera size={16}/>, memo: "해안가 카페 들르기" },
  { id: 3, time: "14:00", activity: "고기국수 점심 식사", type: "food", icon: <Utensils size={16}/> },
  { id: 4, time: "16:00", activity: "협재 해수욕장 산책", type: "sightseeing", icon: <Sun size={16}/>, memo: "일몰 사진 포인트" },
];

// --- Main Component ---
export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [showResult, setShowResult] = useState(false);
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => { setScrolled(window.scrollY > 20); };
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleGenerate = () => {
    if (!destination.trim()) {
      alert("여행지를 입력해주세요!"); // 간단한 유효성 검사
      return;
    }
    setIsLoading(true);
    // AI 생성 흉내 (1.5초 딜레이)
    setTimeout(() => {
      setIsLoading(false);
      setShowResult(true);
      setActiveTab('plan'); // 플래너 탭으로 이동하며 결과 보여주기
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setActiveTab('home'); setShowResult(false); }}>
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
              <MapPin size={22} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">TripMaker</span>
          </div>
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

      {/* Main Content */}
      <main>
        {activeTab === 'home' ? (
          <HomeView 
            setActiveTab={setActiveTab} 
            destination={destination}
            setDestination={setDestination}
            handleGenerate={handleGenerate}
            isLoading={isLoading}
          />
        ) : (
          <PlannerView isResult={showResult} destination={destination} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
             <span className="font-bold text-xl tracking-tight">TripMaker</span>
             <p className="text-slate-400 text-sm mt-1 opacity-70">당신의 여행을 디자인합니다.</p>
           </div>
           <p className="text-xs text-slate-500 font-medium">© 2024 TripMaker Korea. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// --- Sub Components ---

function HomeView({ 
  setActiveTab, destination, setDestination, handleGenerate, isLoading
}: { 
  setActiveTab: (tab: Tab) => void;
  destination: string;
  setDestination: (val: string) => void;
  handleGenerate: () => void;
  isLoading: boolean;
}) {
  const [activeRegion, setActiveRegion] = useState<RegionKey>('전체');
  const filteredDestinations = activeRegion === '전체' ? DESTINATIONS_DB : DESTINATIONS_DB.filter(d => d.region === activeRegion);

  return (
    <>
      {/* 1. Hero Section */}
      <section className="relative pt-32 min-h-[700px] grid md:grid-cols-2 overflow-hidden border-b border-slate-200 bg-white">
        <div className="flex flex-col justify-center px-6 md:px-16 lg:px-24 z-10 pb-16 md:pb-0">
            <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-8 border border-indigo-100 animate-fade-in-up">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span> 
                국내 여행 가이드
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                떠나볼까요?<br/>
                <span className="relative inline-block text-indigo-600">
                    대한민국
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" /></svg>
                </span> 어디든.
            </h1>
            <p className="text-slate-500 text-lg mb-12 max-w-md font-medium leading-relaxed">
                복잡한 계획은 내려놓고 가볍게 시작하세요.<br/>
                당신의 취향을 저격할 여행지가 기다리고 있습니다.
            </p>

            {/* Search Box with Logic */}
            <div className="bg-white p-3 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border-2 border-slate-100 max-w-md transform transition-transform hover:-translate-y-1">
                <div className="space-y-2">
                    <div className="flex items-center px-5 py-4 bg-slate-50 rounded-[1.5rem] border border-slate-200 hover:border-indigo-300 hover:bg-white transition-colors group cursor-text">
                        <div className="bg-white p-2.5 rounded-full text-slate-400 group-hover:text-indigo-600 shadow-sm border border-slate-100 transition-colors">
                            <MapPin size={20}/>
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
                                <Calendar size={20}/>
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
            <div className="absolute inset-0 opacity-[0.6]" style={{backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '32px 32px'}} />
            <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-[60px] opacity-60 animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-[60px] opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>

            <div className="relative z-10 transform hover:scale-105 transition-transform duration-500 cursor-pointer">
                 <div className="relative w-[340px] md:w-[480px] aspect-[4/3] rounded-[3rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[6px] border-white">
                     <img src="https://images.unsplash.com/photo-1544836756-3c7d6d15a31a?auto=format&fit=crop&w=1000&q=80" alt="Jeju Island" className="w-full h-full object-cover scale-110"/>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                     <div className="absolute bottom-8 left-8 text-white">
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold mb-2 inline-block">Must Visit</span>
                        <h3 className="text-3xl font-black">Jeju Island</h3>
                     </div>
                 </div>
                 <div className="absolute -left-8 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{animationDuration: '3s'}}>
                    <div className="bg-orange-100 p-2.5 rounded-full text-orange-600"><Sun size={24} fill="currentColor" /></div>
                    <div><p className="text-xs text-slate-400 font-bold uppercase">Weather</p><p className="text-base font-extrabold text-slate-800">Sunny 24°</p></div>
                 </div>
            </div>
        </div>
      </section>

      {/* 2. Categories */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h3 className="text-3xl font-black text-slate-900 mb-10">어떤 여행을 떠나시나요?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {TRAVEL_TYPES.map((type, idx) => (
                    <button key={idx} className="group relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl transition-all duration-300 bg-white border-2 border-slate-200 shadow-sm hover:bg-indigo-600 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-2">
                        <div className="p-3.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                            {type.icon}
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-white transition-colors duration-300">{type.label}</span>
                    </button>
                ))}
            </div>
        </div>
      </section>

      {/* 3. Destinations */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-6">지역별 인기 여행지</h2>
            <div className="flex flex-wrap justify-center gap-3">
                {(['전체', '제주', '강원', '부산/경상', '전라', '서울/경기'] as RegionKey[]).map((region) => (
                    <button key={region} onClick={() => setActiveRegion(region)} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${activeRegion === region ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800'}`}>
                        {region}
                    </button>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredDestinations.map((dest) => (
              <div key={dest.id} className="group bg-white rounded-[2rem] overflow-hidden border-2 border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.15)] transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-2">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img src={dest.image} alt={dest.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                     <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">{dest.city}</h3>
                     <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">{dest.desc}</p>
                     <div className="mt-auto flex flex-wrap gap-2">
                        {dest.tags.map((tag, i) => (
                            <span key={i} className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 group-hover:border-indigo-100 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">{tag}</span>
                        ))}
                     </div>
                  </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}

function PlannerView({ isResult, destination }: { isResult?: boolean; destination?: string }) {
    const [schedule, setSchedule] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);

    return (
        <div className="pt-24 h-screen flex flex-col max-w-screen-2xl mx-auto bg-slate-50">
            {/* Header */}
            <div className="px-6 md:px-12 pb-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center bg-white pt-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-indigo-200">3박 4일</span>
                        <h2 className="text-3xl font-black text-slate-900">
                          {isResult && destination ? `✨ ${destination} 맞춤 여행` : '🍊 제주도 힐링 여행'}
                        </h2>
                    </div>
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400"/> 2024.06.15 (토) - 2024.06.18 (화)
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 text-sm transition-all shadow-sm">초대</button>
                    <button className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 shadow-lg hover:shadow-indigo-200 text-sm transition-all">일정 저장</button>
                </div>
            </div>

            <div className="flex-1 grid md:grid-cols-12 overflow-hidden">
                <div className="md:col-span-4 bg-white border-r border-slate-200 overflow-y-auto p-6 scrollbar-thin">
                    <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                        {['1일차', '2일차', '3일차'].map((day, i) => (
                            <button key={day} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${i === 0 ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                                {day}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6 relative pl-4">
                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
                        {schedule.map((item, idx) => (
                            <div key={item.id} className="flex gap-5 relative group">
                                <div className="flex flex-col items-center z-10 pt-1">
                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 group-hover:border-indigo-600 group-hover:bg-indigo-600 flex items-center justify-center text-slate-300 group-hover:text-white transition-all shadow-sm">
                                        <CheckCircle2 size={18} />
                                    </div>
                                </div>
                                <div className="flex-1 bg-white border-2 border-slate-100 p-5 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-[0_4px_20px_-4px_rgba(79,70,229,0.15)] transition-all cursor-pointer group-hover:-translate-y-1">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{item.time}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors mb-0.5">{item.activity}</h4>
                                            {item.memo && <p className="text-xs text-slate-400 font-medium">{item.memo}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="md:col-span-8 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-[0.4]" style={{backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '24px 24px'}}></div>
                    <div className="bg-white px-10 py-8 rounded-[2rem] shadow-2xl text-center border-4 border-white/50 max-w-sm mx-4 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <MapPin size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">지도 뷰</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            여행 동선을 한눈에 확인하세요.<br/>
                            (API 연동 시 지도가 표시됩니다)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}


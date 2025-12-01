'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Sparkles, Share2, 
  Utensils, Coffee, BedDouble, Car, Camera, Clock, Map as MapIcon
} from 'lucide-react';
import { getTravelPlan } from '@/lib/actions'; 
import { PlanItem } from '@/mockData'; 

interface PlannerViewProps {
  destination: string;
}

export default function PlannerView({ destination }: PlannerViewProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState<PlanItem[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);

  // 데이터 로딩 후 Day 목록 추출
  const days = Array.from(new Set(schedule.map(item => item.day))).sort();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getTravelPlan(destination);
        setSchedule(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [destination]);

  const handleBack = () => router.back();

  const getIconByType = (type: string) => {
    switch (type) {
      case 'food': return <Utensils size={18} className="text-orange-500" />;
      case 'cafe': return <Coffee size={18} className="text-amber-700" />;
      case 'stay': return <BedDouble size={18} className="text-indigo-500" />;
      case 'move': return <Car size={18} className="text-slate-500" />;
      default: return <Camera size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-20">
      
      {/* 1. 상단 헤더 */}
      <div className="bg-white border-b border-slate-200 sticky top-[72px] z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <button 
            onClick={handleBack}
            className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            다시 검색하기
          </button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {destination} 여행 계획
              <span className="hidden md:inline-flex text-indigo-600 text-xs font-bold px-2 py-1 bg-indigo-50 rounded-full border border-indigo-100 items-center gap-1">
                <Sparkles size={12} /> Planni's Pick
              </span>
            </h1>
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 메인 콘텐츠 */}
      <div className="max-w-[1600px] mx-auto px-4 mt-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* A. 왼쪽: 일정 리스트 (모바일/PC 모두 세로 스크롤) */}
            <div className="w-full lg:w-1/2 order-1">
              
              {/* Day 탭 버튼 (상단 고정) */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 sticky top-[150px] lg:top-[160px] bg-slate-50 z-20 pt-2">
                {days.length > 0 ? days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border whitespace-nowrap ${
                      selectedDay === day
                        ? 'bg-slate-900 text-white border-slate-900 scale-105'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Day {day}
                  </button>
                )) : (
                  [1, 2].map(d => <div key={d} className="px-5 py-2.5 rounded-full bg-slate-200 text-slate-400 text-sm font-bold">Day {d}</div>)
                )}
              </div>

              {/* [핵심 변경] 리스트 컨테이너: overflow 제거, 세로 타임라인 적용 */}
              <div className="space-y-8 border-l-[3px] border-indigo-100 ml-4 pl-8 pb-10">
                {schedule
                  .filter((item) => item.day === selectedDay)
                  .map((item, index) => (
                    <div 
                      key={item.id} 
                      className="relative group animate-fade-in-up w-full"
                      style={{ animationDelay: `${index * 100}ms` }} 
                    >
                      {/* 타임라인 점 (모바일/PC 공통 노출) */}
                      <div className="absolute -left-[43px] top-6 w-5 h-5 bg-white border-4 border-indigo-500 rounded-full group-hover:scale-125 group-hover:border-indigo-600 transition-all z-10 shadow-sm"></div>
                      
                      {/* 카드 내용 */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all">
                        
                        {/* 상단: 순서 & 시간 */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                              Step {index + 1}
                            </span>
                            <div className="flex items-center gap-1 text-slate-500 text-sm font-bold bg-slate-50 px-2 py-1 rounded-lg">
                              <Clock size={14} /> {item.time}
                            </div>
                          </div>
                          
                          {/* 아이콘 */}
                          <div className="bg-slate-50 p-2 rounded-full border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                            {getIconByType(item.type)}
                          </div>
                        </div>
                        
                        {/* 제목 */}
                        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-indigo-700 transition-colors">
                          {item.activity}
                        </h3>
                        
                        {/* 꿀팁 메모 */}
                        {item.memo && (
                          <div className="mt-auto text-slate-600 text-sm bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                            <span className="mt-0.5 text-lg">💡</span>
                            <span className="leading-snug">{item.memo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* 데이터 없음 처리 */}
                  {schedule.filter(i => i.day === selectedDay).length === 0 && (
                    <div className="w-full text-slate-400 py-20 text-center">
                      일정이 없습니다.
                    </div>
                  )}
              </div>
            </div>

            {/* B. 오른쪽: 지도 영역 (모바일: 하단 / PC: 우측 Sticky) */}
            <div className="w-full lg:w-1/2 order-2">
              <div className="lg:sticky lg:top-[160px] h-[300px] lg:h-[calc(100vh-180px)] rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
                <MockMap destination={destination} day={selectedDay} />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// ... MockMap, LoadingSkeleton 컴포넌트는 기존과 동일
function MockMap({ destination, day }: { destination: string, day: number }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 text-indigo-300 relative overflow-hidden group">
      <MapIcon size={64} className="mb-4 opacity-50" />
      <p className="font-bold text-lg text-indigo-400">{destination} 지도</p>
      <p className="text-sm text-indigo-300 font-medium bg-white/50 px-3 py-1 rounded-full mt-2">
        Day {day} 동선 표시 중...
      </p>
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '1s'}}></div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-10 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
      <p className="text-slate-500 font-medium animate-pulse">플래니가 최적의 경로를 계산하고 있어요...</p>
    </div>
  );
}

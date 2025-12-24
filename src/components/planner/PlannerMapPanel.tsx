'use client';

import { PlanItem } from '@/types/place';
import Map from '@/components/planner/Map';

interface PlannerMapPanelProps {
    schedule: PlanItem[];
    selectedDay: number;
    selectedItemId: string | null;
    onItemClick: (id: string) => void; // [New]
}

/**
 * @desc 플래너 페이지의 우측 패널(지도)을 담당하는 컴포넌트입니다.
 * 
 * 주요 역할:
 * 1. 전체 일정의 경로를 시각화하는 Naver Map 렌더링
 * 2. 배경 패턴 및 줌 컨트롤 버튼 제공
 * 3. PC 환경에서만 표시됨 (모바일은 PlannerTimeline 내에서 처리)
 */
export default function PlannerMapPanel({
    schedule,
    selectedDay,
    selectedItemId,
    onItemClick
}: PlannerMapPanelProps) {
    return (
        <section className="hidden lg:block flex-1 bg-[#EEF2F5] relative overflow-hidden group">
            {/* 배경 패턴 (Dot Pattern) - 지도가 로딩되기 전이나 빈 공간에 심미적 효과 */}
            <div 
                className="absolute inset-0 opacity-10 pointer-events-none z-0" 
                style={{backgroundImage: 'radial-gradient(#64748b 1.5px, transparent 1.5px)', backgroundSize: '24px 24px'}}
            ></div>
            
            {/* 지도 컴포넌트 */}
            <div className="w-full h-full relative z-10">
                <Map 
                    schedule={schedule} 
                    selectedDay={selectedDay} 
                    selectedItemId={selectedItemId}
                    onItemClick={onItemClick} 
                />
            </div>

            {/* 플로팅 줌 컨트롤 (우측 하단) */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
                <button className="w-11 h-11 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#4338CA] hover:bg-gray-50 transition active:scale-95" title="확대">
                    <i className="fa-solid fa-plus text-[20px]"></i>
                </button>
                <button className="w-11 h-11 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#4338CA] hover:bg-gray-50 transition active:scale-95" title="축소">
                    <div className="w-4 h-0.5 bg-current"></div>
                </button>
            </div>
        </section>
    );
}

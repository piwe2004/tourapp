'use client';

import { PlanItem } from '@/types/place';
import Map from '@/components/planner/Map';

interface PlannerMapPanelProps {
    schedule: PlanItem[];
    selectedDay: number;
    selectedItemId: string | null;
    onItemClick: (id: string) => void; // [New]
    showPath?: boolean;
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
    onItemClick,
    showPath = true
}: PlannerMapPanelProps) {
    return (
        <section className="planner-map-panel">
            {/* 배경 패턴 (Dot Pattern) - 지도가 로딩되기 전이나 빈 공간에 심미적 효과 */}
            <div 
                className="planner-map-bg-pattern" 
                style={{backgroundImage: 'radial-gradient(#64748b 1.5px, transparent 1.5px)', backgroundSize: '24px 24px'}}
            ></div>
            
            {/* 지도 컴포넌트 */}
            <div className="planner-map-wrapper">
                <Map 
                    schedule={schedule} 
                    selectedDay={selectedDay} 
                    selectedItemId={selectedItemId}
                    onItemClick={onItemClick} 
                    showPath={showPath}
                />
            </div>

            {/* 플로팅 줌 컨트롤 (우측 하단) */}
            <div className="planner-map-controls">
                <button className="map-control-btn" title="확대">
                    <i className="fa-solid fa-plus text-[20px]"></i>
                </button>
                <button className="map-control-btn" title="축소">
                    <div className="w-4 h-0.5 bg-current"></div>
                </button>
            </div>
        </section>
    );
}

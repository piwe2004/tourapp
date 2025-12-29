'use client';

import { PlanItem } from "@/types/place";
import { RainyScheduleItem } from '@/lib/weather/actions';
import { cn } from "@/lib/utils";
import clsx from 'clsx';

interface ContentBodyProps {
    item: PlanItem;
    selected?: boolean;
    rainRisk?: RainyScheduleItem;
    onPlanBClick?: (e: React.MouseEvent) => void;
}

/**
 * @desc 카드 내부의 실제 컨텐츠 (시간, 아이콘, 제목, 메모, 날씨 뱃지 등)
 */
export function ContentBody({
    item,
    rainRisk,
    onPlanBClick
}: ContentBodyProps) {
    const isExternal = String(item.PLACE_ID).startsWith('naver-');

    return (
        <div className="day-content-body">
            {/* [Modified] 1. 강수 위험 시 뱃지 표시 (기존 Absolute 제거 후 Time 옆으로 이동) */}
            
            {/* 2. 시간 및 태그 */}
            <div className="day-meta-row">
                <span className="day-time-badge">
                    {item.time}
                </span>
                
                {isExternal && (
                    <span className="day-external-badge" title="네이버 검색 결과">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> N 검색
                    </span>
                )}
                
                {/* [New] Rain Risk Badge */}
                {rainRisk && (
                    <div className="day-rain-badge">
                         <i className="fa-solid fa-triangle-exclamation"></i> 비 예보 {rainRisk.weather.pop}
                    </div>
                )}
            </div>

            {/* 3. 아이콘 및 텍스트 */}
            <div className="day-info-row">
                {/* 카테고리 아이콘 */}
                <div className={clsx(
                    "day-category-icon",
                    getIconColor(item.type, item.is_indoor)
                )}>
                    <i className={cn(
                        "", 
                        getIcon(item.type)
                    )}
                    ></i>
                </div>
                
                {/* 타이틀 및 메모 */}
                <div className="day-info-text">
                    <div className="day-info-title-row">
                        <span className="day-place-name">{item.NAME}</span>
                        {/* [New] 실내/야외 여부 표시 (User Edit Refined) */}
                        {typeof item.is_indoor !== 'undefined' && (
                             <span className={clsx(
                                "day-indoor-label",
                                item.is_indoor ? "indoor" : "outdoor"
                            )}>
                                {item.is_indoor ? "실내" : "야외"}
                            </span>
                        )}
                    </h3>
                    <p className="day-content-highlights">
                        {item.HIGHTLIGHTS || "상세 설명이 없습니다."}
                    </p>
                </div>
            </div>

            {/* 4. Plan B (실내 추천) 버튼 */}
            {rainRisk && rainRisk.recommendations.length > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPlanBClick?.(e); }}
                    className="day-plan-b-btn"
                >
                    <div className="day-btn-overlay"></div>
                    <i className="fa-solid fa-wand-magic-sparkles text-[#4338CA] relative z-10 text-[14px] md:text-[16px]"></i>
                    <span className="relative z-10">비 오면 여기 어때요? (실내 추천)</span>
                </button>
            )}
        </div>
    );
}

// 아이콘 컬러 매핑 헬퍼
function getIconColor(type: string, is_indoor?: boolean) {
    switch (type) {
        case 'sightseeing':
            return is_indoor ? "icon-sightseeing-indoor" : "icon-sightseeing-outdoor";
        case 'food':
            return "icon-food";
        case 'cafe':
            return "icon-cafe";
        case 'move':
            return "icon-move";
        case 'stay':
            return "icon-stay";
        default:
            return "icon-default";
    }
}

// 아이콘 매핑 헬퍼
function getIcon(type: string) {
    switch (type) {
        case 'move': return "fa-solid fa-plane";
        case 'food': return "fa-solid fa-utensils";
        case 'cafe': return "fa-solid fa-coffee";
        case 'sightseeing': return "fa-solid fa-camera";
        case 'stay': return "fa-solid fa-hotel";
        default: return "fa-solid fa-map-pin";
    }
}

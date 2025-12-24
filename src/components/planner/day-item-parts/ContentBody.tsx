'use client';

import { PlanItem } from "@/types/place";
import { RainyScheduleItem } from '@/lib/weather/actions';
import { cn } from "@/lib/utils";

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
    selected,
    rainRisk,
    onPlanBClick
}: ContentBodyProps) {
    const isExternal = String(item.PLACE_ID).startsWith('naver-');

    return (
        <div className="flex-1">
            {/* [Modified] 1. 강수 위험 시 뱃지 표시 (기존 Absolute 제거 후 Time 옆으로 이동) */}
            
            {/* 2. 시간 및 태그 */}
            <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                    "text-xs md:text-sm font-bold px-2 py-0.5 rounded text-gray-800 bg-gray-100",
                )}>
                    {item.time}
                </span>
                
                {isExternal && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200" title="네이버 검색 결과">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> N 검색
                    </span>
                )}
                
                {/* [New] Rain Risk Badge */}
                {rainRisk && (
                    <div className="bg-alert text-alertText px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                         <i className="fa-solid fa-triangle-exclamation"></i> 비 예보 {rainRisk.weather.pop}
                    </div>
                )}
            </div>

            {/* 3. 아이콘 및 텍스트 */}
            <div className="flex gap-3 md:gap-4">
                {/* 카테고리 아이콘 */}
                <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-lg md:text-xl shrink-0",
                    getIconColor(item.type, item.is_indoor)
                )}>
                    <i className={cn(
                        "", 
                        getIcon(item.type)
                    )}
                    ></i>
                </div>
                
                {/* 타이틀 및 메모 */}
                <div className="flex-1 pr-6">
                    <h3 className="text-[15px] md:text-lg font-bold text-gray-800 leading-tight mb-1 flex gap-1 items-end">
                        {item.NAME}
                        {/* [New] 실내/야외 여부 표시 (User Edit Refined) */}
                        {typeof item.is_indoor !== 'undefined' && (
                             <span className={cn(
                                "text-xs font-normal",
                                item.is_indoor ? "text-blue-500" : "text-green-600"
                            )}>
                                {item.is_indoor ? "실내" : "야외"}
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium line-clamp-1">
                        {item.HIGHTLIGHTS || "상세 설명이 없습니다."}
                    </p>
                </div>
            </div>

            {/* 4. Plan B (실내 추천) 버튼 */}
            {rainRisk && rainRisk.recommendations.length > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPlanBClick?.(e); }}
                    className="w-full mt-3 md:mt-4 py-2.5 md:py-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4338CA] text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all border border-indigo-100 hover:shadow-md group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
            return is_indoor ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600';
        case 'food':
            return 'bg-orange-50 text-orange-600';
        case 'cafe':
            return 'bg-amber-50 text-amber-600';
        case 'move':
            return 'bg-blue-50 text-blue-600';
        case 'stay':
            return 'bg-cyan-900 text-cyan-50';
        default:
            return 'bg-gray-50 text-gray-600';
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

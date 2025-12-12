'use client';

import { PlanItem } from "@/mockData";
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
    const isExternal = String(item.id).startsWith('naver-');

    return (
        <div className="flex-1">
            {/* 1. 강수 위험 시 뱃지 표시 */}
            {rainRisk && (
                <div className="absolute -top-3 -right-2 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm animate-bounce z-40">
                    <i className="fa-solid fa-umbrella text-[10px]"></i> 비 예보 {rainRisk.weather.pop}
                </div>
            )}

            {/* 2. 시간 및 태그 */}
            <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                    "text-xs md:text-[13px] font-bold px-2 py-0.5 rounded border",
                    selected 
                        ? 'bg-[#4338CA] text-white border-[#4338CA]' 
                        : 'bg-gray-50 text-gray-600 border-gray-100'
                )}>
                    {item.time}
                </span>
                {isExternal && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200" title="네이버 검색 결과">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> N 검색
                    </span>
                )}
            </div>

            {/* 3. 아이콘 및 텍스트 */}
            <div className="flex gap-3 md:gap-4">
                {/* 카테고리 아이콘 */}
                <div className={cn(
                    "w-10 h-10 md:w-[52px] md:h-[52px] rounded-2xl flex items-center justify-center text-lg md:text-xl shrink-0",
                    rainRisk ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-[#4338CA]'
                )}>
                    {getIcon(item.type)}
                </div>
                
                {/* 타이틀 및 메모 */}
                <div className="flex-1 pr-6">
                    <h3 className="text-[15px] md:text-[16px] font-bold text-gray-900 leading-tight mb-1">
                        {item.activity}
                        {rainRisk && <span className="ml-2 text-[10px] text-gray-400 border border-gray-200 px-1 rounded font-normal">야외</span>}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium line-clamp-1">
                        {item.memo || "상세 설명이 없습니다."}
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

// 아이콘 매핑 헬퍼
function getIcon(type: string) {
    switch (type) {
        case 'move': return <i className="fa-solid fa-plane text-[14px] md:text-[16px]"></i>;
        case 'food': return <i className="fa-solid fa-utensils text-[14px] md:text-[16px]"></i>;
        case 'cafe': return <i className="fa-solid fa-mug-hot text-[14px] md:text-[16px]"></i>;
        case 'sightseeing': return <i className="fa-solid fa-camera text-[14px] md:text-[16px]"></i>;
        case 'stay': return <i className="fa-solid fa-hotel text-[14px] md:text-[16px]"></i>;
        default: return <i className="fa-solid fa-map-pin text-[14px] md:text-[16px]"></i>;
    }
}

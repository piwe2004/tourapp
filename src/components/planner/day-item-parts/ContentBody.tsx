'use client';

import { PlanItem } from "@/types/place";
import { RainyScheduleItem } from '@/lib/weather/actions';
import { cn } from "@/lib/utils";
import clsx from 'clsx';
import { Clock, MapPin, Navigation } from "lucide-react";

interface ContentBodyProps {
    item: PlanItem;
    selected?: boolean;
    rainRisk?: RainyScheduleItem;
    onPlanBClick?: (e: React.MouseEvent) => void;
}

/**
 * @desc 카드 내부의 실제 컨텐츠 (Premium Redesign)
 */
export function ContentBody({
    item,
    rainRisk,
    onPlanBClick
}: ContentBodyProps) {
    const isExternal = String(item.PLACE_ID).startsWith('naver-');

    return (
        <div className="flex-1 min-w-0 py-1">
            
            {/* 1. Header Row: Time & Badges */}
            <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold font-mono border border-slate-200">
                    <Clock size={12} className="text-slate-400" />
                    {item.time}
                </div>
                
                {item.type !== 'stay' && item.STAY_TIME && (
                    <span className="text-xs text-slate-400">
                        ({typeof item.STAY_TIME === 'number' ? formatDuration(item.STAY_TIME) : item.STAY_TIME})
                    </span>
                )}

                {rainRisk && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 animate-pulse">
                         <i className="fa-solid fa-cloud-showers-heavy text-red-400"></i> 
                         비 예보 {rainRisk.weather.pop}%
                    </div>
                )}

                {typeof item.is_indoor !== 'undefined' && (
                    <span className={clsx(
                        "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-tighter",
                        item.is_indoor 
                        ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                        : "bg-green-50 text-green-600 border-green-100"
                    )}>
                        {item.is_indoor ? "실내" : "야외"}
                    </span>
                )}
            </div>

            {/* 2. Main Title Row */}
            <div className="flex items-start gap-3 mb-1.5">
                {/* Category Icon */}
                <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-colors",
                    getIconStyles(item.type)
                )}>
                    <i className={cn("text-lg", getIcon(item.type))}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                     <h3 className="text-lg font-bold text-slate-800 leading-tight truncate">
                        {item.NAME}
                     </h3>
                     {/* Address */}
                     {item.ADDRESS && (
                        <p className="flex items-center gap-1 text-xs text-slate-500 mt-1 truncate">
                            <MapPin size={10} />
                            {item.ADDRESS}
                        </p>
                    )}
                </div>
            </div>

            {/* 3. Tags & Keywords */}
            <div className="pl-[52px]"> {/* Align with text start (Icon width 40px + gap 12px) */}
                 {item.TAGS || item.KEYWORDS ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {/* Prioritize TAGS object, fallback to KEYWORDS */}
                        {(item.TAGS 
                            ? [...(item.TAGS.common || []), ...(item.TAGS.winter || [])]
                            : (item.KEYWORDS || [])
                        ).slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                #{tag}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>

            {/* 4. Plan B Action */}
            {rainRisk && rainRisk.recommendations.length > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPlanBClick?.(e); }}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors shadow-sm"
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>비 오는데 실내로 바꿀까요? (추천 보기)</span>
                </button>
            )}
        </div>
    );
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}분`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

function getIconStyles(type: string) {
    switch (type) {
        case 'sightseeing': return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case 'food':        return "bg-orange-50 text-orange-500 border-orange-100";
        case 'cafe':        return "bg-amber-50 text-amber-600 border-amber-100";
        case 'stay':        return "bg-indigo-50 text-indigo-600 border-indigo-100";
        case 'move':        return "bg-slate-100 text-slate-500 border-slate-200";
        default:            return "bg-slate-50 text-slate-400 border-slate-100";
    }
}

function getIcon(type: string) {
    switch (type) {
        case 'move': return "fa-solid fa-plane";
        case 'food': return "fa-solid fa-utensils";
        case 'cafe': return "fa-solid fa-mug-hot";
        case 'sightseeing': return "fa-solid fa-camera";
        case 'stay': return "fa-solid fa-bed";
        default: return "fa-solid fa-location-dot";
    }
}

'use client';

import { PlanItem } from "@/types/place";
import { RainyScheduleItem } from '@/lib/weather/actions';
import { cn } from "@/lib/utils";

import { Clock } from "lucide-react";

interface ContentBodyProps {
    item: PlanItem;
    selected?: boolean;
    rainRisk?: RainyScheduleItem;
    onPlanBClick?: (e: React.MouseEvent) => void;
}

/**
 * @desc 카드 내부의 실제 컨텐츠 (Premium Redesign)
 */
import styles from '../PlannerTimeline.module.scss'; // Component-level styles

export function ContentBody({
    item,
    rainRisk,
    onPlanBClick
}: ContentBodyProps) {


    return (
        <div className={styles.cardContentWrapper}> {/* Wrapper if needed, or just fragment */}
            
            {/* 1. Top Right Info (Time & Badges) */}
            <div className={styles.timeBadge}>
                <Clock size={12} />
                {item.time || "00:00"}
            </div>

            {/* Rain Badge (Overlay) */}
            {rainRisk && (
                <div className={styles.rainBadge}>
                    <i className="fa-solid fa-cloud-showers-heavy"></i>
                    <span>강수확률 {rainRisk.weather.pop}%</span>
                </div>
            )}

            <div className={styles.cardContent}>
                {/* 2. Left Icon / Visual */}
                <div className={styles.iconVisual}>
                    {/* Use logic to determine icon or image */}
                    <i className={cn("text-2xl", getIcon(item.type))}></i> 
                </div>

                {/* 3. Text Info */}
                <div className={styles.info}>
                    <h3 className={styles.title}>
                        {item.NAME}
                    </h3>
                    <p className={styles.desc}>
                        {item.ADDRESS}
                    </p>
                    {/* Tags */}
                    {item.TAGS && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {/* Tags logic */}
                            {(item.TAGS.common || []).slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Plan B Button */}
            {rainRisk && rainRisk.recommendations.length > 0 && (
                <div className={styles.planBArea}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPlanBClick?.(e); }}
                        className={styles.planBBtn}
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        <span>실내 대체 일정 보기</span>
                    </button>
                </div>
            )}
        </div>
    );
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

'use client';

import { cn } from "@/lib/utils";

interface MarkerProps {
    index: number;
    selected?: boolean;
}

/**
 * @desc DayItems 왼쪽의 숫자 마커 컴포넌트
 * @param index 순서 번호 (0부터 시작하므로 내부에서 +1 처리)
 * @param selected 아이템이 선택되었는지 여부
 */
export function Marker({ index, selected }: MarkerProps) {
    return (
        <div
            className={cn(
                "w-7 h-7 md:w-9 md:h-9 rounded-full border-[3px] font-bold text-[10px] md:text-xs flex items-center justify-center",
                "z-10 shrink-0 shadow-sm mt-1 transition-all duration-300 relative cursor-pointer",
                // 선택 시 강조 스타일
                selected
                    ? 'bg-[#4338CA] border-white text-white ring-4 ring-indigo-50 scale-110'
                    : 'bg-white border-indigo-100 text-gray-400 group-hover:border-[#4338CA] group-hover:text-[#4338CA]'
            )}
        >
            {index + 1}
        </div>
    );
}

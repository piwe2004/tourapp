'use client';

interface TravelTimeProps {
    onAddStopClick?: (e: React.MouseEvent) => void;
}

/**
 * @desc 다음 장소로의 이동 시간을 표시하고, 경유지 추가 버튼을 제공하는 컴포넌트
 */
export function TravelTime({ onAddStopClick }: TravelTimeProps) {
    return (
        <div className="flex items-center gap-3 ml-[4px] mb-2 mt-2 md:mb-5 md:mt-5 relative z-0 pl-8 md:pl-10 opacity-70">
            <div className="flex flex-col items-center gap-1">
                {/* 수직선 효과는 상위 Page CSS에서 처리되지만, 여기 빈 공간 확보 */}
            </div>
            
            <div className="flex items-center justify-left w-full -ml-2 relative">
                {/* 이동 시간 뱃지 */}
                <span className="text-[10px] md:text-[14px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm flex items-center gap-1.5 hover:border-indigo-300 transition-colors z-10">
                    <i className="fa-solid fa-car text-indigo-400 text-[10px] md:text-[12px]"></i>
                    <span>40분 이동</span>
                </span>

                {/* 경유지 추가(+) 버튼 */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddStopClick?.(e);
                    }}
                    className="absolute left-40 md:left-50 w-6 h-6 md:w-7 md:h-7 ml-2 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 shadow-sm hover:border-[#4338CA] hover:bg-[#4338CA] hover:text-white transition-all transform hover:scale-105 active:scale-95 z-10"
                    title="경유지 추가"
                >
                    <i className="fa-solid fa-plus text-[12px] md:text-[14px]"></i>
                </button>
            </div>
        </div>
    );
}

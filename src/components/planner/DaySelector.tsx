'use client';

import useDraggableScroll from '@/hooks/useDraggableScroll';

interface DaySelectorProps {
    days: number[];
    dateRange: { start: Date; end: Date };
    selectedDay: number;
    onDaySelect: (day: number) => void;
    onSmartMixClick: () => void;
}

/**
 * @desc 일자 선택(Day Tabs) 및 날씨 요약 위젯 컴포넌트.
 * 가로 드래그 스크롤(useDraggableScroll)을 지원합니다.
 */
export default function DaySelector({ days, dateRange, selectedDay, onDaySelect, onSmartMixClick }: DaySelectorProps) {
    const { ref: scrollRef, events: scrollEvents, isDragging: isScrollDragging } = useDraggableScroll();

    return (
        <div className="bg-white px-4 md:px-6 pt-4 md:pt-6 pb-2 md:pb-4 sticky top-0 z-20 border-b border-gray-100 shadow-sm">
            <div
                ref={scrollRef}
                {...scrollEvents}
                className="flex gap-2 md:gap-2.5 overflow-x-auto no-scrollbar pb-1 cursor-grab active:cursor-grabbing"
                onClickCapture={(e) => {
                    if (isScrollDragging) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
            >
                {days.map(day => {
                    const d = new Date(dateRange.start);
                    d.setDate(d.getDate() + (day - 1));
                    const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                    const weekDay = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];

                    const isActive = selectedDay === day;

                    return (
                        <button
                            key={day}
                            onClick={() => {
                                if (!isScrollDragging) onDaySelect(day);
                            }}
                            className={`flex-1 min-w-[70px] md:min-w-[100px] py-2 md:py-3 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-0.5 leading-none relative overflow-hidden group border ${isActive
                                    ? 'bg-[#4338CA] text-white shadow-lg border-[#4338CA] transform scale-[1.02]'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                        >
                            <span className="text-xs md:text-base">{dateStr} ({weekDay})</span>
                            <span className={`text-[10px] font-normal ${isActive ? 'opacity-70' : 'text-gray-400'}`}>Day {day}</span>
                        </button>
                    );
                })}
            </div>

            {/* Weather Widget */}
            <div className="mt-3 md:mt-5 bg-[#E0E7FF]/50 border border-indigo-100 rounded-2xl p-3 md:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 md:gap-3.5">
                    <div className="w-9 h-9 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center text-lg md:text-xl shadow-sm border border-indigo-50 text-indigo-500">
                        <i className="fa-solid fa-sun text-orange-500 text-[16px] md:text-[20px]"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] md:text-[10px] font-bold text-indigo-400 tracking-wider">DAY {selectedDay} 기상정보</span>
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <span className="text-xs md:text-sm font-bold text-gray-800">대체로 맑음</span>
                            <span className="text-[10px] md:text-xs text-gray-400">|</span>
                            <span className="text-xs md:text-sm font-bold text-[#4338CA]">22° / 24°</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onSmartMixClick}
                    className="px-2.5 py-1.5 md:px-3 bg-white border border-indigo-100 hover:border-[#4338CA] text-[#4338CA] text-[10px] md:text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1 md:gap-1.5 group"
                >

                    <i className="fa-solid fa-wand-magic-sparkles group-hover:animate-pulse text-[10px] md:text-[12px]"></i>
                    <span>스마트 최적화</span>
                </button>
            </div>
        </div>
    );
}

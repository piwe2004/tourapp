import useDraggableScroll from '@/hooks/useDraggableScroll';
import { WeatherData } from '@/lib/weather/service'; // Type Import
import clsx from 'clsx';

interface DaySelectorProps {
    days: number[];
    dateRange: { start: Date; end: Date };
    selectedDay: number;
    onDaySelect: (day: number) => void;
    onSmartMixClick: () => void;
    weatherData: WeatherData | null; // Prop 추가
}

/**
 * @desc 일자 선택(Day Tabs) 및 날씨 요약 위젯 컴포넌트.
 * 가로 드래그 스크롤(useDraggableScroll)을 지원합니다.
 */
export default function DaySelector({ days, dateRange, selectedDay, onDaySelect, onSmartMixClick, weatherData }: DaySelectorProps) {
    const { ref: scrollRef, events: scrollEvents, isDragging: isScrollDragging } = useDraggableScroll();

    return (
        <div className="day-selector-wrapper">
            <div
                ref={scrollRef}
                {...scrollEvents}
                className="day-selector-scroll"
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
                            className={clsx("day-selector-btn", isActive && "day-selector-btn-active")}
                        >
                            <span className="day-selector-date-text">{dateStr} ({weekDay})</span>
                            <span className={clsx("day-selector-label", isActive && "day-selector-label-active")}>Day {day}</span>
                        </button>
                    );
                })}
            </div>

            {/* Weather Widget */}
            <div className="day-selector-weather-widget">
                <div className="day-selector-weather-left">
                    <div className="day-selector-weather-icon-box">
                         {/* 날씨 아이콘 동적 렌더링 */}
                         {weatherData ? (
                            weatherData.pty !== '없음' ? (
                                <i className="fa-solid fa-umbrella text-blue-500 text-[16px] md:text-[20px]"></i>
                            ) : weatherData.sky === '맑음' ? (
                                <i className="fa-solid fa-sun text-orange-500 text-[16px] md:text-[20px]"></i>
                            ) : weatherData.sky === '구름많음' ? (
                                <i className="fa-solid fa-cloud-sun text-yellow-500 text-[16px] md:text-[20px]"></i>
                            ) : (
                                <i className="fa-solid fa-cloud text-gray-400 text-[16px] md:text-[20px]"></i>
                            )
                        ) : (
                            <i className="fa-solid fa-spinner animate-spin text-indigo-300 text-[16px] md:text-[20px]"></i>
                        )}
                    </div>
                    <div className="day-selector-weather-info">
                        <span className="day-selector-weather-title">DAY {selectedDay} 기상정보</span>
                        <div className="day-selector-weather-details">
                             {weatherData ? (
                                <>
                                    <span className="day-selector-weather-text">
                                        {weatherData.pty !== '없음' ? weatherData.pty : weatherData.sky}
                                    </span>
                                    <span className="day-selector-weather-divider">|</span>
                                    <span className="day-selector-weather-temp">{weatherData.tmp}</span>
                                </>
                            ) : (
                                <span className="day-selector-weather-divider">날씨 불러오는 중...</span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={onSmartMixClick}
                    className="day-selector-smart-mix-btn"
                >

                    <i className="fa-solid fa-wand-magic-sparkles group-hover:animate-pulse text-[10px] md:text-[12px]"></i>
                    <span>스마트 최적화</span>
                </button>
            </div>
        </div>
    );
}

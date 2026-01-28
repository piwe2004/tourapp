'use client';

/**
 * -------------------------------------------------------------------------
 * @file        : src/components/planner/PlannerTimeline.tsx
 * @description : 여행 일정의 타임라인 뷰 컴포넌트 (Drag & Drop 지원)
 * @author      : MIN
 * @date        : 2026-01-04
 * -------------------------------------------------------------------------
 * @history
 * - 2026-01-04 MIN : 최초 작성
 * -------------------------------------------------------------------------
 */


import { PlanItem } from '@/types/place';
import { RainyScheduleItem } from '@/lib/weather/actions';
import { WeatherData } from '@/lib/weather/service';
import { TravelContext } from '@/lib/actions';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import DayItems from '@/components/planner/DayItems';
import styles from './PlannerTimeline.module.scss';

interface PlannerTimelineProps {
    days: number[];
    dateRange: { start: Date; end: Date };
    selectedDay: number;
    schedule: PlanItem[];
    isLoading: boolean;
    weatherData: WeatherData | null;
    rainRisks: RainyScheduleItem[];
    selectedItemId: string | null;
    travelContext?: TravelContext | null;

    onDaySelect: (day: number) => void;
    onSmartMixClick: () => void;
    onItemClick: (id: string) => void;
    onDragEnd: (result: DropResult) => void;
    onReplaceClick: (item: PlanItem) => void;
    onLockClick: (id: string) => void;
    onDeleteClick: (id: string) => void;
    onAddStopClick: (index: number) => void;
    onPlanBClick: () => void;
    onMobileMapClick: () => void;
    onAddDayClick: () => void;
}

/**
 * @desc 플래너 페이지 타임라인 (Premium Redesign)
 *       - 깔끔한 수직 연결선
 *       - 부드러운 여백 및 카드 배치
 */
export default function PlannerTimeline({
    days,
    dateRange,
    selectedDay,
    schedule,
    isLoading,
    weatherData,
    rainRisks,
    selectedItemId,
    travelContext,
    onDaySelect,
    onSmartMixClick,
    onItemClick,
    onDragEnd,
    onReplaceClick,
    onLockClick,
    onDeleteClick,
    onAddStopClick,
    onPlanBClick,
    onMobileMapClick,
    onAddDayClick
}: PlannerTimelineProps) {

    // Sort items by time
    const currentDayItems = schedule
        .filter(item => item.day === selectedDay)
        .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

    const currentDayFocus = travelContext?.itinerary?.find(d => d.day === selectedDay)?.dayFocus;
    const getRainRisk = (itemId: string) => rainRisks.find(r => r.item.PLACE_ID === itemId);

    return (
        <section className={styles.container}>
            {/* 1. Header Area: Date & Weather */}
            <div className={styles.header}>
                <div className={styles.dateSelector}>
                    {days.map(day => {
                        const d = new Date(dateRange.start);
                        d.setDate(d.getDate() + (day - 1));
                        const dateStr = `${String(d.getMonth() + 1)}.${String(d.getDate()).padStart(2, '0')}`;
                        const weekDay = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
                        const isActive = selectedDay === day;
                        
                        return (
                            <button 
                                key={day} 
                                onClick={() => onDaySelect(day)}
                                className={isActive ? styles.active : ''}
                            >
                                {dateStr} ({weekDay})
                            </button>
                        );
                    })}
                </div>

                {/* Weather Widget (From Screenshot) */}
                <div className={styles.weatherWidget}>
                     <div className={styles.iconBox}>
                        {weatherData?.sky === '맑음' ? (
                            <i className="fa-solid fa-sun text-orange-500"></i>
                         ) : weatherData?.pty !== '없음' ? (
                            <i className="fa-solid fa-umbrella text-blue-500"></i>
                         ) : (
                            <i className="fa-solid fa-cloud text-slate-400"></i>
                         )}
                     </div>
                     <div className={styles.info}>
                        <div className={styles.summary}>
                            {weatherData ? `${weatherData.sky} ${weatherData.tmp}` : '날씨 정보 로딩중'}
                        </div>
                        <div className={styles.detail}>
                            <span>제주시</span>
                            {weatherData?.pty !== '없음' && <span className="text-blue-500">오후에 비 예상, 우산 챙기세요 ☔</span>}
                        </div>
                     </div>
                </div>
            </div>

            {/* 2. Timeline List */}
            <div className={styles.timelineList}>
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="day-items">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {currentDayItems.map((item, index) => (
                                        <Draggable draggableId={item.PLACE_ID.toString()} index={index} key={item.PLACE_ID}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={provided.draggableProps.style}
                                                    className={styles.dayItem}
                                                >
                                                    {/* Marker */}
                                                    <div className={styles.marker}></div>

                                                    {/* Card Content */}
                                                     <DayItems 
                                                        item={item} 
                                                        index={index}
                                                        rainRisk={getRainRisk(item.PLACE_ID)}
                                                        onPlanBClick={onPlanBClick}
                                                        onClick={() => onItemClick(item.PLACE_ID)}
                                                        selected={selectedItemId === item.PLACE_ID}
                                                        onReplaceClick={() => onReplaceClick(item)}
                                                        onLockClick={() => onLockClick(item.PLACE_ID)}
                                                        onDeleteClick={() => onDeleteClick(item.PLACE_ID)}
                                                        onAddStopClick={() => onAddStopClick(index + 1)}
                                                        isLastItem={index === currentDayItems.length - 1}
                                                        className={styles.card}
                                                     />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}

                 {/* Add Item Button */}
                 <button className={styles.addItemBtn} onClick={onAddDayClick}>
                    + 일정 추가하기
                 </button>
            </div>
        </section>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                        <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

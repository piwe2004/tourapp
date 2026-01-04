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
import Map from '@/components/planner/Map';
import DaySelector from '@/components/planner/DaySelector';

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
        <section className="relative w-full h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* 1. Header Area: Date & Weather */}
            <div className="shrink-0 bg-white border-b border-slate-200 z-10 shadow-sm">
                <DaySelector
                    days={days}
                    dateRange={dateRange}
                    selectedDay={selectedDay}
                    onDaySelect={onDaySelect}
                    onSmartMixClick={onSmartMixClick}
                    weatherData={weatherData}
                />
            </div>

            {/* 2. Mobile Map Preview */}
            <div className="lg:hidden relative h-32 w-full shrink-0 border-b border-slate-200 bg-slate-100">
                <Map schedule={schedule} selectedDay={selectedDay} selectedItemId={selectedItemId} onItemClick={onItemClick} />
                <button
                    className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm shadow-md rounded-lg text-xs font-bold text-slate-700 hover:bg-white transition-colors z-10 border border-slate-200"
                    onClick={onMobileMapClick}
                >
                    지도 크게 보기
                </button>
            </div>

            {/* 3. Timeline List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-20">

                {/* Day Focus Header */}
                {!isLoading && currentDayFocus && (
                    <div className="mb-8 p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700"></div>
                        <span className="inline-block px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-[10px] font-bold mb-2 border border-white/20">
                            DAY {selectedDay} TRIP THEME
                        </span>
                        <h3 className="text-xl md:text-2xl font-black leading-snug drop-shadow-md">
                            "{currentDayFocus}"
                        </h3>
                    </div>
                )}

                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="day-items">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="relative flex flex-col gap-0 min-h-[300px]"
                                // Gap is handled by individual items padding to ensure continuous line connection
                                >
                                    {/* The continuous vertical line is drawn inside individual items or by a global absolute line. 
                                        Here, we can use a global absolute line if spacing is uniform, but with varying card heights, 
                                        it's better to let cards handle their segment or draw a long line behind.
                                        
                                        Approach: Absolute line on the left.
                                    */}
                                    <div className="absolute top-4 bottom-4 left-[21px] w-0.5 bg-slate-200 -z-10"></div>

                                    {currentDayItems.map((item, index) => (
                                        <Draggable draggableId={item.PLACE_ID.toString()} index={index} key={item.PLACE_ID}>
                                            {(provided, snapshot) => (
                                                <div className="relative mb-4">
                                                    {/* Wrapper for margin control */}
                                                    <DayItems
                                                        item={item}
                                                        index={index}
                                                        onClick={() => onItemClick(item.PLACE_ID)}
                                                        selected={selectedItemId === item.PLACE_ID}
                                                        innerRef={provided.innerRef}
                                                        draggableProps={provided.draggableProps}
                                                        dragHandleProps={provided.dragHandleProps}
                                                        isDragging={snapshot.isDragging}
                                                        onReplaceClick={() => onReplaceClick(item)}
                                                        onLockClick={() => onLockClick(item.PLACE_ID)}
                                                        onDeleteClick={() => onDeleteClick(item.PLACE_ID)}
                                                        onAddStopClick={() => onAddStopClick(index + 1)}
                                                        onPlanBClick={onPlanBClick}
                                                        rainRisk={getRainRisk(item.PLACE_ID)}
                                                        isLastItem={index === currentDayItems.length - 1}
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
                <button
                    onClick={onAddDayClick}
                    className="w-full mt-4 py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-2"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-emerald-200">
                        <i className="fa-solid fa-plus text-sm text-slate-500 group-hover:text-emerald-600"></i>
                    </div>
                    일정 추가하기
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

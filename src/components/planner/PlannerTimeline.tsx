'use client';

import { PlanItem } from '@/mockData';
import { RainyScheduleItem } from '@/lib/weather/actions';
import { WeatherData } from '@/lib/weather/service'; // Type Import
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import DayItems from '@/components/planner/DayItems';
import Map from '@/components/planner/Map'; // 모바일용 맵 렌더링에 필요
import DaySelector from '@/components/planner/DaySelector'; // 타임라인 상단의 날짜 선택기

interface PlannerTimelineProps {
    days: number[];
    dateRange: { start: Date; end: Date };
    selectedDay: number; // Restore this
    schedule: PlanItem[];
    isLoading: boolean;
    weatherData: WeatherData | null; // Prop 추가
    rainRisks: RainyScheduleItem[];
    selectedItemId: number | null;
    
    // Handlers
    onDaySelect: (day: number) => void;
    onSmartMixClick: () => void;
    onItemClick: (id: number) => void;
    onDragEnd: (result: DropResult) => void;
    onReplaceClick: (item: PlanItem) => void;
    onLockClick: (id: number) => void;
    onDeleteClick: (id: number) => void;
    onAddStopClick: (index: number) => void;
    onPlanBClick: () => void;
    onMobileMapClick: () => void;
    onAddDayClick: () => void; // "일정 추가하기" 버튼 핸들러
}

/**
 * @desc 플래너 페이지의 좌측 패널(타임라인)을 담당하는 컴포넌트입니다.
 * 
 * 주요 역할:
 * 1. DaySelector를 통한 날짜 이동
 * 2. Drag & Drop 가능한 일정 리스트(DayItems) 렌더링
 * 3. 일정 추가, 삭제, 수정 등의 액션 트리거
 * 4. 모바일 환경에서의 지도 보기 진입점 제공
 */
export default function PlannerTimeline({
    days,
    dateRange,
    selectedDay,
    schedule,
    isLoading,
    weatherData, // Destructuring
    rainRisks,
    selectedItemId,
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
    
    // 선택된 날짜에 해당하는 아이템만 필터링 및 시간순 정렬
    const currentDayItems = schedule
        .filter(item => item.day === selectedDay)
        .sort((a, b) => a.time.localeCompare(b.time));

    // 특정 아이템의 강수 확률 정보를 가져오는 헬퍼 함수
    const getRainRisk = (itemId: number) => rainRisks.find(r => r.item.id === itemId);

    return (
        <section className="w-full lg:w-[480px] xl:w-[540px] bg-[#F8FAFC] h-full flex flex-col border-r border-gray-200 z-10 shadow-xl relative shrink-0">
            {/* 1. 날짜 선택 및 날씨 요약 위젯 */}
            <DaySelector 
                days={days}
                dateRange={dateRange}
                selectedDay={selectedDay}
                onDaySelect={onDaySelect}
                onSmartMixClick={onSmartMixClick}
                weatherData={weatherData} // Pass to DaySelector
            />

            {/* 2. 모바일 전용 지도 미리보기 (LG 사이즈 이상에서는 숨김) */}
            <div className="lg:hidden w-full h-[200px] shrink-0 relative bg-gray-100">
                <Map schedule={schedule} selectedDay={selectedDay} selectedItemId={selectedItemId} />
                <button 
                    className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-lg text-xs font-bold shadow-md z-10" 
                    onClick={onMobileMapClick}
                >
                    지도 크게 보기
                </button>
            </div>

            {/* 3. 타임라인 리스트 영역 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-10 relative bg-[#F8FAFC]">
                {/* 타임라인 수직 연결선 (화면 크기에 따라 위치 조정됨) */}

                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="day-items">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-0 relative"
                                >
                                    <div className="absolute left-[26px] md:left-[17px] top-[0px]  w-[2px] bg-indigo-100/80 h-[calc(100%-4px)]"></div>
                                    {currentDayItems.map((item, index) => (
                                        <Draggable draggableId={item.id.toString()} index={index} key={item.id}>
                                            {(provided, snapshot) => (
                                                <DayItems
                                                    item={item}
                                                    index={index}
                                                    onClick={() => onItemClick(item.id)}
                                                    selected={selectedItemId === item.id}
                                                    innerRef={provided.innerRef}
                                                    draggableProps={provided.draggableProps}
                                                    dragHandleProps={provided.dragHandleProps}
                                                    isDragging={snapshot.isDragging}
                                                    onReplaceClick={() => onReplaceClick(item)}
                                                    onLockClick={() => onLockClick(item.id)}
                                                    onDeleteClick={() => onDeleteClick(item.id)}
                                                    onAddStopClick={() => onAddStopClick(index + 1)} // 현재 아이템 다음 위치에 추가
                                                    onPlanBClick={onPlanBClick}
                                                    rainRisk={getRainRisk(item.id)}
                                                    isLastItem={index === currentDayItems.length - 1} // 마지막 아이템은 연결선 처리 다르게 할 수 있음
                                                />
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}

                {/* 4. 일정 추가 버튼 */}
                <button 
                    onClick={onAddDayClick}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-bold hover:border-[#4338CA] hover:text-[#4338CA] hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2 text-sm group mt-4 relative z-10 bg-[#F8FAFC]"
                >
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 group-hover:bg-[#4338CA] group-hover:text-white flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-plus text-[12px]"></i>
                    </div>
                    일정 추가하기
                </button>
            </div>
        </section>
    );
}

/**
 * @desc 로딩 중일 때 보여줄 스켈레톤 UI
 */
function LoadingSkeleton() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto mt-10 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-slate-500 font-medium animate-pulse">플래니가 생각 중...</p>
        </div>
    );
}

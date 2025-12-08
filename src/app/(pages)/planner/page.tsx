'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Share2, Calendar, Users, MapPin } from 'lucide-react';
import { getTravelPlan } from '@/lib/actions';
import { PlanItem } from '@/mockData';
import DateEditor from '@/components/planner/DateEditor';
import GuestEditor from '@/components/planner/GuestEditor';
import DestinationEditor from '@/components/planner/DestinationEditor';
import DayItems from '@/components/planner/DayItems';
import Button_type1 from '@/components/ui/Button_type1';
import Map from '@/components/planner/Map';
import PlaceReplacementModal from '@/components/planner/PlaceReplacementModal';
import SmartMixModal from '@/components/planner/SmartMixModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { regenerateSchedule, PlannerTheme } from '@/services/ReplanningService';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function PlannerView() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <PlannerContent />
        </Suspense>
    );
}

function PlannerContent() {
    const searchParams = useSearchParams();
    const initialDestination = searchParams.get('destination') || '여행지';

    const [isLoading, setIsLoading] = useState(true);
    const [schedule, setSchedule] = useState<PlanItem[]>([]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    const [destination, setDestination] = useState(initialDestination);
    const [dateRange, setDateRange] = useState<{ start: Date, end: Date }>({
        start: new Date(),
        end: new Date(new Date().setDate(new Date().getDate() + 2))
    });
    const [guests, setGuests] = useState({ adult: 2, teen: 0, child: 0 });

    const [isDateEditorOpen, setIsDateEditorOpen] = useState(false);
    const [isGuestEditorOpen, setIsGuestEditorOpen] = useState(false);
    const [isDestEditorOpen, setIsDestEditorOpen] = useState(false);
    
    // Replacement Modal State
    const [replaceModalState, setReplaceModalState] = useState<{ isOpen: boolean; targetItem: PlanItem | null }>({
        isOpen: false,
        targetItem: null,
    });

    // Re-planning State
    const [isSmartMixOpen, setIsSmartMixOpen] = useState(false);
    const [isReplanning, setIsReplanning] = useState(false);
    
    // Confirm Modal State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, message: "", onConfirm: () => {} });

    const getFormattedDate = (dayIndex: number) => {
        const date = new Date(dateRange.start);
        date.setDate(date.getDate() + (dayIndex - 1));
        return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

// ... (skipping unchanged code) ...

    /**
     * @desc 스마트 믹스 리플래닝 실행 핸들러 (Modal Confirm)
     */
    const handleSmartMixConfirm = async (scope: number | 'all', theme: PlannerTheme) => {
        const runReplanning = async () => {
            setIsReplanning(true);
            try {
                let newSchedule = [...schedule];

                if (scope === 'all') {
                    for (const day of days) {
                        newSchedule = await regenerateSchedule(newSchedule, day, theme);
                    }
                } else {
                    newSchedule = await regenerateSchedule(newSchedule, scope, theme);
                }
                
                setSchedule(newSchedule);
                setIsSmartMixOpen(false);
            } catch (error) {
                console.error("Re-planning failed:", error);
                alert("일정 재구성에 실패했습니다. 잠시 후 다시 시도해주세요.");
            } finally {
                setIsReplanning(false);
            }
        };

        // Check for locked items in the scope
        let hasLockedItems = false;
        if (scope === 'all') {
            hasLockedItems = schedule.some(item => item.isLocked);
        } else {
            hasLockedItems = schedule.some(item => item.day === scope && item.isLocked);
        }

        if (hasLockedItems) {
            setConfirmState({
                isOpen: true,
                message: "고정된 장소는\n변경되지 않고 유지됩니다.\n\n계속 진행하시겠습니까?",
                onConfirm: runReplanning
            });
        } else {
            runReplanning();
        }
    };



    const days = Array.from(new Set(schedule.map(item => item.day))).sort((a, b) => a - b);
    // [수정] 일정 아이템을 시간 순서대로 정렬하여 렌더링
    const currentDayItems = schedule
        .filter((item) => item.day === selectedDay)
        .sort((a, b) => a.time.localeCompare(b.time));

    useEffect(() => {
        const fetchData = async () => {
            if (!destination || destination === '여행지') {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const data = await getTravelPlan(destination);
                setSchedule(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [destination]);

    /**
     * @desc 여행 기간(dateRange) 변경 시 스케줄(schedule)의 일수(Day)를 동기화합니다.
     * 날짜가 늘어나면 새로운 Day를 추가하고, 줄어들면 초과된 Day를 제거합니다.
     */
    useEffect(() => {
        if (schedule.length === 0) return;

        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        // 날짜 차이 계산: (종료일 - 시작일) 일수 + 1
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // 현재 스케줄이 포함하는 최대 Day 계산
        const currentMaxDay = schedule.length > 0 
            ? Math.max(...schedule.map(item => item.day)) 
            : 0;

        // 변경이 필요 없는 경우 중단
        if (totalDays === currentMaxDay) return;

        if (totalDays < currentMaxDay) {
            // [CASE 1] 여행 기간이 줄어든 경우: 초과된 날짜의 아이템 제거
            setSchedule(prev => prev.filter(item => item.day <= totalDays));
            
            // 만약 현재 보고 있는 날짜가 삭제된 날짜라면 1일차로 이동
            if (selectedDay > totalDays) setSelectedDay(1);

        } else {
            // [CASE 2] 여행 기간이 늘어난 경우: 새로운 날짜에 기본 일정 추가
            const newItems: PlanItem[] = [];
            for (let d = currentMaxDay + 1; d <= totalDays; d++) {
                newItems.push({
                    id: Date.now() + d, // 고유 ID 생성 (Timestamp 활용)
                    day: d,
                    time: "10:00",
                    activity: "자유 일정",
                    type: "etc", // 기타 타입
                    memo: "새로 추가된 여행일입니다. 일정을 계획해보세요!",
                    lat: 33.4996, // 제주공항/시내 인근 좌표
                    lng: 126.5312,
                    isLocked: false
                });
            }
            setSchedule(prev => [...prev, ...newItems]);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange, schedule.length]); // schedule.length가 변하거나 dateRange가 변할 때 체크

    useEffect(() => {
        setSelectedItemId(null);
    }, [selectedDay]);

    const formatDateRange = () => {
        const start = `${dateRange.start.getMonth() + 1}.${dateRange.start.getDate()}`;
        const end = `${dateRange.end.getMonth() + 1}.${dateRange.end.getDate()}`;
        return `${start} - ${end}`;
    };

    const formatGuests = () => {
        const total = guests.adult + guests.teen + guests.child;
        return `총 ${total}명`;
    };

    const handleItemClick = (id: number) => {
        setSelectedItemId(prev => prev === id ? null : id);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(currentDayItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const otherItems = schedule.filter(item => item.day !== selectedDay);
        
        const newSchedule = [...otherItems, ...items].sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            const indexA = items.indexOf(a);
            const indexB = items.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            return 0;
        });

        setSchedule(newSchedule);
    };

    const handleReplacePlace = (newItem: PlanItem) => {
        setSchedule(prev => prev.map(item => 
            item.id === replaceModalState.targetItem?.id ? newItem : item
        ));
        setReplaceModalState({ isOpen: false, targetItem: null });
    };

    /**
     * @desc 일정 고정/해제 토글 핸들러
     */
    const handleToggleLock = (id: number) => {
        setSchedule(prev => prev.map(item => 
            item.id === id ? { ...item, isLocked: !item.isLocked } : item
        ));
    };



    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-20">
            {isDateEditorOpen && (
                <DateEditor
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onSave={(start, end) => {
                        setDateRange({ start, end });
                        setIsDateEditorOpen(false);
                    }}
                    onClose={() => setIsDateEditorOpen(false)}
                />
            )}
            {isGuestEditorOpen && (
                <GuestEditor
                    guests={guests}
                    onSave={(newGuests) => {
                        setGuests(newGuests);
                        setIsGuestEditorOpen(false);
                    }}
                    onClose={() => setIsGuestEditorOpen(false)}
                />
            )}
            {isDestEditorOpen && (
                <DestinationEditor
                    destination={destination}
                    onSave={(newDest) => {
                        setDestination(newDest);
                        setIsDestEditorOpen(false);
                    }}
                    onClose={() => setIsDestEditorOpen(false)}
                />
            )}
            
            {replaceModalState.isOpen && replaceModalState.targetItem && (
                <PlaceReplacementModal
                    isOpen={replaceModalState.isOpen}
                    onClose={() => setReplaceModalState({ isOpen: false, targetItem: null })}
                    onReplace={handleReplacePlace}
                    originalItem={replaceModalState.targetItem}
                />
            )}

            <SmartMixModal 
                isOpen={isSmartMixOpen}
                onClose={() => setIsSmartMixOpen(false)}
                onConfirm={handleSmartMixConfirm}
                totalDays={days.length}
                startDate={dateRange.start}
                loading={isReplanning}
            />

            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                message={confirmState.message}
                title="일정 재구성 알림"
                confirmText="진행하기"
            />

            <div className="bg-white border-b border-slate-200 sticky top-[72px] z-30 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                {destination} 여행 계획
                                <span className="hidden md:inline-flex text-indigo-600 text-xs font-bold px-2 py-1 bg-indigo-50 rounded-full border border-indigo-100 items-center gap-1">
                                    <Sparkles size={12} /> Planni&apos;s Pick
                                </span>
                            </h2>
                            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                                <button onClick={() => setIsDateEditorOpen(true)} className="flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all -ml-2">
                                    <Calendar size={14} />
                                    <span className="font-medium">{formatDateRange()}</span>
                                </button>
                                <span className="text-slate-300">|</span>
                                <button onClick={() => setIsGuestEditorOpen(true)} className="flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all">
                                    <Users size={14} />
                                    <span className="font-medium">{formatGuests()}</span>
                                </button>
                                <span className="text-slate-300">|</span>
                                <button onClick={() => setIsDestEditorOpen(true)} className="flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all">
                                    <MapPin size={14} />
                                    <span className="font-medium">{destination}</span>
                                </button>
                            </div>
                        </div>
                        <button className="absolute top-4 right-4 md:static p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 mt-6">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-1/3 order-1">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 pb-2 scrollbar-hide overflow-x-auto">
                                    {days.length > 0 ? days.map((day) => (
                                        <Button_type1 
                                            key={day} 
                                            onClick={() => setSelectedDay(day)} 
                                            text={getFormattedDate(day)} 
                                            active={selectedDay === day}
                                        />
                                    )) : null}
                                </div>
                                <button
                                    onClick={() => setIsSmartMixOpen(true)}
                                    className="flex-shrink-0 ml-2 bg-indigo-600 text-white p-2 rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm font-bold"
                                >
                                    <Sparkles size={16} /> 
                                    <span className="hidden xl:inline">일정 재구성</span>
                                </button>
                            </div>
                            
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="day-items">
                                    {(provided) => (
                                        <div 
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="flex justify-between items-stretch gap-10 pb-5 overflow-x-scroll md:overflow-visible md:space-y-8 md:border-l-[3px] md:border-indigo-100 md:ml-4 md:pl-10 md:pb-0 md:block"
                                        >
                                            {currentDayItems.map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <DayItems 
                                                            item={item} 
                                                            index={index} 
                                                            onClick={() => handleItemClick(item.id)}
                                                            selected={selectedItemId === item.id}
                                                            innerRef={provided.innerRef}
                                                            draggableProps={provided.draggableProps}
                                                            dragHandleProps={provided.dragHandleProps}
                                                            isDragging={snapshot.isDragging}
                                                            onReplaceClick={() => setReplaceModalState({ isOpen: true, targetItem: item })}
                                                            onLockClick={() => handleToggleLock(item.id)}
                                                        />
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                        <div className="w-full lg:w-2/3 order-2">
                            <div className="lg:sticky lg:top-[190px] h-[300px] lg:h-[calc(100vh-220px)] rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
                                <Map schedule={schedule} selectedDay={selectedDay} selectedItemId={selectedItemId} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto mt-10 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-slate-500 font-medium animate-pulse">플래니가 생각 중...</p>
        </div>
    );
}
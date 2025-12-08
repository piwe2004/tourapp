'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Share2, Calendar, Users, MapPin, Plus, X } from 'lucide-react';
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


    
    // Replacement Modal State
    const [replaceModalState, setReplaceModalState] = useState<{ 
        isOpen: boolean; 
        targetItem: PlanItem | null;
        mode: 'replace' | 'add';
        targetIndex?: number;
    }>({
        isOpen: false,
        targetItem: null,
        mode: 'replace'
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

    // Mobile Map View State
    const [isMobileMapOpen, setIsMobileMapOpen] = useState(false);

    const handleReplacePlace = (newItem: PlanItem) => {
        if (replaceModalState.mode === 'replace') {
            setSchedule(prev => prev.map(item => 
                // [Fix] 교체 시 기존 아이템의 날짜(day)와 시간(time) 유지
                item.id === replaceModalState.targetItem?.id 
                    ? { ...newItem, day: item.day, time: item.time, id: item.id } 
                    : item
            ));
        } else if (replaceModalState.mode === 'add' && typeof replaceModalState.targetIndex === 'number') {
            const index = replaceModalState.targetIndex;
            // Re-fetch current items to ensure we have latest sort
            const currentDayItems = schedule.filter(item => item.day === selectedDay).sort((a,b)=>a.time.localeCompare(b.time));
            
            let newTime = "12:00";
            
            // Logic to find a time slot between index-1 and index (currentDayItems[index] is the one AFTER insertion point? No, index comes from `index + 1` in the click handler)
            // The button is rendered AFTER item `index`. So we want to insert at `index + 1` relative to the list *before* insertion.
            // The `targetIndex` passed to `openAddModal` corresponds to the destination index in the *displayed* list.
            
            const prevItem = currentDayItems[index - 1];
            const nextItem = currentDayItems[index];

            if (prevItem && nextItem) {
                // Calculate middle time
                const [h1, m1] = prevItem.time.split(':').map(Number);
                const [h2, m2] = nextItem.time.split(':').map(Number);
                
                const t1 = h1 * 60 + m1;
                const t2 = h2 * 60 + m2;
                const mid = Math.floor((t1 + t2) / 2);
                
                const h = Math.floor(mid / 60);
                const m = mid % 60;
                newTime = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
            } else if (prevItem) {
                 // Last item
                 const [h1, m1] = prevItem.time.split(':').map(Number);
                 const t1 = h1 * 60 + m1 + 60; // Add 60 mins
                 const h = Math.floor(t1 / 60) % 24;
                 const m = t1 % 60;
                 newTime = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; 
            }

            const itemToAdd: PlanItem = {
                ...newItem,
                id: Date.now(),
                day: selectedDay,
                time: newTime,
                isLocked: false,
            };

            setSchedule(prev => [...prev, itemToAdd]);
        }

        setReplaceModalState({ isOpen: false, targetItem: null, mode: 'replace' });
    };

    const openAddModal = (index: number) => {
        setReplaceModalState({
            isOpen: true,
            targetItem: null,
            mode: 'add',
            targetIndex: index
        });
    };

    const handleDeletePlace = (id: number) => {
        if (confirm("정말로 이 일정을 삭제하시겠습니까?")) {
            setSchedule(prev => prev.filter(item => item.id !== id));
        }
    };

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
        console.log("Planner Page: useEffect triggered. Destination:", destination);
        const fetchData = async () => {
            if (!destination || destination === '여행지') {
                console.log("Planner Page: No destination or default. Setting isLoading false.");
                setIsLoading(false);
                return;
            }

            console.log("Planner Page: Fetching plan for", destination);
            setIsLoading(true);
            try {
                const data = await getTravelPlan(destination);
                console.log("Planner Page: Data fetched:", data?.length);
                setSchedule(data);
            } catch (error) {
                console.error("Planner Page: Error fetching plan:", error);
            } finally {
                console.log("Planner Page: Loading finished.");
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



    /**
     * @desc 일정 고정/해제 토글 핸들러
     */
    const [activeSettingsTab, setActiveSettingsTab] = useState<'date' | 'guest' | 'dest' | null>(null);

    const toggleSettings = (tab: 'date' | 'guest' | 'dest') => {
        setActiveSettingsTab(prev => prev === tab ? null : tab);
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
            {replaceModalState.isOpen && (
                <PlaceReplacementModal
                    isOpen={replaceModalState.isOpen}
                    onClose={() => setReplaceModalState({ isOpen: false, targetItem: null, mode: 'replace' })}
                    onReplace={handleReplacePlace}
                    originalItem={replaceModalState.targetItem}
                    mode={replaceModalState.mode}
                />
            )}

            {isSmartMixOpen && (
                <SmartMixModal
                    isOpen={isSmartMixOpen}
                    onClose={() => setIsSmartMixOpen(false)}
                    onConfirm={handleSmartMixConfirm}
                    totalDays={days.length > 0 ? days.length : 1}
                    startDate={dateRange.start}
                />
            )}

            <ConfirmModal 
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                message={confirmState.message}
                title="일정 재구성 알림"
                confirmText="진행하기"
            />

            {/* Sticky Header */}
            <div className="bg-white border-b border-slate-200 sticky top-[72px] z-30 shadow-sm transition-all">
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
                                <button 
                                    onClick={() => toggleSettings('date')} 
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all -ml-2 ${activeSettingsTab === 'date' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600 hover:bg-indigo-50'}`}
                                >
                                    <Calendar size={14} />
                                    <span className="font-medium">{formatDateRange()}</span>
                                </button>
                                <span className="text-slate-300">|</span>
                                <button 
                                    onClick={() => toggleSettings('guest')} 
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${activeSettingsTab === 'guest' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600 hover:bg-indigo-50'}`}
                                >
                                    <Users size={14} />
                                    <span className="font-medium">{formatGuests()}</span>
                                </button>
                                <span className="text-slate-300">|</span>
                                <button 
                                    onClick={() => toggleSettings('dest')} 
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${activeSettingsTab === 'dest' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600 hover:bg-indigo-50'}`}
                                >
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

            {/* Inline Settings Panel (Scrolls with content) */}
            {activeSettingsTab && (
                <div className="bg-slate-100 border-b border-indigo-100 animate-slide-down">
                    <div className="max-w-xl mx-auto p-6">
                        {activeSettingsTab === 'date' && (
                            <DateEditor
                                startDate={dateRange.start}
                                endDate={dateRange.end}
                                onSave={(start, end) => {
                                    setDateRange({ start, end });
                                    setActiveSettingsTab(null);
                                }}
                                onClose={() => setActiveSettingsTab(null)}
                                isInline={true}
                            />
                        )}
                        {activeSettingsTab === 'guest' && (
                            <GuestEditor
                                guests={guests}
                                onSave={(newGuests) => {
                                    setGuests(newGuests);
                                    setActiveSettingsTab(null);
                                }}
                                onClose={() => setActiveSettingsTab(null)}
                                isInline={true}
                            />
                        )}
                        {activeSettingsTab === 'dest' && (
                            <DestinationEditor
                                destination={destination}
                                onSave={(newDest) => {
                                    setDestination(newDest);
                                    setActiveSettingsTab(null);
                                }}
                                onClose={() => setActiveSettingsTab(null)}
                                isInline={true}
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-[1600px] mx-auto px-4 mt-6">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-1/3 order-1">
                            <div className="flex items-center justify-between mb-6 gap-2">
                                <div className="no-scrollbar flex items-center gap-2 pt-2 pb-2 scrollbar-hide overflow-x-auto">
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
                                            className="pb-5 overflow-visible space-y-8 border-l-[3px] border-indigo-100 ml-4 pl-10 pb-0 block"
                                        >
                                            {currentDayItems.map((item, index) => (
                                                <div key={item.id} className="min-w-[90%] relative mb-0">
                                                     <Draggable draggableId={item.id.toString()} index={index}>
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
                                                                onReplaceClick={() => setReplaceModalState({ isOpen: true, targetItem: item, mode: 'replace' })}
                                                                onLockClick={() => handleToggleLock(item.id)}
                                                                onDeleteClick={() => handleDeletePlace(item.id)}
                                                            />
                                                        )}
                                                    </Draggable>
                                                    
                                                    {/* Insert Button (between items) */}
                                                    {index < currentDayItems.length - 1 && (
                                                        <div className="flex justify-center items-center pt-4 pb-4 relative z-0 group/insert max-w-full">
                                                            <button 
                                                                onClick={() => openAddModal(index + 1)}
                                                                className="opacity-100 w-6 h-6 rounded-full bg-white border-2 border-slate-300 text-slate-300 flex items-center justify-center hover:border-indigo-500 hover:text-indigo-600 hover:scale-110 transition-all z-20 shadow-sm md:opacity-0 md:group-hover/insert:opacity-100"
                                                                title="이 위치에 장소 추가"
                                                            >
                                                                <Plus size={14} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                        {/* Desktop Map (Hidden on Mobile) */}
                        <div className="hidden lg:block w-full lg:w-2/3 order-2">
                            <div className="lg:sticky lg:top-[190px] lg:h-[calc(100vh-220px)] rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
                                <Map schedule={schedule} selectedDay={selectedDay} selectedItemId={selectedItemId} />
                            </div>
                        </div>

                        {/* Mobile Map Button (FAB) */}
                        <button
                            onClick={() => setIsMobileMapOpen(true)}
                            className="lg:hidden fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-all animate-bounce-subtle"
                        >
                            <MapPin size={24} />
                            <span className="ml-2 font-bold">전체경로 보기</span>
                        </button>

                        {/* Mobile Map Modal (Full Screen) */}
                        {/* Mobile Map Modal (Card Style) */}
                        {isMobileMapOpen && (
                            <div className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center animate-fade-in">
                                <div className="w-full h-full max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20">
                                    <div className="flex justify-between items-center p-4 border-b bg-white">
                                        <h2 className="font-bold text-lg flex items-center gap-2">
                                            <MapPin size={20} className="text-indigo-600"/>
                                            전체 경로 보기
                                        </h2>
                                        <button 
                                            onClick={() => setIsMobileMapOpen(false)}
                                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <div className="flex-1 relative">
                                        <Map schedule={schedule} selectedDay={selectedDay} selectedItemId={selectedItemId} />
                                    </div>
                                </div>
                            </div>
                        )}
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
'use client';

/**
 * @file PlannerView (page.tsx)
 * @desc 여행 플래너의 메인 페이지 컨테이너입니다.
 * 
 * 주요 역할:
 * 1. 상태 관리 (State Management) - usePlannerStore 및 로컬 useState 사용
 * 2. 데이터 가져오기 (Data Fetching) - 여행 계획, 날씨, 추천 장소 등
 * 3. 핸들러 정의 (Event Handlers) - 사용자 입력에 따른 상태 변경 로직
 * 4. 레이아웃 조립 (Layout Composition) - PlannerTimeline, PlannerMapPanel, PlannerModals 컴포넌트 조합
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTravelPlan } from '@/lib/actions';
import { PlanItem } from '@/mockData';
import { getPlanBRecommendations, RainyScheduleItem } from '@/lib/weather/actions';
import { regenerateSchedule, PlannerTheme } from '@/services/ReplanningService';
import { DropResult } from '@hello-pangea/dnd';
import { usePlannerStore } from '@/store/plannerStore';

// 분리된 컴포넌트들 Import
import PlannerTimeline from '@/components/planner/PlannerTimeline';
import PlannerMapPanel from '@/components/planner/PlannerMapPanel';
import PlannerModals from '@/components/planner/PlannerModals';

export default function PlannerView() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <PlannerContent />
        </Suspense>
    );
}

function PlannerContent() {
    // URL 쿼리 파라미터에서 여행지 정보 가져오기
    const searchParams = useSearchParams();
    const initialDestination = searchParams.get('destination') || '여행지';

    // 1. 전역 상태 (Global Store)
    const { 
        destination, dateRange, guests, activeEditor,
        setDestination, setDateRange, setGuests, setActiveEditor 
    } = usePlannerStore();

    // 초기화: URL 파라미터로 받은 여행지를 스토어에 설정
    useEffect(() => {
        setDestination(initialDestination);
    }, [initialDestination, setDestination]);

    // 2. 로컬 상태 (Local State)
    const [isLoading, setIsLoading] = useState(true);
    const [schedule, setSchedule] = useState<PlanItem[]>([]); // 전체 일정 데이터
    const [selectedDay, setSelectedDay] = useState(1);        // 현재 선택된 날짜 (Day 1, 2...)
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null); // 지도/리스트에서 하이라이트된 아이템 ID

    // 날씨 및 Plan B 관련 상태
    const [rainRisks, setRainRisks] = useState<RainyScheduleItem[]>([]);
    const [isPlanBOpen, setIsPlanBOpen] = useState(false);

    // 모달 제어 상태
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

    const [isSmartMixOpen, setIsSmartMixOpen] = useState(false); // 스마트 일정 재구성 모달
    
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, message: "", onConfirm: () => { } });

    const [isMobileMapOpen, setIsMobileMapOpen] = useState(false); // 모바일 전체화면 지도

    // =========================================================================================
    // Handlers (이벤트 처리 로직)
    // =========================================================================================

    /**
     * @desc 일정 추가 모달 열기
     * @param index 추가할 위치 (순서 인덱스)
     */
    const openAddModal = (index: number) => {
        setReplaceModalState({
            isOpen: true,
            targetItem: null,
            mode: 'add',
            targetIndex: index
        });
    };

    /**
     * @desc 장소 교체 또는 추가 완료 시 실행
     * @param newItem 새로 선택된 장소 데이터
     */
    const handleReplacePlace = (newItem: PlanItem) => {
        if (replaceModalState.mode === 'replace') {
            // 기존 아이템 교체
            setSchedule(prev => prev.map(item =>
                item.id === replaceModalState.targetItem?.id
                    ? { ...newItem, day: item.day, time: item.time, id: item.id }
                    : item
            ));
        } else if (replaceModalState.mode === 'add') {
            // 새 아이템 추가
            const index = replaceModalState.targetIndex ?? 0;
            const currentDayItems = schedule.filter(item => item.day === selectedDay).sort((a, b) => a.time.localeCompare(b.time));
            let newTime = "12:00";
            
            // 시간 자동 계산 로직 (이전 아이템 시간 + 30분)
            const prevItem = currentDayItems[index - 1];
            if (prevItem) {
                const [h, m] = prevItem.time.split(':').map(Number);
                const nextM = m + 30;
                const nextH = h + Math.floor(nextM / 60);
                newTime = `${String(nextH % 24).padStart(2, '0')}:${String(nextM % 60).padStart(2, '0')}`;
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

    /**
     * @desc 아이템 삭제 (Confirm 확인 후 진행)
     */
    const handleDeletePlace = (id: number) => {
        setConfirmState({
            isOpen: true,
            message: "정말로 이 일정을 삭제하시겠습니까?",
            onConfirm: () => {
                setSchedule(prev => prev.filter(item => item.id !== id));
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    /**
     * @desc 아이템 잠금 토글 (Lock/Unlock)
     */
    const handleToggleLock = (id: number) => {
        setSchedule(prev => prev.map(item =>
            item.id === id ? { ...item, isLocked: !item.isLocked } : item
        ));
    };

    /**
     * @desc 스마트 믹스(자동 재구성) 실행
     * @param scope 적용 범위 (단일 날짜 or 전체 'all')
     * @param theme 선택한 테마 (키즈, 힐링 등)
     */
    const handleSmartMixConfirm = async (scope: number | 'all', theme: PlannerTheme) => {
        const runReplanning = async () => {
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
                alert("일정 재구성에 실패했습니다.");
            }
        };

        const hasLockedItems = scope === 'all'
            ? schedule.some(item => item.isLocked)
            : schedule.some(item => item.day === scope && item.isLocked);

        // 잠긴 아이템이 있으면 경고 표시 후 진행
        if (hasLockedItems) {
            setConfirmState({
                isOpen: true,
                message: "고정된 장소는 유지됩니다. 진행하시겠습니까?",
                onConfirm: runReplanning
            });
        } else {
            runReplanning();
        }
    };

    // =========================================================================================
    // Effects & Computed State
    // =========================================================================================

    // 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getTravelPlan(destination);
                setSchedule(data);

                // Plan B 날씨 위험요소 체크 (데모용 Mock)
                const todayStr = new Date().toISOString().split('T')[0];
                const risks = await getPlanBRecommendations(123, todayStr);
                setRainRisks(risks);
            } catch (error) {
                console.error("Failed to fetch plan:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [destination]);

    // 날짜 범위에 따른 총 일수(days) 계산
    const duration = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const days = Array.from({ length: duration }, (_, i) => i + 1);

    // 날짜가 줄어들었을 경우, 범위를 벗어난 일정 정리 (선택적)
    useEffect(() => {
        if (schedule.length === 0) return;
        const currentMaxDay = Math.max(...schedule.map(item => item.day), 0);
        
        if (duration < currentMaxDay) {
             setSchedule(prev => prev.filter(item => item.day <= duration));
             if (selectedDay > duration) setSelectedDay(1);
        }
    }, [duration, schedule, selectedDay]);

    // 날짜 변경 시 선택 아이템 초기화
    useEffect(() => {
        setSelectedItemId(null);
    }, [selectedDay]);

    const handleItemClick = (id: number) => {
        setSelectedItemId(prev => prev === id ? null : id);
    };

    // 드래그 앤 드롭 종료 시 처리
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const currentDayItems = schedule
            .filter(item => item.day === selectedDay)
            .sort((a, b) => a.time.localeCompare(b.time));

        const items = Array.from(currentDayItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const otherItems = schedule.filter(item => item.day !== selectedDay);

        // 재정렬 후 병합
        const newSchedule = [...otherItems, ...items].sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            const indexA = items.indexOf(a);
            const indexB = items.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            return 0;
        });

        setSchedule(newSchedule);
    };

    // =========================================================================================
    // Render
    // =========================================================================================

    return (
        <div className="h-screen w-full bg-white flex flex-col font-sans overflow-hidden">
            {/* Main Content Area */}
            <main className="flex flex-1 overflow-hidden relative">
                {/* 1. 좌측 타임라인 패널 */}
                <PlannerTimeline 
                    days={days}
                    dateRange={dateRange}
                    selectedDay={selectedDay}
                    schedule={schedule}
                    isLoading={isLoading}
                    rainRisks={rainRisks}
                    selectedItemId={selectedItemId}
                    onDaySelect={setSelectedDay}
                    onSmartMixClick={() => setIsSmartMixOpen(true)}
                    onItemClick={handleItemClick}
                    onDragEnd={onDragEnd}
                    onReplaceClick={(item) => setReplaceModalState({ isOpen: true, targetItem: item, mode: 'replace' })}
                    onLockClick={handleToggleLock}
                    onDeleteClick={handleDeletePlace}
                    onAddStopClick={openAddModal}
                    onPlanBClick={() => setIsPlanBOpen(true)}
                    onMobileMapClick={() => setIsMobileMapOpen(true)}
                    onAddDayClick={() => setReplaceModalState({ isOpen: true, targetItem: null, mode: 'add', targetIndex: schedule.filter(i => i.day === selectedDay).length })}
                />

                {/* 2. 우측 지도 패널 (PCOnly) */}
                <PlannerMapPanel 
                    schedule={schedule}
                    selectedDay={selectedDay}
                    selectedItemId={selectedItemId}
                />
            </main>

            {/* 3. 각종 모달 모음 */}
            <PlannerModals 
                schedule={schedule}
                selectedDay={selectedDay}
                selectedItemId={selectedItemId}
                dateRange={dateRange}
                destination={destination}
                guests={guests}
                days={days}
                replaceModalState={replaceModalState}
                isSmartMixOpen={isSmartMixOpen}
                confirmState={confirmState}
                isPlanBOpen={isPlanBOpen}
                isMobileMapOpen={isMobileMapOpen}
                activeEditor={activeEditor}
                onReplaceClose={() => setReplaceModalState({ isOpen: false, targetItem: null, mode: 'replace' })}
                onReplaceConfirm={handleReplacePlace}
                onSmartMixClose={() => setIsSmartMixOpen(false)}
                onSmartMixConfirm={handleSmartMixConfirm}
                onConfirmClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onPlanBClose={() => setIsPlanBOpen(false)}
                onMobileMapClose={() => setIsMobileMapOpen(false)}
                onDateSave={(start, end) => { setDateRange({ start, end }); setActiveEditor(null); }}
                onGuestSave={(newGuests) => { setGuests(newGuests); setActiveEditor(null); }}
                onDestSave={(newDest) => { setDestination(newDest); setActiveEditor(null); }}
                onEditorClose={() => setActiveEditor(null)}
            />
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
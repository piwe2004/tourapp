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
import { getPlanBRecommendations, RainyScheduleItem, getWeather } from '@/lib/weather/actions'; // getWeather 추가
import { WeatherData } from '@/lib/weather/service'; // Type 추가
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
    const initialDestination = searchParams.get('destination') || '서울'; // 기본값 서울로 변경

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

    // [Mod] 날씨 캐시 상태 추가 (Day 번호 -> 날씨 데이터)
    const [weatherCache, setWeatherCache] = useState<Record<number, WeatherData>>({}); 
    // const [weatherData, setWeatherData] = useState<WeatherData | null>(null); // 기존 단일 상태 제거

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

                // Plan B 날씨 위험요소 체크
                const startDateStr = dateRange.start.toISOString().split('T')[0];
                const risks = await getPlanBRecommendations(123, startDateStr);
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

    // [New] 전체 일정 날씨 일괄 조회 (Batch Fetching)
    useEffect(() => {
        const fetchAllWeather = async () => {
            if (schedule.length === 0) return;

            // 이미 캐시가 꽉 차있으면 스킵 (선택 사항: 리프레시 버튼 등으로 강제 갱신 가능)
            // 여기서는 단순화를 위해 schedule이 변경될 때마다 재조회하거나, 
            // 혹은 기존 캐시에 없는 Day만 조회하도록 최적화 가능.
            // 이번 구현: schedule/dateRange 변경 시 전체 재조회 (날짜가 바뀌면 날씨도 바뀌므로)
            
            const newCache: Record<number, WeatherData> = {};
            
            const promises = days.map(async (day) => {
                // 해당 날짜 계산
                const targetDate = new Date(dateRange.start);
                targetDate.setDate(targetDate.getDate() + (day - 1));
                const dateStr = targetDate.toISOString().split('T')[0];

                // 해당 날짜의 첫 번째 일정 좌표 (없으면 서울)
                const dayItems = schedule.filter(item => item.day === day).sort((a, b) => a.time.localeCompare(b.time));
                let lat = 37.5665;
                let lng = 126.9780;

                if (dayItems.length > 0) {
                    lat = dayItems[0].lat;
                    lng = dayItems[0].lng;
                }

                try {
                    const data = await getWeather(lat, lng, dateStr);
                    newCache[day] = data;
                } catch (error) {
                    console.error(`Day ${day} weather fetch failed:`, error);
                }
            });

            await Promise.all(promises);
            setWeatherCache(newCache);
        };

        // 디바운싱 혹은 일정 로딩 완료 후 실행
        // schedule이 로드된 후 실행되어야 정확한 좌표를 쓸 수 있음
        if (!isLoading && schedule.length > 0) {
            fetchAllWeather();
        }
    }, [dateRange, schedule, isLoading, days.length]); // days 배열 자체보다는 length 의존이 안전

    // [Restored] 아이템 클릭 핸들러
    const handleItemClick = (id: number) => {
        setSelectedItemId(prev => prev === id ? null : id);
    };

    /* 기존 개별 조회 useEffect 제거
    // 날씨 데이터 가져오기 (selectedDay 변경 시)
    useEffect(() => {
        const fetchWeather = async () => {
            setWeatherData(null); // 로딩 중 초기화
            
            // 1. 현재 선택된 날짜 계산
            const targetDate = new Date(dateRange.start);
            targetDate.setDate(targetDate.getDate() + (selectedDay - 1));
            const dateStr = targetDate.toISOString().split('T')[0];

            // 2. 해당 날짜의 첫 번째 일정 좌표 가져오기 (없으면 서울 시청 좌표 사용)
            const dayItems = schedule.filter(item => item.day === selectedDay).sort((a, b) => a.time.localeCompare(b.time));
            let lat = 37.5665; // 서울 기본값
            let lng = 126.9780;

            if (dayItems.length > 0) {
                lat = dayItems[0].lat;
                lng = dayItems[0].lng;
            }

            try {
                const data = await getWeather(lat, lng, dateStr);
                setWeatherData(data);
            } catch (error) {
                console.error("Weather fetch failed:", error);
            }
        };

        fetchWeather();
    }, [selectedDay, dateRange, schedule]);
    */

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
        // 재정렬 후 병합
        const newSchedule = [...otherItems, ...items].sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            const indexA = items.indexOf(a);
            const indexB = items.indexOf(b);
            // items.indexOf returns -1 if not found, enabling stable sort relative to 'items' order
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1; // a is in items, b is not (should not happen in this logic)
            if (indexB !== -1) return 1;
            return 0; // neither in items (should not happen)
        });

        setSchedule(newSchedule);
    };

    // =========================================================================================
    // Render
    // =========================================================================================

    return (
        <div className="h-[calc(100vh-224px)] min-h-[800px] w-full bg-white flex flex-col font-sans overflow-hidden">
            {/* Main Content Area */}
            <main className="flex flex-1 overflow-hidden relative">
                {/* 1. 좌측 타임라인 패널 */}
                <PlannerTimeline 
                    days={days}
                    dateRange={dateRange}
                    selectedDay={selectedDay}
                    schedule={schedule}
                    isLoading={isLoading}
                    weatherData={weatherCache[selectedDay] || null} // [Mod] 캐시에서 현재 날짜 데이터 전달
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
                    onItemClick={handleItemClick} // [New] 마커 클릭 핸들러 전달
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
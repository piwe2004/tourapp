'use client';

/**
 * -------------------------------------------------------------------------
 * @file        : src/app/(pages)/planner/page.tsx
 * @description : 여행 플래너의 메인 페이지 컨테이너 (PlannerView)
 * @author      : MIN
 * @date        : 2026-01-04
 * -------------------------------------------------------------------------
 * @history
 * - 2026-01-04 MIN : 최초 작성
 * -------------------------------------------------------------------------
 */


/**
 * @file PlannerView (page.tsx)
 * @desc 여행 플래너의 메인 페이지 컨테이너입니다.
 */

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { extractTravelContext, getTravelPlan, TravelContext } from '@/lib/actions';
import { PlanItem } from '@/types/place';
import { RainyScheduleItem, getWeather, getPlanBRecommendations } from '@/lib/weather/actions';
import { WeatherData } from '@/lib/weather/service';
import { regenerateSchedule, PlannerTheme } from '@/services/ReplanningService';
import { DropResult } from '@hello-pangea/dnd';
import { usePlannerStore } from '@/store/plannerStore';

// 분리된 컴포넌트들 Import
import PlannerTimeline from '@/components/planner/PlannerTimeline';
import PlannerMapPanel from '@/components/planner/PlannerMapPanel';
import PlannerModals from '@/components/planner/PlannerModals';
import PlannerPlaceList from '@/components/planner/PlannerPlaceList'; // [New]
import styles from './planner.module.scss';

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
    const initialDestination = searchParams.get('destination') || '서울';

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
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null); // 지도/리스트에서 하이라이트된 아이템 ID
    const [travelContext, setTravelContext] = useState<TravelContext | null>(null); // AI 생성 컨텍스트

    // 날씨 및 Plan B 관련 상태
    const [rainRisks, setRainRisks] = useState<RainyScheduleItem[]>([]);
    const [isPlanBOpen, setIsPlanBOpen] = useState(false);

    // [Mod] 날씨 캐시 상태 추가 (Day 번호 -> 날씨 데이터)
    const [weatherCache, setWeatherCache] = useState<Record<number, WeatherData>>({});

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

    // Handlers

    /**
     * @desc 일정 추가 모달 열기
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
     */
    const handleReplacePlace = (newItem: PlanItem) => {
        if (replaceModalState.mode === 'replace') {
            // 기존 아이템 교체
            setSchedule(prev => prev.map(item =>
                item.PLACE_ID === replaceModalState.targetItem?.PLACE_ID
                    ? { ...newItem, day: item.day, time: item.time, PLACE_ID: item.PLACE_ID }
                    : item
            ));
        } else if (replaceModalState.mode === 'add') {
            // 새 아이템 추가
            const index = replaceModalState.targetIndex ?? 0;
            const currentDayItems = schedule.filter(item => item.day === selectedDay).sort((a, b) => {
                const aTime = typeof a.STAY_TIME === 'number' ? a.STAY_TIME : 60;
                const bTime = typeof b.STAY_TIME === 'number' ? b.STAY_TIME : 60;
                return aTime - bTime;
            });
            let newTime = "12:00";

            // 시간 자동 계산 로직
            const prevItem = currentDayItems[index - 1];
            if (prevItem && prevItem.time) {
                const [h, m] = prevItem.time.split(':').map(Number);
                const nextM = m + 30;
                const nextH = h + Math.floor(nextM / 60);
                newTime = `${String(nextH % 24).padStart(2, '0')}:${String(nextM % 60).padStart(2, '0')}`;
            }

            const itemToAdd: PlanItem = {
                ...newItem,
                PLACE_ID: Date.now().toString(),
                day: selectedDay,
                time: newTime,
                isLocked: false,
            };
            setSchedule(prev => [...prev, itemToAdd]);
        }
        setReplaceModalState({ isOpen: false, targetItem: null, mode: 'replace' });
    };

    /**
     * @desc 아이템 삭제
     */
    const handleDeletePlace = (id: string) => {
        setConfirmState({
            isOpen: true,
            message: "정말로 이 일정을 삭제하시겠습니까?",
            onConfirm: () => {
                setSchedule(prev => prev.filter(item => item.PLACE_ID !== id));
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    /**
     * @desc 아이템 잠금 토글
     */
    const handleToggleLock = (id: string) => {
        setSchedule(prev => prev.map(item =>
            item.PLACE_ID === id ? { ...item, isLocked: !item.isLocked } : item
        ));
    };

    /**
     * @desc 스마트 믹스 실행
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
    const fetchingRef = useRef<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!initialDestination) return;

            // Prevent double fetch in Strict Mode
            if (fetchingRef.current === initialDestination) {
                console.log("[Planner] Already fetching for:", initialDestination);
                return;
            }
            fetchingRef.current = initialDestination;

            setIsLoading(true);
            const aiSchedule: PlanItem[] = [];
            let context: TravelContext | null = null;

            // 1. [Try] AI Context & Hydration
            try {
                // 1-1. AI Context Extraction
                context = await extractTravelContext(initialDestination);
                console.log("[Planner] Extracted Context:", context);

                if (context) {
                    setTravelContext(context); // Store for UI enrichment

                    // Update Store
                    if (context.destination) setDestination(context.destination);
                    if (context.dateRange?.start && context.dateRange?.end) {
                        setDateRange({
                            start: new Date(context.dateRange.start),
                            end: new Date(context.dateRange.end)
                        });
                    }
                    if (context.party) {
                        setGuests({
                            adult: context.party.adult || 2,
                            teen: 0,
                            child: context.party.child || 0
                        });
                    }

                    // 1-2. Hydration (Itinerary -> DB)
                    // [Modified] Server Action now returns fully hydrated PlanItems.
                    if (context.itinerary && context.itinerary.length > 0) {
                        console.log("[Planner] Using pre-hydrated itinerary from Server.");
                        context.itinerary.forEach(dayPlan => {
                            if (dayPlan.places && Array.isArray(dayPlan.places)) {
                                aiSchedule.push(...dayPlan.places);
                            }
                        });
                    }
                }
            } catch (aiError) {
                console.error("[Planner] AI Generation Failed:", aiError);
            }

            // 2. Final Decision
            if (aiSchedule.length > 0) {
                // Success path
                console.log("[Planner] Schedule created via AI:", aiSchedule);
                setSchedule(aiSchedule);

                // Plan B (Optional)
                if (context) {
                    const startDateStr = context.dateRange?.start || dateRange.start.toISOString().split('T')[0];
                    getPlanBRecommendations(aiSchedule, startDateStr).then(risks => setRainRisks(risks));
                }
            } else {
                // 3. Fallback Logic
                if (context && context.destination) {
                    console.warn("[Planner] AI context exists but schedule is empty. Stopping to prevent fallback loop.");
                } else {
                    console.warn("[Planner] No AI context. Falling back to Legacy Cloud Function...");
                    try {
                        const fallbackData = await getTravelPlan(initialDestination);
                        setSchedule(fallbackData);
                    } catch (fallbackError) {
                        console.error("[Planner] Critical: Fallback failed:", fallbackError);
                    }
                }
            }

            setIsLoading(false);
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialDestination]);

    // 날짜 범위에 따른 총 일수(days) 계산
    const duration = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const days = Array.from({ length: duration }, (_, i) => i + 1);

    // [New] 전체 일정 날씨 일괄 조회 (Batch Fetching)
    useEffect(() => {
        const fetchAllWeather = async () => {
            if (schedule.length === 0) return;

            const newCache: Record<number, WeatherData> = {};
            const currentDays = Array.from({ length: duration }, (_, i) => i + 1);

            const promises = currentDays.map(async (day) => {
                const targetDate = new Date(dateRange.start);
                targetDate.setDate(targetDate.getDate() + (day - 1));
                const dateStr = targetDate.toISOString().split('T')[0];

                const dayItems = schedule.filter(item => item.day === day).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
                let lat = 37.5665;
                let lng = 126.9780;

                if (dayItems.length > 0) {
                    lat = dayItems[0].LOC_LAT;
                    lng = dayItems[0].LOC_LNG;
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

        if (!isLoading && schedule.length > 0) {
            fetchAllWeather();
        }
    }, [dateRange.start, dateRange.end, duration, schedule, isLoading]);

    // [Restored] 아이템 클릭 핸들러
    const handleItemClick = (id: string) => {
        setSelectedItemId(prev => prev === id ? null : id);
    };

    // 드래그 앤 드롭 종료 시 처리
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const currentDayItems = schedule
            .filter(item => item.day === selectedDay)
            .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

        const items = Array.from(currentDayItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const otherItems = schedule.filter(item => item.day !== selectedDay);

        const newSchedule = [...otherItems, ...items].sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            const indexA = items.indexOf(a);
            const indexB = items.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
        });

        setSchedule(newSchedule);
    };

    // =========================================================================================
    // Render
    // =========================================================================================
    
    // [SPOT_SEARCH] 여부 판단
    const isSpotSearch = travelContext?.tripType === 'SPOT_SEARCH';

    return (
        <div className={styles.plannerPage}>
            {/* 0. 헤더 영역 (AI 생성 테마 및 정보 요약) */}
            <header className={styles.plannerHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.headerTop}>
                        <h1 className={styles.destinationName}>{destination}</h1>
                        {travelContext?.tripSummary?.autoGeneratedTheme && (
                            <div className={styles.themeTag}>
                                <i className="fa-solid fa-sparkles"></i>
                                {travelContext.tripSummary.autoGeneratedTheme}
                            </div>
                        )}
                    </div>
                    {/* Summary Info */}
                    <div className={styles.summaryInfo}>
                        {!isSpotSearch && (
                            <>
                            <div className={styles.infoItem}>
                                <i className="fa-regular fa-calendar-days text-[14px]"></i>
                                <span>
                                    {dateRange.start.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} ~ {dateRange.end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                                </span>
                            </div>
                            <span className={styles.infoDivider}>|</span>
                            </>
                        )}
                        <div className={styles.infoItem}>
                            <i className="fa-solid fa-users text-[14px]"></i>
                            <span>성인 {guests.adult}명{guests.child > 0 ? `, 아동 ${guests.child}명` : ''}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                {/* 1. 좌측 패널: Timeline(코스) vs PlaceList(장소검색) */}
                <div className={styles.leftPanel}>
                    {isSpotSearch ? (
                        <PlannerPlaceList 
                                places={travelContext?.searchResults || []}
                                onItemClick={handleItemClick}
                                selectedItemId={selectedItemId}
                        />
                    ) : (
                        <PlannerTimeline
                            days={days}
                            dateRange={dateRange}
                            selectedDay={selectedDay}
                            schedule={schedule}
                            isLoading={isLoading}
                            weatherData={weatherCache[selectedDay] || null}
                            rainRisks={rainRisks}
                            selectedItemId={selectedItemId}
                            travelContext={travelContext}
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
                    )}
                </div>

                {/* 2. 우측 지도 패널 (PCOnly) */}
                <div className={`${styles.rightPanel} ${isMobileMapOpen ? styles.mobileOpen : ''}`}>
                    <PlannerMapPanel
                        schedule={isSpotSearch ? (travelContext?.searchResults || []) : schedule}
                        selectedDay={isSpotSearch ? 1 : selectedDay}
                        selectedItemId={selectedItemId}
                        onItemClick={handleItemClick}
                        showPath={!isSpotSearch} // [New] Spot Search 모드에서는 경로선 숨김
                    />
                </div>
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
                rainRisks={rainRisks}
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
                onItemClick={handleItemClick}
                onDateSave={(start, end) => { setDateRange({ start, end }); setActiveEditor(null); }}
                onGuestsSave={(newGuests: { adult: number, teen: number, child: number } | number) => {
                    if (typeof newGuests === 'number') {
                        setGuests({ adult: newGuests, teen: 0, child: 0 });
                    } else {
                        setGuests(newGuests);
                    }
                    setActiveEditor(null);
                }}
                onDestSave={(newDest) => { setDestination(newDest); setActiveEditor(null); }}
                onEditorClose={() => setActiveEditor(null)}
            />
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="planner-page">
            <div className="loadingContainer">
                <div className="spinner"></div>
                <p className="loadingText">플래니가 생각 중...</p>
            </div>
        </div>
    );
}
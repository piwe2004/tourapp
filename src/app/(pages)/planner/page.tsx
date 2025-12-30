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

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { extractTravelContext, getTravelPlan, getPlacesByNames, FirebasePlace, TravelContext } from '@/lib/actions';
import { PlanItem } from '@/types/place';
import { mapPlaceToPlanItem } from "@/lib/mappers";
import { RainyScheduleItem, getWeather, getPlanBRecommendations } from '@/lib/weather/actions'; // getWeather, getPlanBRecommendations 추가
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
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null); // 지도/리스트에서 하이라이트된 아이템 ID
    const [travelContext, setTravelContext] = useState<TravelContext | null>(null); // AI 생성 컨텍스트 (테마, 일자별 포커스 등)

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

    // Handlers

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
            
            // 시간 자동 계산 로직 (이전 아이템 시간 + 30분)
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
     * @desc 아이템 삭제 (Confirm 확인 후 진행)
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
     * @desc 아이템 잠금 토글 (Lock/Unlock)
     */
    const handleToggleLock = (id: string) => {
        setSchedule(prev => prev.map(item =>
            item.PLACE_ID === id ? { ...item, isLocked: !item.isLocked } : item
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
                    if (context.itinerary && context.itinerary.length > 0) {
                        const placeNames = context.itinerary.flatMap(day => day.places.map(p => p.NAME));
                        // Safe Fetch
                        let dbPlaces: FirebasePlace[] = [];
                        try {
                            dbPlaces = await getPlacesByNames(placeNames);
                        } catch (e) {
                            console.warn("[Planner] DB Batch fetch failed, proceeding with AI-only data:", e);
                        }
                        
                        const placesMap = new Map<string, FirebasePlace>();
                        dbPlaces.forEach(p => placesMap.set(p.NAME, p));

                        let timeOffset = 9;
                            context.itinerary.forEach((dayPlan) => {
                                timeOffset = 9;
                                dayPlan.places.forEach((aiPlace) => {
                                    try {
                                        const dbPlace = placesMap.get(aiPlace.NAME);
                                        let planItem: PlanItem;
                                        
                                        // [Refine] Type Mapping
                                        const mappedType: PlanItem['type'] = aiPlace.type;

                                        // [Refine] Tag Cleaning
                                        const cleanTags = (aiPlace.KEYWORDS || []).map((t: string) => t.startsWith('#') ? t.slice(1) : t);

                                        // DB 매칭 성공
                                        if (dbPlace) {
                                            const timeStr = `${String(timeOffset).padStart(2, '0')}:00`;
                                            planItem = mapPlaceToPlanItem(dbPlace, dayPlan.day, timeStr);
                                            if (aiPlace.MEMO) planItem.MEMO = aiPlace.MEMO;
                                            if (aiPlace.TAGS) planItem.KEYWORDS = [...new Set([...planItem.KEYWORDS, ...(aiPlace.KEYWORDS || [])])];
                                            planItem.type = mappedType; // AI의 타입 분류가 더 정확할 수도 있음
                                        } else {
                                            // DB 매칭 실패: AI JSON 기반 Fallback
                                            const timeStr = `${String(timeOffset).padStart(2, '0')}:00`;
                                            
                                            // [Refine] Robust Duration Parsing
                                            let stayTime = 60;
                                            if (mappedType === 'stay') stayTime = 720; // 12h
                                            else if (mappedType === 'sightseeing') stayTime = 90;
                                            
                                            try {
                                                const durationStr = String(aiPlace.STAY_TIME || "");
                                                if (durationStr) {
                                                    const hMatch = durationStr.match(/(\d+)시간/);
                                                    const mMatch = durationStr.match(/(\d+)분/);
                                                    let minutes = 0;
                                                    if (hMatch) minutes += parseInt(hMatch[1]) * 60;
                                                    if (mMatch) minutes += parseInt(mMatch[1]);
                                                    if (minutes > 0) stayTime = minutes;
                                                }
                                            } catch (e) { console.warn("Time parse error", e); }

                                            planItem = {
                                                _docId: `ai-${Date.now()}-${Math.random()}`,
                                                PLACE_ID: `ai-${Date.now()}-${Math.random()}`,
                                                NAME: aiPlace.NAME,
                                                ADDRESS: aiPlace.ADDRESS || '주소 정보 없음',
                                                SUB_REGION: null,
                                                CATEGORY: { main: 'AI추천', sub: aiPlace.type || '' },
                                                IMAGE_URL: aiPlace.IMAGE_URL || null, 
                                                GALLERY_IMAGES: null,
                                                LOC_LAT: aiPlace.LOC_LAT || 37.5665,
                                                LOC_LNG: aiPlace.LOC_LNG || 126.9780,
                                                MAP_LINK: '',
                                                AFFIL_LINK: null,
                                                IS_AFLT: false,
                                                IS_TICKET_REQUIRED: false,
                                                TIME_INFO: String(aiPlace.STAY_TIME || "") || null,
                                                PARKING_INFO: null,
                                                REST_INFO: null,
                                                FEE_INFO: null,
                                                DETAILS: {},
                                                RATING: null,
                                                HIGHTLIGHTS: aiPlace.MEMO ? [aiPlace.MEMO] : null,
                                                KEYWORDS: cleanTags,
                                                NAME_GRAMS: [],
                                                STAY_TIME: stayTime, 
                                                PRICE_GRADE: 0,
                                                STATS: { bookmark_count: 0, view_count: 0, review_count: 0, rating: 0, weight: 0 },
                                                TAGS: { spring: null, summer: null, autumn: null, winter: null },
                                                
                                                day: dayPlan.day,
                                                time: timeStr,
                                                type: mappedType,
                                                isLocked: false,
                                                MEMO: aiPlace.MEMO
                                            };
                                        }

                                        if (planItem) {
                                            aiSchedule.push(planItem);
                                            timeOffset += 2;
                                        }
                                    } catch (loopError) {
                                        console.error(`[Planner] Error processing item ${aiPlace.NAME}:`, loopError);
                                    }
                                });
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
                // Context가 명확히 있는데 일정이 안 만들어진 경우 -> Fallback 하지 말고 멈춤 (무한 로딩/중복 요청 방지)
                if (context && context.destination) {
                    console.warn("[Planner] AI context exists but schedule is empty. Stopping to prevent fallback loop.");
                } else {
                    // AI가 아예 실패했거나 Context를 못 가져온 경우에만 Fallback
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
    }, [initialDestination]); // Re-run only if URL param changes

    // 날짜 범위에 따른 총 일수(days) 계산
    const duration = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const days = Array.from({ length: duration }, (_, i) => i + 1);

    // [New] 전체 일정 날씨 일괄 조회 (Batch Fetching)
    useEffect(() => {
        const fetchAllWeather = async () => {
            if (schedule.length === 0) return;

            // 이미 캐시가 존재하는 경우, 재진입 방지 (간단한 캐싱 전략)
            // 날짜 범위나 일정이 바뀌었을 때만 실행되도록 의존성 관리
            
            const newCache: Record<number, WeatherData> = {};
            const currentDays = Array.from({ length: duration }, (_, i) => i + 1);
            
            const promises = currentDays.map(async (day) => {
                // 이미 캐시된 데이터가 있고, 날짜가 동일하다면 스킵 가능하지만
                // 여기서는 단순화를 위해 전체 갱신 (API 호출 최적화는 추후 고도화)

                // 해당 날짜 계산
                const targetDate = new Date(dateRange.start);
                targetDate.setDate(targetDate.getDate() + (day - 1));
                const dateStr = targetDate.toISOString().split('T')[0];

                // 해당 날짜의 첫 번째 일정 좌표 (없으면 서울)
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

        // 디바운싱 혹은 일정 로딩 완료 후 실행
        // schedule이 로드된 후 실행되어야 정확한 좌표를 쓸 수 있음
        if (!isLoading && schedule.length > 0) {
            fetchAllWeather();
        }
        // days 배열은 매 렌더링마다 새로 생성되므로 의존성 배열에서 제거하고, duration과 dateRange.start 등 원시값에 의존하게 변경
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
        <div className="planner-page">
            {/* 0. 헤더 영역 (AI 생성 테마 및 정보 요약) */}
            <header className="planner-header">
                <div className="planner-header-content">
                    <div className="header-top">
                        <h1 className="destination-name">{destination}</h1>
                        {travelContext?.tripSummary?.autoGeneratedTheme && (
                            <div className="theme-tag">
                                <i className="fa-solid fa-sparkles"></i>
                                {travelContext.tripSummary.autoGeneratedTheme}
                            </div>
                        )}
                    </div>
                    <div className="summary-info">
                        <div className="info-item">
                            <i className="fa-regular fa-calendar-days text-[14px]"></i>
                            <span>
                                {dateRange.start.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} ~ {dateRange.end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                            </span>
                        </div>
                        <span className="info-divider">|</span>
                        <div className="info-item">
                            <i className="fa-solid fa-users text-[14px]"></i>
                            <span>성인 {guests.adult}명{guests.child > 0 ? `, 아동 ${guests.child}명` : ''}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="plannerPageContainer">
                {/* Main Content Area */}
                <main className="mainContent">
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
                    onItemClick={handleItemClick} // [New]
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
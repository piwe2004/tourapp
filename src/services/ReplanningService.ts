import { PlanItem } from "@/types/place";

export type PlannerTheme = 'cafe' | 'photo' | 'indoor' | 'walk' | 'activity';

interface Gap {
    startItem: PlanItem | null; // null if start of day
    endItem: PlanItem | null;   // null if end of day
    day: number;
    startTime: string;          // HH:MM
    endTime: string;            // HH:MM
    durationMin: number;
}

/**
 * @desc 두 시간 문자열(HH:MM) 사이의 분 차이를 계산합니다.
 */
function calculateDuration(start: string, end: string): number {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
}

/**
 * @desc 분을 시간 문자열(HH:MM)에 더합니다.
 */
function addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minutes);
    const newH = String(date.getHours()).padStart(2, '0');
    const newM = String(date.getMinutes()).padStart(2, '0');
    return `${newH}:${newM}`;
}

/**
 * @desc 잠기지 않은 일정 사이의 빈 시간(Gap)을 식별합니다. 이동 시간 등은 단순화를 위해 Gap에 포함시켰다고 가정하거나 별도 처리.
 * 여기서는 간단히 'Locked Item' 사이를 Gap으로 간주하고 기존 Unlocked Item은 날려버리고 새로 채우는 방식을 사용합니다.
 */
function identifyGaps(dayItems: PlanItem[], day: number): Gap[] {
    // 시간순 정렬
    const sorted = [...dayItems].sort((a, b) => a.time.localeCompare(b.time));
    const lockedItems = sorted.filter(item => item.isLocked);
    
    // 만약 고정된 게 하나도 없다면? -> 09:00 ~ 21:00 전체가 Gap
    if (lockedItems.length === 0) {
        return [{
            startItem: null,
            endItem: null,
            day,
            startTime: "09:00",
            endTime: "21:00",
            durationMin: 720
        }];
    }

    const gaps: Gap[] = [];
    
    // 1. Day Start ~ First Locked Item
    const first = lockedItems[0];
    const startDiff = calculateDuration("09:00", first.time);
    if (startDiff > 60) { // 최소 60분 이상 비어야 추천
         gaps.push({
            startItem: null,
            endItem: first,
            day,
            startTime: "09:00",
            endTime: first.time,
            durationMin: startDiff
         });
    }

    // 2. Between Locked Items
    for (let i = 0; i < lockedItems.length - 1; i++) {
        const current = lockedItems[i];
        const next = lockedItems[i+1];
        
        // 간단화를 위해 current의 활동 시간을 90분으로 가정하고 그 이후부터 next 전까지를 Gap으로 봄
        // 실제로는 item.duration 등이 필요하지만 mockData엔 없음.
        const predictedEndTime = addMinutes(current.time, 90); 
        const duration = calculateDuration(predictedEndTime, next.time);
        
        if (duration > 60) {
             gaps.push({
                startItem: current,
                endItem: next,
                day,
                startTime: predictedEndTime,
                endTime: next.time,
                durationMin: duration
             });
        }
    }

    // 3. Last Locked Item ~ Day End
    const last = lockedItems[lockedItems.length - 1];
    const predictedEndTime = addMinutes(last.time, 90);
    const endDiff = calculateDuration(predictedEndTime, "21:00");
    if (endDiff > 60) {
        gaps.push({
            startItem: last,
            endItem: null,
            day,
            startTime: predictedEndTime,
            endTime: "21:00",
            durationMin: endDiff
        });
    }

    return gaps;
}

import { getPlacesByTheme } from "@/lib/firebase/placeService";

/**
 * @desc 테마에 맞는 장소를 검색합니다. (Real Data)
 * NCP Search API 대신 Firestore에서 키워드 기반으로 검색합니다.
 */
async function searchPlacesByTheme(theme: PlannerTheme): Promise<Partial<PlanItem>[]> {
    const places = await getPlacesByTheme(theme);
    return places;
}

/**
 * @desc 스마트 믹스 리플래닝 실행
 * 1. 현재 일정에서 Locked Item만 남김
 * 2. Gap 분석
 * 3. Gap에 맞는 테마 장소 삽입
 * 4. 시간 재정렬 후 반환
 */
export async function regenerateSchedule(
    currentSchedule: PlanItem[], 
    day: number, 
    theme: PlannerTheme
): Promise<PlanItem[]> {
    
    // 0. 시뮬레이션 딜레이
    await new Promise(r => setTimeout(r, 1000));

    const dayItems = currentSchedule.filter(item => item.day === day);
    const otherItems = currentSchedule.filter(item => item.day !== day);
    
    // 1. Unlocked 아이템 제거 (재설계 대상) -> Locked만 유지
    const lockedItems = dayItems.filter(item => item.isLocked);
    
    // 만약 Locked가 하나도 없으면 기존 로직 유지 or 전체 갈아엎기?
    // 기획상: Locked 유지, 나머지 채우기.
    // 기존 아이템들을 다 날리기엔 좀 위험할 수 있으나 "Re-planning"의 정의가 그러함.
    // 사용자 경험을 위해 Locked가 0개면 경고를 띄울 수도 있지만 여기선 그냥 전체 추천으로 진행.

    const gaps = identifyGaps(dayItems, day);
    const newItems: PlanItem[] = [...lockedItems];
    
    // 2. 각 Gap 채우기
    // Theme에 맞는 후보 장소 리스트를 가져옵니다.
    const candidatePool = await searchPlacesByTheme(theme);
    let poolIndex = 0;

    for (const gap of gaps) {
        if (poolIndex >= candidatePool.length) poolIndex = 0; // 풀 모자르면 순환
        const candidate = candidatePool[poolIndex++];
        
        // 새 아이템 생성
        const newItem: PlanItem = {
            // PlaceData Fields
            _docId: `temp-${Date.now()}-${Math.random()}`,
            PLACE_ID: (Date.now() + Math.random()).toString(),
            NAME: candidate.NAME || "추천 장소",
            ADDRESS: "",
            SUB_REGION: null,
            CATEGORY: {
                main: "테마 추천",
                sub: theme
            },
            LOC_LAT: 33.4 + (Math.random() * 0.2), // 임시 좌표
            LOC_LNG: 126.3 + (Math.random() * 0.4),
            IMAGE_URL: null,
            GALLERY_IMAGES: null,
            MAP_LINK: "",
            AFFIL_LINK: null,
            IS_AFLT: false,
            IS_TICKET_REQUIRED: false,
            TIME_INFO: null,
            PARKING_INFO: null,
            REST_INFO: null,
            FEE_INFO: null,
            DETAILS: { stayTime: "60" },
            RATING: 4.5,
            HIGHTLIGHTS: [],
            KEYWORDS: [],
            NAME_GRAMS: [],
            STAY_TIME: 60,
            PRICE_GRADE: 0,
            STATS: { bookmark_count: 0, view_count: 0, review_count: 0, rating: 0, weight: 0 },
            TAGS: { spring: null, summer: null, autumn: null, winter: null },

            // PlanItem Specific Fields
            day: day,
            time: gap.startTime,
            type: candidate.type as PlanItem['type'], // Type Assertion: Mock 데이터는 항상 type을 포함하므로 명시적 형변환
            isLocked: false,
            is_indoor: false
        };
        newItems.push(newItem);
    }
    
    // 3. 시간 순 정렬
    newItems.sort((a, b) => a.time.localeCompare(b.time));

    // 4. 전체 스케줄 병합
    const finalSchedule = [...otherItems, ...newItems];
    
    // 4. 전체 스케줄 날짜/시간 순 정렬
    return finalSchedule.sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.time.localeCompare(b.time);
    });
}

import { PlanItem } from "@/mockData";

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

/**
 * @desc 테마에 맞는 장소를 검색합니다. (Mock)
 * 실제로는 NCP Search API를 호출해야 합니다.
 */
async function searchPlacesByTheme(theme: PlannerTheme): Promise<Partial<PlanItem>[]> {
    // 테마별 더미 데이터
    const THEME_MOCKS: Record<PlannerTheme, Partial<PlanItem>[]> = {
        cafe: [
            { activity: "오션뷰 카페 루시아", type: "cafe", memo: "절벽 위에서 즐기는 커피", isLocked: false },
            { activity: "감귤 창고 카페", type: "cafe", memo: "빈티지하고 아늑한 분위기", isLocked: false },
            { activity: "휴일로", type: "cafe", memo: "서귀포 핫플레이스", isLocked: false },
        ],
        photo: [
            { activity: "동백 포레스트", type: "sightseeing", memo: "겨울철 필수 인생샷 명소", isLocked: false },
            { activity: "무지개 해안도로", type: "sightseeing", memo: "알록달록 경계석과 바다 배경", isLocked: false },
        ],
        indoor: [
            { activity: "본태 박물관", type: "sightseeing", memo: "안도 타다오 건축과 예술", isLocked: false },
            { activity: "항공우주박물관", type: "sightseeing", memo: "아이들과 가기 좋은 실내", isLocked: false },
        ],
        walk: [
            { activity: "사려니숲길", type: "sightseeing", memo: "피톤치드 가득한 힐링 산책", isLocked: false },
            { activity: "올레길 7코스", type: "sightseeing", memo: "외돌개와 바다 절경", isLocked: false },
        ],
        activity: [
            { activity: "9.81 파크", type: "sightseeing", memo: "무동력 레이싱 테마파크", isLocked: false },
            { activity: "제주 제트보트", type: "sightseeing", memo: "짜릿한 바다 질주", isLocked: false },
        ]
    };

    return THEME_MOCKS[theme] || [];
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
    let candidatePool = await searchPlacesByTheme(theme);
    let poolIndex = 0;

    for (const gap of gaps) {
        if (poolIndex >= candidatePool.length) poolIndex = 0; // 풀 모자르면 순환
        const candidate = candidatePool[poolIndex++];
        
        // 새 아이템 생성
        const newItem: PlanItem = {
            id: Math.floor(Math.random() * 100000) + 1000, // 임시 ID
            day: day,
            time: gap.startTime, // Gap 시작 시간 배치
            activity: candidate.activity!,
            type: candidate.type as any,
            memo: `[테마 추천] ${candidate.memo}`,
            lat: 33.4 + (Math.random() * 0.2), // 임시 좌표
            lng: 126.3 + (Math.random() * 0.4),
            isLocked: false
        };
        newItems.push(newItem);
    }
    
    // 3. 시간 순 정렬
    newItems.sort((a, b) => a.time.localeCompare(b.time));

    // 4. 전체 스케줄 병합
    return [...otherItems, ...newItems];
}

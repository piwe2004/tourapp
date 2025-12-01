export interface PlanItem {
    id: number;
    day: number; // 👈 이 필드가 핵심입니다! 없으면 필터링이 안 돼요.
    time: string;
    activity: string;
    type: 'sightseeing' | 'food' | 'cafe' | 'stay' | 'move';
    memo: string;
}

// [Mock] 제주도 1박 2일 더미 데이터
export const MOCK_PLAN_JEJU: PlanItem[] = [
    // 1일차 데이터 (day: 1 필수)
    { id: 1, day: 1, time: "10:30", activity: "제주공항 도착", type: "move", memo: "렌터카 수령" },
    { id: 2, day: 1, time: "12:00", activity: "이호테우 해변", type: "sightseeing", memo: "빨간 목마 등대" },
    { id: 3, day: 1, time: "13:30", activity: "자매국수", type: "food", memo: "고기국수 맛집" },

    // 2일차 데이터 (day: 2 필수)
    { id: 8, day: 2, time: "09:30", activity: "호텔 체크아웃", type: "stay", memo: "짐 챙기기" },
    { id: 9, day: 2, time: "10:30", activity: "아르떼뮤지엄", type: "sightseeing", memo: "미디어 아트" },
];

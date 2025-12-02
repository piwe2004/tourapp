export interface PlanItem {
  id: number;
  day: number;
  time: string;
  activity: string;
  type: 'sightseeing' | 'food' | 'cafe' | 'stay' | 'move';
  memo: string;
  // [New] 좌표 추가 (없을 수도 있으니 optional)
  lat?: number;
  lng?: number;
}

export const MOCK_PLAN_JEJU: PlanItem[] = [
  // 1일차
  { id: 1, day: 1, time: "10:30", activity: "제주국제공항", type: "move", memo: "렌터카 수령", lat: 33.5104, lng: 126.4913 },
  { id: 2, day: 1, time: "12:00", activity: "이호테우 해변", type: "sightseeing", memo: "빨간 목마 등대", lat: 33.4981, lng: 126.4525 },
  { id: 3, day: 1, time: "13:30", activity: "자매국수", type: "food", memo: "고기국수 맛집", lat: 33.5065, lng: 126.5167 },
  
  // 2일차
  { id: 8, day: 2, time: "09:30", activity: "호텔 체크아웃", type: "stay", memo: "짐 챙기기", lat: 33.4890, lng: 126.4983 },
  { id: 9, day: 2, time: "10:30", activity: "아르떼뮤지엄", type: "sightseeing", memo: "미디어 아트", lat: 33.3969, lng: 126.3456 },
];
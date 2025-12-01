// ... 기존 TravelPlace 인터페이스 등 유지 ...

export interface PlanItem {
  id: number;
  day: number; // 1일차, 2일차 구분
  time: string;
  activity: string;
  type: 'sightseeing' | 'food' | 'cafe' | 'stay' | 'move';
  memo: string;
}

// 📌 [Mock] 제주도 1박 2일 더미 데이터
export const MOCK_PLAN_JEJU: PlanItem[] = [
  // 1일차
  { id: 1, day: 1, time: "10:30", activity: "제주국제공항 도착", type: "move", memo: "렌터카 픽업 후 출발" },
  { id: 2, day: 1, time: "11:30", activity: "이호테우 해변", type: "sightseeing", memo: "빨간 목마 등대 인증샷 필수!" },
  { id: 3, day: 1, time: "13:00", activity: "자매국수", type: "food", memo: "제주 3대 고기국수 맛집, 웨이팅 주의" },
  { id: 4, day: 1, time: "14:30", activity: "애월 한담해안산책로", type: "sightseeing", memo: "에메랄드빛 바다를 보며 산책" },
  { id: 5, day: 1, time: "16:00", activity: "노티드 제주", type: "cafe", memo: "당 충전 & 곰돌이 포토존" },
  { id: 6, day: 1, time: "18:30", activity: "숙성도 애월점", type: "food", memo: "흑돼지 찐맛집, 테이블링 예약 필수" },
  { id: 7, day: 1, time: "20:30", activity: "애월 숙소 체크인", type: "stay", memo: "오션뷰 스파 즐기기" },

  // 2일차
  { id: 8, day: 2, time: "09:30", activity: "호텔 조식 및 체크아웃", type: "stay", memo: "" },
  { id: 9, day: 2, time: "10:30", activity: "아르떼뮤지엄 제주", type: "sightseeing", memo: "몰입형 미디어아트 전시 관람" },
  { id: 10, day: 2, time: "12:30", activity: "협재 수우동", type: "food", memo: "수요미식회 맛집, 냉우동 추천" },
  { id: 11, day: 2, time: "14:00", activity: "협재 해수욕장", type: "sightseeing", memo: "비양도가 보이는 맑은 해변" },
  { id: 12, day: 2, time: "16:00", activity: "앤트러사이트 한림", type: "cafe", memo: "폐공장을 개조한 힙한 카페" },
  { id: 13, day: 2, time: "18:00", activity: "제주공항 이동 및 면세점", type: "move", memo: "마음샌드 구매 도전" },
];

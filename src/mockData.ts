// ... 기존 TravelPlace 인터페이스 등 유지 ...

export interface PlanItem {
  id: number;
  day: number; // 1일차, 2일차 구분
  time: string;
  activity: string;
  type: 'sightseeing' | 'food' | 'cafe' | 'stay' | 'move' | 'etc';
  memo: string;
  lat?: number;
  lng?: number;
  isLocked?: boolean; // 사용자가 고정한 일정인지 여부
  duration?: number; // 분 단위 소요 시간 (e.g. 60)
}

// 📌 [Mock] 제주도 1박 2일 더미 데이터
export const MOCK_PLAN_JEJU: PlanItem[] = [
  // 1일차
  { id: 1, day: 1, time: "10:30", activity: "제주국제공항 도착", type: "move", memo: "렌터카 픽업 후 출발", lat: 33.5104, lng: 126.4913, duration: 60 },
  { id: 2, day: 1, time: "11:30", activity: "이호테우 해변", type: "sightseeing", memo: "빨간 목마 등대 인증샷 필수!", lat: 33.4963, lng: 126.4549, duration: 90 },
  { id: 3, day: 1, time: "13:00", activity: "자매국수", type: "food", memo: "제주 3대 고기국수 맛집, 웨이팅 주의", lat: 33.5006, lng: 126.5282, duration: 90 },
  { id: 4, day: 1, time: "14:30", activity: "애월 한담해안산책로", type: "sightseeing", memo: "에메랄드빛 바다를 보며 산책", lat: 33.4592, lng: 126.3106, duration: 90 },
  { id: 5, day: 1, time: "16:00", activity: "노티드 제주", type: "cafe", memo: "당 충전 & 곰돌이 포토존", lat: 33.4625, lng: 126.3092, duration: 150 },
  { id: 6, day: 1, time: "18:30", activity: "숙성도 애월점", type: "food", memo: "흑돼지 찐맛집, 테이블링 예약 필수", lat: 33.4650, lng: 126.3200, duration: 120 },
  { id: 7, day: 1, time: "20:30", activity: "애월 숙소 체크인", type: "stay", memo: "오션뷰 스파 즐기기", lat: 33.4700, lng: 126.3300, duration: 0 },

  // 2일차
  { id: 8, day: 2, time: "09:30", activity: "호텔 조식 및 체크아웃", type: "stay", memo: "", lat: 33.4700, lng: 126.3300, duration: 60 },
  { id: 9, day: 2, time: "10:30", activity: "아르떼뮤지엄 제주", type: "sightseeing", memo: "몰입형 미디어아트 전시 관람", lat: 33.3968, lng: 126.3456, duration: 120 },
  { id: 10, day: 2, time: "12:30", activity: "협재 수우동", type: "food", memo: "수요미식회 맛집, 냉우동 추천", lat: 33.3960, lng: 126.2400, duration: 90 },
  { id: 11, day: 2, time: "14:00", activity: "협재 해수욕장", type: "sightseeing", memo: "비양도가 보이는 맑은 해변", lat: 33.3938, lng: 126.2396, duration: 120 },
  { id: 12, day: 2, time: "16:00", activity: "앤트러사이트 한림", type: "cafe", memo: "폐공장을 개조한 힙한 카페", lat: 33.3900, lng: 126.2500, duration: 120 },
  { id: 13, day: 2, time: "18:00", activity: "제주공항 이동 및 면세점", type: "move", memo: "마음샌드 구매 도전", lat: 33.5104, lng: 126.4913, duration: 60 },
];

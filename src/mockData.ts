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
  is_indoor?: boolean; // 실내/실외 여부 (Plan B 추천용)
  address?: string; // [New] 주소
  highlights?: string;    // [New] 대표 메뉴 (음식점/카페) 또는 주요 포인트
  imageUrl?: string; // [New] 장소 대표 이미지 URL
  category: { main: string, sub: string },
}

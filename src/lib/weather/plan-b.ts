import { PlanItem, MOCK_PLAN_JEJU } from "@/mockData";
import { getWeatherForDate } from "./service";

// 추천을 위한 예비 장소 데이터베이스 (Mock)
const MOCK_PLACES_DB: PlanItem[] = [
  { id: 101, day: 0, time: "", activity: "제주 항공우주박물관", type: "sightseeing", memo: "비 오는 날 아이와 함께", lat: 33.303, lng: 126.299, is_indoor: true },
  { id: 102, day: 0, time: "", activity: "오설록 티 뮤지엄", type: "cafe", memo: "녹차 카페 & 실내 전시", lat: 33.306, lng: 126.289, is_indoor: true },
  { id: 103, day: 0, time: "", activity: "제주 현대미술관", type: "sightseeing", memo: "실내 미술 관람", lat: 33.350, lng: 126.265, is_indoor: true },
  { id: 104, day: 0, time: "", activity: "본태박물관", type: "sightseeing", memo: "건축과 예술의 만남", lat: 33.304, lng: 126.392, is_indoor: true },
  { id: 105, day: 0, time: "", activity: "뽀로로앤타요 테마파크", type: "sightseeing", memo: "실내 테마파크", lat: 33.290, lng: 126.350, is_indoor: true },
];

export interface RainyScheduleItem {
  item: PlanItem;
  weather: {
    pop: string;
    pty: string;
    sky: string;
  };
  recommendations: PlanItem[];
}

/**
 * @desc 일정 중 비 예보가 있는 야외 활동을 감지하고 대체 장소를 추천합니다.
 */
export async function checkRainySchedule(plan: PlanItem[], date: string): Promise<RainyScheduleItem[]> {
  const rainRisks: RainyScheduleItem[] = [];

  for (const item of plan) {
    // 1. 실내 활동이면 패스
    if (item.is_indoor) continue;

    // 2. 날씨 조회 (해당 장소, 해당 날짜)
    // [Fix] item.day에 따라 날짜 계산
    const targetDate = new Date(date);
    targetDate.setDate(targetDate.getDate() + (item.day - 1));
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // 좌표가 없으면 패스
    if (!item.lat || !item.lng) continue;

    const weather = await getWeatherForDate(item.lat, item.lng, dateStr);

    // 3. 비 예보 판단 (POP >= 60% OR PTY != "없음")
    const popVal = parseInt(weather.pop.replace("%", "")) || 0;
    const isRainy = weather.pty !== "없음" && weather.pty !== "정보없음" && weather.pty !== "-";
    
    if (popVal >= 60 || isRainy) {
      // 4. 대체 장소 추천
      const recommendations = recommendIndoorPlaces(item);

      rainRisks.push({
        item,
        weather: {
          pop: weather.pop,
          pty: weather.pty,
          sky: weather.sky
        },
        recommendations
      });
    }
  }

  return rainRisks;
}

/**
 * @desc 대체 장소 추천 알고리즘
 * 1. 실내 여부 (is_indoor = true)
 * 2. 거리 5km 이내
 * 3. 유사 카테고리 (sightseeing <-> sightseeing, cafe <-> food/cafe)
 */
function recommendIndoorPlaces(target: PlanItem): PlanItem[] {
  if (!target.lat || !target.lng) return [];

  return MOCK_PLACES_DB.filter(place => {
    if (!place.is_indoor) return false;
    if (!place.lat || !place.lng) return false;

    // 거리 계산 (Haversine Formula) (약식)
    const dist = getDistanceFromLatLonInKm(target.lat!, target.lng!, place.lat, place.lng);
    if (dist > 5) return false; // 5km 반경

    // 카테고리 유사성 (단순화)
    // 관광 <-> 관광, 식음료 <-> 식음료
    const isSightseeing = target.type === 'sightseeing';
    const placeIsSightseeing = place.type === 'sightseeing';
    
    if (isSightseeing && placeIsSightseeing) return true;
    if (!isSightseeing && !placeIsSightseeing) return true; // 나머지는 서로 추천
    
    return false;
  });
}

// Haversine Formula for distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

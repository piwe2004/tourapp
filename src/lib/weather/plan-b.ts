import { PlanItem } from "@/types/place";
import { getWeatherForDate } from "./service";
import { getNearbyIndoorPlaces } from "@/lib/firebase/placeService";

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
    const targetDate = new Date(date);
    targetDate.setDate(targetDate.getDate() + (item.day - 1));
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // 좌표가 없으면 패스
    if (!item.LOC_LAT || !item.LOC_LNG) continue;

    const weather = await getWeatherForDate(item.LOC_LAT, item.LOC_LNG, dateStr);

    // 3. 비 예보 판단 (POP >= 60% OR PTY != "없음")
    const popVal = parseInt(weather.pop.replace("%", "")) || 0;
    const isRainy = weather.pty !== "없음" && weather.pty !== "정보없음" && weather.pty !== "-";
    
    if (popVal >= 60 || isRainy) {
      // 4. 대체 장소 추천 (Real Data)
      const recommendations = await recommendIndoorPlaces(item);

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
 * @desc 대체 장소 추천 알고리즘 (Firebase 연동)
 */
async function recommendIndoorPlaces(target: PlanItem): Promise<PlanItem[]> {
  if (!target.LOC_LAT || !target.LOC_LNG) return [];

  // Firebase에서 주변 실내 장소 조회
  const candidates = await getNearbyIndoorPlaces(target.LOC_LAT, target.LOC_LNG);

  // 카테고리 유사성 필터
  return candidates.filter(place => {
    const isSightseeing = target.type === 'sightseeing';
    const placeIsSightseeing = place.type === 'sightseeing';
    
    if (isSightseeing && placeIsSightseeing) return true;
    if (!isSightseeing && !placeIsSightseeing) return true;
    
    return false;
  });
}


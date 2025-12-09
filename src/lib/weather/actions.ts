'use server';

import { getWeatherForDate, WeatherData } from "./service";
import { checkRainySchedule, RainyScheduleItem } from "./plan-b";
export type { RainyScheduleItem };
import { MOCK_PLAN_JEJU } from "@/mockData";

/**
 * 특정 날짜와 위치의 날씨 정보를 조회하는 Server Action
 * @param lat 위도
 * @param lng 경도
 * @param date 날짜 (YYYY-MM-DD)
 */
export async function getWeather(lat: number, lng: number, date: string): Promise<WeatherData> {
  // 에러 핸들링은 service 내부에서 Fallback 처리되므로 바로 호출
  return await getWeatherForDate(lat, lng, date);
}

/**
 * 전체 일정에 대해 비 예보가 있는 야외 일정을 감지하고 대안을 추천하는 Action
 * @param planId (현재는 Mock ID 사용, 실제로는 DB 조회)
 * @param date 여행 시작 날짜
 */
export async function getPlanBRecommendations(planId: number, date: string): Promise<RainyScheduleItem[]> {
  // 실제로는 planId로 DB에서 일정을 가져와야 함. 지금은 MOCK_PLAN_JEJU 사용.
  const plan = MOCK_PLAN_JEJU;
  return await checkRainySchedule(plan, date);
}

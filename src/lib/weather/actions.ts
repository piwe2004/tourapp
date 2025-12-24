'use server';

import { getWeatherForDate, WeatherData } from "./service";
import { checkRainySchedule, RainyScheduleItem } from "./plan-b";
import { PlanItem } from "@/types/place";
export type { RainyScheduleItem };

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
 * @desc 여행 일정(PlanItem[])을 받아 비 예보가 있는 야외 활동에 대한 대체 장소를 추천합니다.
 * @param schedule 전체 일정 배열
 * @param date 여행 시작 날짜
 */
export async function getPlanBRecommendations(schedule: PlanItem[], date: string): Promise<RainyScheduleItem[]> {
  return await checkRainySchedule(schedule, date);
}
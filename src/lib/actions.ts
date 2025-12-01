'use server';

import { MOCK_PLAN_JEJU, PlanItem } from "@/mockData";

// 지금은 API 연동 없이 더미 데이터만 반환합니다.
export async function getTravelPlan(destination: string): Promise<PlanItem[]> {
  console.log(`[Mock] "${destination}" 요청 받음. 더미 데이터를 반환합니다.`);

  // 1.5초 딜레이를 줘서 '로딩 스켈레톤'이 잘 뜨는지 확인합니다.
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 검색어와 상관없이 항상 준비된 '제주도 플랜'을 리턴합니다.
  return MOCK_PLAN_JEJU;
}

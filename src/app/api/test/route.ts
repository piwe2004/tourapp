// src/app/api/test/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destination } = body;

    // 가짜 데이터 반환 (나중에 여기에 Gemini가 들어갑니다)
    const dummyData = {
      title: `✨ ${destination} 2박 3일 여행 코스`,
      days: [
        { day: 1, place: "공항 도착 -> 렌터카 픽업 -> 해안도로 드라이브" },
        { day: 2, place: "유명 맛집 점심 -> 감성 카페 -> 야경 명소" },
        { day: 3, place: "기념품 샵 -> 공항 복귀" },
      ],
    };

    return NextResponse.json(dummyData);
  } catch (error) {
    return NextResponse.json({ error: "데이터 처리 중 오류 발생" }, { status: 500 });
  }
}

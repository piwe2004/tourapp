"use server";

/**
 * -------------------------------------------------------------------------
 * @file        : src/lib/actions.ts
 * @description : 여행 일정 생성 및 관리를 위한 핵심 Server Actions (AI 호출, DB 조회)
 * @author      : MIN
 * @date        : 2026-01-04
 * -------------------------------------------------------------------------
 * @history
 * - 2026-01-04 MIN : 최초 작성
 * -------------------------------------------------------------------------
 */

import { PlanItem } from "@/types/place";
import { geminiModel } from "./gemini";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  collection,
  getDocs,
  query,
  limit,
  where,
} from "firebase/firestore";
import { headers } from "next/headers";
import { FirebasePlace } from "@/types/places";
export type { FirebasePlace };

// TODO: 실제 배포된 Cloud Function URL로 교체하세요
// 예시: https://us-central1-your-project-id.cloudfunctions.net/generateOptimizedRoute
const OPTIMIZE_API_URL =
  "https://us-central1-tourapp-a8507.cloudfunctions.net/generateOptimizedRoute";

/**
 * @desc Cloud Function을 호출하여 여행 경로를 최적화합니다.
 * @param places 최적화할 장소 목록 (FirebasePlace[])
 * @param preferences 사용자 선호도 (문자열)
 * @returns 최적화된 장소 목록 (FirebasePlace[])
 */
async function optimizeRoute(
  places: FirebasePlace[],
  preferences: string
): Promise<FirebasePlace[]> {
  if (!OPTIMIZE_API_URL) {
    console.warn(
      "[Server] OPTIMIZE_API_URL이 설정되지 않았습니다. 최적화를 건너뜁니다."
    );
    return places;
  }

  try {
    console.log(`[Server][Firebase Debug] 🚀 경로 최적화 요청 시작 | 장소: ${places.length}개 | 선호도: ${preferences}`);
    const response = await fetch(OPTIMIZE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ places, preferences }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 오류 ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.optimized_route && Array.isArray(data.optimized_route)) {
      console.log(`[Server][Firebase Debug] ✅ 경로 최적화 성공 | 반환된 장소: ${data.optimized_route.length}개`);
      return data.optimized_route;
    }

    return places;
  } catch (error) {
    console.warn("[Server] 경로 최적화 실패, 원본 순서를 사용합니다:", error);
    return places;
  }
}

import { mapPlaceToPlanItem } from "@/lib/mappers";
import { getPlacesByIds } from "@/lib/actions_helper";

// (내부 mapPlaceToPlanItem 함수 제거됨)

/**
 * @desc 목적지(destination)를 기반으로 여행 계획을 생성합니다. (Legacy Fallback)
 * AI 컨텍스트 추출 실패 시 단순 DB 조회로 대체할 때 사용됩니다.
 * @param destination 여행지 지역명 (예: "제주", "부산")
 * @returns 변환된 PlanItem 배열
 */
export async function getTravelPlan(destination: string): Promise<PlanItem[]> {
  console.log(`[Server][Firebase Debug] 🔍 getTravelPlan 호출됨 | 목적지: "${destination}"`);

  try {
    const placesRef = collection(db, "PLACES");
    const rawPlaces: FirebasePlace[] = [];

    // 1. Destination 기반 쿼리
    // destination이 주소의 가장 앞부분(지역명)이라고 가정하고 Range Filter 사용
    let q;
    if (destination) {
      q = query(
        placesRef,
        where("ADDRESS", ">=", destination),
        where("ADDRESS", "<=", destination + "\uf8ff"),
        limit(20)
      );
    } else {
      q = query(placesRef, limit(20));
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`[Server][Firebase Debug] ⚠️ "${destination}" 관련 데이터 없음 (0건)`);
      return [];
    } else {
      querySnapshot.forEach((doc) => {
        rawPlaces.push(doc.data() as FirebasePlace);
      });
    }

    if (rawPlaces.length === 0) {
      return [];
    }

    // 2. 경로 최적화 (Cloud Function 호출) - [Disabled as per user request]
    const optimizedPlaces = rawPlaces;

    // 3. PlanItem 변환 및 시간 할당
    const items: PlanItem[] = [];
    let dayCounter = 1;
    let timeCounter = 9; // 9시부터 시작

    optimizedPlaces.forEach((placeData) => {
      // 시간/날짜 단순 분배 로직 (데모용)
      const timeStr = `${String(timeCounter).padStart(2, "0")}:00`;

      items.push(mapPlaceToPlanItem(placeData, dayCounter, timeStr));

      timeCounter += 2;
      if (timeCounter > 20) {
        timeCounter = 9;
        dayCounter += 1;
      }
    });

    console.log(`[Server][Firebase Debug] ✅ getTravelPlan 완료 | 총 ${items.length}개 장소 반환`);
    return items;
  } catch (error) {
    console.error("[Server] Firebase 데이터 가져오기 실패:", error);
    return []; // 에러 시 빈 배열 반환
  }
}

export interface TravelContext {
  destination: string | null;
  theme: string[];
  tripSummary?: {
    autoGeneratedTheme: string;
    destination: string;
    totalPlaces: number;
  };
  party: {
    adult: number;
    child: number;
  };
  dateRange: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
  itinerary?: {
    day: number;
    date?: string;
    dayFocus?: string;
    places: PlanItem[];
  }[];
}

/**
 * @desc IP 기반 속도 제한 (1분에 5회)을 확인합니다.
 * 과도한 API 호출을 방지하기 위해 Firestore에 요청 기록을 저장하고 제한합니다.
 * @param ip 사용자 IP 주소
 * @returns 통과 여부 (true: 통과, false: 차단)
 */
async function checkRateLimit(ip: string): Promise<boolean> {
  // 로컬호스트나 IP가 없는 경우 제한 없이 통과
  if (!ip || ip === "unknown") return true;

  const ref = doc(db, "rate_limits", ip);
  const snapshot = await getDoc(ref);
  const now = Date.now();
  const ONE_MINUTE = 60 * 1000;

  if (!snapshot.exists()) {
    // 첫 요청: 문서 생성
    await setDoc(ref, {
      count: 1,
      lastRequest: serverTimestamp(),
    });
    return true;
  }

  const data = snapshot.data();
  const lastRequestTime =
    data.lastRequest instanceof Timestamp ? data.lastRequest.toMillis() : now; // 타임스탬프 없으면 현재 시간 간주

  if (now - lastRequestTime > ONE_MINUTE) {
    // 1분 지남: 카운트 리셋
    await updateDoc(ref, {
      count: 1,
      lastRequest: serverTimestamp(),
    });
    return true;
  } else {
    // 1분 이내
    if (data.count >= 5) {
      return false; // 5회 초과 차단
    }
    // 카운트 증가
    await updateDoc(ref, {
      count: data.count + 1,
    });
    return true;
  }
}

/**
 * @desc 사용자의 자연어 쿼리를 분석하여 여행 조건을 추출하는 함수입니다.
 * 보안 로직: 입력값 검증 및 Rate Limiting 포함
 * @param query 사용자가 입력한 여행 관련 검색어 (예: "부산 맛집 여행")
 */
// ... existing code ...

/**
 * @desc 주어진 장소 이름 목록에 해당하는 Firebase 데이터를 일괄 조회합니다.
 * AI가 생성한 장소 이름들을 실제 DB 데이터와 매핑하기 위해 사용됩니다.
 * @param names 조회할 장소 이름 배열
 * @returns 조회된 FirebasePlace 배열
 */
export async function getPlacesByNames(
  names: string[]
): Promise<FirebasePlace[]> {
  if (!names || names.length === 0) return [];

  console.log(
    `[Server][Firebase Debug] 🛒 getPlacesByNames 호출 | 요청된 이름: ${names.length}개`,
    names.slice(0, 5)
  );

  const placesRef = collection(db, "PLACES");
  const uniqueNames = Array.from(new Set(names)).filter((n) => n.trim() !== "");
  // [Modified] 사용자 요청에 따라 과도한 쿼리 방지
  if (uniqueNames.length > 30) {
    console.warn(
      `[Server] 조회할 장소가 너무 많습니다 (${uniqueNames.length}). 오류 방지를 위해 DB 조회를 건너뜁니다.`
    );
    return [];
  }

  const chunks = [];

  // Firestore 'in' query supports max 10 items. Chunk it.
  for (let i = 0; i < uniqueNames.length; i += 10) {
    chunks.push(uniqueNames.slice(i, i + 10));
  }

  const results: FirebasePlace[] = [];

  try {
    const promises = chunks.map(async (chunk) => {
      // NAME 필드 기준 정확한 매칭
      const q = query(placesRef, where("NAME", "in", chunk));
      const snapshot = await getDocs(q);
      const chunkResults: FirebasePlace[] = [];
      snapshot.forEach((doc) => {
        chunkResults.push(doc.data() as FirebasePlace);
      });
      console.log(
        `[Server][Firebase Debug] 📦 청크 조회 결과 | 요청: ${chunk.length}개 -> 발견: ${chunkResults.length}개`
      );
      return chunkResults;
    });

    const chunkedResults = await Promise.all(promises);
    chunkedResults.forEach((r) => results.push(...r));

    console.log(`[Server][Firebase Debug] ✅ getPlacesByNames 완료 | 총 매칭된 장소: ${results.length}개`);
    return results;
  } catch (error) {
    console.error("[Server] 일괄 장소 조회 실패:", error);
    return [];
  }
}

/**
 * @desc 사용자의 자연어 쿼리를 분석하여 여행 컨텍스트(목적지, 테마, 일정 등)를 추출합니다.
 * Gemini AI를 활용하여 사용자 의도를 파악하고, 최적의 여행 경로를 제안합니다.
 * @param userQuery 사용자가 입력한 여행 관련 검색어 (예: "부산 맛집 여행")
 * @returns 여행 컨텍스트 객체 (TravelContext)
 */
export async function extractTravelContext(
  userQuery: string
): Promise<TravelContext> {
  // ... (existing code for headers, ratelimit) ...
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // 1. 입력값 검증: 길이 제한 (50자)
  if (userQuery.length > 50) {
    throw new Error("검색어는 50자 이내여야 합니다.");
  }

  // 2. 입력값 검증: 스크립트 태그 방지 (간이 XSS 방어)
  if (/<script/i.test(userQuery)) {
    throw new Error("허용되지 않는 입력이 포함되어 있습니다.");
  }

  // 3. Rate Limiting 체크
  const isAllowed = await checkRateLimit(ip);
  if (!isAllowed) {
    throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // [New] 4. Firebase에서 후보 장소 조회
  const destinationKeyword = userQuery.split(" ")[0]; // 단순 휴리스틱: 첫 단어를 목적지로 가정
  let candidatePlacesStr = "";

  try {
    console.log(`[Server][Firebase Debug] 🔎 extractTravelContext 후보 장소 조회 | 키워드: "${destinationKeyword}"`);
    const placesRef = collection(db, "PLACES");
    const q = query(
      placesRef,
      where("ADDRESS", ">=", destinationKeyword),
      where("ADDRESS", "<=", destinationKeyword + "\uf8ff"),
      limit(100) // 후보군 100개로 제한
    );

    const snapshot = await getDocs(q);
    const rawCandidates: FirebasePlace[] = [];

    if (snapshot.empty) {
      console.warn(
        `[Server][Firebase Debug] ⚠️ 후보 장소 없음 | 키워드: "${destinationKeyword}"`
      );
      candidatePlacesStr =
        "No specific database candidates found. Please suggest popular places based on your knowledge, but use placeholder IDs (e.g., 999001).";
    } else {
      snapshot.forEach((doc) => {
        rawCandidates.push(doc.data() as FirebasePlace);
      });

      // [New] 평점(RATING) 내림차순 정렬로 최적의 후보 제공
      rawCandidates.sort((a, b) => (b.RATING || 0) - (a.RATING || 0));

      // 100개를 초과하지 않도록 제한 (쿼리 제한이 있지만 안전장치)
      const topCandidates = rawCandidates.slice(0, 100);

      const candidates: string[] = [];
      topCandidates.forEach((data) => {
        // 형식: - ID: 123 | Name: 장소명 | Loc: 35.1, 129.2 | Cat: 메인>서브 | Tags: #태그1 #태그2 | Rating: 4.5
        // 프롬프트를 위해 태그 평탄화
        let tagStr = "";
        if (data.TAGS) {
          const allTags = Object.values(data.TAGS).flat();
          tagStr = allTags.slice(0, 5).join(" "); // 상위 5개 태그
        }

        const cat = `${data.CATEGORY?.main || ""}>${data.CATEGORY?.sub || ""}`;
        candidates.push(
          `- ID: ${data.PLACE_ID} | Name: ${data.NAME} | Loc: ${
            data.LOC_LAT
          }, ${data.LOC_LNG} | Cat: ${cat} | Tags: ${tagStr} | Rating: ${
            data.RATING || 0
          }`
        );
      });
      candidatePlacesStr = candidates.join("\n");
      console.log(
        `[Server][Firebase Debug] ✅ 후보 장소 확보 완료 | ${candidates.length}개 (평점순 정렬됨)`
      );
    }
  } catch (error) {
    console.error("[Server] 후보 장소 조회 중 오류 발생:", error);
    candidatePlacesStr =
      "No specific database candidates found. Please suggest popular places based on your knowledge, but use placeholder IDs (e.g., 999001).";
  }

  const prompt = `
    # Role
너는 주어진 [Candidate Places] 목록 중에서 사용자의 요청("${userQuery}")에 가장 적합한 장소들을 선택하여 순서만 나열하는 'Route Sorter'다.

# Context (이 데이터를 반드시 프롬프트에 포함해야 함)
[Candidate Places]
${candidatePlacesStr}

# 핵심 미션
1. **Selection**: 후보군 중에서 요청에 맞는 최적의 장소(Day당 6~8개)를 'PLACE_ID'로 선택하라.
2. **Routing**: 선택된 장소들의 'Loc' 좌표를 참고하여 동선이 꼬이지 않게(서→동, 권역별) 정렬하라.
3. **Output**: 오직 'PLACE_ID'로 구성된 배열만 반환하라.
   - 예시: [1018702, 2033911, 5022133, ...]
   - 중복을 제거 해라
   - 다른날과의 중복을 제거 해라
4. **Accommodation Rule (숙소 앵커링)**:
   - **Day N의 마지막 장소**: 반드시 'main: 숙박'인 ID여야 한다. (해당 지역에서 가장 동선이 좋은 숙소 선택)
   - **Day N+1의 첫 번째 장소**: 반드시 **Day N의 마지막에 선택한 숙소 ID와 동일**해야 한다. (숙소에서 출발)
   - *예외: 마지막 날(Last Day)의 끝은 숙소일 필요 없다.*

5. **Route Sorting**:
   - 'Loc' 좌표를 기준으로 이동 거리가 짧도록 정렬하라.
   - 단, 숙소 규칙(1번)이 거리 규칙보다 우선한다.

# Output JSON Schema (Extreme Light Version)
{
  "theme": "테마명(짧게)",
  "itinerary": [
    {
      "day": 1,
      "route_ids": []  // 오직 PLACE_ID만!
    },
    {
      "day": 2,
      "route_ids": []  // 오직 PLACE_ID만!
    }
  ]
}

# IMPORTANT:
- [Candidate Places]에 없는 ID는 절대 만들어내지 마라.
- 설명, 좌표, 이름 등 불필요한 필드는 모두 제거하라.
  `;
  // ... (rest of the function)

  interface AIResponse {
    theme: string;
    itinerary: {
      day: number;
      date: string;
      places: {
        NAME: string;
        name?: string; // Fallback
        CATEGORY: { main: string; sub: string };
        IMAGE_URL: string;
        image_url?: string; // Fallback
        LOC_LAT: number;
        loc_lat?: number; // Fallback
        coordinates?: { lat: number; lng: number }; // Fallback
        LOC_LNG: number;
        loc_lng?: number; // Fallback
        ADDRESS: string;
        address?: string; // Fallback
        STAY_TIME: string;
        stay_time?: string; // Fallback
        recommendedDuration?: string; // Fallback
        TRAVEL_TIME_TO_NEXT: string;
        IS_AFLT: boolean;
        RATING: number;
        TAGS: {
          winter?: string[];
          common?: string[];
          [key: string]: string[] | undefined;
        };
        MEMO: string;
        memo?: string; // Fallback
        VISIT_ORDER: number;
      }[];
    }[];
  }

  try {
    let result;
    let retryCount = 0;
    const maxRetries = 3;

    while (true) {
      try {
        result = await geminiModel.generateContent(prompt);
        break;
      } catch (error: any) {
        if (
          (error.message?.includes("503") ||
            error.message?.includes("Overloaded") ||
            error.status === 503) &&
          retryCount < maxRetries
        ) {
          retryCount++;
          console.warn(
            `[Gemini] 모델 과부하 (503). ${retryCount}초 후 재시도합니다 (${retryCount}/${maxRetries})...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        } else {
          throw error;
        }
      }
    }

    const response = await result.response;
    const text = response.text();

    console.log("[Gemini] 원본 응답:", text);

    // 마크다운 코드 블록에서 JSON 추출
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(jsonStr) as AIResponse;

    // 실제 일정 일수를 기반으로 종료일 계산
    const maxDay =
      parsedData.itinerary?.reduce((max, day) => Math.max(max, day.day), 1) ||
      1;
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (maxDay - 1));
    const endDateStr = endDate.toISOString().split("T")[0];

    // [Modified] route_ids(새 스키마) 또는 places(구 스키마) 확인
    // "PLACE_ID만 있는 배열" 요청에 대한 동적 처리
    const hasRouteIds = parsedData.itinerary?.some(
      (day) => (day as any).route_ids && Array.isArray((day as any).route_ids)
    );

    let enrichedItinerary: any[] = [];

    if (hasRouteIds) {
      // 1. 새로운 로직: ID 추출 -> Firebase 조회 -> 매핑
      const allIds =
        parsedData.itinerary?.flatMap((day) => (day as any).route_ids || []) ||
        [];

      const places = await getPlacesByIds(allIds);
      const placesMap = new Map(places.map((p) => [String(p.PLACE_ID), p]));

      enrichedItinerary =
        parsedData.itinerary?.map((day) => {
          const dayIds = (day as any).route_ids || [];
          const dayPlaces = dayIds
            .map((id: string | number) => {
              const p = placesMap.get(String(id));
              if (!p) return null; // ID not found in DB
              return {
                ...p, // Spread Firebase Data
                // PlanItem 상세 필드 매핑
                day: day.day,
                time: "10:00", // 기본 시간, 필요 시 추후 조정
                type: "sightseeing", // 기본값, 아래 로직에서 구체화
                // ... 기타 필수 PlanItem 필드는 기본값 사용
              };
            })
            .filter((p: any) => p !== null);

          // 타입 및 구조 구체화
          console.log(`Days ${day}`);
          return {
            day: day.day,
            date: day.date,
            places: dayPlaces.map((place: any, idx: number) => {
              let internalType: PlanItem["type"] = "etc";
              const mainCat = place.CATEGORY?.main || "";
              if (mainCat.includes("식당")) internalType = "food";
              else if (mainCat.includes("카페")) internalType = "cafe";
              else if (mainCat.includes("숙박")) internalType = "stay";
              else if (mainCat.includes("관광지")) internalType = "sightseeing";

              const keywords = [
                ...(place.TAGS?.common || []),
                ...(place.TAGS?.winter || []),
              ].map((tag: string) =>
                tag.startsWith("#") ? tag.slice(1) : tag
              );

              return {
                ...place,
                _docId: place._docId || `ai_${Math.random()}`,
                PLACE_ID: String(place.PLACE_ID),
                NAME: place.NAME,
                ADDRESS: place.ADDRESS || "",
                CATEGORY: place.CATEGORY,
                LOC_LAT: place.LOC_LAT,
                LOC_LNG: place.LOC_LNG,
                IMAGE_URL: place.IMAGE_URL || null,
                type: internalType,
                day: day.day,
                time: `${String(9 + idx * 2).padStart(2, "0")}:00`, // Simple sequential time
                KEYWORDS: keywords,
                STAY_TIME: place.STAY_TIME || 60,
                STATS: {
                  bookmark_count: 0,
                  view_count: 0,
                  review_count: 0,
                  rating: place.RATING || 0,
                  weight: 1,
                },
                TAGS: place.TAGS || {},
                isLocked: false,
                is_indoor: false,
                DETAILS: {},
              } as PlanItem;
            }),
          };
        }) || [];
    } else {
      // 구 스키마 (AI가 전체 JSON 반환)
      enrichedItinerary =
        parsedData.itinerary?.map((day) => ({
          day: day.day,
          date: day.date,
          places: day.places.map((place) => {
            // 한글 카테고리를 내부 'type'으로 매핑
            let internalType: PlanItem["type"] = "etc";
            const mainCat = place.CATEGORY?.main || "";
            if (mainCat.includes("식당")) internalType = "food";
            else if (mainCat.includes("카페")) internalType = "cafe";
            else if (mainCat.includes("숙박")) internalType = "stay";
            else if (mainCat.includes("관광지")) internalType = "sightseeing";

            // 하위 호환성을 위해 TAGS 객체를 KEYWORDS 배열로 평탄화
            // [Modified] 첫 번째 사용 가능한 태그 배열(예: winter, summer, common) 선택
            let extractedTags: string[] = [];
            if (place.TAGS) {
              const firstTagKey = Object.keys(place.TAGS)[0];
              if (firstTagKey && Array.isArray(place.TAGS[firstTagKey])) {
                extractedTags = place.TAGS[firstTagKey]!;
              }
            }

            const keywords = extractedTags.map((tag) =>
              tag.startsWith("#") ? tag.slice(1) : tag
            );

            // [Robustness] 키 정규화 (AI가 소문자로 반환할 경우 대비)
            const aiName = place.NAME || place.name;
            const aiLat =
              place.LOC_LAT ||
              place.loc_lat ||
              place.coordinates?.lat ||
              37.5665; // 누락 시 서울 기본값
            const aiLng =
              place.LOC_LNG ||
              place.loc_lng ||
              place.coordinates?.lng ||
              126.978;
            const aiAddress = place.ADDRESS || place.address || "";
            const aiImage = place.IMAGE_URL || place.image_url || null;
            const aiMemo = place.MEMO || place.memo || "";

            // 체류 시간 파싱
            let stayTimeVal: string | number | undefined =
              place.STAY_TIME || place.stay_time || place.recommendedDuration;
            if (!stayTimeVal) {
              if (internalType === "stay") stayTimeVal = 720;
              else if (internalType === "sightseeing") stayTimeVal = 90;
              else stayTimeVal = 60;
            }

            return {
              _docId: `ai_${Math.random().toString(36).substr(2, 9)}`,
              PLACE_ID: `ai_${Math.random().toString(36).substr(2, 9)}`,
              NAME: aiName,
              ADDRESS: aiAddress,
              CATEGORY: {
                main: place.CATEGORY?.main || "AI추천",
                sub: place.CATEGORY?.sub || internalType,
              },
              LOC_LAT: aiLat,
              LOC_LNG: aiLng,
              IMAGE_URL: aiImage,
              GALLERY_IMAGES: null,
              MAP_LINK: "",
              AFFIL_LINK: null,
              IS_AFLT: false,
              IS_TICKET_REQUIRED: false,
              TIME_INFO: null,
              PARKING_INFO: null,
              REST_INFO: null,
              FEE_INFO: null,
              DETAILS: {},
              RATING: place.RATING || 0,
              HIGHTLIGHTS: aiMemo ? [aiMemo] : [], // MEMO를 하이라이트로 사용
              MEMO: aiMemo,
              KEYWORDS: keywords,
              NAME_GRAMS: [],

              day: day.day,
              time: `${String(8 + place.VISIT_ORDER * 2).padStart(2, "0")}:00`,
              type: internalType,
              STAY_TIME: stayTimeVal,
              PRICE_GRADE: 0,
              STATS: {
                bookmark_count: 0,
                view_count: 0,
                review_count: 0,
                rating: place.RATING || 0,
                weight: 1,
              },
              TAGS: place.TAGS || {
                spring: null,
                summer: null,
                autumn: null,
                winter: null,
              },
              isLocked: false,
              is_indoor: false,
            } as unknown as PlanItem;
          }),
        })) || [];
    } // End if hasRouteIds

    // 새 스키마를 TravelContext 구조로 매핑 (풍부한 데이터 포함)
    const mappedData: TravelContext = {
      destination: userQuery, // 쿼리를 목적지로 대체 사용
      theme: parsedData.theme ? [parsedData.theme] : [],
      party: { adult: 2, child: 0 },
      dateRange: { start: today, end: endDateStr },
      itinerary: enrichedItinerary,
    };

    return mappedData;
  } catch (error) {
    console.error("[Gemini] 컨텍스트 추출 중 오류 발생:", error);
    // 오류 발생 시 Fallback 반환
    return {
      destination: null,
      theme: [],
      party: { adult: 2, child: 0 },
      dateRange: { start: today, end: today },
    };
  }
}

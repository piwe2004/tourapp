"use server";

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

// TODO: Replace with your actual deployed Cloud Function URL
// Example: https://us-central1-your-project-id.cloudfunctions.net/generateOptimizedRoute
const OPTIMIZE_API_URL =
  "https://us-central1-tourapp-a8507.cloudfunctions.net/generateOptimizedRoute";

/**
 * @desc Call Cloud Function to optimize route
 */
async function optimizeRoute(
  places: FirebasePlace[],
  preferences: string
): Promise<FirebasePlace[]> {
  if (!OPTIMIZE_API_URL || OPTIMIZE_API_URL.includes("YOUR_PROJECT_ID")) {
    console.warn(
      "[Server] OPTIMIZE_API_URL is not set. Skipping optimization."
    );
    return places;
  }

  try {
    console.log("[Server] Requesting route optimization...");
    const response = await fetch(OPTIMIZE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ places, preferences }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.optimized_route && Array.isArray(data.optimized_route)) {
      console.log("[Server] Route optimized successfully.");
      return data.optimized_route;
    }

    return places;
  } catch (error) {
    console.warn(
      "[Server] Route optimization failed, using original order:",
      error
    );
    return places;
  }
}

/**
 * @desc Firebase PLACE 데이터를 앱 내부 PlanItem으로 변환
 */
function mapPlaceToPlanItem(
  place: FirebasePlace,
  day: number = 1,
  time: string = "10:00"
): PlanItem {
  // 카테고리 매핑 로직
  let type: PlanItem["type"] = "etc";
  const mainCat = place.CATEGORY?.main || "";
  const subCat = place.CATEGORY?.sub || "";

  if (
    mainCat.includes("식당") ||
    subCat.includes("식당") ||
    subCat.includes("레스토랑")
  )
    type = "food";
  else if (
    mainCat.includes("카페") ||
    subCat.includes("카페") ||
    subCat.includes("베이커리")
  )
    type = "cafe";
  else if (
    mainCat.includes("관광") ||
    subCat.includes("관광지") ||
    mainCat.includes("명소")
  )
    type = "sightseeing";
  else if (
    mainCat.includes("숙소") ||
    mainCat.includes("숙박") ||
    subCat.includes("호텔") ||
    subCat.includes("펜션")
  )
    type = "stay";
  else if (mainCat.includes("이동")) type = "move";

  return {
    // PlaceData Fields
    _docId: place.PLACE_ID?.toString() || "",
    PLACE_ID: place.PLACE_ID?.toString() || Date.now().toString(),
    NAME: place.NAME,
    ADDRESS: place.ADDRESS || "",
    SUB_REGION: place.SUB_REGION || null,
    CATEGORY: {
      main: place.CATEGORY?.main || "",
      sub: place.CATEGORY?.sub || "",
    },
    IMAGE_URL: place.IMAGE_URL || null,
    GALLERY_IMAGES: null,
    LOC_LAT: place.LOC_LAT,
    LOC_LNG: place.LOC_LNG,
    MAP_LINK: place.MAP_LINK || "",
    AFFIL_LINK: null,
    IS_AFLT: place.IS_AFLT || false,
    IS_TICKET_REQUIRED: false,
    TIME_INFO: null,
    PARKING_INFO: null,
    REST_INFO: null,
    FEE_INFO: place.PRICE_GRADE ? `가격대: ${place.PRICE_GRADE}` : null,
    DETAILS: {
      stayTime: place.STAY_TIME ? place.STAY_TIME.toString() : null,
    },
    RATING: place.RATING || null,
    HIGHTLIGHTS: place.HIGHTLIGHTS || null,
    KEYWORDS: place.KEYWORDS || [],
    NAME_GRAMS: [],
    STAY_TIME: place.STAY_TIME || 60,
    PRICE_GRADE: place.PRICE_GRADE || 0,
    STATS: {
      bookmark_count: 0,
      view_count: 0,
      review_count: 0,
      rating: 0,
      weight: 0,
    },
    TAGS: {
      spring: place.TAGS?.spring || null,
      summer: place.TAGS?.summer || null,
      autumn: place.TAGS?.autumn || null,
      winter: place.TAGS?.winter || null,
    },

    // PlanItem Specific Fields
    day,
    time,
    type,
    isLocked: false,
  };
}

// Firebase에서 실제 데이터를 가져옵니다.
export async function getTravelPlan(destination: string): Promise<PlanItem[]> {
  console.log(`[Server] "${destination}" 데이터 요청 (Firebase)`);

  try {
    const placesRef = collection(db, "PLACES");
    // 일단 10개만 가져옵니다. 추후 destination 기반 쿼리 등 추가 가능
    // TODO: destination이 있으면 해당 지역(SUB_REGION 등)으로 필터링하는 로직 추가 필요

    // 예: 단순 쿼리 (랜덤 또는 상위 10개)
    const q = query(placesRef, limit(10));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("[Server] 데이터가 없습니다.");
      return [];
    }

    const items: PlanItem[] = [];
    let dayCounter = 1;
    let timeCounter = 9; // 9시부터 시작

    const rawPlaces: FirebasePlace[] = [];
    querySnapshot.forEach((doc) => {
      rawPlaces.push(doc.data() as FirebasePlace);
    });

    // 2. 경로 최적화 (Cloud Function 호출)
    // destination이 있으면 그곳을 시작점으로 고려해달라는 힌트 추가
    const preferences = destination
      ? `Start near ${destination}, minimize travel time`
      : "Efficient route, minimize travel time";

    const optimizedPlaces = await optimizeRoute(rawPlaces, preferences);

    // 3. PlanItem 변환 및 시간 할당
    // const items: PlanItem[] = []; // Already declared above
    // let dayCounter = 1; // Already declared above
    // let timeCounter = 9; // Already declared above

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

    console.log(`[Server] ${items.length}개의 장소를 가져왔습니다.`);
    return items;
  } catch (error) {
    console.error("[Server] Firebase 데이터 가져오기 실패:", error);
    return []; // 에러 시 빈 배열 반환
  }
}

export interface TravelContext {
  destination: string | null;
  theme: string[];
  party: {
    adult: number;
    child: number;
  };
  dateRange: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
}

/**
 * @desc IP 기반 속도 제한 (1분에 5회)
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
export async function extractTravelContext(
  query: string
): Promise<TravelContext> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // 1. 입력값 검증: 길이 제한 (50자)
  if (query.length > 50) {
    throw new Error("검색어는 50자 이내여야 합니다.");
  }

  // 2. 입력값 검증: 스크립트 태그 방지 (간이 XSS 방어)
  if (/<script/i.test(query)) {
    throw new Error("허용되지 않는 입력이 포함되어 있습니다.");
  }

  // 3. Rate Limiting 체크
  const isAllowed = await checkRateLimit(ip);
  if (!isAllowed) {
    throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const prompt = `
    You are a helpful travel assistant.
    Analyze the following user query and extract travel context into JSON format.

    Current Date: ${today}

    User Query: "${query}"

    Requirements:
    1. "destination": Extract the city or region name. If not found, return null.
    2. "theme": Extract keywords related to travel style (e.g., "food", "healing", "activity"). Return as a string array.
    3. "party":
       - "adult": Default to 2 if not specified.
       - "child": Default to 0 if not specified.
    4. "dateRange":
       - "start": Calculate based on terms like "tomorrow", "next weekend", or specific dates relative to Current Date. If not specified, use Current Date.
       - "end": Calculate based on duration (e.g., "2 nights"). If not specified, default to 1 night after start date.
       - Format dates as "YYYY-MM-DD".

    Response Format (JSON only):
    {
      "destination": string | null,
      "theme": string[],
      "party": {
        "adult": number,
        "child": number
      },
      "dateRange": {
        "start": string,
        "end": string
      }
    }
  `;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("[Gemini] Raw response:", text);

    // Extract JSON from markdown code block if present
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr) as TravelContext;

    return data;
  } catch (error) {
    console.error("[Gemini] Error extracting context:", error);
    // Fallback in case of error
    return {
      destination: null,
      theme: [],
      party: { adult: 2, child: 0 },
      dateRange: { start: today, end: today },
    };
  }
}

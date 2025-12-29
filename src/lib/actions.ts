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
  if (!OPTIMIZE_API_URL) {
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

import { mapPlaceToPlanItem } from "@/lib/mappers";

// (Removed internal mapPlaceToPlanItem function)

// Firebase에서 실제 데이터를 가져옵니다.
export async function getTravelPlan(destination: string): Promise<PlanItem[]> {
  console.log(`[Server] "${destination}" 데이터 요청 (Firebase)`);

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
      console.warn(
        `[Server] "${destination}" 관련 데이터가 없습니다. (Fallback: 전체 랜덤)`
      );
      // 데이터가 없으면 랜덤으로 일부 가져오기 (Fallback)
      const fallbackQ = query(placesRef, limit(10));
      const fallbackSnapshot = await getDocs(fallbackQ);

      if (fallbackSnapshot.empty) return [];

      fallbackSnapshot.forEach((doc) => {
        rawPlaces.push(doc.data() as FirebasePlace);
      });
    } else {
      querySnapshot.forEach((doc) => {
        rawPlaces.push(doc.data() as FirebasePlace);
      });
    }

    if (rawPlaces.length === 0) {
      return [];
    }

    // 2. 경로 최적화 (Cloud Function 호출)
    const preferences = destination
      ? `Start near ${destination}, minimize travel time`
      : "Efficient route, minimize travel time";

    const optimizedPlaces = await optimizeRoute(rawPlaces, preferences);

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
  itinerary?: {
    day: number;
    places: {
      name: string;
      type: "spot" | "restaurant" | "hotel";
      memo: string;
    }[];
  }[];
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
// ... existing code ...

/**
 * @desc 주어진 장소 이름 목록에 해당하는 Firebase 데이터를 일괄 조회
 */
export async function getPlacesByNames(names: string[]): Promise<FirebasePlace[]> {
  if (!names || names.length === 0) return [];
  
  console.log(`[Server] getPlacesByNames called with ${names.length} names:`, names.slice(0, 5));

  const placesRef = collection(db, "PLACES");
  const uniqueNames = Array.from(new Set(names)).filter(n => n.trim() !== "");
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
      snapshot.forEach(doc => {
        chunkResults.push(doc.data() as FirebasePlace);
      });
      console.log(`[Server] Chunk result: ${chunk.length} requested -> ${chunkResults.length} found.`);
      return chunkResults;
    });

    const chunkedResults = await Promise.all(promises);
    chunkedResults.forEach(r => results.push(...r));
    
    console.log(`[Server] Total matched places: ${results.length}`);
    return results;
  } catch (error) {
    console.error("[Server] 일괄 장소 조회 실패:", error);
    return [];
  }
}

/**
 * @desc 사용자의 자연어 쿼리를 분석하여 여행 조건을 추출하는 함수입니다.
 * ...
 */
export async function extractTravelContext(
  query: string
): Promise<TravelContext> {
  // ... (existing code for headers, ratelimit) ...
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
    You are a professional travel planner and route optimizer.
    Your goal is to extract context and CREATE a logically optimized itinerary.

    Current Date: ${today}
    User Query: "${query}"

    # OPTIMIZATION RULES (CRITICAL):
    1. CLUSTERING: Group places that are geographically close to each other for the same day to minimize travel time.
    2. ACCOMMODATION: If a hotel/accommodation is mentioned or provided, every day's route must START and END at that location.
    3. LOGICAL FLOW: Ensure the sequence of places follows a natural geographic path (e.g., North to South) without backtracking or crisscrossing.
    4. VALIDATION: Check the travel distance between consecutive points. If it exceeds 30 mins by car, find a closer alternative or reorganize.
    5. PLACE NAMES: Use the **Exact Official Korean Name** (e.g., "성산일출봉" not "성산 일출봉", "해운대해수욕장" not "해운대"). This is critical for database matching.

    # OUTPUT REQUIREMENTS:
    1. "destination": Extract city/region (e.g., "제주", "부산").
    2. "theme": Extract keywords as string array.
    3. "party": adult (default 2), child (default 0).
    4. "itinerary": 
      - A list of days (Day 1, Day 2, etc.).
      - Each day contains a 'places' array ordered by the optimized route.
      - "type" MUST be one of: "spot", "restaurant", "hotel", "cafe". 
      - Include 'memo' explaining why this place fits the flow.

    # IMPORTANT JSON RULES:
    1. Output strictly standard JSON. 
    2. Boolean values MUST be lowercase (true, false). NEVER use Python-style (True, False).
    3. Do not include any text outside the JSON block.

    # Response Format:
    {
      "destination": string,
      "theme": string[],
      "party": { "adult": number, "child": number },
      "dateRange": { "start": string, "end": string },
      "itinerary": [
        {
          "day": number,
          "places": [
            { "name": string, "type": "spot" | "restaurant" | "hotel" | "cafe", "memo": string }
          ]
        }
      ]
    }
  `;
  // ... (rest of the function)

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

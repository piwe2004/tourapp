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
// Parsing Interface
interface ParsedTravelContext {
  region: string;
  districts: string[];
  people: string | null;
  themes: string[];
  duration: string;
}

export async function extractTravelContext(
  userQuery: string
): Promise<TravelContext> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";

  // 1. Validation
  if (userQuery.length > 100) throw new Error("검색어는 100자 이내여야 합니다.");
  if (/<script/i.test(userQuery)) throw new Error("허용되지 않는 입력입니다.");

  // 2. Rate Limiting
  const isAllowed = await checkRateLimit(ip);
  if (!isAllowed) throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");

  const today = new Date().toISOString().split("T")[0];

  // --------------------------------------------------------------------------
  // Step 1: Query Parsing (Gemini) - 5 Priorities
  // --------------------------------------------------------------------------
  console.log(`[Server] 🧠 Gemini Query Parsing 시작: "${userQuery}"`);
  
  const parsePrompt = `
    Analyze the unexpected travel query "${userQuery}" and extract the following 5 key elements in JSON format.
    
    # Priority & Extraction Rules
    1. **region** (1st Priority): The major region name (e.g., "제주", "부산", "강릉", "서울").
       - Must be a broad administrative region.
    
    2. **districts** (2nd Priority): A list of 2-3 specific sub-regions (Gu/Gun/Dong).
       - IF the user specified a district (e.g. "Aewol"), include it.
       - **CRITICAL**: IF the user did NOT specify a district, **YOU MUST RECOMMEND 2-3 districts** that best fit the **Theme** and **People**.
         - Example: "Jeju cafe trip" -> ["애월", "한림", "노형"] (Famous for cafes)
         - Example: "Jeju family trip" -> ["서귀포", "성산"] (Resorts/Nature)

    3. **people** (3rd Priority): Companion type (Matches 'MEMBER' field).
       - Keywords: "아이", "부모님", "커플", "친구", "혼자", "가족"
       - If not specified, categorize based on context or set null.

    4. **themes** (4th Priority): Travel style (Matches 'STYLES' field).
       - Keywords: '힐링/휴식', '맛집 탐방', '액티비티/모험', '역사/문화', '인생샷/SNS', '호캉스'
       - Extract as a list of strings.

    5. **duration** (5th Priority): Travel duration string (e.g., "1박2일").
       - Default to "1박2일" if not specified.

    # Output JSON Schema
    {
      "region": "string",
      "districts": ["string", "string"],
      "people": "string",
      "themes": ["string"],
      "duration": "string"
    }
  `;

  let parsedContext: ParsedTravelContext = { region: "제주", districts: [], people: null, themes: [], duration: "1박2일" };

  try {
    const parseResult = await geminiModel.generateContent(parsePrompt);
    const parseResponse = await parseResult.response;
    const jsonStr = parseResponse.text().replace(/```json|```/g, "").trim();
    parsedContext = JSON.parse(jsonStr) as ParsedTravelContext;
    console.log("[Server] ✅ Query Parsed:", parsedContext);
  } catch (e) {
    console.error("[Server] Query Parsing Failed, using defaults:", e);
    // Fallback: simple split
    parsedContext.region = userQuery.split(" ")[0] || "제주";
  }

  // --------------------------------------------------------------------------
  // Step 2: Firebase Fetch (Priority 1: Region)
  // --------------------------------------------------------------------------
  const region = parsedContext.region || "제주"; // Fallback
  const candidates: (FirebasePlace & { score: number })[] = [];
  
  try {
    const placesRef = collection(db, "PLACES");
    // Region Scan (ADDRESS starts with region)
    // Note: This fetches a broad set (limit 150) to apply In-Memory Scoring effectively
    const q = query(
      placesRef,
      where("ADDRESS", ">=", region),
      where("ADDRESS", "<=", region + "\uf8ff"),
      limit(300) 
    );
    
    const snapshot = await getDocs(q);
    console.log(`[Server] 📦 Region Fetch (${region}): ${snapshot.size} places found.`);

    // --------------------------------------------------------------------------
    // Step 3: In-Memory Scoring (Priority 2, 3, 4)
    // --------------------------------------------------------------------------
    const { districts, people, themes } = parsedContext;

    snapshot.forEach(doc => {
      const data = doc.data() as FirebasePlace;
      let score = 0;

      // [Priority 2] Districts (+50 / +40)
      if (districts && districts.length > 0) {
        if (data.ADDRESS && data.ADDRESS.includes(districts[0])) {
            score += 50; // Primary recommendation match
        } else if (districts.slice(1).some((d: string) => data.ADDRESS && data.ADDRESS.includes(d))) {
            score += 40; // Secondary recommendation match
        }
      }

      // [Priority 3] People (MEMBER field) (+30)
      if (people && data.MEMBER && Array.isArray(data.MEMBER)) {
        // Simple fuzzy match or exact match
        if (data.MEMBER.some(m => m.includes(people!) || people!.includes(m))) {
            score += 30;
        }
      }

      // [Priority 4] Themes (STYLES field) (+20)
      if (themes && themes.length > 0 && data.STYLES && Array.isArray(data.STYLES)) {
        if (data.STYLES.some(s => themes.some((t: string) => s.includes(t) || t.includes(s)))) {
            score += 20;
        }
      }

      // Base Score: Rating fallback
      score += (data.RATING || 0);

      candidates.push({ ...data, score });
    });

    // Sort by Score
    candidates.sort((a, b) => b.score - a.score);

    // --------------------------------------------------------------------------
    // Step 4: Candidate Selection (Category Quotas)
    // --------------------------------------------------------------------------
    // User Request: 식당 10~30, 숙소 5~20, 관광지 0~20, 카페 10~20
    
    // Group by Category
    const grouped = {
        food: [] as typeof candidates,
        cafe: [] as typeof candidates,
        stay: [] as typeof candidates,
        sightseeing: [] as typeof candidates,
        etc: [] as typeof candidates
    };

    candidates.forEach(c => {
        const cat = c.CATEGORY?.main || "";
        // [Robustness] Broader keyword matching
        if (/식당|음식|맛집/.test(cat)) grouped.food.push(c);
        else if (/카페|커피|베이커리|디저트/.test(cat)) grouped.cafe.push(c);
        else if (/숙박|호텔|리조트|펜션|모텔|게스트하우스/.test(cat)) grouped.stay.push(c);
        else if (/관광지|명소|문화|체험|공원/.test(cat)) grouped.sightseeing.push(c);
        else grouped.etc.push(c);
    });

    // Select Top N based on constraints (Max limit used here)
    // Food: 30, Stay: 20, Sightseeing: 20, Cafe: 20
    // Note: Scores are already sorted descending
    const selectedFood = grouped.food.slice(0, 30);
    const selectedStay = grouped.stay.slice(0, 20);
    const selectedSightseeing = grouped.sightseeing.slice(0, 20);
    const selectedCafe = grouped.cafe.slice(0, 20);
    
    // Combine
    const topCandidates = [
        ...selectedFood,
        ...selectedStay,
        ...selectedSightseeing,
        ...selectedCafe
    ];
    
    console.log(`[Server] 🏆 Top Scored Candidates Selected:
      - Food: ${selectedFood.length}
      - Stay: ${selectedStay.length}
      - Sightseeing: ${selectedSightseeing.length}
      - Cafe: ${selectedCafe.length}
      - Total: ${topCandidates.length}
    `);

    // Convert to String for Prompt
    const candidatePlacesStr = topCandidates.map(data => {
        const styleStr = data.STYLES?.join(",") || data.CATEGORY?.sub || "";
        return `- ID: ${data.PLACE_ID} | Name: ${data.NAME} | Loc: ${data.LOC_LAT}, ${data.LOC_LNG} | Cat: ${data.CATEGORY?.main} | Style: ${styleStr} | Rating: ${data.RATING || 0}`;
    }).join("\n");

    // --------------------------------------------------------------------------
    // Step 5: Route Generation (Gemini)
    // --------------------------------------------------------------------------
    const isMajorTouristCity = /제주|부산|강릉|여수|경주|속초|거제/.test(region);
    
    const routePrompt = `
      # Role
      You are an expert travel planner for "${region}".
      
      # Request
      Create a perfect "${parsedContext.duration}" itinerary for a "${parsedContext.people || 'general'}" group focusing on "${parsedContext.themes?.join(',') || 'general'}" themes.
      
      # Context
      ${candidatePlacesStr}
      
      # Critical Constraints (MUST FOLLOW)
      1. **Accommodation Strategy (Anchoring)**:
         - Select the **Assign ONE best accommodation** for the trip (or different ones if needed).
         - **Check-in Time**: The accommodation visit MUST be scheduled around **15:00 ~ 16:00** (3 PM - 4 PM) to unpack and rest. It should NOT be the last place.
         - *Flow*: Lunch -> Activity/Cafe -> **Check-in (Stay)** -> Dinner -> Night Activity.
      
      2. **Geographical Logic**:
         ${isMajorTouristCity 
           ? `- **Strict Clustering**: Since "${region}" is a major tourist area, pick spots **very close** to the accommodation to minimize travel time.` 
           : `- **Balanced Approach**: Since "${region}" is a general area, prioritize **Top-Rated/Popular** spots even if they are slightly far, but try to keep them within reasonable driving distance from the accommodation.`}
         - Sort routes geographically (West -> East or Cluster-based).

      3. **Volume**: 4-6 places per day.
      4. **Theme**: Suggest a creative Korean theme title.
      
      # Output JSON Schema
      {
        "theme": "string",
        "itinerary": [
          { "day": 1, "route_ids": [123, 456, 789, 101, 112] }, // sequence of PLACE_IDs
          ...
        ]
      }
    `;

    let result;
    let retryCount = 0;
    while(true) {
        try {
            result = await geminiModel.generateContent(routePrompt);
            break;
        } catch (e: any) {
            if (retryCount++ < 3 && e.status === 503) {
                await new Promise(r => setTimeout(r, 1000 * retryCount));
                continue;
            }
            throw e;
        }
    }

    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(jsonStr);

    // --------------------------------------------------------------------------
    // Step 6: Hydration & Return
    // --------------------------------------------------------------------------
    
    // Optimization: Use topCandidates map first, then fallback to getPlacesByIds if needed (though unlikely if prompt followed rules)
    // Actually, prompt constrained to candidate list, so we can trust they are likely in topCandidates or at least we should prioritize them.
    // However, to be robust, we'll use a map of topCandidates.
    
    const candidatesMap = new Map(topCandidates.map(p => [String(p.PLACE_ID), p]));
    
    // If Gemini hallucinates IDs not in candidates (rare but possible), we filter them out or could fetch if really needed.
    // Let's stick to candidatesMap for speed.
    
    const enrichedItinerary = parsedData.itinerary?.map((day: { day: number; route_ids?: (string | number)[] }) => {
        const places = (day.route_ids || []).map((id: string | number) => {
            const p = candidatesMap.get(String(id));
            if (!p) return null;
            return mapPlaceToPlanItem(p, day.day, "10:00");
        }).filter((p: PlanItem | null) => p !== null) as PlanItem[]; // Ensure type safety
        
        // Time adjustment
        places.forEach((p: PlanItem, idx: number) => {
            p.time = `${String(10 + idx * 2).padStart(2, '0')}:00`;
        });

        return {
            day: day.day,
            date: "", 
            places
        };
    }) || [];

    // Date Calculation
    const end = new Date(today);
    const totalDays = enrichedItinerary.length || 1;
    end.setDate(end.getDate() + totalDays - 1);

    return {
        destination: region,
        theme: parsedContext.themes || [],
        party: { adult: 2, child: 0 }, // 추후 people parsing 연동 가능
        dateRange: { start: today, end: end.toISOString().split("T")[0] },
        tripSummary: {
            autoGeneratedTheme: parsedData.theme || `${region} 여행`,
            destination: region,
            totalPlaces: enrichedItinerary.reduce((acc: number, d: { places: PlanItem[] }) => acc + d.places.length, 0)
        },
        itinerary: enrichedItinerary
    };

  } catch (error) {
    console.error("[Server] Critical Error in extractTravelContext:", error);
    // Return empty fallback
    return {
        destination: parsedContext.region,
        theme: [],
        party: { adult: 2, child: 0 },
        dateRange: { start: today, end: today },
        itinerary: []
    };
  }
}

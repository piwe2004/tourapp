/**
 * -------------------------------------------------------------------------
 * @file        : src/lib/mappers.ts
 * @description : 데이터 모델 간 변환 유틸리티 (FirebasePlace -> PlanItem)
 * @author      : MIN
 * @date        : 2026-01-04
 * -------------------------------------------------------------------------
 * @history
 * - 2026-01-04 MIN : 최초 작성
 * -------------------------------------------------------------------------
 */

import { PlanItem } from "@/types/place";
import { FirebasePlace } from "@/types/places";

/**
 * @desc Firebase PLACE 데이터를 앱 내부 PlanItem으로 변환
 */
export function mapPlaceToPlanItem(
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

  // Type casting explicitly for optional fields that might be missing in FirebasePlace but required/optional in PlanItem
  // Safe defaults are used.

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
      //   stayTime: place.STAY_TIME ? place.STAY_TIME.toString() : null,
      // Assuming strict type, but let's just use empty or minimal
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
    } as any, // Type mismatch workaround if TAGS structure is different

    // PlanItem Specific Fields
    day,
    time,
    type,
    isLocked: false,
    MEMO: undefined, // Default undefined
  };
}

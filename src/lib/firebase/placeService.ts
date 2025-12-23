import { db } from "../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { FirebasePlace } from "@/types/places";
import { PlanItem } from "@/mockData";

export interface PlaceDetails {
  _docId: string;        // Firebase 문서 ID
  placeId: string;      // 콘텐츠 ID
  name: string;          // 장소명
  address: string;       // 주소
  imageUrl: string;     // 대표 이미지 URL (없으면 빈 문자열)
  
  // 📍 위치 정보
  locLat: number;
  locLng: number;
  
  // 🏷️ 카테고리 (이걸로 식당/숙박/관광지 구분)
  category: {
    main: string;        // "식당", "숙박", "관광지" 등
    sub: string;         // "한식", "호텔", "해수욕장" 등
  };

  // 📝 통합 정보 (n8n에서 우리가 깔끔하게 정리해준 4대장)
  timeInfo: string | null;      // 영업시간 / 입실퇴실시간
  parkingInfo: string | null;   // 주차 정보
  restInfo: string | null;      // 휴무일
  feeInfo: string | null;       // 이용요금 / 메뉴가격
  
  // 🎟️ 기능 플래그
  isTicketRequired: boolean;   // 예약/예매 버튼 노출 여부

  // ⭐ AI 및 통계 데이터
  rating: number[] | null;       // 별점 (배열이거나 null)
  highlights: string[] | null;  // 한줄 요약
  keywords: string[];            // 검색용 키워드
  tags: {                        // 계절별 태그
    spring: string[] | null;
    summer: string[] | null;
    autumn: string[] | null;
    winter: string[] | null;
  };

  // 🧩 2. 핵심: 변동되는 상세 정보는 'Dictionary' 타입으로 선언!
  // "키가 뭔지 모르지만, 값은 문자열 아니면 null이다" 라는 뜻입니다.
  details: Record<string, string | null>; 
}

/**
 * @desc Firebase 'PLACES' 컬렉션에서 장소의 상세 정보(이미지, 주소, 특징/메뉴)를 가져옵니다.
 *       'NAME' 필드를 기준으로 검색합니다.
 * @param placeName 장소 이름 (e.g., "자매국수")
 * @returns PlaceDetails 객체 (모든 필드는 null일 수 있음)
 */
export async function fetchPlaceDetails(placeName: string): Promise<PlaceDetails> {
    const defaultResult: PlaceDetails = {
        _docId: "",
        placeId: "",
        name: placeName,
        address: "",
        imageUrl: "",
        locLat: 0,
        locLng: 0,
        category: { main: "", sub: "" },
        timeInfo: null,
        parkingInfo: null,
        restInfo: null,
        feeInfo: null,
        isTicketRequired: false,
        rating: null,
        highlights: null,
        keywords: [],
        tags: { spring: null, summer: null, autumn: null, winter: null },
        details: {}
    };
    
    if (!placeName) return defaultResult;

    try {
        const placesRef = collection(db, "PLACES");
        const q = query(placesRef, where("NAME", "==", placeName), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data() as FirebasePlace;

            return {
                _docId: doc.id,
                placeId: data.PLACE_ID?.toString() || "",
                name: data.NAME || placeName,
                address: data.ADDRESS || "",
                imageUrl: data.IMAGE_URL || "",
                locLat: data.LOC_LAT || 0,
                locLng: data.LOC_LNG || 0,
                category: {
                    main: data.CATEGORY?.main || "",
                    sub: data.CATEGORY?.sub || ""
                },
                timeInfo: null, // 추후 데이터 필드 추가 필요
                parkingInfo: null,
                restInfo: null,
                feeInfo: data.PRICE_GRADE ? `가격대: ${data.PRICE_GRADE}` : null,
                isTicketRequired: false,
                rating: data.RATING ? [data.RATING] : null,
                highlights: data.HIGHLIGHTS || null,
                keywords: data.KEYWORDS || [],
                tags: {
                    spring: data.TAGS?.spring || null,
                    summer: data.TAGS?.summer || null,
                    autumn: data.TAGS?.autumn || null,
                    winter: data.TAGS?.winter || null
                },
                details: {
                    stayTime: data.STAY_TIME ? data.STAY_TIME.toString() : null,
                    subRegion: data.SUB_REGION || null,
                    mapLink: data.MAP_LINK || null,
                    isAflt: data.IS_AFLT ? "true" : "false"
                }
            };
        }
    } catch (error) {
        console.warn(`Error fetching details for ${placeName}:`, error);
    }

    return defaultResult;
}

/**
 * @desc 현 위치 주변의 실내 추천 장소를 가져옵니다. (Mock 대체)
 */

export async function getNearbyIndoorPlaces(lat: number, lng: number): Promise<PlanItem[]> {
    try {
        // [Simple Logic] 전체/일부 데이터를 가져와서 거리 + 실내 여부로 필터링
        // (Firestore에서 위경도 범위 쿼리는 복잡하므로, 여기서는 Category/Keywords로 1차 필터 후 클라이언트 거리 계산)
        
        const placesRef = collection(db, "PLACES");
        // '실내' 키워드나 특정 카테고리로 필터링하면 좋겠지만, 
        // 데이터 구조상 모든 장소를 훑거나, '관광지'/'카페' 위주로 가져와서 필터링
        
        // 1. 우선 50개 정도만 가져와서 거리 계산 (Production에서는 Geofire 등 사용 권장)
        const q = query(placesRef, limit(50)); 
        const snapshot = await getDocs(q);
        
        const results: PlanItem[] = [];

        snapshot.forEach(doc => {
            const data = doc.data() as FirebasePlace;
            
            // 1. 좌표 유효성 체크
            if (!data.LOC_LAT || !data.LOC_LNG) return;

            // 2. 거리 계산 (5km 이내)
            const dist = getDistanceFromLatLonInKm(lat, lng, data.LOC_LAT, data.LOC_LNG);
            if (dist > 5) return;

            // 3. 실내 여부 판단 (Infer IsIndoor)
            const isIndoor = checkIsIndoor(data);
            if (!isIndoor) return;

            // 4. PlanItem으로 변환
            results.push({
                id: data.PLACE_ID,
                day: 0, // 추천용 임시
                time: "",
                activity: data.NAME,
                type: mapCategoryToType(data.CATEGORY.main),
                memo: data.HIGHLIGHTS?.[0] || "비 오는 날 추천",
                lat: data.LOC_LAT,
                lng: data.LOC_LNG,
                is_indoor: true,
                address: data.ADDRESS,
                imageUrl: data.IMAGE_URL,
                category: {
                    main: data.CATEGORY.main,
                    sub: data.CATEGORY.sub
                }
            });
        });

        return results;

    } catch (error) {
        console.error("Failed to fetch nearby indoor places:", error);
        return [];
    }
}

// 거리 계산 헬퍼
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

// 실내 여부 추론
function checkIsIndoor(place: FirebasePlace): boolean {
    const indoorKeywords = ['박물관', '미술관', '전시', '카페', '실내', '아쿠아리움', '공방'];
    const outdoorKeywords = ['해수욕장', '오름', '공원', '산책'];

    // 1. 카테고리 체크
    if (place.CATEGORY.sub && indoorKeywords.some(k => place.CATEGORY.sub.includes(k))) return true;
    if (place.CATEGORY.main === '카페' || place.CATEGORY.main === '식당') return true; 

    // 2. 키워드 체크
    if (place.KEYWORDS && place.KEYWORDS.some(k => indoorKeywords.some(ik => k.includes(ik)))) return true;

    // 3. 반대로 Outdoor 키워드가 있으면 false
    if (place.CATEGORY.sub && outdoorKeywords.some(k => place.CATEGORY.sub.includes(k))) return false;

    // 기본적으로 모르면 false (보수적 접근)
    return false;
}

// 카테고리 매핑
function mapCategoryToType(mainCat: string): PlanItem['type'] {
    if (mainCat === '식당') return 'food';
    if (mainCat === '카페') return 'cafe';
    if (mainCat === '숙박') return 'stay';
    return 'sightseeing';
}

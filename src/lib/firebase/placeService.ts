import { db } from "../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { FirebasePlace } from "@/types/places";
import { PlanItem, PlaceData } from "@/types/place";

/**
 * @desc Firebase 'PLACES' 컬렉션에서 장소의 상세 정보(이미지, 주소, 특징/메뉴)를 가져옵니다.
 *       'NAME' 필드를 기준으로 검색합니다.
 * @param placeName 장소 이름 (e.g., "자매국수")
 * @returns PlaceData 객체 (모든 필드는 null일 수 있음)
 */
export async function fetchPlaceDetails(placeName: string): Promise<PlaceData> {
    const defaultResult: PlaceData = {
        _docId: "",
        PLACE_ID: "",
        NAME: placeName,
        ADDRESS: "",
        SUB_REGION: null,
        CATEGORY: { main: "", sub: "" },
        IMAGE_URL: "",
        GALLERY_IMAGES: null,
        LOC_LAT: 0,
        LOC_LNG: 0,
        MAP_LINK: "",
        AFFIL_LINK: null,
        IS_AFLT: false,
        IS_TICKET_REQUIRED: false,
        TIME_INFO: null,
        PARKING_INFO: null,
        REST_INFO: null,
        FEE_INFO: null,
        DETAILS: {},
        RATING: null,
        HIGHTLIGHTS: null,
        KEYWORDS: [],
        NAME_GRAMS: [],
        STAY_TIME: 0,
        PRICE_GRADE: 0,
        STATS: {
            bookmark_count: 0,
            view_count: 0,
            review_count: 0,
            rating: 0,
            weight: 0
        },
        TAGS: { spring: null, summer: null, autumn: null, winter: null }
    };
    
    if (!placeName) return defaultResult;

    try {
        const placesRef = collection(db, "PLACES");
        const q = query(placesRef, where("NAME", "==", placeName), limit(1));
        console.log(`[Server][Firebase Debug] 🕵️ fetchPlaceDetails 조회 | 이름: "${placeName}"`);
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data() as FirebasePlace;

            return {
                _docId: doc.id,
                PLACE_ID: data.PLACE_ID?.toString() || "",
                NAME: data.NAME || placeName,
                ADDRESS: data.ADDRESS || "",
                SUB_REGION: data.SUB_REGION || null,
                CATEGORY: {
                    main: data.CATEGORY?.main || "",
                    sub: data.CATEGORY?.sub || ""
                },
                IMAGE_URL: data.IMAGE_URL || "",
                GALLERY_IMAGES: null, // 추후 추가
                LOC_LAT: data.LOC_LAT || 0,
                LOC_LNG: data.LOC_LNG || 0,
                MAP_LINK: data.MAP_LINK || "",
                AFFIL_LINK: null,
                IS_AFLT: data.IS_AFLT || false,
                IS_TICKET_REQUIRED: false, // 기본값
                TIME_INFO: null,
                PARKING_INFO: null,
                REST_INFO: null,
                FEE_INFO: data.PRICE_GRADE ? `가격대: ${data.PRICE_GRADE}` : null,
                DETAILS: {
                    stayTime: data.STAY_TIME ? data.STAY_TIME.toString() : null,
                },
                RATING: data.RATING || null,
                HIGHTLIGHTS: data.HIGHTLIGHTS || null,
                KEYWORDS: data.KEYWORDS || [],
                NAME_GRAMS: [],
                STAY_TIME: data.STAY_TIME || 0,
                PRICE_GRADE: data.PRICE_GRADE || 0,
                STATS: {
                    bookmark_count: 0,
                    view_count: 0,
                    review_count: 0,
                    rating: 0,
                    weight: 0
                },
                TAGS: {
                    spring: data.TAGS?.spring || null,
                    summer: data.TAGS?.summer || null,
                    autumn: data.TAGS?.autumn || null,
                    winter: data.TAGS?.winter || null
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
            const planItem: PlanItem = {
                // PlaceData Fields
                _docId: doc.id,
                PLACE_ID: data.PLACE_ID.toString(),
                NAME: data.NAME,
                ADDRESS: data.ADDRESS || "",
                SUB_REGION: data.SUB_REGION || null,
                CATEGORY: {
                    main: data.CATEGORY.main,
                    sub: data.CATEGORY.sub
                },
                IMAGE_URL: data.IMAGE_URL || null,
                GALLERY_IMAGES: null,
                LOC_LAT: data.LOC_LAT,
                LOC_LNG: data.LOC_LNG,
                MAP_LINK: data.MAP_LINK || "",
                AFFIL_LINK: null,
                IS_AFLT: data.IS_AFLT || false,
                IS_TICKET_REQUIRED: false,
                TIME_INFO: null,
                PARKING_INFO: null,
                REST_INFO: null,
                FEE_INFO: data.PRICE_GRADE ? `가격대: ${data.PRICE_GRADE}` : null,
                DETAILS: {},
                RATING: data.RATING || null,
                HIGHTLIGHTS: data.HIGHTLIGHTS || null,
                KEYWORDS: data.KEYWORDS || [],
                NAME_GRAMS: [],
                STAY_TIME: data.STAY_TIME || 60,
                PRICE_GRADE: data.PRICE_GRADE || 0,
                STATS: {
                    bookmark_count: 0,
                    view_count: 0,
                    review_count: 0,
                    rating: 0,
                    weight: 0
                },
                TAGS: {
                    spring: data.TAGS?.spring || null,
                    summer: data.TAGS?.summer || null,
                    autumn: data.TAGS?.autumn || null,
                    winter: data.TAGS?.winter || null
                },

                // PlanItem Specific Fields
                day: 0, // 추천용 임시
                time: "00:00",
                type: mapCategoryToType(data.CATEGORY.main),
                isLocked: false
            };
            
            results.push(planItem);
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
    const outdoorKeywords = ['해수욕장', '오름', '공원', '산책', '숲길'];

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


/**
 * @desc 테마별 추천 장소를 가져옵니다.
 *       단순화를 위해, 테마별 키워드 매핑을 사용하여 검색합니다.
 */
export async function getPlacesByTheme(theme: string): Promise<PlanItem[]> {
    try {
        const themeKeywords: Record<string, string[]> = {
            'cafe': ['카페', '디저트', '커피'],
            'photo': ['포토존', '사진', '인생샷', '풍경'],
            'indoor': ['실내', '박물관', '미술관', '전시'],
            'walk': ['산책', '숲길', '올레길', '오름'],
            'activity': ['액티비티', '체험', '레저', '테마파크']
        };

        const keywords = themeKeywords[theme] || [];
        if (keywords.length === 0) return [];

        const placesRef = collection(db, "PLACES");
        // Firestore 'array-contains-any' 사용 (KEYWORDS 필드 가정)
        // 주의: KEYWORDS 필드가 배열이어야 함.
        const q = query(
            placesRef, 
            where("KEYWORDS", "array-contains-any", keywords),
            limit(10) 
        );
        
        const snapshot = await getDocs(q);
        console.log(`[Server][Firebase Debug] 🎨 getPlacesByTheme 조회 | 테마: "${theme}" | 키워드: [${keywords.join(", ")}] | 결과: ${snapshot.size}개`);
        const results: PlanItem[] = [];

        snapshot.forEach(doc => {
            const data = doc.data() as FirebasePlace;
            
            const planItem: PlanItem = {
                _docId: doc.id,
                PLACE_ID: data.PLACE_ID.toString(),
                NAME: data.NAME,
                ADDRESS: data.ADDRESS || "",
                SUB_REGION: data.SUB_REGION || null,
                CATEGORY: {
                    main: data.CATEGORY.main,
                    sub: data.CATEGORY.sub
                },
                IMAGE_URL: data.IMAGE_URL || null,
                GALLERY_IMAGES: null,
                LOC_LAT: data.LOC_LAT || 0,
                LOC_LNG: data.LOC_LNG || 0,
                MAP_LINK: data.MAP_LINK || "",
                AFFIL_LINK: null,
                IS_AFLT: data.IS_AFLT || false,
                IS_TICKET_REQUIRED: false,
                TIME_INFO: null,
                PARKING_INFO: null,
                REST_INFO: null,
                FEE_INFO: null,
                DETAILS: {},
                RATING: data.RATING || null,
                HIGHTLIGHTS: data.HIGHTLIGHTS || null,
                KEYWORDS: data.KEYWORDS || [],
                NAME_GRAMS: [],
                STAY_TIME: data.STAY_TIME || 60,
                PRICE_GRADE: data.PRICE_GRADE || 0,
                STATS: { bookmark_count: 0, view_count: 0, review_count: 0, rating: 0, weight: 0 },
                TAGS: { spring: null, summer: null, autumn: null, winter: null },
                
                day: 0, 
                time: "00:00",
                type: mapCategoryToType(data.CATEGORY.main),
                isLocked: false
            };
            results.push(planItem);
        });

        return results;

    } catch (error) {
        console.error("Failed to fetch places by theme:", error);
        return [];
    }
}

import { db } from "../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { FirebasePlace } from "@/types/places";

export interface PlaceDetails {
    imageUrl: string | null;
    address: string | null;
    menu: string | null;
}

/**
 * @desc Firebase 'PLACES' 컬렉션에서 장소의 상세 정보(이미지, 주소, 특징/메뉴)를 가져옵니다.
 *       'NAME' 필드를 기준으로 검색합니다.
 * @param placeName 장소 이름 (e.g., "자매국수")
 * @returns PlaceDetails 객체 (모든 필드는 null일 수 있음)
 */
export async function fetchPlaceDetails(placeName: string): Promise<PlaceDetails> {
    const defaultResult: PlaceDetails = { imageUrl: null, address: null, menu: null };
    
    if (!placeName) return defaultResult;

    try {
        const placesRef = collection(db, "PLACES");
        const q = query(placesRef, where("NAME", "==", placeName), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data() as FirebasePlace;

            // 1. 이미지: IMAGE_URL
            const imageUrl = data.IMAGE_URL || null;

            // 2. 주소: ADDRESS
            const address = data.ADDRESS || null;

            // 3. 메뉴/특징: HIGHLIGHTS 배열을 문자열로 변환
            // HIGHLIGHTS가 없으면 KEYWORDS 사용
            let menu: string | null = null;
            if (data.HIGHLIGHTS && data.HIGHLIGHTS.length > 0) {
                menu = data.HIGHLIGHTS.join(", ");
            } else if (data.KEYWORDS && data.KEYWORDS.length > 0) {
                menu = data.KEYWORDS.slice(0, 3).join(", ");
            }

            return { imageUrl, address, menu };
        }
    } catch (error) {
        console.warn(`Error fetching details for ${placeName}:`, error);
    }

    return defaultResult;
}

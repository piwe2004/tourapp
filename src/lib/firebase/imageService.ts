import { db } from "../firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

/**
 * @desc Retrieves a representative image for a place from the 'GALLERY_IMAGES' collection.
 *       Queries by matching the 'title' field with the place name.
 * @param placeName The name of the place to search for (e.g., "자매국수")
 * @returns The URL of the image, or null if not found.
 */
export async function fetchPlaceImage(placeName: string): Promise<string | null> {
  if (!placeName) return null;

  try {
    const imagesRef = collection(db, "GALLERY_IMAGES");
    // 'title' 필드와 장소 이름이 일치하는 문서 검색
    const q = query(imagesRef, where("title", "==", placeName), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      // data.imageUrl 필드가 있다고 가정 (실제 필드명 확인 필요, 여기서는 일반적인 imageUrl로 가정)
      return data.imageUrl || data.url || null; 
    }
  } catch (error) {
    console.warn(`Error fetching image for ${placeName}:`, error);
  }

  return null;
}

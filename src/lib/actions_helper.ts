/**
 * -------------------------------------------------------------------------
 * @file        : src/lib/actions_helper.ts
 * @description : Server Actions에서 사용하는 헬퍼 함수 모음 (ID 기반 조회 등)
 * @author      : MIN
 * @date        : 2026-01-04
 * -------------------------------------------------------------------------
 * @history
 * - 2026-01-04 MIN : 최초 작성
 * -------------------------------------------------------------------------
 */

import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FirebasePlace } from "@/types/places";

// ... (imports remain the same as previous files, ensuring necessary imports like 'where', 'documentId' etc if needed)

/**
 * @desc 주어진 PLACE_ID 목록에 해당하는 Firebase 데이터를 일괄 조회 (숫자형/문자열 ID 모두 대응)
 */
export async function getPlacesByIds(
  ids: (string | number)[]
): Promise<FirebasePlace[]> {
  if (!ids || ids.length === 0) return [];

  console.log(
    `[Server][Firebase Debug] 🆔 getPlacesByIds 호출 | 요청된 ID: ${ids.length}개`,
    ids.slice(0, 5)
  );

  const placesRef = collection(db, "PLACES");
  // Ensure IDs are consistent types if needed. Assuming DB has mixed or specific type.
  // The terminal example showed numbers (1018702). DB might store them as numbers or strings.
  // We'll try to match exact value.

  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length > 30) {
    console.warn(
      `[Server] Too many IDs to fetch (${uniqueIds.length}). Skipping to prevent error.`
    );
    return [];
  }

  const chunks = [];
  for (let i = 0; i < uniqueIds.length; i += 10) {
    chunks.push(uniqueIds.slice(i, i + 10));
  }

  const results: FirebasePlace[] = [];

  try {
    const promises = chunks.map(async (chunk) => {
      // Trying to match PLACE_ID field.
      // Note: If PLACE_ID is document ID, use documentId(). If it's a field "PLACE_ID", use where.
      // Based on PlaceData interface, PLACE_ID is a field.
      const q = query(placesRef, where("PLACE_ID", "in", chunk));
      const snapshot = await getDocs(q);
      const chunkResults: FirebasePlace[] = [];
      snapshot.forEach((doc) => {
        chunkResults.push(doc.data() as FirebasePlace);
      });
      console.log(
        `[Server][Firebase Debug] 📦 ID 청크 조회 | 요청: ${chunk.length}개 -> 발견: ${chunkResults.length}개`
      );
      return chunkResults;
    });

    const chunkedResults = await Promise.all(promises);
    chunkedResults.forEach((r) => results.push(...r));

    return results;
  } catch (error) {
    console.error("[Server] 일괄 ID 조회 실패:", error);
    return [];
  }
}

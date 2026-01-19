

interface RouteResponse {
  code: number;
  message: string;
  route?: {
    traoptimal?: {
      summary: {
        distance: number;
        duration: number;
      };
      path: [number, number][]; // [lng, lat]
      section?: {
        pointIndex: number;
        pointCount: number;
        distance: number;
        duration: number;
        name?: string;
      }[];
    }[];
  };
}

/**
 * @desc 두 지점(또는 경유지 포함) 사이의 주행 경로를 가져옵니다.
 * @param start 시작점 {LOC_LAT, LOC_LNG}
 * @param goal 도착점 {LOC_LAT, LOC_LNG}
 * @param waypoints 경유지 리스트 (Optional)
 */
export async function getRoutePath(
  start: { LOC_LAT: number; LOC_LNG: number },
  goal: { LOC_LAT: number; LOC_LNG: number },
  waypoints: { LOC_LAT: number; LOC_LNG: number }[] = []
): Promise<{ 
  path: { lat: number; lng: number }[]; 
  distance: number; 
  duration: number;
  sections: { pointIndex: number; pointCount: number; distance: number; duration: number }[];
} | null> {
  
  if (!start.LOC_LAT || !start.LOC_LNG || !goal.LOC_LAT || !goal.LOC_LNG) {
      console.warn("Invalid start or goal coordinates");
      return null;
  }

  // 좌표 포맷: "lng,lat"
  const startParam = `${start.LOC_LNG},${start.LOC_LAT}`;
  const goalParam = `${goal.LOC_LNG},${goal.LOC_LAT}`;
  
  // 경유지 포맷: "lng,lat|lng,lat|..." (최대 5개 제한이 일반적이나, URL 길이 주의)
  const waypointsParam = waypoints
    .filter(p => p.LOC_LAT && p.LOC_LNG)
    .map(p => `${p.LOC_LNG},${p.LOC_LAT}`)
    .join('|');

  const queryParams = new URLSearchParams({
    start: startParam,
    goal: goalParam,
  });

  if (waypointsParam) {
    queryParams.append('waypoints', waypointsParam);
  }

  try {
    const res = await fetch(`/api/directions?${queryParams.toString()}`);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    
    const data: RouteResponse = await res.json();
    
    if (data.code === 0 && data.route && data.route.traoptimal && data.route.traoptimal.length > 0) {
        const result = data.route.traoptimal[0];
        
        // Naver 5 API returns [lng, lat]. Convert to {lat, lng} for Map.tsx
        // Map.tsx usually uses naver.maps.LatLng or {lat, lng} objects.
        const path = result.path.map(([lng, lat]) => ({ lat, lng }));
        
        // 섹션 정보 추출 (구간별 상세 정보)
        // 경유지가 없을 경우 section 정보가 빈 배열이거나 없을 수 있음 -> 전체를 하나의 섹션으로 처리
        let sections = [];
        if (result.section && result.section.length > 0) {
            sections = result.section.map(s => ({
                pointIndex: s.pointIndex,
                pointCount: s.pointCount,
                distance: s.distance,
                duration: s.duration
            }));
        } else {
            // 섹션 정보가 없으면 전체 경로를 하나의 섹션으로 간주
            sections = [{
                pointIndex: 0,
                pointCount: path.length,
                distance: result.summary.distance,
                duration: result.summary.duration
            }];
        }

        return {
            path,
            distance: result.summary.distance,
            duration: result.summary.duration,
            sections
        };
    } else {
        console.warn("No route found or API error:", data.message);
        return null;
    }

  } catch (error) {
    console.error("Failed to fetch route:", error);
    return null;
  }
}

'use client';

/**
 * -------------------------------------------------------------------------
 * @file        : src/components/planner/Map.tsx
 * @description : 네이버 지도를 이용한 경로 및 마커 시각화 컴포넌트
 * @author      : MIN
 * @date        : 2026-01-04
 * -------------------------------------------------------------------------
 * @history
 * - 2026-01-04 MIN : 최초 작성
 * - 2026-01-15 MIN : Directions 5 API 연동 (실시간 경로 안내)
 * -------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react';
import { PlanItem } from '@/types/place';
import { getRoutePath } from '@/services/directionService';

interface MapProps {
  schedule: PlanItem[];
  selectedDay: number;
  selectedItemId?: string | null;
  onItemClick: (id: string) => void;
  showPath?: boolean;
}

export default function Map({ schedule, selectedDay, selectedItemId, onItemClick, showPath = true }: MapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
  const durationMarkersRef = useRef<naver.maps.Marker[]>([]);

  // 네이버 지도 SDK 로드 상태
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  // 실제 경로(Polyline) 좌표 상태
  const [routePath, setRoutePath] = useState<naver.maps.LatLng[]>([]);
  // 경로 구간 정보 상태
  const [routeSections, setRouteSections] = useState<{ pointIndex: number; pointCount: number; distance: number; duration: number }[]>([]);

  // 1. 네이버 맵 로드 확인
  useEffect(() => {
    const checkMapLoaded = setInterval(() => {
      if (window.naver && window.naver.maps) {
        setIsMapLoaded(true);
        clearInterval(checkMapLoaded);
      }
    }, 100);
    return () => clearInterval(checkMapLoaded);
  }, []);

  // 2. 지도 초기화 및 마커 렌더링
  useEffect(() => {
    if (!isMapLoaded || !mapElement.current || !window.naver?.maps) return;

    // 현재 선택된 날짜의 아이템 필터링
    const dayItems = schedule.filter(
      (item) => item.day === selectedDay && item.LOC_LAT && item.LOC_LNG
    );

    // 중심 좌표 설정
    const centerLat = dayItems.length > 0 ? dayItems[0].LOC_LAT! : 33.5104;
    const centerLng = dayItems.length > 0 ? dayItems[0].LOC_LNG! : 126.4913;
    const center = new window.naver.maps.LatLng(centerLat, centerLng);

    // 지도 인스턴스 생성 (한 번만)
    if (!mapRef.current) {
      const mapOptions: naver.maps.MapOptions = {
        center: center,
        zoom: 11,
        minZoom: 6,
        scaleControl: false,
        mapDataControl: false,
        logoControlOptions: {
          position: window.naver.maps.Position.BOTTOM_RIGHT,
        },
      };
      mapRef.current = new window.naver.maps.Map(mapElement.current, mapOptions);
    }

    const map = mapRef.current;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 생성
    dayItems.forEach((item, index) => {
      const position = new window.naver.maps.LatLng(item.LOC_LAT!, item.LOC_LNG!);
      const isSelected = selectedItemId === item.PLACE_ID;

      const markerContent = `
        <div style="position: absolute; left: 0px; top: 0px; width: 20px; height: 20px;" class="group/marker cursor-pointer planner-map-marker-container">
            <div class="planner-map-tooltip">
                ${item.NAME}
                <div class="planner-map-tooltip-arrow"></div>
            </div>
            <div class="planner-map-marker-circle ${isSelected ? 'active' : ''}">
                ${index + 1}
            </div>
        </div>
      `;

      const marker = new window.naver.maps.Marker({
        position: position,
        map: map,
        title: item.NAME,
        zIndex: isSelected ? 100 : 10,
        icon: {
          content: markerContent,
          size: new window.naver.maps.Size(20, 20),
          anchor: new window.naver.maps.Point(20, 20),
        }
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        onItemClick(item.PLACE_ID);
      });

      markersRef.current.push(marker);
    });

    // 뷰포트 조정
    if (selectedItemId) {
      const selectedItem = dayItems.find(item => item.PLACE_ID === selectedItemId);
      if (selectedItem && selectedItem.LOC_LAT && selectedItem.LOC_LNG) {
        map.morph(new window.naver.maps.LatLng(selectedItem.LOC_LAT, selectedItem.LOC_LNG), 14);
      }
    } else {
        if (dayItems.length > 0) {
            // 마커들이 모두 보이도록 바운드 조정
            const bounds = new window.naver.maps.LatLngBounds(
                 new window.naver.maps.LatLng(dayItems[0].LOC_LAT!, dayItems[0].LOC_LNG!),
                 new window.naver.maps.LatLng(dayItems[0].LOC_LAT!, dayItems[0].LOC_LNG!)
            );
            dayItems.forEach(item => {
                bounds.extend(new window.naver.maps.LatLng(item.LOC_LAT!, item.LOC_LNG!));
            });
            map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
        } else {
            map.setCenter(center);
            map.setZoom(11);
        }
    }

  }, [schedule, selectedDay, selectedItemId, isMapLoaded, onItemClick]);

  // 3-1. 경로 초기화 (showPath, isMapLoaded 변경 시)
  useEffect(() => {
    if (!isMapLoaded || !showPath) {
      setRoutePath((prev) => (prev.length > 0 ? [] : prev));
      setRouteSections((prev) => (prev.length > 0 ? [] : prev));
    }
  }, [showPath, isMapLoaded]);

  // 3-2. 실시간 경로 데이터 가져오기 (Directions 5 API)
  useEffect(() => {
    let isCancelled = false;

    if (!isMapLoaded || !showPath) return;

    const dayItems = schedule.filter(item => item.day === selectedDay && item.LOC_LAT && item.LOC_LNG);

    // 아이템이 2개 미만이면 경로 없음 -> 초기화는 위 3-1에서 처리되거나, 여기서 명시적으로 빈배열 set 가능하지만
    // schedule 변경 시에도 반응해야 하므로 여기서도 체크 필요
    if (dayItems.length < 2) {
        setRoutePath([]);
        setRouteSections([]);
        return;
    }

    const fetchDirections = async () => {
        // API 제한 고려: 최대 5개 경유지 + 시작 + 끝 = 7개 포인트까지 한 번에 가능
        if (dayItems.length <= 7) {
            const start = dayItems[0];
            const goal = dayItems[dayItems.length - 1];
            const waypoints = dayItems.slice(1, -1);

            const result = await getRoutePath(
                { LOC_LAT: start.LOC_LAT!, LOC_LNG: start.LOC_LNG! },
                { LOC_LAT: goal.LOC_LAT!, LOC_LNG: goal.LOC_LNG! },
                waypoints.map(p => ({ LOC_LAT: p.LOC_LAT!, LOC_LNG: p.LOC_LNG! }))
            );

            if (!isCancelled) {
                if (result && result.path) {
                    const naverPath = result.path.map(p => new window.naver.maps.LatLng(p.lat, p.lng));
                    setRoutePath(naverPath);
                    setRouteSections(result.sections || []);
                } else {
                    const straightPath = dayItems.map(p => new window.naver.maps.LatLng(p.LOC_LAT!, p.LOC_LNG!));
                    setRoutePath(straightPath);
                    setRouteSections([]);
                }
            }
        } else {
            // 7개 초과 시 직선 경로
            if (!isCancelled) {
                const straightPath = dayItems.map(p => new window.naver.maps.LatLng(p.LOC_LAT!, p.LOC_LNG!));
                setRoutePath(straightPath);
                setRouteSections([]);
            }
        }
    };

    fetchDirections();
    
    return () => {
        isCancelled = true;
    };

  }, [schedule, selectedDay, showPath, isMapLoaded]);

  // 4. 경로(Polyline) 및 소요시간 마커 그리기
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    // Polyline 업데이트
    if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
    }

    if (showPath && routePath.length > 1) {
        const polyline = new window.naver.maps.Polyline({
            map: map,
            path: routePath,
            strokeColor: "#4f46e5",
            strokeOpacity: 0.8,
            strokeWeight: 5,
            strokeStyle: "solid",
            strokeLineCap: "round",
            strokeLineJoin: "round",
        });
        polylineRef.current = polyline;
    }

    // 소요시간 마커 업데이트
    durationMarkersRef.current.forEach(m => m.setMap(null));
    durationMarkersRef.current = [];

    if (showPath && routeSections.length > 0 && routePath.length > 0) {
        routeSections.forEach((section) => {
            // 섹션의 중간 지점 계산
            const midIndex = section.pointIndex + Math.floor(section.pointCount / 2);
            
            if (midIndex < routePath.length) {
                const position = routePath[midIndex];
                const durationMin = Math.round(section.duration / 60000); // 밀리초 -> 분
                
                const durationText = durationMin <= 0 ? "약 1분" : `${durationMin}분`;

                const content = `
                  <div class="planner-map-duration-marker" style="
                    background-color: white;
                    border: 1px solid #4f46e5;
                    color: #4f46e5;
                    padding: 2px 6px;
                    border-radius: 9999px;
                    font-size: 11px;
                    font-weight: 700;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                    white-space: nowrap;
                    transform: translate(-50%, -50%);
                  ">
                    ${durationText}
                  </div>
                `;

                const marker = new window.naver.maps.Marker({
                    position: position,
                    map: map,
                    icon: {
                        content: content,
                        size: new window.naver.maps.Size(0, 0),
                        anchor: new window.naver.maps.Point(0, 0),
                    }
                });
                
                durationMarkersRef.current.push(marker);
            }
        });
    }

  }, [routePath, routeSections, showPath, isMapLoaded]);

  return (
    <div className="planner-map-inner">
      <div ref={mapElement} className="planner-map-element" />

      <div className="planner-map-overlay">
        {!process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID && (
          <p className="planner-map-warning">
            ⚠️ Client ID 필요
          </p>
        )}
      </div>
    </div>
  );
}

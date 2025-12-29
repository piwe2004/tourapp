'use client';

import { useEffect, useRef, useState } from 'react';
import { PlanItem } from '@/types/place';

interface MapProps {
  schedule: PlanItem[];
  selectedDay: number;
  selectedItemId?: string | null; // 선택된 아이템 ID prop 추가
  onItemClick: (id: string) => void; // [New] 마커 클릭 핸들러
}

export default function Map({ schedule, selectedDay, selectedItemId, onItemClick }: MapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]); // 마커 관리용 ref
  const polylineRef = useRef<naver.maps.Polyline | null>(null); // 경로 관리용 ref

  // 네이버 지도 SDK 로드 상태 감지
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    const checkMapLoaded = setInterval(() => {
      if (window.naver && window.naver.maps) {
        setIsMapLoaded(true);
        clearInterval(checkMapLoaded);
      }
    }, 100);

    return () => clearInterval(checkMapLoaded);
  }, []);

  /**
   * @desc 일정 데이터(schedule)가 변경되면 지도와 경로를 다시 그립니다.
   */
  useEffect(() => {
    // 1. 지도 SDK가 로드되지 않았거나 DOM 요소가 없으면 중단
    if (!isMapLoaded || !mapElement.current || !window.naver?.maps) return;

    // 2. 현재 선택된 날짜의 아이템만 필터링 (위도/경도 있는 것만)
    const dayItems = schedule.filter(
      (item) => item.day === selectedDay && item.LOC_LAT && item.LOC_LNG
    );

    // 3. 중심 좌표 계산 (데이터가 없으면 제주공항 기본값)
    const centerLat = dayItems.length > 0 ? dayItems[0].LOC_LAT! : 33.5104;
    const centerLng = dayItems.length > 0 ? dayItems[0].LOC_LNG! : 126.4913;
    const center = new window.naver.maps.LatLng(centerLat, centerLng);

    // 4. 지도 인스턴스 초기화 (한 번만 실행)
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

    // 5. 기존 마커 및 경로 깨끗이 제거 (초기화)
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // 6. 새로운 마커 생성 및 경로 좌표 수집
    const pathCoords: naver.maps.LatLng[] = [];

    dayItems.forEach((item, index) => {
      const position = new window.naver.maps.LatLng(item.LOC_LAT!, item.LOC_LNG!);
      pathCoords.push(position);

      const isSelected = selectedItemId === item.PLACE_ID;

      // 선택 여부에 따른 마커 스타일링
      // z-index: 선택된 마커가 100, hover시 50(group-hover로 처리)

      const markerContent = `
        <div style="position: absolute; left: 0px; top: 0px; width: 20px; height: 20px;" class="group/marker cursor-pointer planner-map-marker-container">
            <!-- Tooltip -->
            <div class="planner-map-tooltip">
                ${item.NAME}
                <div class="planner-map-tooltip-arrow"></div>
            </div>
            
            <!-- Map Marker Circle -->
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

      // [New] 마커 클릭 이벤트 핸들러 추가
      window.naver.maps.Event.addListener(marker, 'click', () => {
        onItemClick(item.PLACE_ID);
      });

      markersRef.current.push(marker);
    });

    // 7. 경로(Polyline) 그리기 - 아이템이 2개 이상일 때만 연결
    if (pathCoords.length > 1) {
      const polyline = new window.naver.maps.Polyline({
        map: map,
        path: pathCoords,
        strokeColor: "#4f46e5",
        strokeOpacity: 0.8,
        strokeWeight: 5,
        strokeStyle: "solid",
        strokeLineCap: "round",
        strokeLineJoin: "round",
      });
      polylineRef.current = polyline;
    }

    // 8. 뷰포트(View) 자동 조정
    if (selectedItemId) {
      // 특정 아이템 선택 시 해당 위치로 부드럽게 이동
      const selectedItem = dayItems.find(item => item.PLACE_ID === selectedItemId);
      if (selectedItem && selectedItem.LOC_LAT && selectedItem.LOC_LNG) {
        const target = new window.naver.maps.LatLng(selectedItem.LOC_LAT, selectedItem.LOC_LNG);
        map.morph(target, 14);
      }
    } else {
      // 전체 경로가 보이도록 줌 레벨 조정
      if (pathCoords.length > 0) {
        const bounds = new window.naver.maps.LatLngBounds(pathCoords[0], pathCoords[0]);
        pathCoords.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds, {
          top: 50, bottom: 50, left: 50, right: 50
        });
      } else {
        map.setCenter(center);
        map.setZoom(11);
      }
    }

  }, [schedule, selectedDay, selectedItemId, isMapLoaded, onItemClick]); // onItemClick 의존성 추가

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

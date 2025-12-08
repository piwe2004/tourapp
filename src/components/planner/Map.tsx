'use client';

import { useEffect, useRef, useState } from 'react';
import { PlanItem } from '@/mockData';
import { getIconByType } from '../ui/MapIcons';
import { renderToStaticMarkup } from 'react-dom/server';

interface MapProps {
  schedule: PlanItem[];
  selectedDay: number;
  selectedItemId?: number | null; // 선택된 아이템 ID prop 추가
}

export default function Map({ schedule, selectedDay, selectedItemId }: MapProps) {
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
      (item) => item.day === selectedDay && item.lat && item.lng
    );

    // 3. 중심 좌표 계산 (데이터가 없으면 제주공항 기본값)
    const centerLat = dayItems.length > 0 ? dayItems[0].lat! : 33.5104;
    const centerLng = dayItems.length > 0 ? dayItems[0].lng! : 126.4913;
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

    dayItems.forEach((item) => {
      const position = new window.naver.maps.LatLng(item.lat!, item.lng!);
      pathCoords.push(position);

      const isSelected = selectedItemId === item.id;
      
      // 선택 여부에 따른 마커 스타일링
      const width = isSelected ? 60 : 40;
      const height = isSelected ? 69 : 49;

      const markerContent = `
        <div style="
          width: ${width}px;
          height: ${height}px;
          cursor: pointer; 
          position: relative; 
          display: flex; 
          justify-content: center; 
          align-items: center;
          z-index: ${isSelected ? '100' : '10'};
        ">
          <div style="
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 100%;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-origin: bottom center;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
          ">
            <svg viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
              <path d="M18 0C8.05888 0 0 8.05888 0 18C0 27.9411 18 48 18 48C18 48 36 27.9411 36 18C36 8.05888 27.9411 0 18 0Z" fill="${isSelected ? '#4338ca' : '#4f46e5'}"/>
              <circle cx="18" cy="18" r="14" fill="white"/>
              <circle cx="18" cy="18" r="12" fill="${isSelected ? '#4338ca' : '#4f46e5'}"/>
            </svg>
            <div style="
              position: absolute;
              top: ${isSelected ? '5px' : '9px'};
              left: 50%;
              transform: translateX(-50%);
              color: white;
              font-weight: 800;
              font-family: sans-serif;
              width:${isSelected ? '42' : '20'}px;
              height:${isSelected ? '42' : '20'}px;
              display: flex;
              justify-content: center;
              align-items: center;
            ">
              ${renderToStaticMarkup(getIconByType(item.type, isSelected ? 25 : 18, "text-white-500", "#ffffff"))}
            </div>
          </div>
        </div>
      `;
      const marker = new window.naver.maps.Marker({
        position: position,
        map: map,
        title: item.activity,
        icon: {
          content: markerContent,
          anchor: new window.naver.maps.Point(width / 2, height),
        }
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
      const selectedItem = dayItems.find(item => item.id === selectedItemId);
      if (selectedItem && selectedItem.lat && selectedItem.lng) {
        const target = new window.naver.maps.LatLng(selectedItem.lat, selectedItem.lng);
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

  }, [schedule, selectedDay, selectedItemId, isMapLoaded]); // isMapLoaded 의존성 추가로 로드 완료 시 즉시 렌더링됨

  return (
    <div className="w-full h-full relative">
      <div ref={mapElement} className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden" />

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {!process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID && (
          <p className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-md z-10">
            ⚠️ Client ID 필요
          </p>
        )}
      </div>
    </div>
  );
}
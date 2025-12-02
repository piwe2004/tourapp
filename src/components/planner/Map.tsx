'use client';

import { useEffect, useRef } from 'react';
import { PlanItem } from '@/mockData';

declare global {
  interface Window {
    naver: any;
  }
}

interface MapProps { // Props 이름도 깔끔하게 MapProps로 변경
  schedule: PlanItem[];
  selectedDay: number;
}

export default function Map({ schedule, selectedDay }: MapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!window.naver || !window.naver.maps) return;
    if (!mapElement.current) return;

    // 선택된 날짜의 데이터 필터링
    const dayItems = schedule.filter(
      (item) => item.day === selectedDay && item.lat && item.lng
    );

    // 중심 좌표 (데이터 없으면 제주공항)
    const centerLat = dayItems.length > 0 ? dayItems[0].lat : 33.5104;
    const centerLng = dayItems.length > 0 ? dayItems[0].lng : 126.4913;
    const center = new window.naver.maps.LatLng(centerLat, centerLng);

    // 지도 초기화
    if (!mapRef.current) {
      const mapOptions = {
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
    } else {
      mapRef.current.setCenter(center);
    }

    const map = mapRef.current;

    // --- 마커 및 경로 그리기 ---
    // (기존 마커 제거 로직은 생략하고 덮어쓰기 방식 유지)
    const pathCoords: any[] = [];

    dayItems.forEach((item, index) => {
      const position = new window.naver.maps.LatLng(item.lat, item.lng);
      pathCoords.push(position);

      const marker = new window.naver.maps.Marker({
        position: position,
        map: map,
        title: item.activity,
        icon: {
          content: `
            <div style="
              background-color: #4f46e5; 
              color: white; 
              width: 24px; 
              height: 24px; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              font-size: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              border: 2px solid white;
            ">
              ${index + 1}
            </div>
          `,
          anchor: new window.naver.maps.Point(12, 12),
        },
      });
    });

    if (pathCoords.length > 1) {
      new window.naver.maps.Polyline({
        map: map,
        path: pathCoords,
        strokeColor: "#4f46e5",
        strokeOpacity: 0.8,
        strokeWeight: 5,
        strokeStyle: "solid",
        strokeLineCap: "round",
        strokeLineJoin: "round",
      });
    }

  }, [schedule, selectedDay]);

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
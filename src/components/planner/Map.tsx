'use client';

import { useEffect, useRef } from 'react';
import { PlanItem } from '@/mockData';

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

  useEffect(() => {
    if (!window.naver || !window.naver.maps) return;
    if (!mapElement.current) return;

    // 선택된 날짜의 데이터 필터링
    const dayItems = schedule.filter(
      (item) => item.day === selectedDay && item.lat && item.lng
    );

    // 중심 좌표 (데이터 없으면 제주공항)
    const centerLat = dayItems.length > 0 ? dayItems[0].lat! : 33.5104;
    const centerLng = dayItems.length > 0 ? dayItems[0].lng! : 126.4913;
    const center = new window.naver.maps.LatLng(centerLat, centerLng);

    // 지도 초기화
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
    // 지도 초기화 이후에는 아래 로직으로 뷰 제어

    const map = mapRef.current;

    // --- 기존 마커 및 경로 제거 (초기화) ---
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // --- 마커 및 경로 그리기 ---
    const pathCoords: naver.maps.LatLng[] = [];

    dayItems.forEach((item, index) => {
      const position = new window.naver.maps.LatLng(item.lat!, item.lng!);
      pathCoords.push(position);

      const isSelected = selectedItemId === item.id;
      
      // 커스텀 마커 HTML (SVG 활용)
      const markerContent = `
        <div style="cursor: pointer; position: relative; display: flex; justify-content: center; align-items: center;">
          <div style="
            position: absolute;
            bottom: 0;
            width: ${isSelected ? '48px' : '36px'};
            height: ${isSelected ? '48px' : '36px'};
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-origin: bottom center;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
            z-index: ${isSelected ? '100' : '10'};
          ">
            <svg viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
              <path d="M18 0C8.05888 0 0 8.05888 0 18C0 27.9411 18 48 18 48C18 48 36 27.9411 36 18C36 8.05888 27.9411 0 18 0Z" fill="${isSelected ? '#4338ca' : '#4f46e5'}"/>
              <circle cx="18" cy="18" r="14" fill="white"/>
              <circle cx="18" cy="18" r="12" fill="${isSelected ? '#4338ca' : '#4f46e5'}"/>
            </svg>
            <div style="
              position: absolute;
              top: ${isSelected ? '14px' : '10px'};
              left: 50%;
              transform: translateX(-50%);
              color: white;
              font-weight: 800;
              font-size: ${isSelected ? '16px' : '13px'};
              font-family: sans-serif;
            ">${index + 1}</div>
          </div>
        </div>
      `;

      // 마커 생성
      const marker = new window.naver.maps.Marker({
        position: position,
        map: map,
        title: item.activity,
        icon: {
          content: markerContent,
          anchor: new window.naver.maps.Point(isSelected ? 24 : 18, isSelected ? 48 : 36), // 이미지 하단 중앙이 좌표에 오도록 설정
        },
      });
      markersRef.current.push(marker); // 생성된 마커 저장
    });

    // 경로 그리기
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
      polylineRef.current = polyline; // 생성된 경로 저장
    }

    // --- 뷰 조정 로직 ---
    if (selectedItemId) {
      // 아이템 선택 시: 해당 위치로 줌인 및 이동
      const selectedItem = dayItems.find(item => item.id === selectedItemId);
      if (selectedItem && selectedItem.lat && selectedItem.lng) {
        const target = new window.naver.maps.LatLng(selectedItem.lat, selectedItem.lng);
        map.morph(target, 14); // 부드럽게 이동하며 줌 레벨 14로 변경
      }
    } else {
      // 아이템 미선택 시: 전체 경로가 보이도록 조정
      if (pathCoords.length > 0) {
        const bounds = new window.naver.maps.LatLngBounds(pathCoords[0], pathCoords[0]);
        pathCoords.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds, {
            top: 50, bottom: 50, left: 50, right: 50 // 패딩 추가
        });
      } else {
        // 데이터가 없으면 기본 위치로 이동
        map.setCenter(center);
        map.setZoom(11);
      }
    }

  }, [schedule, selectedDay, selectedItemId]); // selectedItemId 의존성 추가

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
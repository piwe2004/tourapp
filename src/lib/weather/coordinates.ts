/**
 * @desc 기상청 격자 좌표 변환을 위한 유틸리티
 * 
 * 기상청 위도(Lat), 경도(Lng) -> 격자(X, Y) 변환
 * 알고리즘: Lambert Conformal Conic (LCC) 투영법
 * 
 * 참고: 기상청 공식 가이드
 */

interface LatLng {
  lat: number;
  lng: number;
}

interface GridCoord {
  x: number;
  y: number;
}

// 기상청 투영 상수
const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0; // 투영 위도1(degree)
const SLAT2 = 60.0; // 투영 위도2(degree)
const OLON = 126.0; // 기준 점 경도(degree)
const OLAT = 38.0; // 기준 점 위도(degree)
const XO = 43; // 기준 점 X좌표(GRID)
const YO = 136; // 기진 점 Y좌표(GRID)

export function dfs_xy_conv(lat: number, lng: number): GridCoord {
  const DEGRAD = Math.PI / 180.0;
  
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);
  
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  
  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { x, y };
}

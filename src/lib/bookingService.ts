/**
 * @desc 플래니(Planni) 통합 예약 링크 생성기 (4대 플랫폼 지원)
 */
export type BookingPlatform = 'agoda' | 'yanolja' | 'yeogi' | 'hotelscombined';

export interface PlatformConfig {
  m_id: string;
  getUrl: (name: string, inDate: string, outDate: string) => string;
  name: string;
  style: string; // Tailwind classes for brand color
}

export const BOOKING_PLATFORMS: Record<BookingPlatform, PlatformConfig> = {
// 1️⃣ 아고다 (Agoda) - 다크/모던
  'agoda': {
    name: '아고다',
    m_id: 'agoda', 
    getUrl: (name, inDate, outDate) => 
      `https://www.agoda.com/partners/partnersearch.aspx?cid=-1&checkin=${inDate}&checkout=${outDate}&city=${encodeURIComponent(name)}`,
    style: 'btn-agoda'
  },
  
  // 2️⃣ 야놀자 (Yanolja) - 야놀자 핑크
  'yanolja': {
    name: '야놀자',
    m_id: 'yanolja', 
    getUrl: (name, inDate, outDate) => 
      `https://www.yanolja.com/search/${encodeURIComponent(name)}?checkinDate=${inDate}&checkoutDate=${outDate}&accommodationsType=hotel`,
    style: 'btn-yanolja'
  },

  // 3️⃣ 여기어때 (Yeogi) - 여기어때 레드
  'yeogi': {
    name: '여기어때',
    m_id: 'goodchoice', 
    getUrl: (name, inDate, outDate) => 
      `https://www.yeogi.com/domestic-accommodations?keyword=${encodeURIComponent(name)}&checkIn=${inDate}&checkOut=${outDate}&personal=2`,
    style: 'btn-yeogi'
  },

  // 4️⃣ 호텔스컴바인 (HotelsCombined) - 스카이블루
  'hotelscombined': {
    name: '호텔스컴바인',
    m_id: 'hotelscombined', 
    getUrl: (name, inDate, outDate) => 
      `https://www.hotelscombined.co.kr/Hotels/Search?destination=${encodeURIComponent(name)}&checkin=${inDate}&checkout=${outDate}`,
    style: 'btn-hotelscombined'
  }
};

/**
 * @desc 예약 제휴 링크를 생성하고 새 탭으로 엽니다.
 * @param platform 플랫폼 키 ('agoda', 'yanolja'...)
 * @param hotelName 호텔 이름
 * @param checkIn 체크인 날짜 YYYY-MM-DD
 * @param checkOut 체크아웃 날짜 YYYY-MM-DD
 */
export function openBooking(platform: BookingPlatform, hotelName: string, checkIn: string, checkOut: string) {
  // 1. 내 링크프라이스 ID
  const myAffiliateId = "A100685588"; 

  // 2. 선택한 플랫폼 정보 가져오기
  const selected = BOOKING_PLATFORMS[platform];
  if (!selected) {
    console.error("지원하지 않는 플랫폼입니다:", platform);
    return;
  }

  // 3. 최종 목적지 URL 생성
  const targetUrl = selected.getUrl(hotelName, checkIn, checkOut);

  // 4. 링크프라이스 딥링크 조립
  // tu 파라미터는 반드시 encodeURIComponent 처리 되어야 함
  const deepLink = `http://click.linkprice.com/click.php?m=${selected.m_id}&a=${myAffiliateId}&l=9999&l_cd1=3&l_cd2=0&tu=${encodeURIComponent(targetUrl)}`;

  // 5. 새 창으로 열기
  window.open(deepLink, '_blank');
}

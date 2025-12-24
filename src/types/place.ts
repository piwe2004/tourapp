/**
 * 통합 장소 인터페이스
 * 식당, 숙박, 관광지 데이터를 모두 이 하나의 타입으로 처리합니다.
 */


export interface PlaceData {
  // 식별자 및 기본 정보
  _docId: string;         // Firebase 문서 ID
  PLACE_ID: string;       // 콘텐츠 고유 ID
  NAME: string;           // 장소 이름
  ADDRESS: string;        // 전체 주소
  SUB_REGION: string | null; // 행정구역 (예: 해운대구)

  // 카테고리 (핵심 분류 기준)
  CATEGORY: {
    main: string;         // 식당, 숙박, 관광지, 쇼핑, 액티비티
    sub: string;          // 한식, 호텔, 해수욕장 등
  };

  // 이미지
  IMAGE_URL: string | null;      // 대표 이미지 (없으면 null)
  GALLERY_IMAGES: string[] | null; // 추가 이미지 배열 (없으면 null)

  // 위치 및 링크
  LOC_LAT: number;        // 위도 (y)
  LOC_LNG: number;        // 경도 (x)
  MAP_LINK: string;       // 네이버 지도 링크
  
  // 제휴 및 예약 (수익화)
  AFFIL_LINK: string | null; // 아고다/클룩 등 제휴 링크
  IS_AFLT: boolean;          // 제휴 링크 보유 여부
  IS_TICKET_REQUIRED: boolean; // 티켓/입장권 필요 여부 (true면 예약하기 버튼 노출)

  // 통합 상세 정보 (n8n에서 정리한 4대장)
  // 타입 상관없이 화면에 바로 뿌려주면 되는 요약 정보들입니다.
  TIME_INFO: string | null;    // 영업시간 / 입실퇴실시간
  PARKING_INFO: string | null; // 주차 정보
  REST_INFO: string | null;    // 휴무일
  FEE_INFO: string | null;     // 이용요금 / 메뉴가격 정보

  // 가변 상세 정보 (Dictionary)
  // 식당의 대표메뉴, 숙박의 부대시설 등 타입별 고유 정보는 여기에 다 들어있습니다.
  // 사용법: place.DETAILS['대표메뉴']
  DETAILS: Record<string, string | null>;

  // AI 분석 및 통계 데이터
  RATING: number | null;         // 구글/네이버 평점 (단일 숫자 또는 null)
  // 만약 배열로 들어온다면 number[] | null 로 수정 필요
  
  HIGHTLIGHTS: string[] | null;  // AI 한줄 요약 포인트
  KEYWORDS: string[];            // 검색 및 해시태그용 키워드
  NAME_GRAMS: string[];          // 검색용 n-gram

  STAY_TIME: number;             // 평균 체류 시간 (분 단위)
  PRICE_GRADE: number;           // 가격대 등급 (0~3)

  STATS: {                       // 앱 내부 통계
    bookmark_count: number;
    view_count: number;
    review_count: number;
    rating: number;              // 앱 자체 평점
    weight: number;              // 추천 가중치
  };

  TAGS: {                        // 계절별 추천 태그
    spring: string[] | null;
    summer: string[] | null;
    autumn: string[] | null;
    winter: string[] | null;
  };
}

export interface PlanItem extends PlaceData {
  // Planner Specific
  day: number;
  time:string
  isLocked?: boolean; // 고정 여부
  is_indoor?: boolean; // 실내 실외
  type: 'sightseeing' | 'food' | 'cafe' | 'stay' | 'move' | 'etc'; 
}

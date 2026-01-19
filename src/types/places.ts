export interface FirebasePlace {
  PLACE_ID: number;
  NAME: string;
  CATEGORY: {
    main: string;
    sub: string;
  };
  LOC_LAT: number;
  LOC_LNG: number;
  IMAGE_URL?: string;
  HIGHTLIGHTS?: string[];
  KEYWORDS?: string[];
  PRICE_GRADE?: number;
  RATING?: number;
  STAY_TIME?: number; // 분 단위
  SUB_REGION?: string;
  TAGS?: Record<string, string[]>;
  MAP_LINK?: string;
  IS_AFLT?: boolean;
  ADDRESS?: string;
  MEMBER?: string[]; // [New] 인원/동반자
  STYLES?: string[]; // [New] 여행 스타일/목적
  AREA_DATA?: {
    areaCd: string;
    sigeCd: string; // 시군구 코드 (필수)
  };
}

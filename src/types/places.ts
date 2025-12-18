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
  HIGHLIGHTS?: string[];
  KEYWORDS?: string[];
  PRICE_GRADE?: number;
  RATING?: number;
  STAY_TIME?: number; // 분 단위
  SUB_REGION?: string;
  TAGS?: Record<string, string[]>;
  MAP_LINK?: string;
  IS_AFLT?: boolean;
}

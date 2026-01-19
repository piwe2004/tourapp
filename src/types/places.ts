export interface LodgingDetail {
  contentid: string;
  contenttypeid: string;
  roomcount: string;
  roomtype: string;
  refundregulation: string;
  checkintime: string;
  checkouttime: string;
  chkcooking: string;
  seminar: string;
  sports: string;
  sauna: string;
  beauty: string;
  beverage: string;
  karaoke: string;
  barbecue: string;
  campfire: string;
  bicycle: string;
  fitness: string;
  publicpc: string;
  publicbath: string;
  subfacility: string;
  foodplace: string;
  reservationurl: string;
  pickup: string;
  infocenterlodging: string;
  parkinglodging: string;
  reservationlodging: string;
  scalelodging: string;
  accomcountlodging: string;
}

export interface AttractionDetail {
  contentid: string;
  contenttypeid: string;
  infocenter: string;
  restdate: string;
  usetime: string;
  parking: string;
  chkbabycarriage: string;
  chkpet: string;
  chkcreditcard: string;
}

export interface RestaurantDetail {
  contentid: string;
  contenttypeid: string;
  firstmenu: string;
  treatmenu: string;
  smoking: string;
  packing: string;
  infocenterfood: string;
  opentimefood: string;
  restdatefood: string;
  parkingfood: string;
  reservationfood: string;
}

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
  // Detailed information based on category
  detail?: LodgingDetail | AttractionDetail | RestaurantDetail;
}

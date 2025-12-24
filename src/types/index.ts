export type Tab = 'home' | 'plan';
export type RegionKey = '전체' | '제주' | '강원' | '부산/경상' | '전라' | '서울/경기';

export interface Destination {
    id: number;
    city: string;
    subTitle: string;
    image: string;
    rating: number;
    reviews: number;
    desc: string;
    region: RegionKey;
    tags: string[];
}

export interface ScheduleItem {
    id: number;
    time: string;
    activity: string;
    type: 'stay' | 'food' | 'sightseeing' | 'cafe';
    icon: React.ReactNode;
    HIGHTLIGHTS?: string;
}

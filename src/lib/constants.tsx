import React from 'react';
import { Baby, User, Sun, Utensils, Music, Mountain, Train, Camera } from 'lucide-react';
import { Destination, ScheduleItem } from '@/types';

export const TRAVEL_TYPES = [
    { label: '아이와 함께', icon: <Baby size={ 24} /> },
{ label: '부모님 효도', icon: <User size={ 24 } /> },
{ label: '커플 데이트', icon: <Sun size={ 24 } /> },
{ label: '혼자 여행', icon: <User size={ 24 } /> },
{ label: '맛집 투어', icon: <Utensils size={ 24 } /> },
{ label: '휴양/힐링', icon: <Sun size={ 24 } /> },
{ label: '문화/역사', icon: <Music size={ 24 } /> },
{ label: '액티비티', icon: <Mountain size={ 24 } /> },
];

export const DESTINATIONS_DB: Destination[] = [
    { id: 1, city: "제주도", subTitle: "서귀포/애월", image: "https://images.unsplash.com/photo-1544836756-3c7d6d15a31a?auto=format&fit=crop&w=800&q=80", rating: 4.9, reviews: 5400, desc: "야자수와 푸른 바다의 조화", region: '제주', tags: ['#오름', '#바다', '#귤'] },
    { id: 2, city: "부산", subTitle: "해운대/광안리", image: "https://images.unsplash.com/photo-1616239103038-79659b9101d2?auto=format&fit=crop&w=800&q=80", rating: 4.8, reviews: 3200, desc: "낭만적인 바다와 야경", region: '부산/경상', tags: ['#야경', '#국밥', '#카페'] },
    { id: 3, city: "여수", subTitle: "전라남도", image: "https://images.unsplash.com/photo-1635327918995-1811a43697e8?auto=format&fit=crop&w=800&q=80", rating: 4.7, reviews: 1800, desc: "여수 밤바다의 낭만", region: '전라', tags: ['#낭만포차', '#케이블카'] },
    { id: 4, city: "전주", subTitle: "한옥마을", image: "https://images.unsplash.com/photo-1616053648085-3b9875df5462?auto=format&fit=crop&w=800&q=80", rating: 4.6, reviews: 1500, desc: "고즈넉한 한옥 산책", region: '전라', tags: ['#한옥', '#비빔밥', '#경기전'] },
    { id: 5, city: "서울", subTitle: "종로/강남", image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80", rating: 4.8, reviews: 4100, desc: "전통과 현대의 조화", region: '서울/경기', tags: ['#궁궐', '#한강', '#쇼핑'] },
    { id: 6, city: "강릉", subTitle: "강원도", image: "https://images.unsplash.com/photo-1549416878-b9ca95e2f6b1?auto=format&fit=crop&w=800&q=80", rating: 4.7, reviews: 2300, desc: "커피 향 가득한 바다", region: '강원', tags: ['#안목해변', '#순두부'] },
    { id: 7, city: "가평", subTitle: "경기도", image: "https://images.unsplash.com/photo-1627885489066-e8d1a4987569?auto=format&fit=crop&w=800&q=80", rating: 4.5, reviews: 1100, desc: "가까운 근교 힐링", region: '서울/경기', tags: ['#남이섬', '#글램핑'] },
    { id: 8, city: "경주", subTitle: "경상북도", image: "https://images.unsplash.com/photo-1627918536868-b3917d235882?auto=format&fit=crop&w=800&q=80", rating: 4.8, reviews: 2100, desc: "지붕 없는 박물관", region: '부산/경상', tags: ['#첨성대', '#황리단길'] },
];

export const INITIAL_SCHEDULE: ScheduleItem[] = [
    { id: 1, time: "11:00", activity: "제주공항 도착", type: "sightseeing", icon: <Train size={ 16} />, memo: "셔틀버스 탑승장 이동" },
{ id: 2, time: "12:30", activity: "애월 해안도로 드라이브", type: "sightseeing", icon: <Camera size={ 16 }/>, memo: "해안가 카페 들르기" },
{ id: 3, time: "14:00", activity: "고기국수 점심 식사", type: "food", icon: <Utensils size={ 16 }/> },
{ id: 4, time: "16:00", activity: "협재 해수욕장 산책", type: "sightseeing", icon: <Sun size={ 16 }/>, memo: "일몰 사진 포인트" },
];

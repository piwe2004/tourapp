'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PlaceCardData {
    id: string;
    name: string;
    rating: number;
    reviews: number;
    tags: string[];
    emoji: string;
    imageSrc?: string;
}

const mockPlaces: PlaceCardData[] = [
    {
        id: '1',
        name: '성산일출봉',
        rating: 4.9,
        reviews: 747,
        tags: ['#자연', '#등산', '#일출'],
        emoji: '🌋',
    },
    {
        id: '2',
        name: '카페 델문도',
        rating: 4.8,
        reviews: 579,
        tags: ['#카페', '#오션뷰', '#인스타'],
        emoji: '☕',
    },
    {
        id: '3',
        name: '우도 해수욕장',
        rating: 4.7,
        reviews: 992,
        tags: ['#해변', '#스노클링', '#자연'],
        emoji: '🏖️',
    },
    {
        id: '4',
        name: '제주 흑돼지 맛집',
        rating: 4.9,
        reviews: 892,
        tags: ['#맛집', '#흑돼지', '#저녁'],
        emoji: '🍖',
    },
    {
        id: '5',
        name: '제주 아쿠아리움',
        rating: 4.6,
        reviews: 621,
        tags: ['#실내', '#비오는날', '#가족'],
        emoji: '🐠',
    },
    {
        id: '6',
        name: '협재 해수욕장',
        rating: 4.8,
        reviews: 423,
        tags: ['#해변', '#인스타', '#일몰'],
        emoji: '🌊',
    }
];

export default function PlaceSearchPage() {
    const [activeCategory, setActiveCategory] = useState<string>('전체');

    return (
        <div className="w-full bg-[#f8fafc] min-h-screen py-8 px-4 sm:px-8">
            <div className="max-w-[1430px] mx-auto flex flex-col gap-8">

                {/* 헤더 및 카테고리 필터 */}
                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#0f172b]">
                        어디로 가고 싶으세요?
                    </h1>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setActiveCategory('전체')}
                            className={`px-6 py-2.5 rounded-full font-bold text-base transition-all shadow-md ${activeCategory === '전체'
                                    ? 'bg-[#432dd7] text-white shadow-[#c6d2ff]'
                                    : 'bg-white text-[#314158] border border-[#cad5e2] hover:bg-gray-50'
                                }`}
                        >
                            전체
                        </button>
                        <button
                            onClick={() => setActiveCategory('비 오는 날')}
                            className={`px-6 py-2.5 rounded-full font-bold text-base transition-all shadow-md flex items-center gap-2 ${activeCategory === '비 오는 날'
                                    ? 'bg-[#432dd7] text-white shadow-[#c6d2ff]'
                                    : 'bg-white text-[#314158] border border-[#cad5e2] hover:bg-gray-50'
                                }`}
                        >
                            ☔ 비 오는 날
                        </button>
                        <button
                            onClick={() => setActiveCategory('인스타')}
                            className={`px-6 py-2.5 rounded-full font-bold text-base transition-all shadow-md flex items-center gap-2 ${activeCategory === '인스타'
                                    ? 'bg-[#432dd7] text-white shadow-[#c6d2ff]'
                                    : 'bg-white text-[#314158] border border-[#cad5e2] hover:bg-gray-50'
                                }`}
                        >
                            📸 인스타
                        </button>
                        <button
                            onClick={() => setActiveCategory('카페')}
                            className={`px-6 py-2.5 rounded-full font-bold text-base transition-all shadow-md flex items-center gap-2 ${activeCategory === '카페'
                                    ? 'bg-[#432dd7] text-white shadow-[#c6d2ff]'
                                    : 'bg-white text-[#314158] border border-[#cad5e2] hover:bg-gray-50'
                                }`}
                        >
                            ☕ 카페
                        </button>
                    </div>
                </div>

                {/* 장소 카드 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockPlaces.map((place) => (
                        <div
                            key={place.id}
                            className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
                        >
                            {/* 카드 상단 이미지 영역 */}
                            <div className="h-48 relative bg-gradient-to-br from-[#7c86ff] via-[#ad46ff] to-[#f6339a] flex items-center justify-center overflow-hidden">
                                <span className="text-[72px] drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    {place.emoji}
                                </span>

                                {/* 찜하기 버튼 */}
                                <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>
                            </div>

                            {/* 카드 하단 정보 영역 */}
                            <div className="p-5 flex flex-col gap-3">
                                <h3 className="text-lg font-bold text-[#0f172b] line-clamp-1">
                                    {place.name}
                                </h3>

                                {/* 평점 및 리뷰 */}
                                <div className="flex items-center gap-1.5">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                    <span className="font-bold text-[#0f172b]">{place.rating}</span>
                                    <span className="text-[#62748e] text-sm">({place.reviews})</span>
                                </div>

                                {/* 해시태그 */}
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {place.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="bg-[#f1f5f9] text-[#45556c] text-xs px-2.5 py-1 rounded-full font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

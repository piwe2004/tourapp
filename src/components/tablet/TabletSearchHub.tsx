/**
 * 태블릿 홈 페이지 - Search Hub 컴포넌트
 * 
 * @desc 오른쪽 패널에 표시되는 검색 및 발견 허브입니다.
 *       AI 검색창, 트렌딩 검색어, 동행자 선택, 추천 장소를 포함합니다.
 */

'use client';

import { useState } from 'react';
import PlaceCard from './PlaceCard';

export default function TabletSearchHub() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);

    // 트렌딩 검색어 목록
    const trendingSearches = [
        { icon: '🍷', text: '데이트 맛집' },
        { icon: '☕️', text: '감성 카페' },
        { icon: '🏝️', text: '제주도 여행' },
        { icon: '🍜', text: '서울 노포 맛집' },
        { icon: '🏕️', text: '글램핑' },
    ];

    // 동행자 선택 옵션
    const companionOptions = [
        { id: 'solo', emoji: '👤', title: '혼자', subtitle: 'Solo Trip', color: 'blue' },
        { id: 'couple', emoji: '💕', title: '연인과', subtitle: 'Couple', color: 'pink' },
        { id: 'friends', emoji: '👯♀️', title: '친구와', subtitle: 'Friends', color: 'green' },
        { id: 'family', emoji: '👨👩👧👦', title: '가족과', subtitle: 'Family', color: 'orange' },
    ];

    // 추천 장소 샘플 데이터
    const recommendedPlaces = [
        {
            title: '카페 오리진',
            location: '서울 강남구',
            category: '조용한 분위기',
            rating: 4.8,
            tags: ['노트북', '커피맛집'],
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDROeGtKpuTKUtYo94fOLJpVZW2imHFOse71G_VQSXBcb4Dv7Ynhau10h0RraKX3Dlj8YXT4p1beW5dSbJAIyiqWaXsAVcwzIGSAz0Uy2QegRIchfdMj6gwPoYUDNpeAcQ21MMtlOoBSPUhfhwm8yYylImOWyx1a5AdAmyDZQByZcCPCWlbeoyMOhagptqTSUNWUh_eFC1gv_6PkzBeMalGl-DnjMVZkiEVs0QXJykL7QCh_gNkqNC5S63a9m3VXvJsIxJimTM98LM',
        },
        {
            title: '더 다이닝',
            location: '서울 서초구',
            category: '이탈리안',
            rating: 4.5,
            tags: ['데이트', '와인'],
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqKr9dn27DX6Gbp5Ks7Od7IPgZbLjjGEHxjLY6odc8YA9XskF5XhCPaytjAjmrOGnjYWjowb4Ghir_C7L79fKC8bXMv2O85K_ss8pH5kAeJ97L-oFIA41wHml0N4BIV_prac568VE3oz-IHeejBAffJ4l4RCklJAnJwg_wWzSgHoRUIeOuve05-tZfF5Pm2MUCW6nDDIafVXfF4ZBNv3nvYN0l2y7N8qelYdS9HTydIDSdxGLn_mHoB7t2CKo3p9E9LB02DbrinmY',
        },
        {
            title: '스테이 서울',
            location: '서울 용산구',
            category: '뷰 맛집',
            rating: 4.9,
            tags: ['호캉스', '휴식'],
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyfdzgJx0AJI2dzCfq-GNkyMWWcwjXwBcVwWmzEV2DXASqmC34xsgF8_4RDbdDZaOT3iio_KNd-G3Q2gQ_OEStsz6aKnoDk9GmPypXQwShtqVgNcayAMT7LT3Hmch-MXwVA4_r5ib8qiVmWChEQYBslJZXGuFwKLe04h3cU1LYx87M5Wq7YUL_7WW6-Ob4odovj4fWjA_UbbN5Fw6ENQOaBuaD5YD6t4BizdNqJDmkgE-sap8fkDSCjS7ik-enLQ_7qM7GXt5yq4M',
        },
    ];

    // 검색 버튼 클릭 핸들러
    const handleSearch = () => {
        console.log('검색 쿼리:', searchQuery);
        // TODO: 실제 검색 로직 구현
    };

    return (
        <section className="flex-1 h-full overflow-y-auto bg-light relative">
            <div className="max-w-4xl mx-auto px-8 py-10 lg:py-14 flex flex-col gap-10">
                {/* 모바일 헤더 (작은 화면용) */}
                <div className="lg:hidden flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">Planni</h1>
                </div>

                {/* 검색 입력 영역 */}
                <div className="flex flex-col gap-4">
                    <label
                        className="text-lg font-semibold text-gray-500 ml-2"
                        htmlFor="search"
                    >
                        어디로 떠나시나요?
                    </label>
                    <div className="relative group">
                        {/* 왼쪽 아이콘 */}
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <span className="material-icons-round text-primary text-3xl group-focus-within:scale-110 transition-transform">
                                auto_awesome
                            </span>
                        </div>
                        {/* 검색 입력창 */}
                        <input
                            className="block w-full pl-16 pr-16 py-6 bg-white border-2 border-transparent focus:border-primary/50 text-gray-900 rounded-full text-xl shadow-lg shadow-gray-200/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-400"
                            id="search"
                            placeholder="강남역 조용한 노트북 카페 찾아줘..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                        />
                        {/* 오른쪽 검색 버튼 */}
                        <div className="absolute inset-y-0 right-2 flex items-center">
                            <button
                                onClick={handleSearch}
                                className="w-12 h-12 bg-primary hover:bg-primary-hover rounded-full flex items-center justify-center text-gray-900 transition-colors shadow-md"
                            >
                                <span className="material-icons-round text-2xl">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 트렌딩 검색어 */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2 ml-1">
                        <span className="material-icons-round text-primary text-sm">trending_up</span>
                        <span className="text-sm font-bold uppercase tracking-wider text-gray-400">
                            Trending Searches
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {trendingSearches.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setSearchQuery(item.text)}
                                className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-primary/10 hover:border-primary/30 hover:text-primary-hover transition-all font-medium text-sm shadow-sm flex items-center gap-2"
                            >
                                <span>{item.icon}</span> {item.text}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 동행자 선택 카드 */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        누구와 함께 하시나요?
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {companionOptions.map((option) => {
                            const isSelected = selectedCompanion === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedCompanion(option.id)}
                                    className="group relative bg-white rounded-lg p-6 text-left shadow-sm border border-gray-100 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                                >
                                    {/* 이모지 아이콘 */}
                                    <div
                                        className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center text-2xl transition-colors ${option.color === 'blue'
                                            ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-100'
                                            : option.color === 'pink'
                                                ? 'bg-pink-50 text-pink-500 group-hover:bg-pink-100'
                                                : option.color === 'green'
                                                    ? 'bg-green-50 text-green-500 group-hover:bg-green-100'
                                                    : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'
                                            }`}
                                    >
                                        {option.emoji}
                                    </div>
                                    {/* 타이틀 */}
                                    <h4 className="text-lg font-bold text-gray-800 mb-1">{option.title}</h4>
                                    <p className="text-sm text-gray-400">{option.subtitle}</p>
                                    {/* 선택 체크박스 */}
                                    <div
                                        className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 transition-all ${isSelected
                                            ? 'border-primary bg-primary'
                                            : 'border-gray-200 group-hover:border-primary'
                                            }`}
                                    >
                                        {isSelected && (
                                            <span className="material-icons-round text-white text-sm leading-none flex items-center justify-center h-full">
                                                check
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 추천 장소 섹션 */}
                <div className="space-y-4 pb-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">내 주변 추천 장소</h3>
                        <button className="text-primary hover:text-primary-hover font-medium text-sm flex items-center">
                            더보기 <span className="material-icons-round text-base">chevron_right</span>
                        </button>
                    </div>
                    {/* 가로 스크롤 컨테이너 */}
                    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
                        {recommendedPlaces.map((place, index) => (
                            <PlaceCard key={index} {...place} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

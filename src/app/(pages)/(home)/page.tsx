/**
 * Planni 홈 페이지 - 태블릿 디자인
 * 
 * @desc Sidebar, Hero Section, Search Hub를 통합한 태블릿 전용 레이아웃입니다.
 *       전체 화면을 활용하여 몰입감 있는 여행지 탐색 경험을 제공합니다.
 */

'use client';

import { useState } from 'react';

// 장소 카드 인터페이스 정의
interface PlaceCardProps {
    title: string;
    location: string;
    category: string;
    rating: number;
    tags: string[];
    imageUrl: string;
}

// 장소 카드 컴포넌트 (내부 정의)
function PlaceCard({
    title,
    location,
    category,
    rating,
    tags,
    imageUrl,
}: PlaceCardProps) {
    return (
        <div className="min-w-[280px] bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer group">
            {/* 이미지 영역 */}
            <div className="h-40 rounded-lg overflow-hidden mb-3 relative">
                <img
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={imageUrl}
                />
                {/* 평점 배지 */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="text-yellow-500">★</span> {rating.toFixed(1)}
                </div>
            </div>

            {/* 정보 영역 */}
            <div className="px-2 pb-2">
                <h4 className="font-bold text-lg mb-1 truncate text-gray-900">{title}</h4>
                <p className="text-sm text-gray-500 mb-3 truncate">
                    {location} • {category}
                </p>

                {/* 태그들 */}
                <div className="flex gap-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-500"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function HomeView() {
    // 상태 관리
    const [activePage, setActivePage] = useState<'home' | 'saved' | 'travel'>('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);

    // 네비게이션 메뉴 아이템 정의
    const navItems = [
        { id: 'home' as const, icon: 'home', label: '홈' },
        { id: 'saved' as const, icon: 'favorite_border', label: '저장' },
        { id: 'travel' as const, icon: 'map', label: '여행' },
    ];

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
        { id: 'friends', emoji: '👯‍♀️', title: '친구와', subtitle: 'Friends', color: 'green' },
        { id: 'family', emoji: '👨‍👩‍👧‍👦', title: '가족과', subtitle: 'Family', color: 'orange' },
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
        <div className="flex h-screen w-screen overflow-hidden bg-background-tablet-light font-display text-gray-800 selection:bg-primary-tablet selection:text-black">
            {/* ================================
                1. Sidebar Navigation (왼쪽 고정)
                ================================ */}
            <nav className="w-20 md:w-24 h-full bg-white flex flex-col items-center py-8 border-r border-gray-100 flex-shrink-0 z-20 shadow-sm">
                {/* 로고 아이콘 */}
                <div className="mb-12">
                    <div className="w-12 h-12 bg-primary-tablet rounded-xl flex items-center justify-center shadow-lg shadow-primary-tablet/30">
                        <span className="material-icons-round text-gray-900 text-3xl">explore</span>
                    </div>
                </div>

                {/* 네비게이션 버튼들 */}
                <div className="flex flex-col gap-8 flex-1 w-full px-4">
                    {navItems.map((item) => {
                        const isActive = activePage === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActivePage(item.id)}
                                className="flex flex-col items-center gap-1 group w-full"
                            >
                                {/* 아이콘 배경 */}
                                <div
                                    className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${isActive
                                        ? 'bg-primary-tablet/10 text-primary-tablet'
                                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                        }`}
                                >
                                    <span className="material-icons-round text-2xl">{item.icon}</span>
                                </div>
                                {/* 라벨 */}
                                <span
                                    className={`text-[10px] font-semibold transition-colors ${isActive
                                        ? 'text-primary-tablet'
                                        : 'text-gray-400 group-hover:text-gray-600'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* 프로필 이미지 */}
                <div className="mt-auto">
                    <button className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-primary-tablet transition-colors">
                        <img
                            alt="User Profile"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuTLD1VL7oFaoMij9RXnWINSZCq-_6c70PiqeDKe-7E59zam60hhR1-2SfdKQsdFDTpxTgJjkXSRxy7B_lndxL1RtDomDsDG7-bAigf19uAnPUfoB38y86MFGSQmzk_mTXlTn2b1zPpFGI9sJScI_oK4IVnSFmuhpYEYh_2i348wdKcc6zsGMdVIAyWaQWAPHjQ4rN7lTxUMyIIxSeMSbw37i2wXiytvQ8w2yl-0I-yH_nTVjgTVeFpxJqt9OAVHkTzxBSwZ91M74"
                        />
                    </button>
                </div>
            </nav>

            {/* Main Content Split View */}
            <main className="flex-1 flex flex-row overflow-hidden relative">
                {/* ================================
                    2. Hero Section (왼쪽 패널 ~45%)
                    ================================ */}
                <section className="hidden lg:flex w-[45%] h-full p-4 pr-0 relative">
                    <div className="relative w-full h-full rounded-r-xl overflow-hidden group">
                        {/* 배경 이미지 */}
                        <img
                            alt="Background Image"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMAwT8p15h2qXVm6V8fDKfcb3wejj5iV_PMx2dkFKsrU3KTDEKklHQUA34SE8DCWaMLmhcGUCBHnLQpr5J2QfdFhb3IcB_KCtdkfI9vHCV_lJ-6mq5xf1Ff02fY9UQTiA34Th8wWxXEM6c4NJ9IL_WYAY3n2_lI3E1Vvr59RSad9XmpShPx5MCF7LJLI04BZCQiEITXUE-l0nngxtPsLWv2gaFNT4SXmRdXm1r4l2sXBSYLvJpjB_o7_YhDN2q5JBiYp1IHlSXm8o"
                        />

                        {/* 그라데이션 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>

                        {/* 콘텐츠 */}
                        <div className="absolute inset-0 flex flex-col justify-end p-10 xl:p-14 text-white">
                            {/* AI Discovery 배지 */}
                            <div className="bg-white/20 backdrop-blur-md self-start px-4 py-2 rounded-full mb-6 border border-white/30">
                                <span className="text-sm font-semibold tracking-wide uppercase flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary-tablet rounded-full animate-pulse"></span>
                                    AI Discovery
                                </span>
                            </div>

                            {/* 메인 타이틀 */}
                            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4 drop-shadow-sm">
                                당신의 취향에 딱 맞는<br />
                                <span className="text-primary-tablet">최적의 장소</span>를 찾아보세요
                            </h1>

                            {/* 서브 타이틀 */}
                            <p className="text-lg text-gray-200 font-light max-w-md leading-relaxed opacity-90">
                                AI-powered recommendations for your next journey. Experience travel like never before.
                            </p>

                            {/* 장식용 플로팅 요소 */}
                            <div className="absolute top-10 right-10 animate-bounce delay-700 duration-[3000ms]">
                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl">
                                    <span className="text-2xl">✨</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================================
                    3. Search & Discovery Hub (오른쪽 패널)
                    ================================ */}
                <section className="flex-1 h-full overflow-y-auto bg-background-tablet-light relative">
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
                                    <span className="material-icons-round text-primary-tablet text-3xl group-focus-within:scale-110 transition-transform">
                                        auto_awesome
                                    </span>
                                </div>
                                {/* 검색 입력창 */}
                                <input
                                    className="block w-full pl-16 pr-16 py-6 bg-white border-2 border-transparent focus:border-primary-tablet/50 text-gray-900 rounded-full text-xl shadow-lg shadow-gray-200/50 focus:ring-4 focus:ring-primary-tablet/10 transition-all placeholder:text-gray-400"
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
                                        className="w-12 h-12 bg-primary-tablet hover:bg-primary-tablet-dark rounded-full flex items-center justify-center text-gray-900 transition-colors shadow-md"
                                    >
                                        <span className="material-icons-round text-2xl">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 트렌딩 검색어 */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2 ml-1">
                                <span className="material-icons-round text-primary-tablet text-sm">trending_up</span>
                                <span className="text-sm font-bold uppercase tracking-wider text-gray-400">
                                    Trending Searches
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {trendingSearches.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSearchQuery(item.text)}
                                        className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-primary-tablet/10 hover:border-primary-tablet/30 hover:text-primary-tablet-dark transition-all font-medium text-sm shadow-sm flex items-center gap-2"
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
                                            className="group relative bg-white rounded-lg p-6 text-left shadow-sm border border-gray-100 hover:border-primary-tablet hover:shadow-lg hover:shadow-primary-tablet/10 transition-all duration-300"
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
                                                    ? 'border-primary-tablet bg-primary-tablet'
                                                    : 'border-gray-200 group-hover:border-primary-tablet'
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
                                <button className="text-primary-tablet hover:text-primary-tablet-dark font-medium text-sm flex items-center">
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
            </main>
        </div>
    );
}
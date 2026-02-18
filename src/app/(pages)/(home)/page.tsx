/**
 * Planni 홈 페이지
 * 
 * @desc 반응형 단일 레이아웃 구현 (Mobile First)
 *       - 네비게이션: 모바일(하단) / 데스크탑(좌측)
 *       - 메인 콘텐츠: 검색 및 추천 (공통)
 *       - 히어로 섹션: 데스크탑에서만 좌측 확장을 통해 표시
 */

'use client';

import { useState } from 'react';

// --- Components ---

interface PlaceCardProps {
    title: string;
    location: string;
    category: string;
    rating: number;
    tags: string[];
    imageUrl: string;
}

function PlaceCard({ title, location, category, rating, tags, imageUrl }: PlaceCardProps) {
    return (
        <div className="min-w-[260px] md:min-w-[280px] bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer group snap-center">
            {/* 이미지 */}
            <div className="h-32 md:h-40 rounded-xl overflow-hidden mb-3 relative">
                <img
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={imageUrl}
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 shadow-sm">
                    <span className="text-yellow-500">★</span> {rating.toFixed(1)}
                </div>
            </div>
            {/* 정보 */}
            <div className="px-1 pb-1">
                <h4 className="font-bold text-base md:text-lg mb-1 truncate text-gray-900">{title}</h4>
                <p className="text-xs md:text-sm text-gray-500 mb-2 truncate">
                    {location} • {category}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                    {tags.map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 rounded-md bg-gray-50 text-[10px] md:text-xs text-gray-500 border border-gray-100">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- Data & Types ---



const TRENDING_SEARCHES = [
    { icon: '🏖️', text: '제주도' },
    { icon: '🌊', text: '부산' },
    { icon: '🌸', text: '봄꽃 축제' },
    { icon: '🍜', text: '길거리 음식' },
    { icon: '🍷', text: '데이트 맛집' },
];

const COMPANIONS = [
    { id: 'family', label: '아이와 함께', desc: '안전한 장소, 편리한 교통', tag: '아이와 가기 좋은', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR2qk6nW_ORdQkIP_Hs1T2DnpyZP0MhAeEOYenihaDlgIvTDzOUKioXPUUrEb49uJo_d1vXnKAAsiRbV6Yb2qq8LGrhQ5DwcKW96ypH5ldF7k-4BhmVpDPRfaqnKXeLepKC4CCNbihVXRjO6dexxta030TicbEyO6Vjfe3rOtgRQMMZfPGFSoyfBVP0U8x46hcPobMD4VRCTsRmxlHq9wz_uJrMLkFXdQ1BIvGJYl118nLV1Tt98uncy4H9uwM4JDT8ZJf0r1oorc', color: 'orange' },
    { id: 'couple', label: '커플 여행', desc: '분위기 좋은 식사, 휴식', tag: '로맨틱', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARviEPr5GTg2MDEigt7nvaq6qDIHhbq-6o4w2HywwtNSlperYW1miT_TjjzVDIw6d0AgomQta2sixQWLXWLvwdKXn64iu6ge9rJ9dNHndG5UL0T3vv6PS-84erpTcD8r83vkvhHv_Gi5CFE2GTZMW6aSBa322onu066vmPKcKV5rWA2wfKjjTYvskZ6Y_Es4zaAxYsP_EnKbXbFsidkqiJQfDWZuVduuZ4qnrfoT3xuGaKHHtK8LRg4ZMKulRACKBZG2vq5dUcxgA', color: 'pink' },
    { id: 'pet', label: '반려견과 함께', desc: '공원, 산책로, 펫 프렌들리', tag: '반려견 동반', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWVn3tAftU_R65Tq3jl59njqncc7zdIV4lXrwaCHlMvehHQMmvH5EP8FlyP0qVcoIAsWfrNUdBOmREYAsmVbMe9WQpWBCxZLoWjN5CEtPsvEugE2XVwa6KV_Q_0ePUnlMONUECrXYgj-RAyQZsHFGwM60vAe3p2qfZcWXQ1dmZuX3fCGlkPBmEO6j8u-IgytQPt4uj3Ehu33hc9H-XZPgoS5n1YneEDoqnJjCKlmbjBKNheltvM7nsTJ4JH4aUBgXQ34zZmtHENKg', color: 'green' },
    { id: 'solo', label: '혼자 여행', desc: '조용한 카페, 사색', tag: '힐링', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', color: 'blue' },
];

const CATEGORIES = [
    { icon: '📸', label: '사진 명소' },
    { icon: '🌲', label: '자연' },
    { icon: '🧘', label: '힐링' },
    { icon: '🌆', label: '도시' },
    { icon: '🍽️', label: '맛집' },
    { icon: '🏨', label: '호텔' },
    { icon: '🛍️', label: '쇼핑' },
    { icon: '🎭', label: '문화' },
];

const PLACES = [
    { title: '카페 오리진', location: '서울 강남구', category: '조용한 분위기', rating: 4.8, tags: ['노트북', '커피맛집'], imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDROeGtKpuTKUtYo94fOLJpVZW2imHFOse71G_VQSXBcb4Dv7Ynhau10h0RraKX3Dlj8YXT4p1beW5dSbJAIyiqWaXsAVcwzIGSAz0Uy2QegRIchfdMj6gwPoYUDNpeAcQ21MMtlOoBSPUhfhwm8yYylImOWyx1a5AdAmyDZQByZcCPCWlbeoyMOhagptqTSUNWUh_eFC1gv_6PkzBeMalGl-DnjMVZkiEVs0QXJykL7QCh_gNkqNC5S63a9m3VXvJsIxJimTM98LM' },
    { title: '더 다이닝', location: '서울 서초구', category: '이탈리안', rating: 4.5, tags: ['데이트', '와인'], imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqKr9dn27DX6Gbp5Ks7Od7IPgZbLjjGEHxjLY6odc8YA9XskF5XhCPaytjAjmrOGnjYWjowb4Ghir_C7L79fKC8bXMv2O85K_ss8pH5kAeJ97L-oFIA41wHml0N4BIV_prac568VE3oz-IHeejBAffJ4l4RCklJAnJwg_wWzSgHoRUIeOuve05-tZfF5Pm2MUCW6nDDIafVXfF4ZBNv3nvYN0l2y7N8qelYdS9HTydIDSdxGLn_mHoB7t2CKo3p9E9LB02DbrinmY' },
    { title: '스테이 서울', location: '서울 용산구', category: '뷰 맛집', rating: 4.9, tags: ['호캉스', '휴식'], imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyfdzgJx0AJI2dzCfq-GNkyMWWcwjXwBcVwWmzEV2DXASqmC34xsgF8_4RDbdDZaOT3iio_KNd-G3Q2gQ_OEStsz6aKnoDk9GmPypXQwShtqVgNcayAMT7LT3Hmch-MXwVA4_r5ib8qiVmWChEQYBslJZXGuFwKLe04h3cU1LYx87M5Wq7YUL_7WW6-Ob4odovj4fWjA_UbbN5Fw6ENQOaBuaD5YD6t4BizdNqJDmkgE-sap8fkDSCjS7ik-enLQ_7qM7GXt5yq4M' },
];

export default function HomeView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);

    return (
        <>
            {/* =================================================================
                2. Main Content Wrapper
                ================================================================= */}
            <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden pb-16 md:pb-0">

                {/* Hero Panel (Desktop Only Extension) */}
                <section className="hidden md:flex w-[45%] h-full relative group overflow-hidden">
                    <img
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMAwT8p15h2qXVm6V8fDKfcb3wejj5iV_PMx2dkFKsrU3KTDEKklHQUA34SE8DCWaMLmhcGUCBHnLQpr5J2QfdFhb3IcB_KCtdkfI9vHCV_lJ-6mq5xf1Ff02fY9UQTiA34Th8wWxXEM6c4NJ9IL_WYAY3n2_lI3E1Vvr59RSad9XmpShPx5MCF7LJLI04BZCQiEITXUE-l0nngxtPsLWv2gaFNT4SXmRdXm1r4l2sXBSYLvJpjB_o7_YhDN2q5JBiYp1IHlSXm8o"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                        <div className="bg-white/20 backdrop-blur-md self-start px-4 py-2 rounded-full mb-6 border border-white/30">
                            <span className="text-sm font-semibold tracking-wide uppercase flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                AI Discovery
                            </span>
                        </div>
                        <h1 className="text-5xl font-extrabold leading-tight mb-4 text-white drop-shadow-md">
                            당신의 취향에 딱 맞는<br />
                            <span className="text-primary">최적의 장소</span>를 찾아보세요
                        </h1>
                        <p className="text-lg text-gray-200 font-light max-w-md">
                            AI-powered recommendations for your next journey.
                        </p>
                    </div>
                </section>

                {/* Scrollable Content Area */}
                <section className="flex-1 h-full overflow-y-auto overflow-x-hidden no-scrollbar bg-light relative">
                    <div className="max-w-4xl mx-auto px-6 py-6 md:px-10 md:py-14 flex flex-col gap-8 md:gap-10">

                        {/* [Mobile Hero Text] */}
                        <div className="md:hidden">
                            <h2 className="text-3xl font-bold leading-tight mb-2">
                                당신의 취향에 딱 맞는 <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-600">최적의 장소</span>를 찾아보세요
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">AI가 분석한 나만을 위한 식당, 카페, 숙소 추천</p>
                        </div>

                        {/* Search Bar - Responsive */}
                        <div className="relative group w-full">
                            <div className="absolute -inset-0.5 md:-inset-1 bg-gradient-to-r from-primary to-teal-400 rounded-3xl md:rounded-[2rem] opacity-20 group-hover:opacity-40 transition duration-500 blur-md"></div>
                            <div className="relative bg-white rounded-3xl md:rounded-[2rem] p-5 shadow-sm md:shadow-card border border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
                                <span className="hidden md:block material-icons-round text-primary text-3xl ml-2">auto_awesome</span>

                                <textarea
                                    className="basis-full bg-transparent border-none text-lg font-medium placeholder-slate-400 focus:ring-0 p-0 resize-none h-20 md:h-12 leading-relaxed text-slate-800 md:flex items-center"
                                    placeholder="성수동에서 노트북 하기 좋은 조용한 카페..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                ></textarea>

                                <div className="flex justify-between items-center pt-2 md:pt-0 md:pl-4 border-t border-slate-100 md:border-t-0 md:border-l">
                                    <button className="p-2 text-slate-400 hover:text-primary md:hidden">
                                        <span className="material-icons-round">mic</span>
                                    </button>
                                    <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-black px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/30 transition-all transform active:scale-95 whitespace-nowrap">
                                        <span className="material-icons-round text-lg">search</span>
                                        <span>찾아보기</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Trending Keywords */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <span className="hidden md:block material-icons-round text-primary text-sm">trending_up</span>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">추천 검색어</p>
                            </div>
                            <div className="flex flex-wrap gap-2 md:gap-3">
                                {TRENDING_SEARCHES.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSearchQuery(item.text)}
                                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-primary/50 text-slate-600 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:bg-primary/5 active:bg-slate-50"
                                    >
                                        <span>{item.icon}</span> {item.text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Companions - Horizontal Scroll (Mobile) / Grid (Desktop) */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <h3 className="text-xl font-bold text-slate-900 md:text-2xl">누구와 함께 하시나요?</h3>
                                <button className="text-primary text-sm font-semibold hover:underline">전체 보기</button>
                            </div>

                            {/* Responsive Container: Scroll snap on mobile, Grid on desktop */}
                            <div className="flex overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-4 snap-x snap-mandatory">
                                {COMPANIONS.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => setSelectedCompanion(option.id)}
                                        className={`snap-center shrink-0 w-[260px] md:w-auto h-[320px] md:h-auto md:aspect-[3/4] relative rounded-2xl overflow-hidden group shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 border-2 
                                            ${selectedCompanion === option.id ? 'border-primary' : 'border-transparent'}`}
                                    >
                                        <img
                                            alt={option.label}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            src={option.image}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                        {/* Selection Check */}
                                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center
                                            ${selectedCompanion === option.id ? 'bg-primary border-primary' : 'border-white/50 group-hover:border-primary'}`}>
                                            {selectedCompanion === option.id && <span className="material-icons-round text-white text-sm">check</span>}
                                        </div>

                                        <div className="absolute bottom-0 left-0 p-5 w-full">
                                            <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white mb-2 border border-white/30">
                                                {option.tag}
                                            </span>
                                            <h4 className="text-xl font-bold text-white mb-1 drop-shadow-sm">{option.label}</h4>
                                            <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed opacity-90">{option.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Place Styles - Grid */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-900 md:text-2xl">장소 스타일</h3>
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-y-4 gap-x-2 md:gap-4">
                                {CATEGORIES.map((style, index) => (
                                    <button key={index} className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white md:bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-primary/10 group-hover:border-primary transition-colors duration-300 text-2xl md:text-3xl">
                                            {style.icon}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600 group-hover:text-black">{style.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations - Horizontal Scroll */}
                        <div className="space-y-4 pb-12">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900 md:text-2xl">내 주변 추천 장소</h3>
                                <button className="text-primary hover:text-primary-hover font-medium text-sm flex items-center">
                                    더보기 <span className="material-icons-round text-base">chevron_right</span>
                                </button>
                            </div>
                            <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory">
                                {PLACES.map((place, index) => (
                                    <PlaceCard key={index} {...place} />
                                ))}
                            </div>
                        </div>

                    </div>
                </section>
            </main>
        </>
    );
}
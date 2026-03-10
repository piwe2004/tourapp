'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Heart, Share, Star, MapPin, Clock, Phone, Map } from 'lucide-react';

export default function PlaceDetailPage() {
    const [isLiked, setIsLiked] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Mock Data
    const images = [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAMAwT8p15h2qXVm6V8fDKfcb3wejj5iV_PMx2dkFKsrU3KTDEKklHQUA34SE8DCWaMLmhcGUCBHnLQpr5J2QfdFhb3IcB_KCtdkfI9vHCV_lJ-6mq5xf1Ff02fY9UQTiA34Th8wWxXEM6c4NJ9IL_WYAY3n2_lI3E1Vvr59RSad9XmpShPx5MCF7LJLI04BZCQiEITXUE-l0nngxtPsLWv2gaFNT4SXmRdXm1r4l2sXBSYLvJpjB_o7_YhDN2q5JBiYp1IHlSXm8o',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1974&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1498804103079-a6351b060096?q=80&w=2070&auto=format&fit=crop'
    ];

    return (
        <div className="w-full bg-[#f6f8f8] min-h-screen flex flex-col xl:flex-row overflow-hidden absolute inset-0 z-50">

            {/* =========================================
          LEFT PANE: Visuals (Image Slider)
          ========================================= */}
            <section className="relative w-full xl:w-1/2 h-[40vh] xl:h-full bg-slate-900 shrink-0">

                {/* Background Image */}
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={images[currentImageIndex]}
                        alt="Place Image"
                        className="w-full h-full object-cover transition-opacity duration-500"
                    />
                    {/* 하단 그라데이션 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10"></div>
                </div>

                {/* 상단 컨트롤 (뒤로가기, 찜) */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                    <Link href="/place-search" className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex gap-3">
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                            <Share className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                        >
                            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* 하단 페이지네이션 인디케이터 */}
                <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-2 z-10">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${currentImageIndex === idx
                                    ? 'w-8 bg-[#13ecc8] shadow-[0_4px_10px_rgba(19,236,200,0.5)]'
                                    : 'w-2 bg-white/50 hover:bg-white/80'
                                }`}
                        />
                    ))}
                </div>

                <div className="absolute bottom-6 right-8 text-xs text-white/80 tracking-wide z-10 font-light">
                    📷 @bluebottle_seongsu
                </div>
            </section>


            {/* =========================================
          RIGHT PANE: Information
          ========================================= */}
            <section className="flex-1 w-full xl:w-1/2 h-[60vh] xl:h-full bg-[#f6f8f8] flex flex-col relative rounded-t-3xl xl:rounded-none -mt-6 xl:mt-0 z-20">

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 xl:p-12 flex flex-col gap-8 pb-32">

                    {/* Header (Title, Rating) */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-[#13ecc8]/10 text-[#13ecc8] text-sm font-semibold rounded-full">
                                카페 & 베이커리
                            </span>
                            <div className="flex items-center gap-1.5 text-sm">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-gray-900">4.8</span>
                                <span className="text-gray-400 font-medium">(1,240 리뷰)</span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 tracking-tight">
                            블루보틀 성수 카페
                        </h1>
                        <p className="text-lg text-gray-500 mt-1">
                            Blue Bottle Coffee Seongsu
                        </p>
                    </div>

                    {/* AI Analysis Card */}
                    <div className="relative bg-gradient-to-br from-[#13ecc8]/10 to-transparent border border-[#13ecc8]/20 rounded-[2rem] p-6 lg:p-8 overflow-hidden shadow-sm">
                        {/* 장식용 블러 효과 */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#13ecc8]/20 blur-2xl rounded-full"></div>

                        <div className="flex gap-4 relative z-10">
                            <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-2xl">✨</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold text-[#13ecc8]">AI 플래니 분석</h3>
                                <p className="text-gray-700 leading-relaxed text-[15px] md:text-base">
                                    사용자님의 <strong className="font-bold text-gray-900">'조용한 작업 공간'</strong> 선호도와 일치합니다. 이곳은 층고가 높아 개방감이 있고, 자연광이 풍부하여 집중하기 좋은 환경을 제공합니다. 특히 평일 오전 시간대가 가장 한적합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Context Badges (Hastags) */}
                    <div className="flex flex-wrap gap-3">
                        {['#사진찍기좋은', '#스페셜티커피', '#인더스트리얼감성', '#데이트코스'].map(tag => (
                            <span key={tag} className="px-4 py-2 bg-[#eef2f2] text-gray-700 rounded-full text-sm font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gray-200/60 my-2"></div>

                    {/* Info List */}
                    <div className="flex flex-col gap-8">

                        {/* Address */}
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <h4 className="text-sm font-bold text-gray-400 tracking-wider">위치</h4>
                                <p className="text-base font-medium text-gray-900">서울 성동구 아차산로 7 케이티링커스</p>

                                {/* 미니맵 플레이스홀더 */}
                                <div className="w-full h-32 bg-gray-200 rounded-3xl mt-3 relative overflow-hidden group cursor-pointer border border-gray-100">
                                    <img
                                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop"
                                        alt="Map Preview"
                                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-x-0 top-0 pt-3 flex justify-center">
                                        <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-xs font-bold text-gray-900">
                                            지도 보기
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-sm font-bold text-gray-400 tracking-wider">영업 시간</h4>
                                <p className="text-base font-medium text-gray-900">매일 08:00 - 20:30</p>
                                <p className="text-sm text-[#13ecc8] font-medium mt-0.5">현재 영업중</p>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-sm font-bold text-gray-400 tracking-wider">연락처</h4>
                                <p className="text-base font-medium text-gray-900">02-6212-6998</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* =========================================
            Sticky Bottom Action Bar
            ========================================= */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex gap-3 z-30 justify-center">
                    <div className="w-full max-w-2xl flex gap-3">
                        <button className="flex-1 md:flex-[0.4] py-4 bg-gray-200 text-gray-800 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors">
                            <Map className="w-5 h-5" />
                            네이버 지도
                        </button>
                        <button className="flex-1 md:flex-[0.6] py-4 bg-[#13ecc8] text-[#10221f] rounded-full font-bold text-lg shadow-[0_4px_14px_rgba(19,236,200,0.3)] hover:shadow-[0_6px_20px_rgba(19,236,200,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            예약 하기
                        </button>
                    </div>
                </div>

            </section>
        </div>
    );
}

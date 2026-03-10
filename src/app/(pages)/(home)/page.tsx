/**
 * Planni 홈 페이지
 * 
 * @desc 반응형 단일 레이아웃 구현 (Mobile First)
 *       - 네비게이션: 모바일(하단) / 데스크탑(좌측)
 *       - 메인 콘텐츠: 검색 및 추천 (공통)
 *       - 히어로 섹션: 데스크탑에서만 좌측 확장을 통해 표시
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Instagram, Youtube } from 'lucide-react';
import SearchBox from '@/components/home/SearchBox';
import CategoryBox from '@/components/home/CategoryBox';
import PopularPlace from '@/components/home/PopularPlace';

// --- Components ---





export default function HomeView() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            {/* =================================================================
                2. Main Content Wrapper
                ================================================================= */}
            <div className="flex flex-col relative pb-16 xl:h-full xl:flex-row xl:overflow-hidden xl:pb-0">

                {/* 왼쪽이미지 영역 */}
                <section className="relative w-full xl:flex items-end xl:w-[35%] h-full group overflow-hidden">
                    <img
                        alt="Background"
                        className="hidden xl:inline-block inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMAwT8p15h2qXVm6V8fDKfcb3wejj5iV_PMx2dkFKsrU3KTDEKklHQUA34SE8DCWaMLmhcGUCBHnLQpr5J2QfdFhb3IcB_KCtdkfI9vHCV_lJ-6mq5xf1Ff02fY9UQTiA34Th8wWxXEM6c4NJ9IL_WYAY3n2_lI3E1Vvr59RSad9XmpShPx5MCF7LJLI04BZCQiEITXUE-l0nngxtPsLWv2gaFNT4SXmRdXm1r4l2sXBSYLvJpjB_o7_YhDN2q5JBiYp1IHlSXm8o"
                    />
                    <div className="hidden xl:block xl:absolute inset-0 bg-gradient-to-t from-black/10 via-black/20 to-black/40">
                    </div>
                    <div className="px-6 py-6 pb-0 xl:absolute inset-0 flex flex-col justify-end xl:py-12 xl:px-8 xl:text-white">
                        <div className="hidden xl:block bg-white/20 backdrop-blur-md self-start px-4 py-2 rounded-full mb-4 border border-white/30">
                            <p className="text-sm font-semibold tracking-wide uppercase flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                Planni Discovery
                            </p>
                        </div>
                        <p className="text-3xl font-bold leading-tight xl:text-5xl xl:font-extrabold xl:leading-tight xl:text-white xl:drop-shadow-md xl:break-keep">
                            당신의 취향에 딱 맞는&nbsp;<br className='xl:hidden' />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-600 xl:text-primary break-keep inline-block">최적의 장소</span>를 찾아보세요
                        </p>
                    </div>
                </section>

                {/* 오른쪽 영역 */}
                <section className="flex-1 h-full overflow-y-auto overflow-x-hidden no-scrollbar bg-light relative">
                    <div className="mx-auto px-6 py-6 xl:px-10 xl:py-14 flex flex-col gap-8 xl:gap-10">
                        {/* 검색 영역 */}
                        <SearchBox />

                        {/* 카테고리 영역 */}
                        <CategoryBox />

                        {/* 인기있는 장소 */}
                        <PopularPlace />

                    </div>
                    <div className="
                        p-6 xl:py-8 xl:px-14 
                        flex flex-col 
                        gap-3 sm:gap-8
                        bg-secondary-footer
                    ">
                        <div className="
                            flex 
                            items-start sm:items-center 
                            justify-between
                        ">
                            <div className="flex flex-col gap-2">
                                <div className="
                                flex items-center gap-2 
                                mb-1 sm:mb-2
                                ">
                                    <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center text-slate-900 font-black text-base">P</div>
                                    <span className="text-xl font-black text-white tracking-tight">Planni</span>
                                </div>
                                <p className="text-xs text-sm text-slate-500">조건이 까다로운 당신을 위한 가장 선명한 장소 발견 서비스.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#13ecc8] hover:text-slate-900 text-white transition-all cursor-pointer">
                                    <Instagram className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="
                            flex flex-col sm:flex-row 
                            justify-between
                            items-start sm:items-center
                            gap-3 sm:gap-6
                            pt-3 sm:pt-6 
                            border-t border-slate-800 
                            relative z-10 
                            text-sm font-medium
                        ">
                            <p className="text-slate-400 text-xs sm:text-s">© 2026 Planni. All rights reserved.</p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <Link href="#" className="text-slate-400 hover:text-white cursor-pointer transition-colors">이용약관</Link>
                                <Link href="#" className="text-white font-bold hover:text-[#13ecc8] cursor-pointer transition-colors">개인정보처리방침</Link>
                                <Link href="#" className="text-slate-400 hover:text-white cursor-pointer transition-colors">문의하기</Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
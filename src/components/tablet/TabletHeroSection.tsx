/**
 * 태블릿 홈 페이지 - Hero Section 컴포넌트
 * 
 * @desc 왼쪽 패널에 표시되는 히어로 섹션으로, 큰 배경 이미지와 함께
 *       AI 기반 여행지 추천 서비스의 핵심 가치를 전달합니다.
 */

'use client';

export default function TabletHeroSection() {
    return (
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
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                            AI Discovery
                        </span>
                    </div>

                    {/* 메인 타이틀 */}
                    <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4 drop-shadow-sm">
                        당신의 취향에 딱 맞는<br />
                        <span className="text-primary">최적의 장소</span>를 찾아보세요
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
    );
}

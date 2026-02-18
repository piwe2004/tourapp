'use client';

import { useEffect, useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlannerStore } from '@/store/plannerStore';
import clsx from 'clsx';

export default function Header() {
    const pathname = usePathname();
    const isPlanner = pathname === '/planner';

    return isPlanner ? <PlannerHeader /> : <DefaultHeader />;
}

function PlannerHeader() {
    const { destination, dateRange, activeEditor, setActiveEditor } = usePlannerStore();

    // 포맷팅된 날짜 문자열 (예: 11.27 - 11.29)
    const formatDate = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}`;
    const dateStr = `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;

    // 현재 선택된 activeEditor에 따라 모달 로직 연동 (여기서는 표시만)
    // 실제 모달 렌더링은 Page 레벨이나 ModalWrapper에서 처리

    return (
        <>
            {/* Desktop Header */}
            <header className="planner-header">
                {/* Left: Logo */}
                <Link href="/" className="logo-container">
                    <div className="logo-icon">
                        <i className="fa-solid fa-plane"></i>
                    </div>
                    <span className="logo-text">Planni</span>
                </Link>

                {/* Center: Title & Info (Absolute Center) */}
                <div className="center-container">
                    {/* PC Title */}
                    <div className="pc-title">
                        <h1 className="destination-title">{destination} 여행</h1>
                        <div className="info-row">
                            <button
                                onClick={() => setActiveEditor('date')}
                                className={clsx("info-button", activeEditor === 'date' && "text-indigo-600")}
                            >
                                {dateStr}
                                <i className="fa-regular fa-calendar text-[10px]"></i>
                            </button>
                            <div className="header-divider"></div>
                            <button
                                onClick={() => setActiveEditor('guest')}
                                className={clsx("info-button", activeEditor === 'guest' && "text-indigo-600")}
                            >
                                {/* Guest count logic simplified for header display if store has total or breakdown */}
                                인원 수정
                                <i className="fa-solid fa-user-group text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="actions-container">
                    <button className="invite-button">
                        <i className="fa-regular fa-paper-plane"></i>
                        <span>일행 초대</span>
                    </button>

                    <div className="vertical-divider"></div>

                    <button className="save-button">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>저장</span>
                    </button>

                    <div className="profile-image">
                        {/* <img src="/avatar-placeholder.png" alt="Profile" /> */}
                    </div>
                </div>
            </header>

            {/* Mobile Header (Fixed Top) */}
            <div className="mobile-header">
                <Link href="/" className="logo-container">
                    <div className="logo-icon w-8 h-8 text-base">
                        <i className="fa-solid fa-plane"></i>
                    </div>
                </Link>

                <div className="mobile-info-col">
                    <button onClick={() => setActiveEditor('date')} className="date-button">
                        {dateStr}
                    </button>
                    <button onClick={() => setActiveEditor('destination')} className="dest-button pc-hidden">
                        {destination} <i className="fa-solid fa-chevron-down text-[8px]"></i>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="weather-badge">
                        <i className="fa-solid fa-sun"></i> 맑음
                    </div>
                    <button className="share-button">
                        <i className="fa-solid fa-share-nodes"></i>
                    </button>
                </div>
            </div>
        </>
    );
}



function DefaultHeader() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const isTransparentElement = pathname === '/';
    const [activePage, setActivePage] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isTransparent = isTransparentElement && !scrolled;

    const NAV_ITEMS = [
        { id: 'home', icon: 'home', label: '홈' },
        { id: 'saved', icon: 'bookmark_border', label: '보관함' },
        { id: 'add', icon: 'add', label: '추가', mobileOnly: true }, // Mobile FAB placeholder
        { id: 'travel', icon: 'flight_takeoff', label: '경로' },
        { id: 'profile', icon: 'person_outline', label: '프로필' },
    ] as const;

    return (
        <header className="flex items-center justify-between md:h-full border-gray-100 md:border-t-0 md:border-r md:flex-col md:py-8 md:bg-white pt-6 px-6 md:p-0">
            <Link href="/" title="메인페이지" className="flex items-center gap-2 relative md:mb-12 shrink">
                <h1 className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg md:w-12 md:h-12 md:text-2xl after:content-['P'] shadow-lg shadow-primary/30"></h1>
                <p className="text-2xl font-extrabold tracking-tight md:text-[0px] md:absolute md:top-0">
                    Planni
                </p>
            </Link>
            <nav className="h-[72px] fixed bottom-0 left-0 w-full border-t border-gray-100 z-50 md:relative md:w-24 md:h-full md:border-0 bg-white/90 backdrop-blur-lg">

                {/* Nav Items Container */}
                <div className="flex justify-between items-center h-full px-6 md:px-0 md:flex-col md:justify-start md:gap-8 md:w-full">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activePage === item.id;

                        // "Add" button Special Style (Mobile FAB-like)
                        if (item.id === 'add') {
                            return (
                                <div key={item.id} className="relative md:hidden -top-5">
                                    <button className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 text-black transform active:scale-95 transition-transform border-4 border-background-tablet-light">
                                        <span className="material-icons-round text-3xl">add</span>
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActivePage(item.id)}
                                className={`h-[40px] flex flex-col items-center justify-between md:gap-1 md:h-auto w-12 md:w-full group transition-all
                                    ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {/* Desktop Icon Background */}
                                <div className={`h-[18px] md:flex md:w-12 md:h-12 items-center justify-center rounded-2xl transition-all duration-300
                                    ${isActive ? 'md:bg-primary/10' : 'text-gray-400 group-hover:bg-gray-100'}`}>
                                    <span className="material-icons-round text-2xl">{item.icon}</span>
                                </div>
                                {/* Label */}
                                <span className={`text-[10px] md:text-[13px] font-light md:font-normal md:mt-1 ${isActive ? ' font-normal md:font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
            <div className="w-10 h-10 rounded-full border-2 overflow-hidden border-white shadow-sm md:w-12 md:h-12 shrink">
                <img
                    alt="User profile"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_pbUD2fhWrNqEY8ZOx7Fw7OLYZsZPhiBWc6bcxSwNqpOfBlNxNRx3MwHtNflMqIFgyvwq2RDFiQpiXpz-13t9oGQHasW-mN5Y_xcpTjzCe_g5ErZIh5wlKipgyDuxXbUkcOKuomEWJRHGFzPsiC64gcpUO_M0yjK2VgIIx2vSJ5IT2AZ1k_dt1wIZ49ms9qQCODbrCR4x5_mvaskJnKXJYWQLGt4xX298Il3azsRpxtr7YI2uDV-_gmFxnKD12s-oDJjt0Hbb6qk"
                />
            </div>
        </header>
    );
}

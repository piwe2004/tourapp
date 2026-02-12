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

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isTransparent = isTransparentElement && !scrolled;

    return (
        <header className={clsx(
            "fixed top-0 left-0 right-0 z-sticky h-[72px] flex items-center justify-between px-6 lg:px-8 transition-all duration-300 bg-transparent",
            { "bg-white shadow-sm border-b border-gray-200": !isTransparent }
        )}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white text-lg">
                    <i className="fa-solid fa-plane"></i>
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                    Planni
                </span>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
                {/* Search Icon Button */}
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 transition-all duration-200 bg-transparent hover:bg-slate-100 hover:text-primary">
                    <i className="fa-solid fa-magnifying-glass text-lg"></i>
                </button>

                {/* Profile Avatar */}
                <button className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold transition-all duration-200 hover:shadow-[0_0_0_2px_#4338ca]">
                    U
                </button>
            </div>
        </header>
    );
}

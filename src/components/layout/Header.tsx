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
    const isTransparentElement = pathname === '/'; // 홈에서만 투명

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isTransparent = isTransparentElement && !scrolled;

    return (
        <header className={clsx("header header__default", isTransparent ? "transparent" : "scrolled")}>
            <Link href="/" className="header__logo">
                <i className="fa-solid fa-plane text-xl"></i>
                <span className={clsx("header__logo-text", isTransparent ? "text-white" : "text-slate-900")}>
                    Planni
                </span>
            </Link>

            <div className="header__btnBox">
                <button className={clsx("search-button hover:border-indigo-600 hover:text-indigo-600",
                    isTransparent && "bg-white/10 border-white/20 text-white hover:bg-white hover:text-indigo-600")}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
                <button className={clsx("settings-button hover:bg-indigo-600",
                    isTransparent && "bg-white/10 hover:bg-white hover:text-indigo-600")}>
                    <i className="fa-solid fa-bars"></i>
                </button>
            </div>
        </header>
    );
}

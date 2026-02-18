/**
 * 태블릿 홈 페이지 - Sidebar 컴포넌트
 * 
 * @desc 왼쪽 고정 사이드바로, 로고/네비게이션 메뉴/프로필을 표시합니다.
 *       사용자가 현재 어느 페이지에 있는지 시각적으로 보여줍니다.
 */

'use client';

import { useState } from 'react';

interface TabletSidebarProps {
    currentPage?: 'home' | 'saved' | 'travel';
}

export default function TabletSidebar({ currentPage = 'home' }: TabletSidebarProps) {
    const [activePage, setActivePage] = useState(currentPage);

    // 네비게이션 메뉴 아이템 정의
    const navItems = [
        { id: 'home' as const, icon: 'home', label: '홈' },
        { id: 'saved' as const, icon: 'favorite_border', label: '저장' },
        { id: 'travel' as const, icon: 'map', label: '여행' },
    ];

    return (
        <nav className="w-20 md:w-24 h-full bg-white flex flex-col items-center py-8 border-r border-gray-100 flex-shrink-0 z-20 shadow-sm">
            {/* 로고 아이콘 */}
            <div className="mb-12">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
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
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                    }`}
                            >
                                <span className="material-icons-round text-2xl">{item.icon}</span>
                            </div>
                            {/* 라벨 */}
                            <span
                                className={`text-[10px] font-semibold transition-colors ${isActive
                                    ? 'text-primary'
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
                <button className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors">
                    <img
                        alt="User Profile"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuTLD1VL7oFaoMij9RXnWINSZCq-_6c70PiqeDKe-7E59zam60hhR1-2SfdKQsdFDTpxTgJjkXSRxy7B_lndxL1RtDomDsDG7-bAigf19uAnPUfoB38y86MFGSQmzk_mTXlTn2b1zPpFGI9sJScI_oK4IVnSFmuhpYEYh_2i348wdKcc6zsGMdVIAyWaQWAPHjQ4rN7lTxUMyIIxSeMSbw37i2wXiytvQ8w2yl-0I-yH_nTVjgTVeFpxJqt9OAVHkTzxBSwZ91M74"
                    />
                </button>
            </div>
        </nav>
    );
}

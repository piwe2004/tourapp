'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './HeroSection.module.scss';
import clsx from 'clsx';

export default function HeroSection() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/planner?destination=${encodeURIComponent(query)}`);
    };

    return (
        <section className={styles.heroSection}>
            
            {/* Left Column: Text & Input */}
            <div className={styles.leftColumn}>
                {/* Badge */}
                <div className={styles.badge}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>당신의 AI 여행 메이트</span>
                </div>

                {/* Main Title */}
                <h1 className={styles.title}>
                    단 한 문장으로<br />
                    여행 계획을<br />
                    완성하세요
                </h1>

                {/* Subtitle */}
                <p className={styles.subtitle}>
                    어디로, 누구와 갈지만 말씀해주세요.<br />
                    나머지는 AI가 알아서 처리합니다.
                </p>

                {/* Search Form */}
                <div className={styles.searchFormWrapper}>
                    <form onSubmit={handleSearch} className={styles.searchForm}>
                        <i className={`fa-solid fa-compass ${styles.searchIcon}`}></i>
                        <input 
                            type="text" 
                            placeholder="예) 이번 주말 부산에서 로맨틱한 데이트 코스"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" className={styles.submitButton}>
                            생성하기
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </form>
                </div>

                {/* Quick Tags */}
                <div className={styles.quickTags}>
                    <span className={styles.tagsLabel}>Try:</span>
                    <button onClick={() => setQuery('제주도 2박 3일 힐링 여행')} className={styles.tagButton}>
                        🗻 제주도 2박 3일 힐링
                    </button>
                    <button onClick={() => setQuery('부산 맛집 데이트 코스')} className={styles.tagButton}>
                        🌊 부산 맛집 데이트
                    </button>
                </div>
            </div>

            {/* Right Column: Destination Card (Visual) */}
            <div className={styles.rightColumn}>
                {/* Decorative Elements */}
                <div className={clsx(styles.decorations, styles.yellowBlob)}></div>
                <div className={clsx(styles.decorations, styles.indigoBlob)}></div>

                {/* Main Card */}
                <div className={styles.destinationCard}>
                    
                    {/* Top Row: Badges */}
                    <div className={styles.cardHeader}>
                        {/* Popular Badge */}
                        <div className={styles.glassBadge}>
                            <span className={styles.emoji}>🔥</span>
                            <span className={styles.label}>인기 급상승</span>
                            <span className={styles.value}>+450% ↑</span>
                        </div>

                        {/* Weather Widget */}
                        <div className={clsx(styles.glassBadge, styles.weatherWidget)}>
                            <i className="fa-solid fa-sun"></i>
                            <div className={styles.weatherText}>
                                <span className={styles.label}>날씨</span>
                                <span className={styles.value}>맑음 24°C</span>
                            </div>
                        </div>
                    </div>

                    {/* Center: 3D Icon */}
                    <div className={styles.cardCenter}>
                         <div className={styles.mainIcon}>
                            🏝️
                        </div>
                         <h2 className={styles.destinationName}>제주도</h2>
                    </div>

                    {/* Bottom: Interactive Hint */}
                    <div className={styles.hoverHint}>
                         <span>지금 바로 떠나보세요</span>
                    </div>

                    {/* Floating Elements (Background UI Lines) */}
                    <div className={styles.bgRing}></div>
                </div>
            </div>
        </section>
    );
}


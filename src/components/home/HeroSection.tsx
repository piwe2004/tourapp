'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HeroSection() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/planner?destination=${encodeURIComponent(query)}`);
    };

    return (
        <section className="hero-section">
            {/* Background Image with Overlay */}
            <div className="bgImageWrapper">
                <img 
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
                    alt="Travel Background" 
                />
            </div>
            <div className="overlay"></div>

            {/* Content */}
            <div className="content">
                {/* Badge */}
                <div className="badge">
                    <span className="dot"></span>
                    <span>AI Travel Planner</span>
                </div>

                {/* Title */}
                <h1 className="title">
                    당신의 완벽한 여행,<br />
                    <span className="highlight">플래니</span>가계획해드릴게요.
                </h1>

                {/* Subtitle */}
                <p className="subtitle">
                    복잡한 여행 계획은 이제 그만. AI가 당신의 취향을 분석하여<br />
                    숙소, 맛집, 관광지까지 최적의 동선을 제안합니다.
                </p>

                {/* Search Form (Direct Input) */}
                <form onSubmit={handleSearch} className="hero-search-form">
                    <div className="input-wrapper">
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        <input 
                            type="text" 
                            className="hero-input"
                            placeholder="어떤 여행을 원하시나요? (예: 제주도 2박3일 힐링 여행)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="search-button">
                        시작하기
                    </button>
                </form>

                {/* Quick Tags (Optional helper) */}
                <div className="quick-tags">
                   <span>추천:</span>
                   <button type="button" onClick={() => setQuery('제주도 아이와 함께 2박3일')}>#제주도_아이와</button>
                   <button type="button" onClick={() => setQuery('부산 맛집 탐방 1박2일')}>#부산_맛집</button>
                   <button type="button" onClick={() => setQuery('강릉 힐링 여행 당일치기')}>#강릉_힐링</button>
                </div>
            </div>
        </section>
    );
}


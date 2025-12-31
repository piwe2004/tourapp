'use client';

import { useRouter } from 'next/navigation';

export default function HeroSection() {
    const router = useRouter();

    const handleStart = () => {
        router.push('/start');
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

                {/* CTA Button */}
                <button 
                    onClick={handleStart}
                    className="ctaButton"
                >
                    여행 시작하기
                </button>
            </div>
        </section>
    );
}

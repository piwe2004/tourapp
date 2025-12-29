'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Hero Section Component
export default function HeroSection() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/planner?destination=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <section className="hero-section">
            <div className="hero-container">
                {/* Left Column: Text & Search */}
                <div className="hero-left-col">
                    <div className="hero-badge">
                        <span className="pulse-dot"></span>
                        나만의 여행 플래너
                    </div>
                    
                    <h1 className="hero-title">
                        어디로 여행을<br />
                        떠나시나요?<br />
                        <span className="highlight">AI와 함께 계획해보세요</span>
                    </h1>
                    
                    <p className="hero-description">
                        복잡한 여행 계획은 이제 그만.<br />
                         취향만 알려주시면 숙소부터 맛집, 명소까지 완벽한 코스를 제안해드립니다.
                    </p>

                    <div className="search-wrapper">
                        <form onSubmit={handleSearch} className="search-form">
                            <div className="search-icon-wrapper">
                                <i className="fa-solid fa-plane-up text-lg"></i>
                            </div>
                            <input 
                                type="text"
                                placeholder="어디로 떠나보고 싶으신가요? (예: 제주도, 부산)"
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button 
                                type="submit" 
                                disabled={!searchTerm.trim()}
                                className="submit-button"
                            >
                                <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Hero Images & Floating Cards */}
                <div className="hero-right-col">
                    <div className="hero-image-wrapper">
                        {/* Main Interaction Image */}
                        <div className="main-image-container">
                             <Image 
                                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80" 
                                alt="Travel Planning" 
                                className="main-image"
                                fill
                                style={{ objectFit: 'cover' }}
                                priority
                            />
                            <div className="hero-overlay"></div>
                            <div className="image-text">
                                <span className="must-visit-badge">
                                    Must Visit
                                </span>
                                <h3 className="image-title">Switzerland</h3>
                            </div>
                        </div>

                        {/* Floating Cards */}
                        {/* 1. Weather Card */}
                        <div className="weather-card">
                            <div className="icon-box orange-icon">
                                <i className="fa-solid fa-sun text-lg"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="card-text-label">Weather</span>
                                <span className="card-text-value">24°C Sunny</span>
                            </div>
                        </div>

                        {/* 2. Booking Card */}
                        <div className="booking-card">
                            <div className="icon-box indigo-icon">
                                <i className="fa-solid fa-check text-lg"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="card-text-label">Booking</span>
                                <span className="card-text-value">Confirmed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

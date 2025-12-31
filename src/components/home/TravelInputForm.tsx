'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

export default function TravelInputForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Initial state from URL param if available
    const [destination, setDestination] = useState(searchParams.get('destination') || '');

    const [duration, setDuration] = useState(2);
    const [companion, setCompanion] = useState('');
    const [travelStyle, setTravelStyle] = useState('힐링/휴식'); // Default selection
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    
    // Calendar Mock State
    const [startDate, setStartDate] = useState<Date | null>(new Date('2026-01-06')); 
    const [endDate, setEndDate] = useState<Date | null>(new Date('2026-01-15')); 

    const companions = ['혼자', '연인', '친구', '가족(아이 동반)', '가족(부모님 동반)'];
    const stylesList = ['힐링/휴식', '맛집 탐방', '액티비티/모험', '역사/문화', '인생샷/SNS', '호캉스'];

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDuration(parseInt(e.target.value));
    };

    const toggleCalendar = () => {
        setIsCalendarOpen(!isCalendarOpen);
    };

    const handleGenerate = () => {
        if (!destination) {
            alert('여행지를 입력해주세요!');
            return;
        }
        
        const query = `${destination} ${duration - 1}박${duration}일 ${travelStyle}`;
        router.push(`/planner?destination=${encodeURIComponent(query)}`);
    };

    return (
        <div className="travel-input-form">
            {/* Header */}
            <div className="header">
                <h2>여행 정보를 알려주세요</h2>
                <p>멋진 계획을 세우기 위한 몇 가지 질문입니다.</p>
            </div>

            {/* Form Body */}
            <div className="formBody">
                
                {/* 1. Destination */}
                <div className="formGroup">
                    <label>
                        <span className="iconCircle"><i className="fa-solid fa-plane"></i></span>
                        여행지
                    </label>
                    <input 
                        type="text" 
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="예: 부산, 제주도, 강릉"
                        className="textInput"
                    />
                </div>

                {/* 2. Duration / Schedule */}
                <div className="formGroup">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>
                            <span className="iconCircle"><i className="fa-regular fa-calendar"></i></span>
                            기간 (일)
                        </label>
                        <span className="durationDisplay" onClick={toggleCalendar}>
                            {duration}일
                        </span>
                    </div>
                    {/* Slider */}
                    <div 
                        className="sliderContainer"
                        onClick={toggleCalendar}
                    >
                         <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={duration}
                            onChange={handleDurationChange}
                            onClick={(e) => {
                                e.stopPropagation(); 
                            }}
                        />
                    </div>
                </div>

                {/* 3. Companions */}
                <div className="formGroup">
                    <label>
                        <span className="iconCircle"><i className="fa-solid fa-user-group"></i></span>
                        누구와 함께하나요?
                    </label>
                    <div className={clsx("buttonGrid", "cols-3")}>
                        {companions.slice(0,3).map(c => (
                            <button 
                                key={c}
                                onClick={() => setCompanion(c)}
                                className={clsx("selectionBtn", companion === c && "selected")}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                    <div className={clsx("buttonGrid", "cols-2")}>
                        {companions.slice(3).map(c => (
                            <button 
                                key={c}
                                onClick={() => setCompanion(c)}
                                className={clsx("selectionBtn", companion === c && "selected")}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Style */}
                <div className="formGroup">
                    <label>
                        <span className="iconCircle"><i className="fa-regular fa-heart"></i></span>
                        여행 스타일
                    </label>
                    <div className={clsx("buttonGrid", "cols-2")}>
                        {stylesList.map(s => (
                             <button 
                                key={s}
                                onClick={() => setTravelStyle(s)}
                                className={clsx("selectionBtn", "withIcon", travelStyle === s && "selected")}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button 
                    onClick={handleGenerate}
                    className="submitBtn"
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    여행 계획 생성하기
                </button>
            </div>

            {/* Calendar Modal Overlay (Mock) */}
            {isCalendarOpen && (
                <div className="calendarOverlay">
                    <div className="calendarHeader">
                        <button onClick={toggleCalendar}><i className="fa-solid fa-xmark"></i></button>
                        <h3>날짜 선택</h3>
                        <div style={{ width: '24px' }}></div>
                    </div>
                    <div className="calendarBody">
                        {/* Simple CSS-only placeholder for calendar grid functionality */}
                        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#94a3b8' }}>
                            <p>2026년 1월</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                                <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
                                {/* Mock Days */}
                                <span style={{ opacity: 0 }}></span><span style={{ opacity: 0 }}></span><span style={{ opacity: 0 }}></span><span style={{ opacity: 0 }}></span>
                                <span>1</span><span>2</span><span>3</span>
                                <span style={{ color: 'red' }}>4</span><span>5</span>
                                <span className="gridDay" style={{ backgroundColor: '#10b981', color: 'white' }}>6</span>
                                <span className="gridDay" style={{ backgroundColor: '#ecfdf5' }}>7</span>
                                <span className="gridDay" style={{ backgroundColor: '#ecfdf5' }}>8</span>
                                {/* ... truncated for brevity, just visual placeholder */}
                            </div>
                        </div>
                    </div>

                    <div className="calendarFooter">
                        <button 
                            onClick={() => {
                                setDuration(10); 
                                setIsCalendarOpen(false);
                            }}
                        >
                            1.6(화) ~ 1.15(목) 선택완료
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


import { PlanItem } from "@/types/place";
import { X, MapPin, Clock, Utensils, BedDouble, Star, List, Share2, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { openBooking, BOOKING_PLATFORMS, BookingPlatform, PlatformConfig } from "@/lib/bookingService";
import clsx from 'clsx';
import Image from "next/image";

interface DetailPopupProps {
    item: PlanItem;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * @desc 여행 상세 정보를 보여주는 프리미엄 사이드 패널
 *       Glassmorphism 헤더와 깔끔한 섹션 구분
 */
export default function DetailPopup({ item, isOpen, onClose }: DetailPopupProps) {
    const [imageError, setImageError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Animation & ESC Control
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
            // Push history state to handle back button on mobile if needed
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Wait for animation
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Close Handler
    const handleClose = () => {
        setIsVisible(false); // Trigger animation close
        setTimeout(onClose, 300); // Actual close after animation
    };

    if (!isOpen && !isVisible) return null;

    // Booking Handler
    const handleBooking = (platform: BookingPlatform) => {
        const today = new Date();
        const checkInDate = new Date(today);
        checkInDate.setDate(today.getDate() + item.day);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkInDate.getDate() + 1);
        
        const inStr = checkInDate.toISOString().split('T')[0];
        const outStr = checkOutDate.toISOString().split('T')[0];
        openBooking(platform, item.NAME, inStr, outStr);
    };

    return createPortal(
        <>
            {/* Backdrop */}
            <div 
                className={clsx(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={handleClose}
            />

            {/* Side Panel */}
            <div 
                className={clsx(
                    "fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* 1. Hero Header */}
                <div className="relative h-[300px] w-full shrink-0">
                    {/* Image */}
                    {item.IMAGE_URL && !imageError ? (
                        <Image
                            src={item.IMAGE_URL}
                            alt={item.NAME}
                            fill
                            className="object-cover"
                            onError={() => setImageError(true)}
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                             <i className={`fa-solid fa-image text-4xl`}></i>
                        </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Top Buttons */}
                    <button 
                        onClick={handleClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>
                    
                    {/* Title Content */}
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider shadow-sm border border-emerald-400/50">
                                {getActivityTypeLabel(item.type)}
                            </span>
                            {item.RATING ? (
                                <span className="flex items-center gap-1 text-sm font-medium text-yellow-400">
                                    <i className="fa-solid fa-star"></i> {item.RATING}
                                </span>
                            ) : null}
                        </div>
                        <h2 className="text-3xl font-black leading-tight mb-2 drop-shadow-md">{item.NAME}</h2>
                        <p className="flex items-center gap-1.5 text-sm text-gray-200 font-light truncate">
                            <MapPin size={14} className="text-gray-300" />
                            {item.ADDRESS}
                        </p>
                    </div>
                </div>

                {/* 2. Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium mb-0.5">소요시간</p>
                                <p className="text-sm font-bold text-slate-800">
                                    {typeof item.STAY_TIME === 'number' ? `${item.STAY_TIME}분` : item.STAY_TIME}
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                                <Star size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium mb-0.5">평점</p>
                                <p className="text-sm font-bold text-slate-800">{item.RATING || '정보없음'}</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Summary / Description */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-sparkles text-emerald-500"></i>
                             AI 여행 가이드
                        </h3>
                        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50 text-slate-700 leading-relaxed text-sm">
                             {item.MEMO || item.HIGHTLIGHTS ? (
                                <div className="space-y-2">
                                    {item.MEMO && <p>{item.MEMO}</p>}
                                    {Array.isArray(item.HIGHTLIGHTS) && (
                                        <p className="text-slate-500 italic">"{item.HIGHTLIGHTS.join(' ')}"</p>
                                    )}
                                </div>
                             ) : (
                                 <p className="text-slate-400">상세 정보가 없습니다.</p>
                             )}
                        </div>
                    </section>

                    {/* Tags */}
                    {item.TAGS && (
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-hashtag text-slate-400 text-sm"></i> 키워드
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                 {[...(item.TAGS.common || []), ...(item.TAGS.winter || [])].map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors cursor-default">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Location Copy */}
                     <section>
                         <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                             <MapPin size={16} className="text-slate-400" /> 주소
                         </h3>
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                             <span className="text-sm text-slate-600 truncate mr-4">{item.ADDRESS}</span>
                             <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(item.ADDRESS);
                                    // Could show toast here
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap"
                            >
                                복사
                             </button>
                         </div>
                    </section>
                </div>

                {/* 3. Footer Action (Stay Booking) */}
                {item.type === 'stay' && (
                    <div className="p-6 border-t border-slate-100 bg-white shrink-0 safe-area-bottom">
                         <div className="flex flex-col gap-3">
                             <p className="text-xs text-center text-slate-400">
                                 AI가 찾은 최저가로 예약하세요
                             </p>
                             <div className="grid grid-cols-2 gap-3">
                                  {(Object.entries(BOOKING_PLATFORMS) as [BookingPlatform, PlatformConfig][]).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleBooking(key)}
                                        className="py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transform active:scale-95 transition-all text-center"
                                        style={{ backgroundColor: key === 'agoda' ? '#2563EB' : '#FF5722' }}
                                    >
                                        {config.name} 예약
                                    </button>
                                  ))}
                             </div>
                         </div>
                    </div>
                )}
            </div>
        </>,
        document.body
    );
}

function getActivityTypeLabel(type: string) {
    if (type === 'stay') return '숙소';
    if (type === 'food') return '맛집';
    if (type === 'cafe') return '카페';
    if (type === 'sightseeing') return '관광';
    if (type === 'move') return '이동';
    return '기타';
}

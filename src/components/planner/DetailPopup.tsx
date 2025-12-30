import { PlanItem } from "@/types/place";
import { X, MapPin, Clock, Utensils, BedDouble, Star, List } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
// import { openBooking, BOOKING_PLATFORMS, BookingPlatform } from "@/lib/bookingService"; // Assuming you might use this later, kept commented or if used
import { openBooking, BOOKING_PLATFORMS, BookingPlatform, PlatformConfig } from "@/lib/bookingService";
import clsx from 'clsx';
import Image from "next/image";

interface DetailPopupProps {
    item: PlanItem;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * @desc 여행 상세 정보를 보여주는 팝업 모달
 *       [Updated] 이미 가져온(pre-fetched) 상세 정보를 즉시 표시
 *       [Updated] 숙소(stay) 타입일 경우 최저가 예약 버튼 노출
 */
export default function DetailPopup({ item, isOpen, onClose }: DetailPopupProps) {
    const [imageError, setImageError] = useState(false);

    // ESC 키 핸들링
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);
    
    // 예약 핸들러
    const handleBooking = (platform: BookingPlatform) => {
        const today = new Date();
        const checkInDate = new Date(today);
        checkInDate.setDate(today.getDate() + item.day); // 예: 1일차면 내일 체크인

        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkInDate.getDate() + 1); // 1박 2일

        const inStr = checkInDate.toISOString().split('T')[0];
        const outStr = checkOutDate.toISOString().split('T')[0];

        openBooking(platform, item.NAME, inStr, outStr);
    };

    if (!isOpen) return null;

    // Helper for icon colors (inline styles for simplicity in migration)
    const iconColors = {
        orange: '#f97316',
        gray: '#6b7280',
        indigo: '#6366f1',
        green: '#22c55e',
        white: 'rgba(255,255,255,0.8)'
    };

    return createPortal(
        <div
            className="detail-popup-overlay"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="detail-popup-container"
                onClick={(e) => e.stopPropagation()} // 내부 클릭 시 부모(배경)으로 이벤트 전파 방지
            >

                {/* Header Image Area */}
                <div className="detail-popup-header">
                    {/* Pre-fetched Image or Fallback */}
                    {item.IMAGE_URL && !imageError ? (
                        <Image
                            src={item.IMAGE_URL}
                            alt={item.NAME}
                            fill
                            sizes="(max-width: 768px) 100vw, 500px"
                            className="detail-popup-header-image"
                            onError={() => setImageError(true)}
                            priority
                        />
                    ) : (
                        <span className="detail-popup-header-placeholder">
                            <i className={`fa-solid ${getIcon(item.type)}`}></i>
                        </span>
                    )}

                    <div className="detail-popup-header-gradient"></div>

                    <div className="detail-popup-header-content">
                        <span className="detail-popup-badge">
                            {getActivityTypeLabel(item.type)}
                        </span>
                        <h2 className="detail-popup-title">{item.NAME}</h2>

                        {/* Address Display (Header) */}
                        {item.ADDRESS && (
                            <p className="detail-popup-address">
                                <MapPin size={14} color={iconColors.white} />
                                {item.ADDRESS}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="detail-popup-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Body */}
                <div className="detail-popup-body">

                    {/* Key Info Grid */}
                    <div className="detail-popup-info-grid">
                        <div className="detail-popup-info-card">
                            <div className={clsx("detail-popup-icon-box", "detail-popup-icon-blue")}>
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="detail-popup-info-label">소요 시간</p>
                                <p className="detail-popup-info-value">
                                    {typeof item.STAY_TIME === 'number' ? `${item.STAY_TIME}분` : item.STAY_TIME}
                                </p>
                            </div>
                        </div>
                        <div className="detail-popup-info-card">
                            <div className={clsx("detail-popup-icon-box", "detail-popup-icon-yellow")}>
                                <Star size={18} />
                            </div>
                            <div>
                                <p className="detail-popup-info-label">평점</p>
                                <p className="detail-popup-info-value">
                                    {item.RATING || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Highlights (Menu) Section */}
                    <div className="detail-popup-section">
                        <h3 className="detail-popup-section-title">
                            <Utensils size={18} color={iconColors.orange} />
                            {item.type === 'food' || item.type === 'cafe' ? '추천 메뉴' : '특징 및 소개'}
                        </h3>
                        <div className="detail-popup-text-box">
                            <i className="fa-solid fa-quote-left"></i>
                            <p>
                                {Array.isArray(item.HIGHTLIGHTS) 
                                    ? item.HIGHTLIGHTS.join(' ') 
                                    : (item.HIGHTLIGHTS || (item.type === 'food' ? "대표 메뉴 정보가 없습니다." : "상세 소개가 없습니다."))}
                            </p>
                        </div>
                    </div>

                     {/* Plan B / Recommendation Section (only if available) */}
                     {item.MEMO && (
                        <div className="detail-popup-section">
                            <h3 className="detail-popup-section-title">
                                <List size={18} color={iconColors.gray} />
                                참고 사항 (Memo)
                            </h3>
                            <div className="detail-popup-text-box-list">
                                <div className="detail-popup-list-check">
                                    <i className="fa-solid fa-check" style={{ color: iconColors.green, marginRight: 8 }}></i>
                                    {item.MEMO}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tags Section */}
                    {item.TAGS && (
                        <div className="detail-popup-section">
                            <h3 className="detail-popup-section-title">
                                <i className="fa-solid fa-hashtag" style={{ color: iconColors.indigo, marginRight: 8, fontSize: 16 }}></i>
                                태그
                            </h3>
                            <div className="day-tags-row">
                                {[...(item.TAGS.common || []), ...(item.TAGS.winter || [])].map((tag, i) => (
                                    <span key={i} className="day-tag-badge">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Address Section */}
                    {item.ADDRESS && (
                        <div className="detail-popup-section">
                            <h3 className="detail-popup-section-title">
                                <MapPin size={18} color={iconColors.indigo} />
                                위치 정보
                            </h3>
                            <div className="detail-popup-address-box">
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '16px' }}>
                                    {item.ADDRESS}
                                </span>
                                <button className="detail-popup-copy-btn" onClick={() => navigator.clipboard.writeText(item.ADDRESS)}>
                                    <i className="fa-regular fa-copy"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Booking Section (Stay Only) */}
                    {item.type === 'stay' && (
                        <div className="detail-popup-section">
                            <h3 className="detail-popup-section-title">
                                <BedDouble size={18} color={iconColors.indigo} />
                                최저가 예약하기
                            </h3>
                            <div className="reserved-btn-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                {(Object.entries(BOOKING_PLATFORMS) as [BookingPlatform, PlatformConfig][]).map(([key, config]) => (
                                    <button
                                        key={key}
                                        className="detail-popup-info-card"
                                        style={{ justifyContent: 'center', cursor: 'pointer', fontWeight: 600, color: '#374151' }}
                                        onClick={() => handleBooking(key)}
                                    >
                                        {config.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>,
        document.body
    );
}

// Helper Functions
function getActivityTypeLabel(type: string) {
    switch (type) {
        case 'sightseeing': return '관광지';
        case 'food': return '식당';
        case 'cafe': return '카페';
        case 'stay': return '숙소';
        case 'move': return '이동';
        default: return '기타';
    }
}

function getIcon(type: string) {
    switch (type) {
        case 'sightseeing': return 'fa-camera';
        case 'food': return 'fa-utensils';
        case 'cafe': return 'fa-coffee';
        case 'stay': return 'fa-bed';
        case 'move': return 'fa-car';
        default: return 'fa-map-pin';
    }
}

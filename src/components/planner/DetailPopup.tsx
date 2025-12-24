import { PlanItem } from "@/types/place";
import { X, MapPin, Clock, Calendar, Utensils, BedDouble, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { openBooking, BOOKING_PLATFORMS, BookingPlatform } from "@/lib/bookingService";
import { cn } from "@/lib/utils";

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
    console.log("item: ", item);
    // 예약 핸들러
    const handleBooking = (platform: BookingPlatform) => {
        // 날짜 계산 (임시: 현재 일정의 day를 기준으로 오늘+day일 후, 1박)
        // 실제로는 전체 일정의 시작일(startDate)을 알아야 정확하지만, 
        // 여기서는 Mocking을 위해 오늘 날짜 기준으로 계산하거나, 
        // 향후 dateRange를 props로 받아야 함.
        // 임시 로직: 오늘 + (item.day)일
        
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

    return createPortal(
        <div 
            className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div 
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative animate-scale-up"
                onClick={(e) => e.stopPropagation()} // 내부 클릭 시 부모(배경)으로 이벤트 전파 방지
            >
                
                {/* Header Image Area */}
                <div className="h-56 bg-indigo-50 relative flex items-center justify-center overflow-hidden">
                     {/* Pre-fetched Image or Fallback */}
                     {item.IMAGE_URL && !imageError ? (
                        <img 
                            src={item.IMAGE_URL} 
                            alt={item.NAME} 
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                     ) : (
                        <span className="text-6xl text-indigo-200 opacity-50 relative z-0">
                            <i className={`fa-solid ${getIcon(item.type)}`}></i>
                        </span>
                     )}
                     
                     <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent z-10"></div>
                     
                     <div className="absolute bottom-5 left-6 z-20 text-white w-[calc(100%-48px)]">
                        <span className="bg-white/20 backdrop-blur-md text-xs font-bold px-2 py-1 rounded mb-2 inline-block border border-white/30">
                            {getActivityTypeLabel(item.type)}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight drop-shadow-sm">{item.NAME}</h2>
                        
                        {/* Address Display (Header) */}
                        {item.ADDRESS && (
                            <p className="text-white/90 text-sm mt-1 flex items-center gap-1 font-medium truncate">
                                <MapPin size={14} className="text-white/80" />
                                {item.ADDRESS}
                            </p>
                        )}
                     </div>

                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-4 right-4 z-30 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-all ring-1 ring-white/10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-6">
                    
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3.5 rounded-2xl flex items-center gap-3 border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-0.5">소요 시간</p>
                                <p className="font-bold text-gray-900 leading-none">{item.STAY_TIME || 60}분</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3.5 rounded-2xl flex items-center gap-3 border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0 shadow-sm">
                                <Star size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-0.5">평점</p>
                                <p className="font-bold text-gray-900 leading-none">
                                    {item.RATING || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* [New] Representative Menu / Key Point */}
                    {item.HIGHTLIGHTS && (
                        <div className="border-t border-gray-100 pt-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                                <Utensils size={16} className="text-orange-500" />
                                {item.type === 'food' || item.type === 'cafe' ? '추천 메뉴' : '주요 포인트'}
                            </h3>
                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 text-sm font-medium text-gray-700 flex items-start gap-4">
                                <span className="bg-white text-orange-600 font-bold px-2 py-1 rounded text-xs border border-orange-200 shrink-0">
                                    HIT
                                </span>
                                {item.HIGHTLIGHTS.join(', ')}
                            </div>
                        </div>
                    )}
                    {/* [New] Representative Menu / Key Point */}
                    {item.HIGHTLIGHTS && (
                        <div className="border-t border-gray-100 pt-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                                <Utensils size={16} className="text-orange-500" />
                                {item.type === 'food' || item.type === 'cafe' ? '추천 메뉴' : '주요 포인트'}
                            </h3>
                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 text-sm font-medium text-gray-700 flex items-start gap-4">
                                <span className="bg-white text-orange-600 font-bold px-2 py-1 rounded text-xs border border-orange-200 shrink-0">
                                    HIT
                                </span>
                                {item.HIGHTLIGHTS.join(', ')}
                            </div>
                        </div>
                    )}

                    {/* [New] Location Info (Address) */}
                    {item.ADDRESS && (
                        <div className="border-t border-gray-100 pt-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                                <MapPin size={16} className="text-rose-500" />
                                위치 정보
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm md:text-base font-medium text-gray-800 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-400 font-normal">도로명 주소</span>
                                    <span>{item.ADDRESS}</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                                    <i className="fa-solid fa-copy text-xs"></i>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* [New] Booking Buttons (Only for Stay) */}
                    {item.type === 'stay' && (
                        <div className="border-t border-gray-100 pt-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                                <BedDouble size={18} className="text-indigo-600" />
                                최저가 예약하기
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {(Object.keys(BOOKING_PLATFORMS) as BookingPlatform[]).map((platform) => (
                                    <button
                                        key={platform}
                                        onClick={() => handleBooking(platform)}
                                        className={cn(
                                            "py-3 rounded-xl border transition-all font-bold shadow-sm flex items-center justify-center gap-2",
                                            BOOKING_PLATFORMS[platform].style
                                        )}
                                    >
                                        {BOOKING_PLATFORMS[platform].name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>


                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="flex-1 py-3.5 rounded-xl font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        닫기
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}

// Helper Functions
function getIcon(type: string) {
    switch (type) {
        case 'move': return "fa-plane";
        case 'food': return "fa-utensils";
        case 'cafe': return "fa-coffee";
        case 'sightseeing': return "fa-camera";
        case 'stay': return "fa-hotel";
        default: return "fa-map-pin";
    }
}

function getActivityTypeLabel(type: string) {
    const map: Record<string, string> = {
        sightseeing: '관광',
        food: '식사',
        cafe: '카페',
        stay: '숙소',
        move: '이동',
        etc: '기타'
    };
    return map[type] || '기타';
}

"use client"

import { PlanItem } from "@/types/place";
import { RainyScheduleItem } from '@/lib/weather/actions';
import { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from 'clsx';

// Atom Components
import { Marker } from "./day-item-parts/Marker";
import { ActionMenu } from "./day-item-parts/ActionMenu";
import { ContentBody } from "./day-item-parts/ContentBody";
import { TravelTime } from "./day-item-parts/TravelTime";
import DetailPopup from "./DetailPopup";
import { openBooking, BOOKING_PLATFORMS, BookingPlatform } from "@/lib/bookingService";

interface DayItemsProps {
    item: PlanItem;
    index: number;
    onClick?: () => void;
    selected?: boolean;
    draggableProps?: DraggableProvidedDraggableProps;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
    innerRef?: (element: HTMLElement | null) => void;
    isDragging?: boolean;
    onReplaceClick?: (e: React.MouseEvent) => void;
    onLockClick?: (e: React.MouseEvent) => void;
    onDeleteClick?: (e: React.MouseEvent) => void;
    onAddStopClick?: (e: React.MouseEvent) => void;
    onPlanBClick?: (e: React.MouseEvent) => void;
    rainRisk?: RainyScheduleItem;
    isLastItem?: boolean;
}

/**
 * @desc 여행 일정의 개별 아이템을 표시하는 컴포넌트 (Wrapper)
 *       Atomic Design 원칙에 따라 내부 요소를 서브 컴포넌트로 분리하였습니다.
 */
export default function DayItems({
    item,
    index,
    onClick,
    selected,
    draggableProps,
    dragHandleProps,
    innerRef,
    isDragging,
    onReplaceClick,
    onLockClick,
    onDeleteClick,
    onAddStopClick,
    onPlanBClick,
    rainRisk,
    isLastItem
}: DayItemsProps) {
    
    // [New] 상세보기 팝업 상태 관리
    // DayItems 내부에 상태를 두어 독립적으로 관리합니다.
    const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);

    return (
        <div
            ref={innerRef}
            {...draggableProps}
            {...dragHandleProps}
            className={clsx(
                "day-item-container",
                isDragging && "day-dragging"
            )}
            onClick={onClick}
        >
            <div className="day-item-inner">
                
                {/* 1. 좌측 순서 마커 */}
                <Marker 
                    index={index} 
                    selected={selected} 
                />

                {/* 2. 메인 카드 영역 */}
                <div
                    className={clsx(
                        "day-card",
                        selected && "day-selected",
                        rainRisk && "day-rain-risk"
                    )}
                >
                    {/* A. 우측 상단 메뉴 & 액션 (Lock, Menu) */}
                    <ActionMenu 
                        item={item} 
                        onLockClick={onLockClick} 
                        onReplaceClick={onReplaceClick} 
                        onDeleteClick={onDeleteClick} 
                    />

                    {/* B. 카드 본문 (제목, 시간, 아이콘 등) */}
                    <ContentBody 
                        item={item} 
                        selected={selected} 
                        rainRisk={rainRisk} 
                        onPlanBClick={onPlanBClick} 
                    />

                    {/* C. [New] 확장된 간략 정보 (SlideDown Effect) */}
                    <AnimatePresence>
                        {selected && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                <div className="day-extended-container">
                                    
                                    {/* 간략 정보 표시 */}
                                    <div className="day-duration-box">
                                        <div className="day-duration-info">
                                            <i className="fa-regular fa-clock text-indigo-400"></i>
                                            <span>
                                                소요시간 <strong className="day-duration-time">{item.STAY_TIME || 60}분</strong>
                                            </span>
                                        </div>
                                        {/* 상세보기 버튼 */}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDetailPopupOpen(true);
                                            }}
                                            className="day-detail-button"
                                        >
                                            상세보기 <i className="fa-solid fa-chevron-right text-[10px]"></i>
                                        </button>
                                    </div>
                                    
                                    
                                    {/* (옵션) 간단한 팁이나 추가 정보 한 줄 */}
                                    {item.HIGHTLIGHTS && (
                                        <div className="day-highlights">
                                            <i className="fa-solid fa-quote-left text-gray-300"></i>
                                            <span className="line-clamp-1">{item.HIGHTLIGHTS}</span>
                                        </div>
                                    )}

                                    {/* [New] 숙소 예약 버튼 (확장 시 노출) */}
                                    {item.type === 'stay' && (
                                        <div className="day-booking-container">
                                            <p className="day-booking-title">
                                                <i className="fa-solid fa-bed text-indigo-500"></i> 최저가 예약하기
                                            </p>
                                            <div className="day-booking-grid">
                                                {(Object.keys(BOOKING_PLATFORMS) as BookingPlatform[]).map((platform) => (
                                                    <button
                                                        key={platform}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const today = new Date();
                                                            const checkInDate = new Date(today);
                                                            checkInDate.setDate(today.getDate() + item.day);
                                                            
                                                            const checkOutDate = new Date(checkInDate);
                                                            checkOutDate.setDate(checkInDate.getDate() + 1);

                                                            const inStr = checkInDate.toISOString().split('T')[0];
                                                            const outStr = checkOutDate.toISOString().split('T')[0];

                                                            openBooking(platform, item.NAME, inStr, outStr);
                                                        }}
                                                        className={cn(
                                                            "day-booking-button",
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 3. 하단 이동 시간 및 경유 추가 버튼 */}
            {!isLastItem && (
                <TravelTime onAddStopClick={onAddStopClick} />
            )}

            {/* [New] 상세 정보 팝업 (Portal로 렌더링됨) */}
            <DetailPopup 
                item={item}
                isOpen={isDetailPopupOpen}
                onClose={() => setIsDetailPopupOpen(false)}
            />
        </div>
    );
}

"use client"

import { PlanItem } from "@/mockData";
import { RainyScheduleItem } from '@/lib/weather/actions';
import { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Atom Components
import { Marker } from "./day-item-parts/Marker";
import { ActionMenu } from "./day-item-parts/ActionMenu";
import { ContentBody } from "./day-item-parts/ContentBody";
import { TravelTime } from "./day-item-parts/TravelTime";
import DetailPopup from "./DetailPopup";

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
            className={cn(
                "min-w-[90%] relative mb-0 transition-opacity",
                isDragging ? 'opacity-80 z-50' : 'opacity-100'
            )}
            onClick={onClick}
        >
            <div className="relative flex gap-3 md:gap-5 group">
                
                {/* 1. 좌측 순서 마커 */}
                <Marker 
                    index={index} 
                    selected={selected} 
                />

                {/* 2. 메인 카드 영역 */}
                <div
                    className={cn(
                        "flex-1 bg-white p-4 md:p-5 rounded-2xl shadow-sm border transition-all duration-300 relative cursor-pointer group/card overflow-hidden",
                        selected 
                            ? 'border-[#4338CA] ring-1 ring-[#4338CA]' 
                            : 'border-gray-100 hover:border-indigo-300 hover:shadow-md',
                        rainRisk && 'border-l-4 border-l-red-500'
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
                                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 gap-3">
                                    
                                    {/* 간략 정보 표시 */}
                                    <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <i className="fa-regular fa-clock text-indigo-400"></i>
                                            <span>
                                                소요시간 <strong className="text-gray-800">{item.duration || 60}분</strong>
                                            </span>
                                        </div>
                                        {/* 상세보기 버튼 */}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDetailPopupOpen(true);
                                            }}
                                            className="ml-auto text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex items-center gap-1 shadow-sm"
                                        >
                                            상세보기 <i className="fa-solid fa-chevron-right text-[10px]"></i>
                                        </button>
                                    </div>
                                    
                                    {/* (옵션) 간단한 팁이나 추가 정보 한 줄 */}
                                    {item.memo && (
                                        <div className="text-xs text-gray-400 px-1 flex items-center gap-2">
                                            <i className="fa-solid fa-quote-left text-gray-300"></i>
                                            <span className="line-clamp-1">{item.memo}</span>
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
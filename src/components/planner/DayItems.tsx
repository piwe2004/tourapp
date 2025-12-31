"use client"

import { PlanItem } from "@/types/place";
import { RainyScheduleItem } from '@/lib/weather/actions';
import { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { clsx } from 'clsx';
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
 * @desc 여행 일정 아이템 (Premium Card Style)
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
    
    // 상세보기 팝업 상태
    const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);

    // 카드 클릭 핸들러: 선택 상태가 아니면 선택, 이미 선택 상태면 팝업 오픈
    const handleCardClick = () => {
        if (!selected) {
            onClick?.();
        } else {
            setIsDetailPopupOpen(true);
        }
    };

    return (
        <>
            <div
                ref={innerRef}
                {...draggableProps}
                {...dragHandleProps}
                className={clsx(
                    "relative pl-6 pr-2 py-1 transition-all", // Timeline alignment padding
                    isDragging && "z-50 scale-105 opacity-90"
                )}
            >
                <div className="flex gap-4 items-start">
                    
                    {/* 1. Left Marker (Connecting Line context moved to PlannerTimeline or managed here via absolute line) */}
                    <div className="shrink-0 pt-2 z-10 relative">
                        <Marker index={index} selected={selected} />
                        {/* Dot indicator if needed */}
                    </div>

                    {/* 2. Main Card */}
                    <motion.div
                        layout
                        onClick={handleCardClick}
                        className={clsx(
                            "flex-1 relative bg-white rounded-2xl border transition-all duration-200 group cursor-pointer",
                            selected 
                                ? "border-emerald-400 shadow-md ring-1 ring-emerald-100" 
                                : "border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md",
                            rainRisk && "border-red-200 bg-red-50/10"
                        )}
                    >
                        {/* Card Inner Padding */}
                        <div className="p-4 flex flex-col gap-2">
                            
                            {/* Actions (Absolute Top Right) */}
                            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ActionMenu 
                                    item={item} 
                                    onLockClick={onLockClick} 
                                    onReplaceClick={onReplaceClick} 
                                    onDeleteClick={onDeleteClick} 
                                />
                            </div>

                            {/* Main Content */}
                            <ContentBody 
                                item={item} 
                                selected={selected} 
                                rainRisk={rainRisk} 
                                onPlanBClick={onPlanBClick} 
                            />

                            {/* Expanded View (Optional: Quick Actions or Mini Detail) */}
                            <AnimatePresence>
                                {selected && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-3 mt-1 border-t border-slate-50 flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-medium">
                                                한 번 더 클릭하면 상세정보를 볼 수 있어요
                                            </span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsDetailPopupOpen(true);
                                                }}
                                                className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                상세보기 <i className="fa-solid fa-arrow-right"></i>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* 3. Travel Time Connector */}
                {!isLastItem && (
                    <div className="pl-[50px] pr-4 py-2">
                        <TravelTime onAddStopClick={onAddStopClick} />
                    </div>
                )}
            </div>

            {/* Detail Popup (Portal) */}
            <DetailPopup 
                item={item}
                isOpen={isDetailPopupOpen}
                onClose={() => setIsDetailPopupOpen(false)}
            />
        </>
    );
}

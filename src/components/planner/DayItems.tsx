"use client"

/**
 * -------------------------------------------------------------------------
 * @file        : src/components/planner/DayItems.tsx
 * @description : 여행 일정의 개별 아이템(카드) 컴포넌트
 * @author      : MIN
 * @date        : 2026-01-04
 * -------------------------------------------------------------------------
 * @history
 * - 2026-01-04 MIN : 최초 작성
 * -------------------------------------------------------------------------
 */


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
    isLastItem,
    className // [New]
}: DayItemsProps & { className?: string }) {

    // 상세보기 팝업 상태
    const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);

    // 카드 클릭 핸들러
    const handleCardClick = () => {
        if (!selected) {
            onClick?.();
        } else {
            setIsDetailPopupOpen(true);
        }
    };

    return (
        <>
            <motion.div
                layout
                onClick={handleCardClick}
                className={clsx(
                    "day-card", // keeping original class for global styles just in case
                    selected && "selected",
                    rainRisk && "rain-risk",
                    className // Apply module styles.card
                )}
            >
                {/* Card Inner Padding & Content */}
                <div className="card-content relative">
                    
                    {/* Actions Menu (Absolute Top Right) - keeping existing logic but maybe needing adjustment */}
                    <div className="absolute top-2 right-2 z-20">
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

                    {/* Expanded View */}
                    <AnimatePresence>
                        {selected && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="expanded-view mt-3 pt-3 border-t border-slate-100"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500">
                                        상세정보를 확인하려면 클릭하세요
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsDetailPopupOpen(true);
                                        }}
                                        className="text-xs font-bold text-indigo-600 flex items-center gap-1"
                                    >
                                        상세보기 <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Detail Popup (Portal) */}
            <DetailPopup
                item={item}
                isOpen={isDetailPopupOpen}
                onClose={() => setIsDetailPopupOpen(false)}
            />
        </>
    );
}

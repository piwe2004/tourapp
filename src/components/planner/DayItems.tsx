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
                    "day-item-wrapper",
                    isDragging && "is-dragging"
                )}
            >
                <div className="day-item-inner">

                    {/* 1. Left Marker */}
                    <div className="marker-wrapper">
                        <Marker index={index} selected={selected} />
                    </div>

                    {/* 2. Main Card */}
                    <motion.div
                        layout
                        onClick={handleCardClick}
                        className={clsx(
                            "day-card",
                            selected && "selected",
                            rainRisk && "rain-risk"
                        )}
                    >
                        {/* Card Inner Padding */}
                        <div className="card-content">

                            {/* Actions (Absolute Top Right) */}
                            <div className="actions-wrapper">
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
                                        className="expanded-view"
                                    >
                                        <div className="expanded-content">
                                            <span className="hint-text">
                                                한 번 더 클릭하면 상세정보를 볼 수 있어요
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsDetailPopupOpen(true);
                                                }}
                                                className="detail-button"
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
                    <div className="travel-time-connector">
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

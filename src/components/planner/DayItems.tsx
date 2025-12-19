"use client"

import { PlanItem } from "@/mockData";
import { RainyScheduleItem } from '@/lib/weather/actions';
import { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { cn } from "@/lib/utils";

// Atom Components
import { Marker } from "./day-item-parts/Marker";
import { ActionMenu } from "./day-item-parts/ActionMenu";
import { ContentBody } from "./day-item-parts/ContentBody";
import { TravelTime } from "./day-item-parts/TravelTime";

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
                        "flex-1 bg-white p-4 md:p-5 rounded-2xl shadow-sm border transition-all duration-300 relative cursor-pointer group/card",
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
                </div>
            </div>

            {/* 3. 하단 이동 시간 및 경유 추가 버튼 */}
            {!isLastItem && (
                <TravelTime onAddStopClick={onAddStopClick} />
            )}
        </div>
    );
}
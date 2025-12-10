"use client"

import { PlanItem } from "@/mockData";
import { RainyScheduleItem } from '@/lib/weather/actions';
import { useState, useEffect, useRef } from "react";
import { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

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

// ... (imports remain same)

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const isExternal = String(item.id).startsWith('naver-');

    return (
        <div
            ref={innerRef}
            {...draggableProps}
            {...dragHandleProps}
            className={`min-w-[90%] relative mb-0 transition-opacity ${isDragging ? 'opacity-80 z-50' : 'opacity-100'}`}
            onClick={onClick}
        >
            <div className="relative flex gap-3 md:gap-5 group">
                {/* Marker */}
                <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full border-[3px] font-bold text-[10px] md:text-xs flex items-center justify-center z-10 shrink-0 shadow-sm mt-1 transition-all duration-300 relative ${selected || rainRisk
                        ? 'bg-[#4338CA] border-white text-white ring-4 ring-indigo-50 scale-110'
                        : 'bg-white border-indigo-100 text-gray-400 group-hover:border-[#4338CA] group-hover:text-[#4338CA]'
                    }`}>
                    {index + 1}
                </div>

                {/* Card */}
                <div
                    className={`flex-1 bg-white p-4 md:p-5 rounded-2xl shadow-sm border transition-all duration-300 relative cursor-pointer group/card ${selected ? 'border-[#4338CA] ring-1 ring-[#4338CA]' : 'border-gray-100 hover:border-indigo-300 hover:shadow-md'
                        } ${rainRisk ? 'border-l-4 border-l-red-500' : ''}`}
                >
                    {/* Lock Toggle (Top Right) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onLockClick?.(e); }}
                        className={`absolute top-4 right-10 w-auto h-auto rounded-full transition z-20 ${item.isLocked
                                ? 'text-[#4338CA] opacity-100'
                                : ''
                            }`}
                        title={item.isLocked ? "고정 해제" : "일정 고정"}
                    >
                        {item.isLocked ? <i className="fa-solid fa-lock text-[14px]"></i> : ''}
                    </button>

                    {/* Menu Button (Top Right Absolute) */}
                    <div className="absolute top-3 right-3 z-30" ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="p-1 px-2 text-gray-300 hover:text-gray-600 rounded transition-colors"
                        >
                            <i className="fa-solid fa-ellipsis-vertical text-[16px]"></i>
                        </button>
                        {isMenuOpen && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-6 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[140px] flex flex-col overflow-hidden animate-fade-in z-50 text-sm"
                            >
                                <div className="flex justify-between px-3 py-2 border-b border-gray-50 text-xs text-gray-400 font-bold">
                                    메뉴 <button onClick={() => setIsMenuOpen(false)}><i className="fa-solid fa-xmark text-[12px]"></i></button>
                                </div>
                                <button className="text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2" onClick={(e) => { onLockClick?.(e); setIsMenuOpen(false); }}>
                                    {item.isLocked ? <i className="fa-solid fa-unlock text-[14px]"></i> : <i className="fa-solid fa-lock text-[14px]"></i>} {item.isLocked ? '고정 해제' : '일정 고정'}
                                </button>
                                {!item.isLocked && (
                                    <>
                                        <button className="text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2" onClick={(e) => { onReplaceClick?.(e); setIsMenuOpen(false); }}>
                                            <i className="fa-solid fa-wand-magic-sparkles text-[14px]"></i> 장소 교체
                                        </button>
                                        <button className="text-left px-4 py-3 hover:bg-red-50 text-red-500 flex items-center gap-2 border-t border-gray-50" onClick={(e) => { onDeleteClick?.(e); setIsMenuOpen(false); }}>
                                            <i className="fa-solid fa-trash text-[14px]"></i> 삭제
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Alert Badge */}
                    {rainRisk && (
                        <div className="absolute -top-3 -right-2 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm animate-bounce z-40">
                            <i className="fa-solid fa-umbrella text-[10px]"></i> 비 예보 {rainRisk.weather.pop}
                        </div>
                    )}

                    {/* Time & Badges */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs md:text-[13px] font-bold px-2 py-0.5 rounded border ${selected ? 'bg-[#4338CA] text-white border-[#4338CA]' : 'bg-gray-50 text-gray-600 border-gray-100'
                            }`}>
                            {item.time}
                        </span>
                        {isExternal && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200" title="네이버 검색 결과">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> N 검색
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex gap-3 md:gap-4">
                        {/* Fallback UI Icon */}
                        <div className={`w-10 h-10 md:w-[52px] md:h-[52px] rounded-2xl flex items-center justify-center text-lg md:text-xl shrink-0 ${rainRisk ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-[#4338CA]'
                            }`}>
                            {getIcon(item.type)}
                        </div>
                        <div className="flex-1 pr-6">
                            <h3 className="text-[15px] md:text-[16px] font-bold text-gray-900 leading-tight mb-1">
                                {item.activity}
                                {rainRisk && <span className="ml-2 text-[10px] text-gray-400 border border-gray-200 px-1 rounded font-normal">야외</span>}
                            </h3>
                            <p className="text-xs text-gray-400 font-medium line-clamp-1">
                                {item.memo || "상세 설명이 없습니다."}
                            </p>
                        </div>
                    </div>

                    {/* Plan B Button */}
                    {rainRisk && rainRisk.recommendations.length > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onPlanBClick?.(e); }}
                            className="w-full mt-3 md:mt-4 py-2.5 md:py-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4338CA] text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all border border-indigo-100 hover:shadow-md group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <i className="fa-solid fa-wand-magic-sparkles text-[#4338CA] relative z-10 text-[14px] md:text-[16px]"></i>
                            <span className="relative z-10">비 오면 여기 어때요? (실내 추천)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Travel Time */}
            {!isLastItem && (
                <div className="flex items-center gap-3 ml-[4px] mb-2 mt-2 md:mb-5 md:mt-5 relative z-0 pl-8 md:pl-10 opacity-70">
                    <div className="flex flex-col items-center gap-1">
                        {/* Dots replaced by continuous line effect handled by main line in Page */}
                    </div>
                    <div className="flex items-center justify-left w-full -ml-2 relative">
                        {/* Badge aligned relative to line */}
                        <span className="text-[10px] md:text-[14px] font-bold text-gray-500 bg-white border border-gray-200 px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm flex items-center gap-1.5 hover:border-indigo-300 transition-colors z-10">
                            <i className="fa-solid fa-car text-indigo-400 text-[10px] md:text-[12px]"></i>
                            <span>40분 이동</span>
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddStopClick?.(e);
                            }}
                            className="absolute left-40 md:left-50 w-6 h-6 md:w-7 md:h-7 ml-2 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 shadow-sm hover:border-[#4338CA] hover:bg-[#4338CA] hover:text-white transition-all transform hover:scale-105 active:scale-95 z-10"
                            title="경유지 추가"
                        >
                            <i className="fa-solid fa-plus text-[12px] md:text-[14px]"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Icon Mapper using FontAwesome
function getIcon(type: string) {
    switch (type) {
        case 'move': return <i className="fa-solid fa-plane text-[14px] md:text-[16px]"></i>;
        case 'food': return <i className="fa-solid fa-utensils text-[14px] md:text-[16px]"></i>;
        case 'cafe': return <i className="fa-solid fa-mug-hot text-[14px] md:text-[16px]"></i>;
        case 'sightseeing': return <i className="fa-solid fa-camera text-[14px] md:text-[16px]"></i>;
        case 'stay': return <i className="fa-solid fa-hotel text-[14px] md:text-[16px]"></i>;
        default: return <i className="fa-solid fa-map-pin text-[14px] md:text-[16px]"></i>;
    }
}
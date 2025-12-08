"use client"

import { PlanItem } from "@/mockData";
import { Clock, RefreshCw, Lock, LockOpen } from "lucide-react";
import { getIconByType } from "../ui/MapIcons";
import { useRef, useState } from "react";

export default function DayItems({ item, index, onClick, selected, draggableProps, dragHandleProps, innerRef, isDragging, onReplaceClick, onLockClick }: { 
    item: PlanItem; 
    index: number; 
    onClick?: () => void; 
    selected?: boolean;
    draggableProps?: any;
    dragHandleProps?: any;
    innerRef?: (element: HTMLElement | null) => void;
    isDragging?: boolean;
    onReplaceClick?: (e: React.MouseEvent) => void;
    onLockClick?: (e: React.MouseEvent) => void;
}) {
    const localRef = useRef<HTMLDivElement>(null);
    const [dragWidth, setDragWidth] = useState<number | undefined>(undefined);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (localRef.current) {
            setDragWidth(localRef.current.offsetWidth);
        }
        if (dragHandleProps?.onPointerDown) {
            dragHandleProps.onPointerDown(e);
        }
    };

    // Merge refs
    const setRefs = (element: HTMLDivElement | null) => {
        localRef.current = element;
        if (innerRef) {
            innerRef(element);
        }
    };

    return(
         <div 
            key={item.id} 
            onClick={onClick} 
            ref={setRefs}
            {...draggableProps}
            {...dragHandleProps}
            onPointerDown={handlePointerDown}
            className={`relative group animate-fade-in-up cursor-pointer transition-all duration-200
                ${isDragging ? 'z-50 scale-105 opacity-90 shadow-2xl' : 'w-full min-w-[70%]'}
            `}
            style={isDragging && dragWidth ? { ...draggableProps?.style, width: `${dragWidth}px` } : draggableProps?.style}
         >
            <div className={`hidden md:block absolute -left-[51px] top-6 w-5 h-5 border-4 rounded-full z-10 shadow-sm transition-colors
                ${item.isLocked ? 'bg-indigo-600 border-indigo-200' : 'bg-white border-indigo-500'}
            `}></div>
            <div className={`bg-white p-5 rounded-2xl border transition-all h-full flex flex-col justify-start
                ${selected 
                    ? 'border-indigo-500 shadow-md ring-2 ring-indigo-100' 
                    : item.isLocked 
                        ? 'border-indigo-200 bg-indigo-50/10 shadow-sm'
                        : 'border-slate-200 shadow-sm hover:shadow-lg'
                }
            `}>
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider
                            ${item.isLocked ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50 text-indigo-600'}
                        `}>
                            <Clock size={10} /> {item.time}
                        </span>
                        {item.isLocked && (
                             <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">Fixed</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onLockClick?.(e);
                            }}
                            className={`p-1.5 rounded-full transition-all cursor-pointer group-hover:opacity-100
                                ${item.isLocked || selected
                                    ? 'text-indigo-600 bg-indigo-50 opacity-100' 
                                    : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0'
                                }
                            `}
                            title={item.isLocked ? "고정 해제" : "일정 고정"}
                        >
                            {item.isLocked ? <Lock size={14} /> : <LockOpen size={14} />}
                        </button>
                        {!item.isLocked && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReplaceClick?.(e);
                                }}
                                className={`p-1.5 text-slate-400 cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all group-hover:opacity-100
                                    ${selected ? 'opacity-100' : 'opacity-0'}
                                `}
                                title="장소 교체"
                            >
                                <RefreshCw size={14} />
                            </button>
                        )}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="bg-slate-50 p-2 rounded-full border border-slate-100">{getIconByType(item.type)}</div>
                    {item.activity}
                </h3>
                {item.memo && (
                    <div className="text-slate-600 text-sm bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                        <span className="mr-2">💡</span>{item.memo}
                    </div>
                )}
            </div>
        </div>
    )
}
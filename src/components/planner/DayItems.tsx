"use client"

import { PlanItem } from "@/mockData";
import { Clock, RefreshCw } from "lucide-react";
import { getIconByType } from "../ui/MapIcons";
import { useRef, useState } from "react";

export default function DayItems({ item, index, onClick, selected, draggableProps, dragHandleProps, innerRef, isDragging, onReplaceClick }: { 
    item: PlanItem; 
    index: number; 
    onClick?: () => void; 
    selected?: boolean;
    draggableProps?: any;
    dragHandleProps?: any;
    innerRef?: (element: HTMLElement | null) => void;
    isDragging?: boolean;
    onReplaceClick?: (e: React.MouseEvent) => void;
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
            <div className="hidden md:block absolute -left-[51px] top-6 w-5 h-5 bg-white border-4 border-indigo-500 rounded-full z-10 shadow-sm"></div>
            <div className={`bg-white p-5 rounded-2xl border transition-all h-full flex flex-col justify-start
                ${selected 
                    ? 'border-indigo-500 shadow-md ring-2 ring-indigo-100' 
                    : 'border-slate-200 shadow-sm hover:shadow-lg'
                }
            `}>
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Step {index + 1}</span>
                        <div className="flex items-center gap-1 text-slate-500 text-sm font-bold bg-slate-50 px-2 py-1 rounded-lg"><Clock size={14} /> {item.time}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onReplaceClick?.(e);
                            }}
                            className="p-1.5 text-slate-400 cursor-pointer hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            title="장소 교체"
                        >
                            <RefreshCw size={14} />
                        </button>
                        <div className="bg-slate-50 p-2 rounded-full border border-slate-100">{getIconByType(item.type)}</div>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.activity}</h3>
                {item.memo && (
                    <div className="text-slate-600 text-sm bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                        <span className="mr-2">💡</span>{item.memo}
                    </div>
                )}
            </div>
        </div>
    )
}
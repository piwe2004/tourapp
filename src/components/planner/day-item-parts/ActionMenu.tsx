'use client';

import { useState, useEffect, useRef } from "react";
import { PlanItem } from "@/mockData";

interface ActionMenuProps {
    item: PlanItem;
    onLockClick?: (e: React.MouseEvent) => void;
    onReplaceClick?: (e: React.MouseEvent) => void;
    onDeleteClick?: (e: React.MouseEvent) => void;
}

/**
 * @desc 카드 우측 상단의 '...' 메뉴 및 고정 버튼 로직
 */
export function ActionMenu({
    item,
    onLockClick,
    onReplaceClick,
    onDeleteClick
}: ActionMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // 메뉴 외부 클릭 시 닫기 로직
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

    return (
        <>
            {/* 고정(Lock) 토글 버튼 (우측 상단 노출) */}
            <button
                onClick={(e) => { e.stopPropagation(); onLockClick?.(e); }}
                className={`absolute top-4 right-10 w-auto h-auto rounded-full transition z-20 ${
                    item.isLocked ? 'text-[#4338CA] opacity-100' : ''
                }`}
                title={item.isLocked ? "고정 해제" : "일정 고정"}
            >
                {item.isLocked && <i className="fa-solid fa-lock text-[14px]"></i>}
            </button>

            {/* '...' 메뉴 버튼 */}
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

                {/* 드롭다운 메뉴 */}
                {isMenuOpen && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-6 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[140px] flex flex-col overflow-hidden animate-fade-in z-50 text-sm"
                    >
                        <div className="flex justify-between px-3 py-2 border-b border-gray-50 text-xs text-gray-400 font-bold">
                            메뉴 
                            <button onClick={() => setIsMenuOpen(false)}>
                                <i className="fa-solid fa-xmark text-[12px]"></i>
                            </button>
                        </div>
                        
                        {/* 1. 고정 토글 메뉴 */}
                        <button 
                            className="text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2" 
                            onClick={(e) => { onLockClick?.(e); setIsMenuOpen(false); }}
                        >
                            {item.isLocked 
                                ? <><i className="fa-solid fa-unlock text-[14px]"></i> 고정 해제</> 
                                : <><i className="fa-solid fa-lock text-[14px]"></i> 일정 고정</>
                            }
                        </button>

                        {/* 2. 장소 교체 및 삭제 (고정 안 된 경우만) */}
                        {!item.isLocked && (
                            <>
                                <button 
                                    className="text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2" 
                                    onClick={(e) => { onReplaceClick?.(e); setIsMenuOpen(false); }}
                                >
                                    <i className="fa-solid fa-wand-magic-sparkles text-[14px]"></i> 장소 교체
                                </button>
                                <button 
                                    className="text-left px-4 py-3 hover:bg-red-50 text-red-500 flex items-center gap-2 border-t border-gray-50" 
                                    onClick={(e) => { onDeleteClick?.(e); setIsMenuOpen(false); }}
                                >
                                    <i className="fa-solid fa-trash text-[14px]"></i> 삭제
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

'use client';

import { useState } from 'react';
import { X, Users, Minus, Plus } from 'lucide-react';

interface Guests {
    adult: number;
    teen: number;
    child: number;
}

interface GuestEditorProps {
    guests: Guests;
    onSave: (guests: Guests) => void;
    onClose: () => void;
    isInline?: boolean;
}

export default function GuestEditor({ guests, onSave, onClose, isInline = false }: GuestEditorProps) {
    const [tempGuests, setTempGuests] = useState<Guests>({ ...guests });

    const updateCount = (type: keyof Guests, delta: number) => {
        setTempGuests(prev => {
            const newValue = prev[type] + delta;
            if (newValue < 0) return prev; // 음수 방지
            return { ...prev, [type]: newValue };
        });
    };

    const totalGuests = tempGuests.adult + tempGuests.teen + tempGuests.child;

    const content = (
        <div className={`bg-white rounded-3xl ${isInline ? 'w-full p-6' : 'shadow-2xl w-full max-w-sm p-6 m-4'}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Users className="text-indigo-600" size={24} />
                    인원 선택
                </h3>
                {!isInline && (
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="space-y-6 mb-8">
                {/* 성인 */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-slate-900 text-lg">성인</p>
                        <p className="text-sm text-slate-400">만 19세 이상</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => updateCount('adult', -1)}
                            disabled={tempGuests.adult <= 0}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus size={18} />
                        </button>
                        <span className="font-bold text-xl w-6 text-center">{tempGuests.adult}</span>
                        <button
                            onClick={() => updateCount('adult', 1)}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                {/* 청소년 */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-slate-900 text-lg">청소년</p>
                        <p className="text-sm text-slate-400">만 13세 ~ 18세</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => updateCount('teen', -1)}
                            disabled={tempGuests.teen <= 0}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus size={18} />
                        </button>
                        <span className="font-bold text-xl w-6 text-center">{tempGuests.teen}</span>
                        <button
                            onClick={() => updateCount('teen', 1)}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                {/* 어린이 */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-slate-900 text-lg">어린이</p>
                        <p className="text-sm text-slate-400">만 12세 이하</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => updateCount('child', -1)}
                            disabled={tempGuests.child <= 0}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus size={18} />
                        </button>
                        <span className="font-bold text-xl w-6 text-center">{tempGuests.child}</span>
                        <button
                            onClick={() => updateCount('child', 1)}
                            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 mb-6 text-center">
                <p className="text-indigo-600 font-medium">총 <span className="font-bold text-xl">{totalGuests}</span>명 선택됨</p>
            </div>

            <button
                onClick={() => onSave(tempGuests)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
                인원 적용하기
            </button>
        </div>
    );

    if (isInline) return content;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            {content}
        </div>
    );
}

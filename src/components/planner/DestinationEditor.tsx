'use client';

import { useState } from 'react';
import { X, MapPin, Search } from 'lucide-react';

interface DestinationEditorProps {
    destination: string;
    onSave: (destination: string) => void;
    onClose: () => void;
    isInline?: boolean;
}

export default function DestinationEditor({ destination, onSave, onClose, isInline = false }: DestinationEditorProps) {
    const [tempDestination, setTempDestination] = useState(destination || '');

    // 추천 여행지 목록 (임시)
    const recommendedDestinations = ['제주도', '부산', '강릉', '경주', '여수', '전주'];

    const content = (
        <div className={`bg-white rounded-3xl ${isInline ? 'w-full p-6' : 'shadow-2xl w-full max-w-sm p-6 m-4'}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="text-indigo-600" size={24} />
                    여행지 선택
                </h3>
                {!isInline && (
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    value={tempDestination}
                    onChange={(e) => setTempDestination(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-lg text-slate-900 placeholder:text-slate-400"
                    placeholder="어디로 떠나시나요?"
                    autoFocus
                />
            </div>

            <div className="mb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">추천 여행지</p>
                <div className="flex flex-wrap gap-2">
                    {recommendedDestinations.map(dest => (
                        <button
                            key={dest}
                            onClick={() => setTempDestination(dest)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tempDestination === dest
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                        >
                            {dest}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={() => onSave(tempDestination)}
                disabled={!tempDestination.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                여행지 변경하기
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

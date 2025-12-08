import { useState } from 'react';
import { Sparkles, Calendar, Check, X, Layers } from 'lucide-react';
import ThemeSelector from '@/components/planner/ThemeSelector';
import { PlannerTheme } from '@/services/ReplanningService';

interface SmartMixModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (scope: number | 'all', theme: PlannerTheme) => void;
    totalDays: number;
    startDate: Date;
    loading?: boolean;
}

export default function SmartMixModal({ isOpen, onClose, onConfirm, totalDays, startDate, loading }: SmartMixModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedScope, setSelectedScope] = useState<number | 'all' | undefined>(undefined);
    const [selectedTheme, setSelectedTheme] = useState<PlannerTheme | undefined>(undefined);

    if (!isOpen) return null;

    const handleNext = () => {
        if (step === 1 && selectedScope !== undefined) {
            setStep(2);
        } else if (step === 2 && selectedTheme) {
            onConfirm(selectedScope!, selectedTheme);
        }
    };

    const getFormattedDate = (dayIndex: number) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + (dayIndex - 1));
        return `${date.getMonth() + 1}.${date.getDate()}`;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-scale-in">
                {/* Header */}
                <div className="bg-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Sparkles size={120} />
                    </div>
                    <h2 className="text-[18px] md:text-2xl font-bold flex items-center gap-2 relative z-10">
                        <Sparkles className="animate-pulse" /> 일정 재구성 하기
                    </h2>
                    <p className="text-[14px] md:text-[16px] opacity-90 mt-1 relative z-10 text-indigo-100">
                        해당일의 일정을 재구성해서 최적의 일정을 만들어드릴게요.
                    </p>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all z-20 cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 md:p-8">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-8 gap-4">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600 font-bold' : 'text-slate-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-indigo-100' : 'bg-slate-100'}`}>1</div>
                            변경 대상
                        </div>
                        <div className="w-5 md:w-12 h-[2px] bg-slate-100"></div>
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600 font-bold' : 'text-slate-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-indigo-100' : 'bg-slate-100'}`}>2</div>
                            테마 선택
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in-right">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 text-left md:text-center">어떤 일정을 변경할까요?</h3>
                            <div >
                                <button
                                    onClick={() => setSelectedScope('all')}
                                    className={`p-3 w-full mb-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group md:p-6
                                        ${selectedScope === 'all'
                                            ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50'
                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-3 rounded-full ${selectedScope === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            <Layers size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg text-slate-900">전체 일정</div>
                                            <div className="text-xs text-slate-500">모든 날짜의 빈 시간을 채웁니다</div>
                                        </div>
                                    </div>
                                    {selectedScope === 'all' && <div className="absolute top-4 right-4 text-indigo-600"><Check size={20} /></div>}
                                </button>

                                <div className="flex gap-2 flex-wrap justify-between items-start overflow-y-auto max-h-[200px]">
                                    {Array.from({ length: totalDays }).map((_, i) => {
                                        const day = i + 1;
                                        const dateStr = getFormattedDate(day);
                                        const isSelected = selectedScope === day;
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => setSelectedScope(day)}
                                                className={`w-[48%] md:w-[32%] p-2 rounded-xl border-2 flex items-center justify-between transition-all md:p-4
                                                    ${isSelected
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                                                        : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={18} className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                                                    <p className='flex flex-col items-start md:gap-2 md:flex-row'>
                                                        <span className="font-bold">Day {day}</span>
                                                        <span className="text-sm opacity-60">({dateStr})</span>
                                                    </p>
                                                </div>
                                                {isSelected && <Check size={16} className="text-indigo-600" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in-right">
                            <h3 className="text-lg font-bold text-slate-800 text-center">어떤 테마로 채워드릴까요?</h3>
                            <ThemeSelector onSelect={setSelectedTheme} selectedTheme={selectedTheme} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 md:p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    {step === 2 ? (
                        <button
                            onClick={() => setStep(1)}
                            className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-200 transition-all"
                        >
                            이전 단계
                        </button>
                    ) : (
                        <div></div>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={loading || (step === 1 && !selectedScope) || (step === 2 && !selectedTheme)}
                        className={`
                            px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2
                            ${loading || (step === 1 && !selectedScope) || (step === 2 && !selectedTheme)
                                ? 'bg-slate-300 cursor-not-allowed transform-none'
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1'
                            }
                        `}
                    >
                        {loading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {step === 1 ? '다음 단계' : '일정 재생성 시작'}
                    </button>
                </div>
            </div>
        </div>
    );
}

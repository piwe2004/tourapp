import { useState } from 'react';
import { Sparkles, X, ChevronRight, Check } from 'lucide-react';
import { PlanItem } from '@/types/place';
import clsx from 'clsx';
import { PlannerTheme } from '@/services/ReplanningService';

interface SmartMixModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (scope: number | 'all', theme: PlannerTheme) => void;
    currentSchedule: PlanItem[];
    days: number[];
}

export default function SmartMixModal({
    isOpen,
    onClose,
    onConfirm,
    days
}: SmartMixModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedScope, setSelectedScope] = useState<number | 'all' | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<PlannerTheme | null>(null);

    if (!isOpen) return null;

    const handleNext = () => {
        if (step === 1 && selectedScope) {
            setStep(2);
        } else if (step === 2 && selectedTheme) {
            onConfirm(selectedScope!, selectedTheme);
            // Reset & Close
            setStep(1);
            setSelectedScope(null);
            setSelectedTheme(null);
        }
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
    };

    const isNextEnabled = (step === 1 && selectedScope) || (step === 2 && selectedTheme);

    return (
        <div className="smart-mix-modal-overlay" onClick={onClose}>
            <div className="smart-mix-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="smart-mix-modal-header">
                    <div className="bg-icon">
                        <Sparkles size={120} />
                    </div>
                    <h3>
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                        <span>스마트 일정 재구성</span>
                    </h3>
                    <p>AI가 최적의 동선과 테마로 일정을 다시 짜드려요</p>
                    
                    <button onClick={onClose} className="plan-b-modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="smart-mix-modal-body">
                    {/* Stepper */}
                    <div className="smart-mix-modal-stepper">
                        <div className={clsx("step", step === 1 ? "active" : "inactive")}>
                            <div className="circle">1</div>
                            <span>범위 선택</span>
                        </div>
                        <div className="line"></div>
                        <div className={clsx("step", step === 2 ? "active" : "inactive")}>
                            <div className="circle">2</div>
                            <span>테마 선택</span>
                        </div>
                    </div>

                    {/* Step 1: Scope Selection */}
                    {step === 1 && (
                        <div className="smart-mix-modal-step-content">
                            <h3>어떤 일정을 변경할까요?</h3>
                            
                            <button
                                className={clsx(
                                    "smart-mix-modal-btn-all",
                                    selectedScope === 'all' && "selected"
                                )}
                                onClick={() => setSelectedScope('all')}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 transition-colors",
                                        selectedScope === 'all' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"
                                    )}>
                                        <Sparkles size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg text-slate-900">전체 일정 최적화</div>
                                        <div className="text-sm text-slate-500">여행 전체의 동선과 테마를 고려해 새로 구성합니다</div>
                                    </div>
                                </div>
                                {selectedScope === 'all' && (
                                    <div className="absolute top-4 right-4 text-indigo-600">
                                        <Check size={20} />
                                    </div>
                                )}
                            </button>

                            <div className="grid grid-cols-3 gap-3 mt-4">
                                {days.map((day) => (
                                    <button
                                        key={day}
                                        className={clsx(
                                            "p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2",
                                            selectedScope === day 
                                                ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                                                : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-600"
                                        )}
                                        onClick={() => setSelectedScope(day)}
                                    >
                                        <div className="font-bold text-lg">Day {day}</div>
                                        {selectedScope === day && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Theme Selection */}
                    {step === 2 && (
                        <div className="smart-mix-modal-step-content">
                            <h3>어떤 스타일로 꾸며볼까요?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'optimized', label: '동선 최적화', desc: '이동거리를 최소화한 효율적인 일정', icon: '⚡️' },
                                    { id: 'healing', label: '여유/힐링', desc: '자연 속에서 즐기는 여유로운 여행', icon: '🌿' },
                                    { id: 'hotplace', label: 'SNS 핫플', desc: '사진 찍기 좋은 트렌디한 장소', icon: '📸' },
                                    { id: 'activity', label: '액티비티', desc: '활동적이고 신나는 체험 위주', icon: '🏃' },
                                    { id: 'foodie', label: '식도락', desc: '맛집 탐방 중심의 맛있는 여행', icon: '🍽️' },
                                    { id: 'kids', label: '아이와 함께', desc: '가족 단위 여행객을 위한 코스', icon: '👨‍👩‍👧‍👦' },
                                ].map((theme) => (
                                    <button
                                        key={theme.id}
                                        className={clsx(
                                            "p-4 rounded-xl border-2 text-left transition-all",
                                            selectedTheme === theme.id 
                                                ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-50" 
                                                : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                                        )}
                                        onClick={() => setSelectedTheme(theme.id as PlannerTheme)}
                                    >
                                        <div className="text-2xl mb-2">{theme.icon}</div>
                                        <div className="font-bold text-slate-900">{theme.label}</div>
                                        <div className="text-xs text-slate-500 mt-1">{theme.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="smart-mix-modal-footer">
                    {step === 1 ? (
                        <button onClick={onClose} className="smart-mix-modal-btn-cancel">
                            취소
                        </button>
                    ) : (
                        <button onClick={handleBack} className="smart-mix-modal-btn-cancel">
                            이전
                        </button>
                    )}
                    
                    <button 
                        onClick={handleNext}
                        disabled={!isNextEnabled}
                        className={clsx(
                            "smart-mix-modal-btn-confirm",
                            !isNextEnabled && "opacity-50 cursor-not-allowed"
                        )}
                        style={{ marginTop: 0, width: 'auto', padding: '12px 32px' }} // Override specific styles for footer layout
                    >
                        <span>{step === 1 ? '다음' : '일정 생성하기'}</span>
                        <ChevronRight size={18} className="inline ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
}

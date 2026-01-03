'use client';

import { X, Map as MapIcon, CloudRain, Check } from 'lucide-react';
import { PlanItem } from '@/types/place';
import Map from '@/components/planner/Map';
import { RainyScheduleItem } from '@/lib/weather/plan-b';
import DateEditor from '@/components/planner/DateEditor';
import PlaceReplacementModal from '@/components/planner/PlaceReplacementModal';
import DestinationEditor from '@/components/planner/DestinationEditor';
import SmartMixModal from '@/components/planner/SmartMixModal';
import { PlannerTheme } from '@/services/ReplanningService';
import GuestEditor from '@/components/planner/GuestEditor';

interface PlannerModalsProps {
    isPlanBOpen: boolean;
    onPlanBClose: () => void;
    rainRisks: RainyScheduleItem[];

    activeEditor: 'date' | 'destination' | 'guest' | null;
    onEditorClose: () => void;

    dateRange: { start: Date, end: Date };
    onDateSave: (start: Date, end: Date) => void;

    destination: string;
    onDestSave: (dest: string) => void;

    guests: { adult: number, teen: number, child: number };
    onGuestsSave: (guests: { adult: number, teen: number, child: number }) => void;

    replaceModalState: {
        isOpen: boolean;
        targetItem: PlanItem | null;
        mode: 'replace' | 'add';
    };
    onReplaceClose: () => void;
    onReplaceConfirm: (newItem: PlanItem) => void;

    isSmartMixOpen: boolean;
    onSmartMixClose: () => void;
    onSmartMixConfirm: (scope: number | 'all', theme: PlannerTheme) => void;

    schedule: PlanItem[];
    days: number[];

    isMobileMapOpen: boolean;
    onMobileMapClose: () => void;

    selectedDay: number;
    selectedItemId: string | null;
    onItemClick: (id: string) => void;

    confirmState: {
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    };
    onConfirmClose: () => void;
}

export default function PlannerModals({
    isPlanBOpen,
    onPlanBClose,
    rainRisks,
    activeEditor,
    onEditorClose,
    dateRange,
    onDateSave,
    destination,
    onDestSave,
    guests,
    onGuestsSave,
    replaceModalState,
    onReplaceClose,
    onReplaceConfirm,
    isSmartMixOpen,
    onSmartMixClose,
    onSmartMixConfirm,
    schedule,
    days,
    isMobileMapOpen,
    onMobileMapClose,
    selectedDay,
    selectedItemId,
    onItemClick,
    confirmState,
    onConfirmClose
}: PlannerModalsProps) {
    return (
        <>
            {/* 1. Date Editor */}
            {activeEditor === 'date' && (
                <DateEditor
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onSave={onDateSave}
                    onClose={onEditorClose}
                />
            )}

            {/* 2. Destination Editor */}
            {activeEditor === 'destination' && (
                <DestinationEditor
                    destination={destination}
                    onSave={onDestSave}
                    onClose={onEditorClose}
                />
            )}

            {/* 3. Guest Editor */}
            {activeEditor === 'guest' && (
                <GuestEditor
                    initialGuests={guests.adult + guests.child}
                    onSave={onGuestsSave}
                    onClose={onEditorClose}
                />
            )}

            {/* 4. Place Replacement/Add Modal */}
            {replaceModalState.isOpen && (
                <PlaceReplacementModal
                    isOpen={replaceModalState.isOpen}
                    onClose={onReplaceClose}
                    originalItem={replaceModalState.targetItem}
                    onReplace={onReplaceConfirm}
                    mode={replaceModalState.mode}
                />
            )}

            {/* 5. Plan B Modal (Rain) */}
            <PlanBModal
                isOpen={isPlanBOpen}
                onClose={onPlanBClose}
                rainRisks={rainRisks}
            />

            {/* 6. Smart Mix Modal */}
            <SmartMixModal
                isOpen={isSmartMixOpen}
                onClose={onSmartMixClose}
                onConfirm={onSmartMixConfirm}
                currentSchedule={schedule}
                days={days}
            />

            {/* 7. Mobile Map Fullscreen Modal */}
            <MobileMapModal
                isOpen={isMobileMapOpen}
                onClose={onMobileMapClose}
                schedule={schedule}
                selectedDay={selectedDay}
                selectedItemId={selectedItemId}
                onItemClick={onItemClick}
            />

            {/* 8. Confirm Modal */}
            {confirmState.isOpen && (
                <div className="confirm-modal">
                    <div className="modalOverlay" onClick={onConfirmClose}>
                        <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                            <div className="modalHeader">
                                <h3>알림</h3>
                                <button onClick={onConfirmClose} className="closeButton">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modalBody">
                                <p>{confirmState.message}</p>
                            </div>
                            <div className="modalFooter">
                                <button onClick={onConfirmClose} className="buttonItem-cancel">취소</button>
                                <button onClick={() => { confirmState.onConfirm(); onConfirmClose(); }} className="buttonItem-confirm">확인</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Plan B Modal Component
function PlanBModal({
    isOpen,
    onClose,
    rainRisks
}: {
    isOpen: boolean,
    onClose: () => void,
    rainRisks: RainyScheduleItem[]
}) {
    if (!isOpen) return null;

    return (
        <div className="plan-b-modal-overlay" onClick={onClose}>
            <div className="plan-b-modal-content" onClick={e => e.stopPropagation()}>
                <div className="plan-b-header">
                    <div className="icon-wrapper">
                        <CloudRain size={24} />
                    </div>
                    <h3>
                        Plan B 추천
                        <span className="text-sm font-normal text-slate-500 ml-2">우천 대비</span>
                    </h3>
                    <p>비 소식이 있는 일정의 대체 장소를 추천해드려요.</p>
                </div>

                <button onClick={onClose} className="plan-b-modal-close-btn">
                    <X size={24} />
                </button>

                <div className="plan-b-body">
                    {rainRisks.length === 0 ? (
                        <div className="empty-state">
                            <Check size={48} className="mx-auto text-green-500 mb-4" />
                            <p>비 소식이 있는 일정이 없습니다!</p>
                        </div>
                    ) : (
                        rainRisks.map((risk, idx) => (
                            <div key={idx} className="plan-b-risk-item">
                                <h4>
                                    Day {risk.item.day} - {risk.item.NAME} 대체 추천
                                </h4>
                                <div className="space-y-2">
                                    {risk.recommendations.map(rec => (
                                        <div key={rec.PLACE_ID} className="plan-b-card">
                                            <div className="plan-b-card-image">
                                                {/* Placeholder for now */}
                                                <span className="text-2xl">🏠</span>
                                            </div>
                                            <div className="plan-b-card-content">
                                                <h5>{rec.NAME}</h5>
                                                <p>{rec.CATEGORY.main}</p>
                                                <span>실내 / {rec.RATING || '평점없음'}</span>
                                            </div>
                                            <button className="text-blue-600 text-sm font-medium hover:underline">
                                                변경
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Mobile Map Modal Component
function MobileMapModal({
    isOpen,
    onClose,
    schedule,
    selectedDay,
    selectedItemId,
    onItemClick
}: {
    isOpen: boolean;
    onClose: () => void;
    schedule: PlanItem[];
    selectedDay: number; // 0=all
    selectedItemId: string | null;
    onItemClick: (id: string) => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="mobile-map-modal-overlay">
            <div className="mobile-map-header">
                <h3>
                    <MapIcon size={18} />
                    지도 보기 (Day {selectedDay === 0 ? 'All' : selectedDay})
                </h3>
                <button onClick={onClose} className="p-2 -mr-2 text-slate-500">
                    <X size={24} />
                </button>
            </div>
            <div className="mobile-map-body">
                <Map
                    schedule={schedule}
                    selectedDay={selectedDay}
                    selectedItemId={selectedItemId}
                    onItemClick={onItemClick}
                />
            </div>
        </div>
    );
}

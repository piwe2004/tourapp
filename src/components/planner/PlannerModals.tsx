import { PlanItem } from '@/mockData';
// import { RainyScheduleItem } from '@/lib/weather/actions'; // Unused type removed
import { MapPin, X } from 'lucide-react';
import Map from '@/components/planner/Map';
import PlaceReplacementModal from '@/components/planner/PlaceReplacementModal';
import SmartMixModal from '@/components/planner/SmartMixModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DateEditor from '@/components/planner/DateEditor';
import GuestEditor from '@/components/planner/GuestEditor';
import DestinationEditor from '@/components/planner/DestinationEditor';
import { PlannerTheme } from '@/services/ReplanningService';

interface PlannerModalsProps {
    // Shared State
    schedule: PlanItem[];
    selectedDay: number;
    selectedItemId: number | null;
    dateRange: { start: Date; end: Date };
    destination: string;
    guests: { adult: number; teen: number; child: number };
    days: number[]; // For SmartMixModal

    // Modal Visibility & State Objects
    replaceModalState: {
        isOpen: boolean;
        targetItem: PlanItem | null;
        mode: 'replace' | 'add';
    };
    isSmartMixOpen: boolean;
    confirmState: {
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    };
    isPlanBOpen: boolean;
    isMobileMapOpen: boolean;
    activeEditor: 'date' | 'guest' | 'dest' | null;

    // Handlers
    onReplaceClose: () => void;
    onReplaceConfirm: (newItem: PlanItem) => void;
    
    onSmartMixClose: () => void;
    onSmartMixConfirm: (scope: number | 'all', theme: PlannerTheme) => void;
    
    onConfirmClose: () => void; // confirmState.onConfirm is mostly internal but trigged by state

    onPlanBClose: () => void;
    
    onMobileMapClose: () => void;
    
    // Editor Handlers using Store update functions
    onDateSave: (start: Date, end: Date) => void;
    onGuestSave: (guests: { adult: number; teen: number; child: number }) => void;
    onDestSave: (dest: string) => void;
    onEditorClose: () => void;
}

/**
 * @desc 플래너 페이지에서 사용되는 모든 모달(팝업)들을 관리하는 컴포넌트입니다.
 * 
 * 포함된 모달:
 * 1. 장소 교체/추가 (PlaceReplacementModal)
 * 2. 스마트 일정 재구성 (SmartMixModal)
 * 3. 확인 대화상자 (ConfirmModal)
 * 4. Plan B (날씨 기반 실내 추천) 모달
 * 5. 헤더 수정 에디터들 (Date, Guest, Destination Editors)
 * 6. 모바일 전체화면 지도 뷰
 */
export default function PlannerModals({
    schedule,
    selectedDay,
    selectedItemId,
    dateRange,
    destination,
    guests,
    days,
    replaceModalState,
    isSmartMixOpen,
    confirmState,
    isPlanBOpen,
    isMobileMapOpen,
    activeEditor,
    onReplaceClose,
    onReplaceConfirm,
    onSmartMixClose,
    onSmartMixConfirm,
    onConfirmClose,
    onPlanBClose,
    onMobileMapClose,
    onDateSave,
    onGuestSave,
    onDestSave,
    onEditorClose
}: PlannerModalsProps) {

    return (
        <>
            {/* 1. 장소 교체 및 추가 모달 */}
            {replaceModalState.isOpen && (
                <PlaceReplacementModal
                    isOpen={replaceModalState.isOpen}
                    onClose={onReplaceClose}
                    onReplace={onReplaceConfirm}
                    originalItem={replaceModalState.targetItem}
                    mode={replaceModalState.mode}
                />
            )}

            {/* 2. 스마트 믹스 (일정 재구성) 모달 */}
            {isSmartMixOpen && (
                <SmartMixModal
                    isOpen={isSmartMixOpen}
                    onClose={onSmartMixClose}
                    onConfirm={onSmartMixConfirm}
                    totalDays={days.length}
                    startDate={dateRange.start}
                />
            )}

            {/* 3. 공통 확인 모달 (삭제, 잠금 등 경고용) */}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={onConfirmClose}
                onConfirm={confirmState.onConfirm}
                message={confirmState.message}
                title="알림"
                confirmText="확인"
            />

            {/* 4. 헤더 설정 에디터들 (날짜, 인원, 여행지) */}
            {activeEditor === 'date' && (
                <DateEditor
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onSave={onDateSave}
                    onClose={onEditorClose}
                />
            )}
            {activeEditor === 'guest' && (
                <GuestEditor
                    guests={guests}
                    onSave={onGuestSave}
                    onClose={onEditorClose}
                />
            )}
            {activeEditor === 'dest' && (
                <DestinationEditor
                    destination={destination}
                    onSave={onDestSave}
                    onClose={onEditorClose}
                />
            )}

            {/* 5. Plan B 추천 모달 (비 올 때) */}
            {isPlanBOpen && (
                <div id="planb-modal" className="fixed inset-0 z-[2010] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onPlanBClose()}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all scale-100">
                        <div className="bg-[#4338CA] p-6 text-white relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-white opacity-10">
                                <i className="fa-solid fa-umbrella text-[128px]"></i>
                            </div>
                            <h3 className="text-xl font-bold flex items-center gap-2 relative z-10">
                                <i className="fa-solid fa-umbrella text-[20px]"></i> Plan B 추천
                            </h3>
                            <p className="text-indigo-100 text-sm mt-1 relative z-10">비 오는 날씨를 고려한 실내 추천 장소입니다.</p>
                             <button onClick={onPlanBClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
                                <i className="fa-solid fa-xmark text-[20px]"></i>
                            </button>
                        </div>
                        <div className="p-6 bg-gray-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {/* Mock Data - 실제로는 rainRisk.recommendations를 받아와야 함 */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-3 hover:border-[#4338CA] cursor-pointer transition flex gap-4 group">
                                 <div className="w-16 h-16 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                                    <i className="fa-solid fa-utensils text-[24px]"></i>
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">제주 아르떼 뮤지엄</h4>
                                    <p className="text-xs text-gray-500 mt-1">몰입형 미디어아트 전시관</p>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. 모바일 지도 전체화면 모달 */}
            {isMobileMapOpen && (
                <div className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center animate-fade-in">
                    <div className="w-full h-full max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/20">
                        <div className="flex justify-between items-center p-4 border-b bg-white">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <MapPin size={20} className="text-indigo-600" />
                                전체 경로 보기
                            </h2>
                            <button
                                onClick={onMobileMapClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 relative">
                            <Map schedule={schedule} selectedDay={selectedDay} selectedItemId={selectedItemId} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

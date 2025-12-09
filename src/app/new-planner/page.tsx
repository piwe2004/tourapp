'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import { 
//     ChevronDown, Sun, Share2, 
//     Plane, Car, Plus, 
//     Umbrella, Sparkles, 
//     Utensils,
//     MapPin, Camera, Hotel, Lock, Unlock, Trash2, MoreVertical, X
// } from 'lucide-react';
import { getTravelPlan } from '@/lib/actions';
import { PlanItem } from '@/mockData';
import { getPlanBRecommendations, RainyScheduleItem } from '@/lib/weather/actions';
import { regenerateSchedule, PlannerTheme } from '@/services/ReplanningService';

// Components
import Map from '@/components/planner/Map';
import PlaceReplacementModal from '@/components/planner/PlaceReplacementModal';
import SmartMixModal from '@/components/planner/SmartMixModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DateEditor from '@/components/planner/DateEditor';
import GuestEditor from '@/components/planner/GuestEditor';
import DestinationEditor from '@/components/planner/DestinationEditor';

export default function NewPlannerPage() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <PlannerContent />
        </Suspense>
    );
}

function PlannerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialDestination = searchParams.get('destination') || '제주';

    // Core State
    const [isLoading, setIsLoading] = useState(true);
    const [schedule, setSchedule] = useState<PlanItem[]>([]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [rainRisks, setRainRisks] = useState<RainyScheduleItem[]>([]);

    // Settings State
    const [destination, setDestination] = useState(initialDestination);
    const [dateRange, setDateRange] = useState<{ start: Date, end: Date }>({
        start: new Date(),
        end: new Date(new Date().setDate(new Date().getDate() + 2))
    });
    const [guests, setGuests] = useState({ adult: 2, teen: 0, child: 0 });
    
    // Editor Modals State
    const [activeEditor, setActiveEditor] = useState<'date' | 'guest' | 'dest' | null>(null);

    // Modal States
    const [replaceModalState, setReplaceModalState] = useState<{
        isOpen: boolean;
        targetItem: PlanItem | null;
        mode: 'replace' | 'add';
        targetIndex?: number;
    }>({ isOpen: false, targetItem: null, mode: 'replace' });

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const [isSmartMixOpen, setIsSmartMixOpen] = useState(false);
    const [isReplanning, setIsReplanning] = useState(false);
    
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, message: "", onConfirm: () => { } });

    // Plan B Modal State
    const [isPlanBOpen, setIsPlanBOpen] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getTravelPlan(destination);
                setSchedule(data);

                // Plan B Check (Mock Date for demo)
                const todayStr = new Date().toISOString().split('T')[0];
                const risks = await getPlanBRecommendations(123, todayStr);
                setRainRisks(risks);
            } catch (error) {
                console.error("Failed to fetch plan:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [destination]);

    // Derived State
    const duration = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const days = Array.from({ length: duration }, (_, i) => i + 1);
    const currentDayItems = schedule
        .filter(item => item.day === selectedDay)
        .sort((a, b) => a.time.localeCompare(b.time));
    const getRainRisk = (itemId: number) => rainRisks.find(r => r.item.id === itemId);

    // Handlers
    const handleReplacePlace = (newItem: PlanItem) => {
        if (replaceModalState.mode === 'replace') {
            setSchedule(prev => prev.map(item =>
                item.id === replaceModalState.targetItem?.id
                    ? { ...newItem, day: item.day, time: item.time, id: item.id }
                    : item
            ));
        } else if (replaceModalState.mode === 'add') {
            const index = replaceModalState.targetIndex ?? 0;
            // Time calculation logic
            let newTime = "12:00";
             const prevItem = currentDayItems[index - 1];
             if (prevItem) {
                 const [h, m] = prevItem.time.split(':').map(Number);
                 newTime = `${h}:${m + 30}`; // Simply add 30 mins
             }

            const itemToAdd: PlanItem = {
                ...newItem,
                id: Date.now(),
                day: selectedDay,
                time: newTime,
                isLocked: false,
            };
            setSchedule(prev => [...prev, itemToAdd]);
        }
        setReplaceModalState({ isOpen: false, targetItem: null, mode: 'replace' });
    };

    const handleDeletePlace = (id: number) => {
        setConfirmState({
            isOpen: true,
            message: "정말로 이 일정을 삭제하시겠습니까?",
            onConfirm: () => {
                setSchedule(prev => prev.filter(item => item.id !== id));
                setConfirmState(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleToggleLock = (id: number) => {
        setSchedule(prev => prev.map(item =>
            item.id === id ? { ...item, isLocked: !item.isLocked } : item
        ));
    };

    const handleSmartMixConfirm = async (scope: number | 'all', theme: PlannerTheme) => {
         const runReplanning = async () => {
             setIsReplanning(true);
             try {
                 let newSchedule = [...schedule];
                 if (scope === 'all') {
                     for (const day of days) {
                         newSchedule = await regenerateSchedule(newSchedule, day, theme);
                     }
                 } else {
                     newSchedule = await regenerateSchedule(newSchedule, scope, theme);
                 }
                 setSchedule(newSchedule);
                 setIsSmartMixOpen(false);
             } catch (error) {
                 console.error("Re-planning failed:", error);
                 alert("일정 재구성에 실패했습니다.");
             } finally {
                 setIsReplanning(false);
             }
         };
 
         const hasLockedItems = scope === 'all' 
             ? schedule.some(item => item.isLocked)
             : schedule.some(item => item.day === scope && item.isLocked);
 
         if (hasLockedItems) {
             setConfirmState({
                 isOpen: true,
                 message: "고정된 장소는 유지됩니다. 진행하시겠습니까?",
                 onConfirm: runReplanning
             });
         } else {
             runReplanning();
         }
     };

    // Helper for External Check
    const isExternalItem = (id: number | string) => String(id).startsWith('naver-');

    return (
        <div className="h-screen w-full bg-white flex flex-col font-sans overflow-hidden">
            {/* Global Header (Fixed) */}
            <header className="h-[64px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-50 relative">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="w-8 h-8 bg-[#4338CA] rounded-lg flex items-center justify-center text-white text-lg shadow-md hover:scale-105 transition-transform">
                        <i className="fa-solid fa-plane transform -rotate-45 text-[18px]"></i>
                    </div>
                    <span className="text-xl lg:text-2xl font-black text-[#4338CA] tracking-tight">Planny</span>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center w-full max-w-[200px] lg:max-w-none pointer-events-none">
                    {/* [Mobile View] Compact & Interactive */}
                    <div className="flex flex-col items-center lg:hidden w-full pointer-events-auto">
                        <button 
                            onClick={() => setActiveEditor('dest')}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg transition active:bg-gray-50 pointer-events-auto"
                        >
                            <h1 className="text-sm font-bold text-gray-800 truncate max-w-[140px]">{destination} 여행</h1>
                            <i className="fa-solid fa-chevron-down text-gray-400 text-[12px]"></i>
                        </button>
                        <span 
                            onClick={() => setActiveEditor('date')}
                            className="text-[10px] text-gray-400 font-medium tracking-wide cursor-pointer hover:text-[#4338CA] pointer-events-auto"
                        >
                            {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                        </span>
                    </div>

                    {/* [PC View] Detailed & Static Title */}
                    <div className="hidden lg:flex flex-col items-center pointer-events-auto">
                        <h1 className="text-lg font-bold text-gray-900">{destination} 여행</h1>

                        <div className="flex items-center gap-3 mt-1 text-[12px] font-medium text-gray-500">
                            {/* Region */}
                            <button onClick={() => setActiveEditor('dest')} className="flex items-center gap-1.5 hover:text-[#4338CA] transition">
                                 <i className="fa-solid fa-location-dot text-gray-400 text-[12px]"></i>
                                 {destination}
                            </button>
                            <div className="w-[1px] h-2.5 bg-gray-200"></div>

                            {/* Schedule */}
                            <button onClick={() => setActiveEditor('date')} className="flex items-center gap-1.5 hover:text-[#4338CA] transition">
                                <i className="fa-solid fa-calendar-days text-gray-400 text-[12px]"></i>
                                {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                            </button>
                            <div className="w-[1px] h-2.5 bg-gray-200"></div>

                            {/* Guests */}
                            <button onClick={() => setActiveEditor('guest')} className="flex items-center gap-1.5 hover:text-[#4338CA] transition">
                                <i className="fa-solid fa-user-group text-gray-400 text-[12px]"></i>
                                {guests.adult + guests.child + guests.teen}명
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="hidden md:flex items-center px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition gap-2">
                        <i className="fa-solid fa-share-nodes text-[16px]"></i>초대
                    </button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-1 hidden md:block"></div>
                    <button className="px-4 py-2 text-sm font-bold text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-lg shadow-md transition transform active:scale-95 flex items-center gap-2">
                         저장
                    </button>
                    <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 ml-1 cursor-pointer overflow-hidden hover:ring-2 hover:ring-[#4338CA] transition-all" onClick={() => setActiveEditor('guest')}>
                        <img src={`https://ui-avatars.com/api/?name=${guests.adult + guests.child}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
            </header>

            {/* [Mobile Only] Custom Day Focus Header */}
            <div className="lg:hidden bg-white px-6 pt-6 pb-2 shrink-0 z-20">
                {/* Row 1: Date & Tools */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-400 tracking-tight">
                        {dateRange.start.toLocaleDateString()} ~ {dateRange.end.toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-3">
                        <div className="bg-[#FFF7ED] text-[#F97316] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-[#FFEDD5]">
                            <i className="fa-solid fa-sun text-[12px]"></i> 24°
                        </div>
                        <button className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm active:scale-95 transition">
                            <i className="fa-solid fa-share-nodes text-[14px]"></i>
                        </button>
                    </div>
                </div>

                {/* Row 2: Title & Dropdown */}
                <div className="flex items-center gap-3">
                    <h1 className="text-[32px] font-black text-slate-900 leading-none tracking-tight">Day {selectedDay}</h1>
                    <button 
                        onClick={() => setActiveEditor('dest')}
                        className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 active:bg-gray-100 transition"
                    >
                        {destination} · {guests.adult + guests.child + guests.teen}명 
                        <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
                    </button>
                </div>
            </div>

            {/* Main Content (Split Layout) */}
            <main className="flex flex-1 overflow-hidden relative">
                
                {/* Left Panel: Schedule List */}
                <section className="w-full lg:w-[480px] xl:w-[540px] bg-[#F8FAFC] h-full flex flex-col border-r border-gray-200 z-10 shadow-xl relative shrink-0">
                    
                    {/* Day Tabs (Sticky) */}
                    <div className="bg-white px-6 pt-6 pb-4 sticky top-0 z-20 border-b border-gray-100 shadow-sm">
                        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                            {days.map(day => {
                                const d = new Date(dateRange.start);
                                d.setDate(d.getDate() + (day - 1));
                                const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                                const weekDay = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
                                
                                const isActive = selectedDay === day;
                                
                                return (
                                    <button 
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-0.5 leading-none relative overflow-hidden group border ${
                                            isActive 
                                            ? 'bg-[#4338CA] text-white shadow-lg border-[#4338CA] transform scale-[1.02]' 
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-base">{dateStr} ({weekDay})</span>
                                        <span className={`text-[10px] font-normal ${isActive ? 'opacity-70' : 'text-gray-400'}`}>Day {day}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Weather Widget */}
                        <div className="mt-5 bg-[#E0E7FF]/50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-indigo-50 text-indigo-500">
                                    <i className="fa-solid fa-sun text-orange-500 text-[20px]"></i>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-indigo-400 tracking-wider">DAY {selectedDay} 기상정보</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-800">대체로 맑음</span>
                                        <span className="text-xs text-gray-400">|</span>
                                        <span className="text-sm font-bold text-[#4338CA]">22° / 24°</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsSmartMixOpen(true)}
                                className="px-3 py-1.5 bg-white border border-indigo-100 hover:border-[#4338CA] text-[#4338CA] text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 group"
                            >

                                <i className="fa-solid fa-wand-magic-sparkles group-hover:animate-pulse text-[12px]"></i>
                                <span>스마트 최적화</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Map View (Hidden on LG) */}
                    <div className="lg:hidden w-full h-[200px] shrink-0 relative bg-gray-100">
                        <Map schedule={schedule} selectedDay={selectedDay} selectedItemId={selectedItemId} />
                         <button className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-lg text-xs font-bold shadow-md z-10" onClick={() => {/* Toggle Fullscreen? */}}>
                            지도 크게 보기
                        </button>
                    </div>

                    {/* Timeline List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-32 relative bg-[#F8FAFC]">
                        {/* Timeline Vertical Line - Perfectly centered with markers (left padding 24px + half marker 18px = 42px center) */}
                        <div className="absolute left-[41px] top-6 bottom-0 w-[2px] bg-indigo-100/80 h-full"></div>

                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            currentDayItems.map((item, index) => {
                                const risk = getRainRisk(item.id);
                                const isSelected = selectedItemId === item.id;
                                const isExternal = isExternalItem(item.id); // Assuming ID check or similar

                                return (
                                    <div key={item.id}>
                                         <div className="relative flex gap-5 group">
                                            {/* Marker */}
                                            <div className={`w-9 h-9 rounded-full border-[3px] font-bold text-xs flex items-center justify-center z-10 shrink-0 shadow-sm mt-1 transition-all duration-300 relative ${
                                                isSelected || risk 
                                                ? 'bg-[#4338CA] border-white text-white ring-4 ring-indigo-50 scale-110' 
                                                : 'bg-white border-indigo-100 text-gray-400 group-hover:border-[#4338CA] group-hover:text-[#4338CA]'
                                            }`}>
                                                {index + 1}
                                            </div>

                                            {/* Card */}
                                            <div 
                                                className={`flex-1 bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 relative cursor-pointer group/card ${
                                                    isSelected ? 'border-[#4338CA] ring-1 ring-[#4338CA]' : 'border-gray-100 hover:border-indigo-300 hover:shadow-md'
                                                } ${risk ? 'border-l-4 border-l-red-500' : ''}`}
                                                onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                                            >
                                                {/* Lock Toggle (Top Right) */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleToggleLock(item.id); }}
                                                    className={`absolute top-4 right-10 w-auto h-auto rounded-full transition z-20 ${
                                                        item.isLocked 
                                                        ? 'text-[#4338CA] opacity-100' 
                                                        : ''
                                                    }`}
                                                    title={item.isLocked ? "고정 해제" : "일정 고정"}
                                                >
                                                    {item.isLocked ? <i className="fa-solid fa-lock text-[14px]"></i> : ''}
                                                </button>

                                                {/* Menu Button (Top Right Absolute) */}
                                                 <div className="absolute top-3 right-3 z-30">
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setOpenMenuId(openMenuId === item.id ? null : item.id); 
                                                        }}
                                                        className="p-1 px-2 text-gray-300 hover:text-gray-600 rounded transition-colors"
                                                    >
                                                        <i className="fa-solid fa-ellipsis-vertical text-[16px]"></i>
                                                    </button>
                                                     {openMenuId === item.id && (
                                                        <div 
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="absolute top-6 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[140px] flex flex-col overflow-hidden animate-fade-in z-50 text-sm"
                                                        >
                                                            <div className="flex justify-between px-3 py-2 border-b border-gray-50 text-xs text-gray-400 font-bold">
                                                                메뉴 <button onClick={() => setOpenMenuId(null)}><i className="fa-solid fa-xmark text-[12px]"></i></button>
                                                            </div>
                                                            <button className="text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2" onClick={() => { handleToggleLock(item.id); setOpenMenuId(null); }}>
                                                                {item.isLocked ? <i className="fa-solid fa-unlock text-[14px]"></i> : <i className="fa-solid fa-lock text-[14px]"></i>} {item.isLocked ? '고정 해제' : '일정 고정'}
                                                            </button>
                                                            {!item.isLocked && (
                                                                <>
                                                                    <button className="text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2" onClick={() => { setReplaceModalState({ isOpen: true, targetItem: item, mode: 'replace' }); setOpenMenuId(null); }}>
                                                                        <i className="fa-solid fa-wand-magic-sparkles text-[14px]"></i> 장소 교체
                                                                    </button>
                                                                    <button className="text-left px-4 py-3 hover:bg-red-50 text-red-500 flex items-center gap-2 border-t border-gray-50" onClick={() => { handleDeletePlace(item.id); setOpenMenuId(null); }}>
                                                                        <i className="fa-solid fa-trash text-[14px]"></i> 삭제
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                     )}
                                                 </div>

                                                {/* Alert Badge */}
                                                {risk && (
                                                <div className="absolute -top-3 -right-2 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm animate-bounce z-40">
                                                        <i className="fa-solid fa-umbrella text-[10px]"></i> 비 예보 {risk.weather.pop}
                                                    </div>
                                                )}

                                                {/* Time & Badges */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`text-[13px] font-bold px-2 py-0.5 rounded border ${
                                                        isSelected ? 'bg-[#4338CA] text-white border-[#4338CA]' : 'bg-gray-50 text-gray-600 border-gray-100'
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
                                                <div className="flex gap-4">
                                                    {/* Fallback UI Icon */}
                                                    <div className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                                                        risk ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-[#4338CA]'
                                                    }`}>
                                                        {getIcon(item.type)}
                                                    </div>
                                                    <div className="flex-1 pr-6">
                                                        <h3 className="text-[16px] font-bold text-gray-900 leading-tight mb-1">
                                                            {item.activity}
                                                            {risk && <span className="ml-2 text-[10px] text-gray-400 border border-gray-200 px-1 rounded font-normal">야외</span>}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 font-medium line-clamp-1">
                                                            {item.memo || "상세 설명이 없습니다."}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Plan B Button */}
                                                {risk && risk.recommendations.length > 0 && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setIsPlanBOpen(true); }}
                                                        className="w-full mt-4 py-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4338CA] text-sm font-bold flex items-center justify-center gap-2 transition-all border border-indigo-100 hover:shadow-md group relative overflow-hidden"
                                                    >
                                                        <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <i className="fa-solid fa-wand-magic-sparkles text-[#4338CA] relative z-10 text-[16px]"></i>
                                                        <span className="relative z-10">비 오면 여기 어때요? (실내 추천)</span>
                                                    </button>
                                                )}
                                            </div>
                                         </div>

                                         {/* Travel Time */}
                                         {index < currentDayItems.length - 1 && (
                                             <div className="flex items-center gap-3 ml-[4px] mb-2 mt-2 md:mb-5 md:mt-5 relative z-0 pl-10 opacity-70">
                                                <div className="flex flex-col items-center gap-1">
                                                    {/* Dots replaced by continuous line effect handled by main line */}
                                                </div>
                                                <div className="flex items-center justify-left w-full -ml-2 relative"> 
                                                    {/* Badge aligned relative to line */}
                                                    <span className="text-[11px] md:text-[14px] font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 hover:border-indigo-300 transition-colors z-10">
                                                        <i className="fa-solid fa-car text-indigo-400 text-[12px]"></i> 
                                                        <span>40분 이동</span>
                                                    </span>
                                                    <button 
                                                        onClick={() => setReplaceModalState({ isOpen: true, targetItem: null, mode: 'add', targetIndex: index + 1 })}
                                                        className="absolute left-50 w-7 h-7 ml-2 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 shadow-sm hover:border-[#4338CA] hover:bg-[#4338CA] hover:text-white transition-all transform hover:scale-105 active:scale-95 z-10"
                                                        title="경유지 추가"
                                                    >
                                                        <i className="fa-solid fa-plus text-[14px]"></i>
                                                    </button>
                                                </div>
                                            </div>
                                         )}
                                    </div>
                                );
                            })
                        )}

                        {/* Add Button Day */}
                         <button 
                            onClick={() => setReplaceModalState({ isOpen: true, targetItem: null, mode: 'add', targetIndex: currentDayItems.length })}
                            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-bold hover:border-[#4338CA] hover:text-[#4338CA] hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2 text-sm group mt-4"
                        >
                            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 group-hover:bg-[#4338CA] group-hover:text-white flex items-center justify-center transition-colors">
                                <i className="fa-solid fa-plus text-[12px]"></i>
                            </div>
                            일정 추가하기
                        </button>
                    </div>
                </section>

                {/* Right Panel: Map (Desktop) */}
                <section className="hidden lg:block flex-1 bg-[#EEF2F5] relative overflow-hidden group">
                     {/* Map Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{backgroundImage: 'radial-gradient(#64748b 1.5px, transparent 1.5px)', backgroundSize: '24px 24px'}}></div>
                    
                    <div className="w-full h-full relative z-10">
                        <Map schedule={schedule} selectedDay={selectedDay} selectedItemId={selectedItemId} />
                    </div>

                    {/* Floating Controls */}
                     <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
                         <button className="w-11 h-11 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#4338CA] hover:bg-gray-50 transition active:scale-95" title="확대">
                            <i className="fa-solid fa-plus text-[20px]"></i>
                        </button>
                        <button className="w-11 h-11 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#4338CA] hover:bg-gray-50 transition active:scale-95" title="축소">
                             {/* Lucide doesn't have explicit Minus icon in imports, assuming Minus is imported or use div */}
                             <div className="w-4 h-0.5 bg-current"></div>
                        </button>
                    </div>
                </section>
            </main>

            {/* Modals & Editors */}
            {replaceModalState.isOpen && (
                <PlaceReplacementModal
                    isOpen={replaceModalState.isOpen}
                    onClose={() => setReplaceModalState({ isOpen: false, targetItem: null, mode: 'replace' })}
                    onReplace={handleReplacePlace}
                    originalItem={replaceModalState.targetItem}
                    mode={replaceModalState.mode}
                />
            )}
            {isSmartMixOpen && (
                <SmartMixModal
                    isOpen={isSmartMixOpen}
                    onClose={() => setIsSmartMixOpen(false)}
                    onConfirm={handleSmartMixConfirm}
                    totalDays={days.length}
                    startDate={dateRange.start}
                />
            )}
            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmState.onConfirm}
                message={confirmState.message}
                title="알림"
                confirmText="확인"
            />
             {activeEditor === 'date' && (
                <DateEditor
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onSave={(start, end) => { setDateRange({ start, end }); setActiveEditor(null); }}
                    onClose={() => setActiveEditor(null)}
                />
            )}
            {activeEditor === 'guest' && (
                <GuestEditor
                    guests={guests}
                    onSave={(newGuests) => { setGuests(newGuests); setActiveEditor(null); }}
                    onClose={() => setActiveEditor(null)}
                />
            )}
            {activeEditor === 'dest' && (
                <DestinationEditor
                    destination={destination}
                    onSave={(newDest) => { setDestination(newDest); setActiveEditor(null); }}
                    onClose={() => setActiveEditor(null)}
                />
            )}

            {/* Plan B Custom Modal (Simple HTML Structure as requested) */}
            {isPlanBOpen && (
                <div id="planb-modal" className="fixed inset-0 z-[2010] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && setIsPlanBOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all scale-100">
                        <div className="bg-[#4338CA] p-6 text-white relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 text-white opacity-10">
                                <i className="fa-solid fa-umbrella text-[128px]"></i>
                            </div>
                            <h3 className="text-xl font-bold flex items-center gap-2 relative z-10">
                                <i className="fa-solid fa-umbrella text-[20px]"></i> Plan B 추천
                            </h3>
                            <p className="text-indigo-100 text-sm mt-1 relative z-10">비 오는 날씨를 고려한 실내 추천 장소입니다.</p>
                             <button onClick={() => setIsPlanBOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
                                <i className="fa-solid fa-xmark text-[20px]"></i>
                            </button>
                        </div>
                        <div className="p-6 bg-gray-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {/* Mock Data */}
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
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-8 mt-4 px-5">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                    <div className="w-[50px] h-4 bg-gray-200 rounded animate-pulse mt-1"></div>
                    <div className="flex-1 h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
                </div>
            ))}
        </div>
    );
}

// Icon Mapper using FontAwesome
function getIcon(type: string) {
    switch (type) {
        case 'move': return <i className="fa-solid fa-plane text-[16px]"></i>;
        case 'food': return <i className="fa-solid fa-utensils text-[16px]"></i>;
        case 'cafe': return <i className="fa-solid fa-mug-hot text-[16px]"></i>;
        case 'sightseeing': return <i className="fa-solid fa-camera text-[16px]"></i>;
        case 'stay': return <i className="fa-solid fa-hotel text-[16px]"></i>;
        default: return <i className="fa-solid fa-map-pin text-[16px]"></i>;
    }
}

// Simple Coffee Icon fallback if Coffee is not filled nicely
const CoffeeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M6 2v2"/><path d="M18 8a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h6a4 4 0 0 1 4 4v3.5A2.5 2.5 0 0 1 13.5 16H10"/><path d="M4 16h16v-2h-3v-1.5a1.5 1.5 0 0 0-1.5-1.5h-7a1.5 1.5 0 0 0-1.5 1.5V14H4v2Z"/><path d="M6 20h12"/></svg>
);

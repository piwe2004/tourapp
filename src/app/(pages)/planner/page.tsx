'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Share2, Map as MapIcon, Calendar, Users, MapPin } from 'lucide-react';
import { getTravelPlan } from '@/lib/actions';
import { PlanItem } from '@/mockData';
import DateEditor from '@/components/planner/DateEditor';
import GuestEditor from '@/components/planner/GuestEditor';
import DestinationEditor from '@/components/planner/DestinationEditor';
import DayItems from '@/components/planner/DayItems';
import Button_type1 from '@/components/ui/Button_type1';
import Map from '@/components/planner/Map';

export default function PlannerView() {
    const searchParams = useSearchParams();
    const initialDestination = searchParams.get('destination') || '여행지';

    const [isLoading, setIsLoading] = useState(true);
    const [schedule, setSchedule] = useState<PlanItem[]>([]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null); // 선택된 아이템 ID 상태 추가

    const [destination, setDestination] = useState(initialDestination);
    const [dateRange, setDateRange] = useState<{ start: Date, end: Date }>({
        start: new Date(),
        end: new Date(new Date().setDate(new Date().getDate() + 2))
    });
    const [guests, setGuests] = useState({ adult: 2, teen: 0, child: 0 });

    const [isDateEditorOpen, setIsDateEditorOpen] = useState(false);
    const [isGuestEditorOpen, setIsGuestEditorOpen] = useState(false);
    const [isDestEditorOpen, setIsDestEditorOpen] = useState(false);

    const [currentSlide, setCurrentSlide] = useState(0);

    const days = Array.from(new Set(schedule.map(item => item.day))).sort();
    const currentDayItems = schedule.filter((item) => item.day === selectedDay);

    useEffect(() => {
        const fetchData = async () => {
            if (!destination || destination === '여행지') {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const data = await getTravelPlan(destination);
                setSchedule(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [destination]);

    useEffect(() => {
        setCurrentSlide(0);
        setSelectedItemId(null); // 날짜 변경 시 선택 초기화
    }, [selectedDay]);

    const formatDateRange = () => {
        const start = `${dateRange.start.getMonth() + 1}.${dateRange.start.getDate()}`;
        const end = `${dateRange.end.getMonth() + 1}.${dateRange.end.getDate()}`;
        return `${start} - ${end}`;
    };

    const formatGuests = () => {
        const total = guests.adult + guests.teen + guests.child;
        return `총 ${total}명`;
    };

    const handleItemClick = (id: number) => {
        setSelectedItemId(prev => prev === id ? null : id); // 이미 선택된 아이템 클릭 시 해제
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-20">
            {isDateEditorOpen && (
                <DateEditor
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onSave={(start, end) => {
                        setDateRange({ start, end });
                        setIsDateEditorOpen(false);
                    }}
                    onClose={() => setIsDateEditorOpen(false)}
                />
            )}
            {isGuestEditorOpen && (
                <GuestEditor
                    guests={guests}
                    onSave={(newGuests) => {
                        setGuests(newGuests);
                        setIsGuestEditorOpen(false);
                    }}
                    onClose={() => setIsGuestEditorOpen(false)}
                />
            )}
            {isDestEditorOpen && (
                <DestinationEditor
                    destination={destination}
                    onSave={(newDest) => {
                        setDestination(newDest);
                        setIsDestEditorOpen(false);
                    }}
                    onClose={() => setIsDestEditorOpen(false)}
                />
            )}

            <div className="bg-white border-b border-slate-200 sticky top-[72px] z-30 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                {destination} 여행 계획
                                <span className="hidden md:inline-flex text-indigo-600 text-xs font-bold px-2 py-1 bg-indigo-50 rounded-full border border-indigo-100 items-center gap-1">
                                    <Sparkles size={12} /> Planni's Pick
                                </span>
                            </h2>
                            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                                <button onClick={() => setIsDateEditorOpen(true)} className="flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all -ml-2">
                                    <Calendar size={14} />
                                    <span className="font-medium">{formatDateRange()}</span>
                                </button>
                                <span className="text-slate-300">|</span>
                                <button onClick={() => setIsGuestEditorOpen(true)} className="flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all">
                                    <Users size={14} />
                                    <span className="font-medium">{formatGuests()}</span>
                                </button>
                                <span className="text-slate-300">|</span>
                                <button onClick={() => setIsDestEditorOpen(true)} className="flex items-center gap-1 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all">
                                    <MapPin size={14} />
                                    <span className="font-medium">{destination}</span>
                                </button>
                            </div>
                        </div>
                        <button className="absolute top-4 right-4 md:static p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 mt-6">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-1/2 order-1">
                            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                {days.length > 0 ? days.map((day) => (
                                    <Button_type1 key={day} onClick={() => setSelectedDay(day)} text={`Day ${day}`} active={selectedDay === day}/>
                                )) : null}
                            </div>
                            <div className="flex justify-between items-stretch gap-10 pb-5 overflow-x-scroll md:overflow-visible md:space-y-8 md:border-l-[3px] md:border-indigo-100 md:ml-4 md:pl-10 md:pb-0 md:block">
                                {currentDayItems.map((item, index) => (
                                   <DayItems 
                                        item={item} 
                                        index={index} 
                                        key={item.id} 
                                        onClick={() => handleItemClick(item.id)}
                                        selected={selectedItemId === item.id}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 order-2">
                            <div className="lg:sticky lg:top-[190px] h-[300px] lg:h-[calc(100vh-220px)] rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
                                <Map schedule={schedule} selectedDay={selectedDay} selectedItemId={selectedItemId} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto mt-10 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-slate-500 font-medium animate-pulse">플래니가 생각 중...</p>
        </div>
    );
}
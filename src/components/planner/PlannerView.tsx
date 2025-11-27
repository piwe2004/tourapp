import React, { useState } from 'react';
import { Calendar, CheckCircle2, MapPin } from 'lucide-react';
import { INITIAL_SCHEDULE } from '@/lib/constants';
import { ScheduleItem } from '@/types';

interface PlannerViewProps {
    isResult?: boolean;
    destination?: string;
}

export default function PlannerView({ isResult, destination }: PlannerViewProps) {
    const [schedule, setSchedule] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);

    return (
        <div className="pt-24 h-screen flex flex-col max-w-screen-2xl mx-auto bg-slate-50">
            {/* Header */}
            <div className="px-6 md:px-12 pb-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center bg-white pt-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-indigo-200">3박 4일</span>
                        <h2 className="text-3xl font-black text-slate-900">
                            {isResult && destination ? `✨ ${destination} 맞춤 여행` : '🍊 제주도 힐링 여행'}
                        </h2>
                    </div>
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" /> 2024.06.15 (토) - 2024.06.18 (화)
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 text-sm transition-all shadow-sm">초대</button>
                    <button className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 shadow-lg hover:shadow-indigo-200 text-sm transition-all">일정 저장</button>
                </div>
            </div>

            <div className="flex-1 grid md:grid-cols-12 overflow-hidden">
                <div className="md:col-span-4 bg-white border-r border-slate-200 overflow-y-auto p-6 scrollbar-thin">
                    <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                        {['1일차', '2일차', '3일차'].map((day, i) => (
                            <button key={day} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${i === 0 ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                                {day}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6 relative pl-4">
                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
                        {schedule.map((item, idx) => (
                            <div key={item.id} className="flex gap-5 relative group">
                                <div className="flex flex-col items-center z-10 pt-1">
                                    <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 group-hover:border-indigo-600 group-hover:bg-indigo-600 flex items-center justify-center text-slate-300 group-hover:text-white transition-all shadow-sm">
                                        <CheckCircle2 size={18} />
                                    </div>
                                </div>
                                <div className="flex-1 bg-white border-2 border-slate-100 p-5 rounded-2xl shadow-sm hover:border-indigo-500 hover:shadow-[0_4px_20px_-4px_rgba(79,70,229,0.15)] transition-all cursor-pointer group-hover:-translate-y-1">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{item.time}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors mb-0.5">{item.activity}</h4>
                                            {item.memo && <p className="text-xs text-slate-400 font-medium">{item.memo}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-8 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                    <div className="bg-white px-10 py-8 rounded-[2rem] shadow-2xl text-center border-4 border-white/50 max-w-sm mx-4 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <MapPin size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">지도 뷰</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            여행 동선을 한눈에 확인하세요.<br />
                            (API 연동 시 지도가 표시됩니다)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

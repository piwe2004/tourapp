"use client"

import { PlanItem } from "@/mockData";
import { BedDouble, Camera, Car, Clock, Coffee, Utensils } from "lucide-react";

export default function DayItems({ item, index, onClick }: { item: PlanItem; index: number; onClick?: () => void }) {

    const getIconByType = (type: string) => {
        switch (type) {
            case 'food': return <Utensils size={18} className="text-orange-500" />;
            case 'cafe': return <Coffee size={18} className="text-amber-700" />;
            case 'stay': return <BedDouble size={18} className="text-indigo-500" />;
            case 'move': return <Car size={18} className="text-slate-500" />;
            default: return <Camera size={18} className="text-blue-500" />;
        }
    };

    return(
         <div key={item.id} onClick={onClick} className="relative group animate-fade-in-up w-full min-w-[70%] cursor-pointer" >
            <div className="hidden md:block absolute -left-[51px] top-6 w-5 h-5 bg-white border-4 border-indigo-500 rounded-full z-10 shadow-sm"></div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all h-full flex flex-col justify-start">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Step {index + 1}</span>
                        <div className="flex items-center gap-1 text-slate-500 text-sm font-bold bg-slate-50 px-2 py-1 rounded-lg"><Clock size={14} /> {item.time}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-full border border-slate-100">{getIconByType(item.type)}</div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.activity}</h3>
                {item.memo && (
                    <div className="text-slate-600 text-sm bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                        <span className="mr-2">💡</span>{item.memo}
                    </div>
                )}
            </div>
        </div>
    )
}
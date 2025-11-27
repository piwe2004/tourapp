import React, { useState } from 'react';
import { DESTINATIONS_DB } from '@/lib/constants';
import { RegionKey } from '@/types';

export default function PopularDestinations() {
    const [activeRegion, setActiveRegion] = useState<RegionKey>('전체');
    const filteredDestinations = activeRegion === '전체' ? DESTINATIONS_DB : DESTINATIONS_DB.filter(d => d.region === activeRegion);

    return (
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto bg-white">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-slate-900 mb-6">지역별 인기 여행지</h2>
                <div className="flex flex-wrap justify-center gap-3">
                    {(['전체', '제주', '강원', '부산/경상', '전라', '서울/경기'] as RegionKey[]).map((region) => (
                        <button key={region} onClick={() => setActiveRegion(region)} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${activeRegion === region ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800'}`}>
                            {region}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredDestinations.map((dest) => (
                    <div key={dest.id} className="group bg-white rounded-[2rem] overflow-hidden border-2 border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.15)] transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-2">
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                            <img src={dest.image} alt={dest.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">{dest.city}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">{dest.desc}</p>
                            <div className="mt-auto flex flex-wrap gap-2">
                                {dest.tags.map((tag, i) => (
                                    <span key={i} className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 group-hover:border-indigo-100 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

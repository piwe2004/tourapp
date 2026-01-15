'use client';
import { useState } from 'react';
import { PlanItem } from '@/types/place';
import { clsx } from 'clsx';

interface PlannerPlaceListProps {
    places: PlanItem[];
    onItemClick: (id: string) => void;
    selectedItemId: string | null;
}

type TabType = 'all' | 'food' | 'cafe' | 'stay' | 'sightseeing';

const TABS: { id: TabType; label: string; icon: string }[] = [
    { id: 'all', label: '전체', icon: 'fa-layer-group' },
    { id: 'food', label: '맛집', icon: 'fa-utensils' },
    { id: 'cafe', label: '카페', icon: 'fa-mug-hot' },
    { id: 'sightseeing', label: '관광', icon: 'fa-camera' },
    { id: 'stay', label: '숙소', icon: 'fa-bed' },
];

export default function PlannerPlaceList({ places, onItemClick, selectedItemId }: PlannerPlaceListProps) {
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const filteredPlaces = places.filter(place => {
        if (activeTab === 'all') return true;
        
        const cat = place.CATEGORY?.main || '';
        if (activeTab === 'food') return /식당|음식|맛집/.test(cat);
        if (activeTab === 'cafe') return /카페|커피|베이커리|디저트/.test(cat);
        if (activeTab === 'stay') return /숙박|호텔|리조트|펜션|모텔|게스트하우스/.test(cat);
        if (activeTab === 'sightseeing') return /관광지|명소|문화|체험|공원/.test(cat);
        return false;
    });

    return (
        <section className="planner-timeline relative flex flex-col h-full bg-white border-r border-[#e5e7eb]">
            {/* Header / Tabs */}
            <div className="shrink-0 p-4 border-b border-gray-200 bg-white z-10">
                <h2 className="text-lg font-bold text-gray-900 mb-3">검색 결과 ({places.length})</h2>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                                activeTab === tab.id 
                                    ? "bg-black text-white" 
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            <i className={clsx("fa-solid", tab.icon)}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredPlaces.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <i className="fa-regular fa-folder-open text-2xl mb-2 block"></i>
                        이 카테고리에는 장소가 없어요.
                    </div>
                ) : (
                    filteredPlaces.map(place => (
                        <div 
                            key={place.PLACE_ID} 
                            onClick={() => onItemClick(place.PLACE_ID)}
                            className={clsx(
                                "group relative flex gap-3 p-3 rounded-xl border border-gray-100 bg-white cursor-pointer transition-all hover:shadow-md",
                                selectedItemId === place.PLACE_ID ? "ring-2 ring-primary border-transparent" : "hover:border-gray-300"
                            )}
                        >
                             {/* Number Badge */}
                             <div className="absolute top-3 left-3 z-10 flex items-center justify-center w-5 h-5 bg-black/60 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
                                {places.indexOf(place) + 1}
                             </div>

                            {/* Image Placeholder */}
                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
                                {place.IMAGE_URL ? (
                                    <img src={place.IMAGE_URL} alt={place.NAME} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <i className="fa-regular fa-image text-lg"></i>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-gray-900 truncate text-[15px]">{place.NAME}</h3>
                                        <div className="flex items-center gap-1 shrink-0 text-amber-500 font-bold text-sm">
                                            <i className="fa-solid fa-star text-[10px]"></i>
                                            {place.RATING ? place.RATING.toFixed(1) : "0.0"}
                                        </div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                                        <span>{place.CATEGORY?.main}</span>
                                        <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                                        <span>{place.CATEGORY?.sub || '일반'}</span>
                                    </div>
                                    
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {(place.KEYWORDS || []).slice(0, 2).map((tag, idx) => (
                                            <span key={idx} className="inline-block px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded border border-gray-200">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="text-[11px] text-gray-400 truncate mt-2 flex items-center gap-1">
                                    <i className="fa-solid fa-location-dot"></i>
                                    {place.ADDRESS}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Footer / Hint */}
            <div className="shrink-0 p-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
                원하는 장소를 선택하여 위치를 확인해보세요!
            </div>
        </section>
    );
}

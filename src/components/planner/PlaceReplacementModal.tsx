'use client';

import { useState, useEffect } from 'react';
import { Search, Star, MapPin, X, Check } from 'lucide-react';
import { PlanItem } from '@/mockData';

interface PlaceReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplace: (newItem: PlanItem) => void;
  originalItem: PlanItem;
}

// Mock Data for Recommendations
const MOCK_RECOMMENDATIONS = [
  { id: 101, name: '우진해장국', category: '맛집', rating: 4.8, distance: '0.5km', lat: 33.5115, lng: 126.5200, type: 'food' },
  { id: 102, name: '동문시장 야시장', category: '맛집', rating: 4.5, distance: '1.2km', lat: 33.5120, lng: 126.5280, type: 'food' },
  { id: 103, name: '스타벅스 제주서해안로DT', category: '카페', rating: 4.6, distance: '3.5km', lat: 33.5150, lng: 126.4800, type: 'cafe' },
  { id: 104, name: '용두암', category: '관광지', rating: 4.3, distance: '2.0km', lat: 33.5160, lng: 126.5120, type: 'sightseeing' },
  { id: 105, name: '도두동 무지개해안도로', category: '관광지', rating: 4.7, distance: '4.0km', lat: 33.5080, lng: 126.4700, type: 'sightseeing' },
  { id: 106, name: '9.81파크 제주', category: '액티비티', rating: 4.9, distance: '15km', lat: 33.3800, lng: 126.3600, type: 'sightseeing' }, // type mapping simplification
  { id: 107, name: '금오름', category: '힐링', rating: 4.8, distance: '20km', lat: 33.3500, lng: 126.3000, type: 'sightseeing' },
  { id: 108, name: '랜디스도넛 제주애월', category: '카페', rating: 4.4, distance: '18km', lat: 33.4600, lng: 126.3100, type: 'cafe' },
];

const CATEGORIES = ['전체', '맛집', '카페', '관광지', '액티비티', '힐링'];

export default function PlaceReplacementModal({ isOpen, onClose, onReplace, originalItem }: PlaceReplacementModalProps) {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [filteredPlaces, setFilteredPlaces] = useState(MOCK_RECOMMENDATIONS);

  // Initialize category based on original item
  useEffect(() => {
    if (isOpen && originalItem) {
      const typeToCategory: Record<string, string> = {
        food: '맛집',
        cafe: '카페',
        sightseeing: '관광지',
        activity: '액티비티', // Assuming 'activity' type exists or mapped from sightseeing
        stay: '전체', // Stay usually doesn't map well to these specific tags, default to All
      };
      setSelectedCategory(typeToCategory[originalItem.type] || '전체');
      setKeyword('');
    }
  }, [isOpen, originalItem]);

  // Filter logic
  useEffect(() => {
    let result = MOCK_RECOMMENDATIONS;

    // 1. Filter by Category
    if (selectedCategory !== '전체') {
      // Simple mapping for demo: '힐링', '액티비티' might share 'sightseeing' type in real DB, 
      // but here we filter by the 'category' string in MOCK_RECOMMENDATIONS
      result = result.filter(place => place.category === selectedCategory);
    }

    // 2. Filter by Keyword
    if (keyword.trim()) {
      result = result.filter(place => place.name.includes(keyword) || place.category.includes(keyword));
    }

    setFilteredPlaces(result);
  }, [keyword, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full md:w-[500px] md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-white z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900">장소 교체</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="장소명 검색 (예: 스타벅스)" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                  ${selectedCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Body (List) */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {filteredPlaces.length > 0 ? (
            <div className="space-y-3">
              {filteredPlaces.map((place) => (
                <div key={place.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{place.category}</span>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star size={12} className="fill-amber-500 mr-0.5" />
                        {place.rating}
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{place.name}</h4>
                    <div className="flex items-center text-slate-400 text-xs">
                      <MapPin size={12} className="mr-1" />
                      {place.distance} · 현재 위치에서
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      // Construct new PlanItem based on original + new place data
                      const newItem: PlanItem = {
                        ...originalItem,
                        activity: place.name,
                        type: place.type as any, // Type assertion for mock
                        memo: `${place.category} 추천 장소로 변경됨`,
                        lat: place.lat,
                        lng: place.lng,
                      };
                      onReplace(newItem);
                    }}
                    className="bg-slate-100 text-slate-600 p-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <Check size={20} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
              <Search size={48} className="mb-4 opacity-20" />
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

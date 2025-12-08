'use client';

import { useState, useEffect } from 'react';
import { Search, Star, MapPin, X, Check, Loader2 } from 'lucide-react';
import { PlanItem } from '@/mockData';

interface PlaceReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplace: (newItem: PlanItem) => void;
  originalItem?: PlanItem | null;
  mode?: 'replace' | 'add';
}

// Mock Data for Recommendations
const MOCK_RECOMMENDATIONS = [
  { id: 101, name: '우진해장국', category: '맛집', rating: 4.8, distance: '0.5km', address:'주소', lat: 33.5115, lng: 126.5200, type: 'food' },
  { id: 102, name: '동문시장 야시장', category: '맛집', rating: 4.5, distance: '1.2km', address:'주소', lat: 33.5120, lng: 126.5280, type: 'food' },
  { id: 103, name: '스타벅스 제주서해안로DT', category: '카페', rating: 4.6, distance: '3.5km', address:'주소', lat: 33.5150, lng: 126.4800, type: 'cafe' },
  { id: 104, name: '용두암', category: '관광지', rating: 4.3, distance: '2.0km', address:'주소', lat: 33.5160, lng: 126.5120, type: 'sightseeing' },
  { id: 105, name: '도두동 무지개해안도로', category: '관광지', rating: 4.7, distance: '4.0km', address:'주소', lat: 33.5080, lng: 126.4700, type: 'sightseeing' },
  { id: 106, name: '9.81파크 제주', category: '액티비티', rating: 4.9, distance: '15km', address:'주소', lat: 33.3800, lng: 126.3600, type: 'sightseeing' },
  { id: 107, name: '금오름', category: '힐링', rating: 4.8, distance: '20km', address:'주소', lat: 33.3500, lng: 126.3000, type: 'sightseeing' },
  { id: 108, name: '랜디스도넛 제주애월', category: '카페', rating: 4.4, distance: '18km', address:'주소', lat: 33.4600, lng: 126.3100, type: 'cafe' },
];

const CATEGORIES = ['전체', '맛집', '카페', '관광지', '액티비티', '힐링'];

type SearchResultItem = {
    id: number | string;
    name: string;
    category: string;
    rating?: number;
    distance?: string;
    lat?: number;
    lng?: number;
    type: string;
    // External specific
    address?: string;
    link?: string;
    mapx?: string;
    mapy?: string;
    source: 'internal' | 'external';
};

interface NaverSearchItem {
    title: string;
    category?: string;
    roadAddress?: string;
    address?: string;
    link?: string;
    mapx?: string;
    mapy?: string;
}

export default function PlaceReplacementModal({ isOpen, onClose, onReplace, originalItem, mode = 'replace' }: PlaceReplacementModalProps) {
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | string | null>(null);
  
  const [displayItems, setDisplayItems] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<'internal' | 'external'>('internal');

  // Initialize category based on original item
  useEffect(() => {
      if (mode === 'replace' && originalItem) {
          const typeToCategory: Record<string, string> = {
              food: '맛집',
              cafe: '카페',
              sightseeing: '관광지',
              activity: '액티비티', 
              stay: '전체',
          };
          setSelectedCategory(typeToCategory[originalItem.type] || '전체');
      } else {
           setSelectedCategory('전체');
      }
    setKeyword('');
    setSelectedPlaceId(null);
    // Reset items to mock initial
    setDisplayItems(MOCK_RECOMMENDATIONS.map(item => ({ ...item, source: 'internal' })));
  }, []); // Run once on mount

  // Search Logic
  useEffect(() => {
    const performSearch = async () => {
        setIsLoading(true);
        setSearchSource('internal');
        
        let results: SearchResultItem[] = [];

        // 1. Internal Filter
        const internalResults = MOCK_RECOMMENDATIONS.filter(place => {
            let matchCategory = true;
            if (selectedCategory !== '전체') {
                matchCategory = place.category === selectedCategory;
            }
            let matchKeyword = true;
            if (keyword.trim()) {
                matchKeyword = place.name.includes(keyword) || place.category.includes(keyword);
            }
            return matchCategory && matchKeyword;
        });

        // 2. Logic: If keyword exists and no internal results -> External
        if (keyword.trim() && internalResults.length === 0) {
             setSearchSource('external');
             try {
                 const res = await fetch(`/api/search?query=${encodeURIComponent(keyword)}`);
                 const data = await res.json();
                 
                 if (data.items && data.items.length > 0) {
                     results = data.items.map((item: NaverSearchItem, idx: number) => ({
                         id: `naver-${idx}`,
                         name: item.title,
                         category: item.category || '기타',
                         type: 'etc', 
                         address: item.roadAddress || item.address,
                         link: item.link,
                         mapx: item.mapx, 
                         mapy: item.mapy,
                         source: 'external',
                         lat: 0, // Will be calculated on selection
                         lng: 0, 
                     }));
                 }
             } catch (error) {
                 console.error("Search API failed", error);
             }
        } else {
            results = internalResults.map(item => ({ ...item, source: 'internal' }));
        }

        setDisplayItems(results);
        setIsLoading(false);
    };

    const timer = setTimeout(() => {
        performSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [keyword, selectedCategory]);

  const mapCategoryToType = (cat: string): PlanItem['type'] => {
      if (cat.includes('음식') || cat.includes('맛집') || cat.includes('식당')) return 'food';
      if (cat.includes('카페') || cat.includes('커피')) return 'cafe';
      if (cat.includes('숙소') || cat.includes('호텔') || cat.includes('펜션')) return 'stay';
      return 'sightseeing';
  };

  /**
   * @desc 선택한 장소를 일정에 반영하는 핸들러
   * 네이버 검색 결과(외부)인 경우, 좌표 변환(KATECH -> WGS84)을 수행합니다.
   */
  const handleApply = () => {
      if (!selectedPlaceId) return;

      // 1. 선택된 장소 데이터 찾기
      const place = displayItems.find(p => p.id === selectedPlaceId);
      if (!place) return;

      let finalLat = place.lat;
      let finalLng = place.lng;

      // 2. 외부(Naver) 검색 결과인 경우 좌표 처리 수행
      // [수정: 2024-12-08] TransCoord 변환 제거
      // Naver Search API의 mapx, mapy는 KATECH가 아니라 "WGS84 좌표 * 10,000,000" 형태의 정수값입니다.
      // 따라서 별도의 좌표계 변환 API 호출 없이 단순 나누기 연산으로 위경도를 복원합니다.
      if (place.source === 'external' && place.mapx && place.mapy) {
          console.log(`[좌표 처리 시도] ${place.name}: mapx=${place.mapx}, mapy=${place.mapy}`);

          try {
              // mapx: 경도 (Longitude), mapy: 위도 (Latitude)
              // 예: 1269279667 -> 126.9279667
              const lat = Number(place.mapy) / 10000000;
              const lng = Number(place.mapx) / 10000000;

              finalLat = lat;
              finalLng = lng;
              
              console.log(`[좌표 처리 완료] Lat: ${finalLat}, Lng: ${finalLng}`);

              // [Safety Check] 변환된 좌표가 한국 영토 범위(대략적)를 벗어나는지 확인
              if (finalLat < 30 || finalLat > 45 || finalLng < 120 || finalLng > 135) {
                   console.warn("좌표가 유효 범위를 벗어났습니다. 제주 시청 기준으로 대체합니다.");
                   finalLat = 33.5000;
                   finalLng = 126.5000;
              }
          } catch (e) {
              console.error("좌표 처리 중 오류가 발생했습니다:", e);
              // 실패 시 기본값 (제주) 사용
              finalLat = 33.5000;
              finalLng = 126.5000;
          }
      }

      // 3. 새로운 PlanItem 객체 생성
      const newItem: PlanItem = {
          id: Date.now(),
          day: 1, // 상위에서 덮어씌워짐
          time: "10:00", // 상위에서 계산됨
          activity: place.name.replace(/(<([^>]+)>)/gi, ""), // HTML 태그 제거
          type: mapCategoryToType(place.category || ''), // 카테고리 매핑
          // 좌표가 없으면 기본값(제주) 사용
          lat: finalLat || 33.4996, 
          lng: finalLng || 126.5312,
          memo: place.address || '',
          isLocked: false,
          duration: 60 // 기본 소요 시간
      };

      // 4. 부모 컴포넌트로 전달 및 모달 닫기
      onReplace(newItem);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
                {mode === 'replace' ? '다른 장소로 변경' : '새로운 장소 추가'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
                {mode === 'replace' ? '현재 일정을 대체할 장소를 선택하세요.' : '일정에 추가할 장소를 검색하세요.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 h-[calc(100vh-50vh)] flex flex-col md:h-[600px]">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="장소명, 카테고리 검색 (예: 우진해장국)" 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-slate-900"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Recommendations List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 -mr-2">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-sm">장소를 찾는 중...</span>
                </div>
            ) : displayItems.length > 0 ? (
                displayItems.map((place) => (
                <div 
                    key={place.id}
                    onClick={() => setSelectedPlaceId(place.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all group ${
                    selectedPlaceId === place.id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md'
                    }`}
                >
                    <div className="w-16 h-16 rounded-lg bg-slate-200 flex-shrink-0 overflow-hidden relative">
                         {/* Placeholder Image Logic based on type */}
                         <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                            {place.category.includes('음식') ? '🍽️' : 
                             place.category.includes('카페') ? '☕' : 
                             place.category.includes('숙소') ? '🏠' : '📍'}
                         </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                          <h4 className={`font-bold text-lg truncate mb-1 ${selectedPlaceId === place.id ? 'text-indigo-700' : 'text-slate-900'}`}>
                          {place.name}
                          </h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                          <span className="text-slate-700 font-medium">{place.category}</span>
                          {place.rating && (
                              <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                                    <Star size={12} fill="currentColor" />
                                    {place.rating}
                                  </div>
                              </>
                          )}
                          {place.distance && (
                              <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span>{place.distance}</span>
                              </>
                          )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 truncate">
                          <MapPin size={12} />
                          {place.address}
                      </div>
                    </div>
                    {selectedPlaceId === place.id && (
                      <div className="absolute top-4 right-4 text-indigo-600 bg-indigo-100 rounded-full p-1">
                          <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                </div>
                ))
            ) : (
                <div className="text-center py-20 text-slate-400">
                    <p>검색 결과가 없습니다.</p>
                </div>
            )}
            
            {/* Search Source Indicator */}
            {searchSource === 'external' && !isLoading && displayItems.length > 0 && (
                <div className="text-center text-xs text-slate-400 mt-2">
                    네이버 검색 결과를 표시하고 있습니다.
                </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
          >
            취소
          </button>
          <button 
            onClick={handleApply}
            disabled={!selectedPlaceId}
            className={`px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all ${
              selectedPlaceId
                ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5'
                : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            {mode === 'replace' ? '이 장소로 변경' : '이 장소 추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

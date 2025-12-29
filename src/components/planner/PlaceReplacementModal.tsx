import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Star, MapPin, X, Check, Loader2 } from 'lucide-react';
import { PlanItem } from '@/types/place';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, startAfter, getDocs, DocumentSnapshot, where } from 'firebase/firestore';
import clsx from 'clsx';

interface PlaceReplacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplace: (newItem: PlanItem) => void;
  originalItem?: PlanItem | null;
  mode?: 'replace' | 'add';
}

// MOCK_RECOMMENDATIONS Removed

const CATEGORIES = ['전체', '음식점', '카페', '관광지', '숙박'];

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
  source: 'internal' | 'external' | 'firebase';
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
  // State for tracking prop changes (to reset state when item changes)
  const [prevKey, setPrevKey] = useState(originalItem?.PLACE_ID);

  // Helper logic for category (can remain local or move out, simplified here)
  const getCategoryFromItem = (item?: PlanItem | null) => {
    if (!item) return '전체';
    const typeToCategory: Record<string, string> = {
      food: '맛집',
      cafe: '카페',
      sightseeing: '관광지',
      activity: '액티비티',
      stay: '전체',
    };
    return typeToCategory[item.type] || '전체';
  };

  const [keyword, setKeyword] = useState('');
  // Initialize lazily
  const [selectedCategory, setSelectedCategory] = useState(() =>
    mode === 'replace' ? getCategoryFromItem(originalItem) : '전체'
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | string | null>(null);

  const [displayItems, setDisplayItems] = useState<SearchResultItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<'internal' | 'external' | 'firebase'>('internal');

  // Firebase Infinite Scroll State
  const [firebaseItems, setFirebaseItems] = useState<SearchResultItem[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // [Fix] Adjust state during render to avoid cascading effects
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const currentKey = originalItem?.PLACE_ID;
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);

    // Reset all state based on new item
    setSelectedCategory(mode === 'replace' ? getCategoryFromItem(originalItem) : '전체');
    setKeyword('');
    setSelectedPlaceId(null);
    setDisplayItems([]); // Empty on reset
    setFirebaseItems([]);
    setLastDoc(null);
    setHasMore(true);
  }

  // Fetch from Firebase
  const fetchFirebasePlaces = useCallback(async (isInitial = false) => {
    if (isFirebaseLoading || (!hasMore && !isInitial)) return;

    setIsFirebaseLoading(true);
    try {
      let q = query(
        collection(db, 'PLACES'),
        orderBy('NAME', 'asc'),
        limit(100)
      );

      if (!isInitial && lastDoc) {
        q = query(
          collection(db, 'PLACES'),
          orderBy('NAME', 'asc'),
          startAfter(lastDoc),
          limit(100)
        );
      }

      const snapshot = await getDocs(q);

      const newItems: SearchResultItem[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // Use Firestore Doc ID
          name: data.NAME,
          category: data.CATEGORY?.main || '기타',
          type: mapCategoryToType(data.CATEGORY?.main || ''),
          address: data.ADDRESS,
          lat: data.LOC_LAT,
          lng: data.LOC_LNG,
          rating: data.RATING,
          source: 'firebase',
          link: data.MAP_LINK
        };
      });

      if (snapshot.docs.length < 100) {
        setHasMore(false);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

      if (isInitial) {
        setFirebaseItems(newItems);
      } else {
        setFirebaseItems(prev => [...prev, ...newItems]);
      }

    } catch (error) {
      console.error("Error fetching places from Firebase:", error);
    } finally {
      setIsFirebaseLoading(false);
    }
  }, [isFirebaseLoading, hasMore, lastDoc]);

  // Initial Fetch on Mount or when Modal Opens
  useEffect(() => {
    if (isOpen && !keyword) {
      // Reset and fetch initial
      setLastDoc(null);
      setHasMore(true);
      fetchFirebasePlaces(true);
    }
  }, [isOpen, keyword, fetchFirebasePlaces]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !keyword && !isFirebaseLoading) {
          fetchFirebasePlaces();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, keyword, isFirebaseLoading, fetchFirebasePlaces]);


  /**
   * @desc 사용자가 입력한 키워드로 장소를 검색하여 PlaceData 배열을 반환하는 함수
   * 여행객이 오타를 내거나 줄임말을 써도 검색되게 하기 위해 NAME_GRAMS 필드를 사용합니다.
   * @param searchTerm 사용자 입력 검색어
   */
  const searchPlacesByName = useCallback(async (searchTerm: string): Promise<SearchResultItem[]> => {
    // 공백 제거
    const cleanTerm = searchTerm.replace(/\s+/g, '');

    if (!cleanTerm) return [];

    try {
      const q = query(
        collection(db, 'PLACES'),
        where('NAME_GRAMS', 'array-contains', cleanTerm),
        limit(20)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return searchPlacesExternal(searchTerm); // 내부 결과 없으면 외부 검색
      }

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.NAME,
          category: data.CATEGORY?.main || '기타',
          type: mapCategoryToType(data.CATEGORY?.main || ''),
          address: data.ADDRESS,
          lat: data.LOC_LAT,
          lng: data.LOC_LNG,
          rating: data.RATING,
          source: 'internal',
          link: data.MAP_LINK
        };
      });

    } catch (error) {
      console.error("Firebase Search Error:", error);
      return [];
    }
  }, []);

  /**
   * @desc 네이버 검색 API를 사용하는 외부 검색 (Fallback)
   */
  const searchPlacesExternal = async (queryStr: string): Promise<SearchResultItem[]> => {
    try {
      const response = await fetch(`/api/search/naver?query=${encodeURIComponent(queryStr)}`);
      if (!response.ok) return [];

      const data = await response.json();
      const items: NaverSearchItem[] = data.items || [];

      return items.map((item, idx) => ({
        id: `external-${idx}`,
        name: item.title.replace(/<[^>]+>/g, ''),
        category: item.category || '기타',
        type: mapCategoryToType(item.category || ''),
        address: item.address || item.roadAddress || '주소 정보 없음',
        lat: 33.4996, // Default (will update on select if mapx/y exists)
        lng: 126.5312,
        source: 'external',
        mapx: item.mapx, // Keep raw for later
        mapy: item.mapy,
        link: item.link
      }));
    } catch (e) {
      console.error("External Search Error:", e);
      return [];
    }
  };

  /**
   * @desc 검색 로직 수행 (내부 + 외부 + 필터링)
   */
  const performSearch = useCallback(async () => {
    if (!keyword.trim()) {
      // 키워드 없으면 카테고리 필터링만 (Firebase Initial List에서)
      if (selectedCategory === '전체') {
        setDisplayItems(firebaseItems);
      } else {
        setDisplayItems(firebaseItems.filter(item => {
          if (selectedCategory === '음식점') return item.type === 'food';
          if (selectedCategory === '카페') return item.type === 'cafe';
          if (selectedCategory === '관광지') return item.type === 'sightseeing';
          if (selectedCategory === '숙박') return item.type === 'stay';
          return true;
        }));
      }
      setSearchSource('firebase');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setDisplayItems([]);

    // 1. Firebase Search (Gram based)
    let results = await searchPlacesByName(keyword);

    // 2. 외부 검색 결과인지 확인
    if (results.length > 0 && results[0].source === 'external') {
      setSearchSource('external');
    } else {
      setSearchSource('internal');
    }

    // 3. 카테고리 필터링
    if (selectedCategory !== '전체') {
      results = results.filter(item => {
        if (selectedCategory === '음식점') return item.type === 'food';
        if (selectedCategory === '카페') return item.type === 'cafe';
        if (selectedCategory === '관광지') return item.type === 'sightseeing';
        if (selectedCategory === '숙박') return item.type === 'stay';
        return true;
      });
    }

    setDisplayItems(results);
    setIsLoading(false);
  }, [keyword, selectedCategory, firebaseItems, searchPlacesByName]);


  // Effect: Keyword or Category Change -> Trigger Search
  useEffect(() => {

    // If keyword exists, debounce search. If not, immediate update from firebaseItems
    if (keyword.trim()) {
      const timer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      performSearch(); // Call immediately for filter updates
    }

  }, [keyword, selectedCategory, firebaseItems, searchPlacesByName]);

  const mapCategoryToType = (cat: string): PlanItem['type'] => {
    if (cat.includes('음식') || cat.includes('맛집') || cat.includes('식당')) return 'food';
    if (cat.includes('카페') || cat.includes('커피')) return 'cafe';
    if (cat.includes('숙소') || cat.includes('숙박') || cat.includes('호텔') || cat.includes('펜션')) return 'stay';
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
      // PlaceData Fields
      _docId: selectedPlaceId?.toString() || Date.now().toString(),
      PLACE_ID: place.source === 'firebase' ? place.id.toString() : Date.now().toString(), // Use Firebase ID if available
      NAME: place.name.replace(/(<([^>]+)>)/gi, ""),
      ADDRESS: place.address || "",
      SUB_REGION: null, // [Added]
      CATEGORY: {
        main: place.category || "",
        sub: ""
      },
      LOC_LAT: finalLat || 33.4996,
      LOC_LNG: finalLng || 126.5312,
      IMAGE_URL: null,
      GALLERY_IMAGES: null,
      MAP_LINK: place.link || "",
      AFFIL_LINK: null,
      IS_AFLT: false,
      IS_TICKET_REQUIRED: false,
      TIME_INFO: null,
      PARKING_INFO: null,
      REST_INFO: null,
      FEE_INFO: null,
      DETAILS: { stayTime: "60" },
      RATING: place.rating || null,
      HIGHTLIGHTS: null,
      KEYWORDS: [],
      NAME_GRAMS: [],
      STAY_TIME: 60,
      PRICE_GRADE: 0,
      STATS: { bookmark_count: 0, view_count: 0, review_count: 0, rating: 0, weight: 0 },
      TAGS: { spring: null, summer: null, autumn: null, winter: null },

      // PlanItem Specific Fields
      day: 1, // 상위에서 덮어씌워짐
      time: "10:00", // 상위에서 계산됨
      type: mapCategoryToType(place.category || ''),
      isLocked: false,
      is_indoor: false // [Added] default
    };

    // 4. 부모 컴포넌트로 전달 및 모달 닫기
    onReplace(newItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="place-replacement-modal-overlay">
      <div
        className="place-replacement-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="place-replacement-modal-header">
          <div>
            <h3 className="title">
              {mode === 'replace' ? '다른 장소로 변경' : '새로운 장소 추가'}
            </h3>
            <p className="description">
              {mode === 'replace' ? '현재 일정을 대체할 장소를 선택하세요.' : '일정에 추가할 장소를 검색하세요.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="place-replacement-modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="place-replacement-modal-body">
          {/* Search Bar */}
          <div className="place-replacement-modal-search-bar">
            <Search className="searchIcon" size={18} />
            <input
              type="text"
              placeholder="장소명, 카테고리 검색 (예: 우진해장국)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />
          </div>

          {/* Categories */}
          <div className="place-replacement-modal-categories">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={clsx(
                  "place-replacement-modal-category-btn",
                  selectedCategory === category && "active"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Recommendations List */}
          <div className="place-replacement-modal-results">
            {isLoading && !displayItems.length ? (
              <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                <Loader2 className="animate-spin" size={24} />
                <span>장소를 찾는 중...</span>
              </div>
            ) : displayItems.length > 0 ? (
              <>
                {displayItems.map((place) => (
                  place.name && (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlaceId(place.id)}
                      className={clsx(
                        "place-replacement-modal-card",
                        selectedPlaceId === place.id && "selected"
                      )}
                    >
                      <div className="place-replacement-modal-card-image">
                        {/* Placeholder Image Logic based on type */}
                        <div className="flex items-center justify-center text-xl">
                          {place.category.includes('음식') ? '🍽️' :
                            place.category.includes('카페') ? '☕' :
                              place.category.includes('숙소') ? '🏠' : '📍'}
                        </div>
                      </div>
                      <div className="place-replacement-modal-card-content">
                        <div className="flex items-center">
                          <h4 className={clsx(selectedPlaceId === place.id && "active")}>
                            {place.name}
                          </h4>
                        </div>
                        <div className="place-replacement-modal-card-meta">
                          <span className="category">{place.category}</span>
                          {place.rating && (
                            <>
                              <span className="dot"></span>
                              <div className="rating">
                                <Star size={12} fill="currentColor" />
                                {place.rating}
                              </div>
                            </>
                          )}
                          {place.distance && (
                            <>
                              <span className="dot"></span>
                              <span>{place.distance}</span>
                            </>
                          )}
                        </div>
                        <div className="place-replacement-modal-address">
                          <MapPin size={12} />
                          {place.address}
                        </div>
                      </div>
                      {selectedPlaceId === place.id && (
                        <div className="place-replacement-modal-check-icon">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  )
                ))}

                {/* Infinite Scroll Loader / Trigger */}
                {!keyword && hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-4">
                    {isFirebaseLoading && <Loader2 className="animate-spin text-slate-400" size={24} />}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <p>검색 결과가 없습니다.</p>
              </div>
            )}

            {/* Search Source Indicator */}
            {searchSource === 'external' && !isLoading && displayItems.length > 0 && (
              <div className="text-xs text-slate-400 text-center mt-2">
                네이버 검색 결과를 표시하고 있습니다.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="place-replacement-modal-footer">
          <button
            onClick={onClose}
            className="place-replacement-modal-btn-cancel"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedPlaceId}
            className={clsx(
              "place-replacement-modal-btn-confirm",
            )}
          >
            {mode === 'replace' ? '이 장소로 변경' : '이 장소 추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

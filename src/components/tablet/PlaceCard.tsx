/**
 * 태블릿 홈 페이지 - Place Card 컴포넌트
 * 
 * @desc 추천 장소를 표시하는 재사용 가능한 카드 컴포넌트입니다.
 *       이미지, 평점, 제목, 위치, 태그 정보를 포함합니다.
 * 
 * @param title - 장소 이름
 * @param location - 위치 정보 (예: "서울 강남구")
 * @param category - 카테고리 (예: "조용한 분위기")
 * @param rating - 평점 (0-5)
 * @param tags - 해시태그 배열
 * @param imageUrl - 장소 이미지 URL
 */

'use client';

interface PlaceCardProps {
    title: string;
    location: string;
    category: string;
    rating: number;
    tags: string[];
    imageUrl: string;
}

export default function PlaceCard({
    title,
    location,
    category,
    rating,
    tags,
    imageUrl,
}: PlaceCardProps) {
    return (
        <div className="min-w-[280px] bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer group">
            {/* 이미지 영역 */}
            <div className="h-40 rounded-lg overflow-hidden mb-3 relative">
                <img
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={imageUrl}
                />
                {/* 평점 배지 */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <span className="text-yellow-500">★</span> {rating.toFixed(1)}
                </div>
            </div>

            {/* 정보 영역 */}
            <div className="px-2 pb-2">
                <h4 className="font-bold text-lg mb-1 truncate text-gray-900">{title}</h4>
                <p className="text-sm text-gray-500 mb-3 truncate">
                    {location} • {category}
                </p>

                {/* 태그들 */}
                <div className="flex gap-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-500"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

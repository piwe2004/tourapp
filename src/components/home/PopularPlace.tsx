'use client';

import Link from "next/link";

interface PlaceCardProps {
    title: string;
    location: string;
    category: string;
    rating: number;
    tags: string[];
    imageUrl: string;
}


function PlaceCard({ title, location, category, rating, tags, imageUrl }: PlaceCardProps) {
    return (
        <div className="
            min-w-[260px] xl:min-w-[280px] 
            bg-white
            rounded-2xl
            shadow-sm hover:shadow-md
            transition-shadow
            border border-gray-100 
            cursor-pointer group snap-center
            overflow-hidden
        ">
            {/* 이미지 */}
            <div className="h-32 xl:h-40 overflow-hidden relative">
                <img
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={imageUrl}
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] xl:text-xs font-bold flex items-center gap-1 shadow-sm">
                    <span className="text-yellow-500">★</span> {rating.toFixed(1)}
                </div>
            </div>
            {/* 정보 */}
            <div className="p-3">
                <h4 className="font-bold text-base xl:text-lg mb-1 truncate text-gray-900">{title}</h4>
                <p className="text-xs xl:text-sm text-gray-500 mb-2 truncate">
                    {location} • {category}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="
                                px-2 py-0.5
                                rounded-md
                                bg-gray-100
                                text-xs xl:text-[12px]
                                text-gray-900
                            "
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function PopularPlace() {

    const PLACES = [
        { title: '카페 오리진', location: '서울 강남구', category: '조용한 분위기', rating: 4.8, tags: ['노트북', '커피맛집'], imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDROeGtKpuTKUtYo94fOLJpVZW2imHFOse71G_VQSXBcb4Dv7Ynhau10h0RraKX3Dlj8YXT4p1beW5dSbJAIyiqWaXsAVcwzIGSAz0Uy2QegRIchfdMj6gwPoYUDNpeAcQ21MMtlOoBSPUhfhwm8yYylImOWyx1a5AdAmyDZQByZcCPCWlbeoyMOhagptqTSUNWUh_eFC1gv_6PkzBeMalGl-DnjMVZkiEVs0QXJykL7QCh_gNkqNC5S63a9m3VXvJsIxJimTM98LM' },
        { title: '더 다이닝', location: '서울 서초구', category: '이탈리안', rating: 4.5, tags: ['데이트', '와인'], imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqKr9dn27DX6Gbp5Ks7Od7IPgZbLjjGEHxjLY6odc8YA9XskF5XhCPaytjAjmrOGnjYWjowb4Ghir_C7L79fKC8bXMv2O85K_ss8pH5kAeJ97L-oFIA41wHml0N4BIV_prac568VE3oz-IHeejBAffJ4l4RCklJAnJwg_wWzSgHoRUIeOuve05-tZfF5Pm2MUCW6nDDIafVXfF4ZBNv3nvYN0l2y7N8qelYdS9HTydIDSdxGLn_mHoB7t2CKo3p9E9LB02DbrinmY' },
        { title: '스테이 서울', location: '서울 용산구', category: '뷰 맛집', rating: 4.9, tags: ['호캉스', '휴식'], imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyfdzgJx0AJI2dzCfq-GNkyMWWcwjXwBcVwWmzEV2DXASqmC34xsgF8_4RDbdDZaOT3iio_KNd-G3Q2gQ_OEStsz6aKnoDk9GmPypXQwShtqVgNcayAMT7LT3Hmch-MXwVA4_r5ib8qiVmWChEQYBslJZXGuFwKLe04h3cU1LYx87M5Wq7YUL_7WW6-Ob4odovj4fWjA_UbbN5Fw6ENQOaBuaD5YD6t4BizdNqJDmkgE-sap8fkDSCjS7ik-enLQ_7qM7GXt5yq4M' },
    ];

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 xl:text-2xl">내 주변 인기 장소</h3>
                    <Link href="/search" className="text-primary hover:text-primary-hover font-medium text-sm flex items-center">
                        더보기 <span className="material-icons-round text-base">chevron_right</span>
                    </Link>
                </div>
                <div className="flex gap-4 xl:gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 xl:mx-0 xl:px-0 snap-x snap-mandatory">
                    {PLACES.map((place, index) => (
                        <PlaceCard key={index} {...place} />
                    ))}
                </div>
            </div>
        </>
    )
}
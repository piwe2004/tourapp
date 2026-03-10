'use client';

import { div } from "framer-motion/client";
import { Baby, Heart, Users, Backpack, HeartHandshake, Dog, Camera, Leaf, Coffee, Utensils } from "lucide-react";


interface Category {
    type: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: string
}

export default function CategoryBox() {

    const CATEGORIES: Category[] = [
        { type: 'children', icon: Baby, label: '아이와 함께', color: '#4F39F6' },
        { type: 'alone', icon: Backpack, label: '홀로', color: '#0084D1' },
        { type: 'couple', icon: Heart, label: '연인', color: '#E60076' },
        // { type: 'friends', icon: Users, label: '친구', color: '#FB2C36' },
        { type: 'parents', icon: HeartHandshake, label: '부모님', color: '#9810FA' },
        { type: 'pet', icon: Dog, label: '애완동물', color: '#BB4D00' },
        // { type: 'photo', icon: Camera, label: '사진 명소', color: '#000' },
        { type: 'nature', icon: Leaf, label: '자연 힐링', color: '#00A63E' },
        { type: 'cafe', icon: Coffee, label: '카페', color: '#FF8181' },
        { type: 'restaurant', icon: Utensils, label: '맛집', color: '#FF9D00' },
    ];

    return (
        <>
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 xl:text-2xl">어떤 장소를 찾고 계신가요?</h3>
                <div className="flex flex-wrap justify-between gap-y-4">
                    {CATEGORIES.map((items, index) => {
                        const IconComponent = items.icon;
                        return (
                            <div key={index} className="w-[24%] xl:w-[11.5%] h-[90px] rounded-[12px] border-2 border-slate-200 text-center bg-white hover:shadow-sm transition-all">
                                <button className="w-full h-full p-2 flex items-center justify-center flex-col gap-2">
                                    <IconComponent color={items.color} />
                                    <span className="text-xs font-semibold text-slate-600">{items.label}</span>
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    );
}
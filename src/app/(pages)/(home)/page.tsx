'use client';

import { useState } from "react";
import HeroSection from "@/components/home/HeroSection";
import TravelCategories from "@/components/home/TravelCategories";
import PopularDestinations from "@/components/home/PopularDestinations";

export default function HomeView({
    destination,
    setDestination,
}: {
    destination: string;
    setDestination: (destination: string) => void;
}) {
    const handleGenerate = () => {
        if (!destination.trim()) {
            alert("여행지를 입력해주세요!"); // 간단한 유효성 검사
            return;
        }
        setIsLoading(true);
        // AI 생성 흉내 (1.5초 딜레이)
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    };
    const [isLoading, setIsLoading] = useState(false);


    return (
        <>
            <HeroSection
                destination={destination}
                setDestination={setDestination}
                handleGenerate={handleGenerate}
                isLoading={isLoading}
            />
            <TravelCategories />
            <PopularDestinations />
        </>
    )
}
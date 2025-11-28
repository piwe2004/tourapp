'use client';

import { useState } from "react";
import HeroSection from "@/components/home/HeroSection";
import TravelCategories from "@/components/home/TravelCategories";
import PopularDestinations from "@/components/home/PopularDestinations";

interface HomeViewProps{
    destination: string;
    setDestination: (destination: string) => void;
    onGenerate:(validDestination:string) => void;
    isLoading:boolean;
}

export default function HomeView({
    destination,
    setDestination,
    onGenerate,
    isLoading
}: HomeViewProps) {

    // 유효성 검사
    const handleButtonClick = () => {
        if (!destination.trim()) {
            alert("여행지를 입력해주세요!");
            return;
        }
        
        onGenerate(destination);
    };


    return (
        <>
            <HeroSection
                destination={destination}
                setDestination={setDestination}
                handleGenerate={handleButtonClick}
                isLoading={isLoading}
            />
            <TravelCategories />
            <PopularDestinations />
        </>
    )
}
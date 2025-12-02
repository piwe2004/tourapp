'use client';

import HeroSection from "@/components/home/HeroSection";
import TravelCategories from "@/components/home/TravelCategories";
import PopularDestinations from "@/components/home/PopularDestinations";

export default function HomeView() {
    return (
        <>
            <HeroSection />
            <TravelCategories />
            <PopularDestinations />
        </>
    )
}
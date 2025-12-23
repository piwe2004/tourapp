'use client';

import HeroSection from "@/components/home/HeroSection";
import TravelCategories from "@/components/home/TravelCategories";
import PopularDestinations from "@/components/home/PopularDestinations";
import MagzineView from "@/components/home/Magzine";

export default function HomeView() {
    return (
        <>
            <HeroSection />
            <TravelCategories />
            <MagzineView />
            <PopularDestinations />
        </>
    )
}
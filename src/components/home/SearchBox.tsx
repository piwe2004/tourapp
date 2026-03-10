'use client';

import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function SearchBox() {

    const [searchQuery, setSearchQuery] = useState('');

    return (
        <>
            {/* Search Bar - Responsive */}
            <form id="searchForm" className="group w-full">
                <div className="bg-white rounded-3xl xl:rounded-4xl p-1 pl-5 shadow-sm xl:shadow-card border border-slate-300 flex flex-row xl:items-center gap-4">
                    <input
                        type="text"
                        name="searchchText"
                        id="searchText"
                        className="
                        basis-full bg-transparent border-none text-base font-medium placeholder-slate-400 focus:ring-0 p-0 h-12 leading-relaxed text-slate-800 xl:flex items-center
                        "
                        placeholder="예) 조용한 분위기의 카페"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    ></input>
                    <div className="flex justify-between items-center pt-0 xl:pl-4 ">
                        <button className="
                        flex items-center gap-2 
                        bg-primary hover:bg-primary-hover 
                        text-white 
                        p-3 sm:px-6
                        rounded-full 
                        font-bold 
                        shadow-lg shadow-primary/30 
                        transition-all transform 
                        active:scale-95 whitespace-nowrap"
                        >
                            <span className="hidden sm:inline">찾아보기</span>
                            <ArrowRight />
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}
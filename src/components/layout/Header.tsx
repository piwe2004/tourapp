import { useEffect, useState } from "react";
import { MapPin, Search, Settings } from "lucide-react";
import { Tab } from "@/types";


export default function Header() {
    const [scrolled, setScrolled] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => { setScrolled(window.scrollY > 20); };
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-4' : 'bg-transparent py-6'}`}>
            <div className="mx-auto px-6 md:px-12 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                        <MapPin size={22} fill="currentColor" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-900">TripMaker</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                        <Search size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-indigo-600 transition-colors shadow-md">
                        <Settings size={20} />
                    </button>
                </div>
            </div>
        </header>
    )
}


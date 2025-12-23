import { TRAVEL_TYPES } from '@/lib/constants';

export default function TravelCategories() {
    return (
        <section className="py-12 px-5 md:px-0">
            <div className="max-w-7xl mx-auto">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-5">이런 여행은 어때요?</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {TRAVEL_TYPES.map((type, idx) => (
                        <button key={idx} className="group relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl transition-all duration-300 bg-white border-2 border-slate-200 shadow-sm cursor-pointer hover:bg-indigo-600 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-2">
                            <div className="p-3.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                                {type.icon}
                            </div>
                            <span className="text-sm font-bold text-slate-600 group-hover:text-white transition-colors duration-300">{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

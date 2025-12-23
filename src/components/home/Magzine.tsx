export default function MagzineView() {
    return (
        <section className="py-6">
            <div className="max-w-7xl mx-auto overflow-hidden rounded-2xl shadow-sm relative group cursor-pointer bg-[#e0e7ff]">
                <div className="flex flex-col-reverse lg:flex-row h-auto lg:h-[280px]">
                    <div className="flex-1 p-6 lg:p-10 flex flex-col justify-center relative z-10">
                        <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur w-fit px-3 py-1 rounded-full text-xs font-bold text-primary mb-3 shadow-sm">
                            <span className="material-symbols-outlined text-sm">umbrella</span>
                            <span>Weather Plan B</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black text-[#121217] mb-3 leading-snug">비 오는 날 제주,<br className="hidden lg:block" /> 걱정 없어요 ☔️</h2>
                        <p className="text-[#6a6783] text-sm lg:text-base mb-6 font-medium">비가 와도 완벽한 여행이 될 수 있도록,<br />실내 관광지 추천 코스를 확인해보세요.</p>
                        <span className="text-sm font-bold text-primary flex items-center group-hover:translate-x-1 transition-transform w-fit">
                            매거진 보러가기
                            <i className="fa-solid fa-arrow-right ml-1 text-[12px]"></i>
                        </span>
                    </div>
                    <div className="flex-1 relative min-h-[200px] lg:min-h-auto overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/20 rounded-full blur-2xl z-0"></div>
                        <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" data-alt="Cozy cafe interior with rain on window view" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHFi82GN7ujRjyMxRwGxZw55cIiM0utFjLJJyQLrgycA0TCdY3pR8U_OPYWi-EiXAAp9p7EyobgQ1Yz56LMTHmFhImYaA5_VQ9ACgWgJSZN0cC7cMhSKJfTs5PbpDXGln27ggbdEkiFlMGrDTVvhBpVhPW5WpKBIZNK2zo7JxaNVztmVA7z2OIVCob1QWecLMwvkMFFkQLq4h-8PhnULi-H0hK4sLa9qxVpeCd7vdj4NmsN6hBun5QP6GqgXDZ-hs3_QaWms-9EgY')" }}>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#e0e7ff] lg:from-transparent lg:bg-gradient-to-l lg:to-[#e0e7ff] via-transparent to-transparent opacity-80"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
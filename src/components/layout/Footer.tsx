export default function Footer(){
    return(
        <footer className="bg-slate-900 text-white py-10 mt-20">
            <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                <span className="font-bold text-xl tracking-tight">TripMaker</span>
                <p className="text-slate-400 text-sm mt-1 opacity-70">당신의 여행을 디자인합니다.</p>
                </div>
                <p className="text-xs text-slate-500 font-medium">© 2024 TripMaker Korea. All rights reserved.</p>
            </div>
        </footer>
    );
}
import { Sparkles } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-0">
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                            <Sparkles size={12} fill="currentColor" />
                        </div>
                        <span className="font-bold text-lg text-slate-900">Planni</span>
                    </div>
                    <p className="text-slate-500 text-sm">가장 친한 여행 친구, 플래니와 함께 떠나보세요.</p>
                </div>
                <div className="flex gap-6 text-xs font-bold text-slate-400">
                    <span className="hover:text-indigo-600 cursor-pointer transition-colors">이용약관</span>
                    <span className="hover:text-indigo-600 cursor-pointer transition-colors">개인정보처리방침</span>
                    <span className="hover:text-indigo-600 cursor-pointer transition-colors">고객센터</span>
                </div>
            </div>
        </footer>
    );
}
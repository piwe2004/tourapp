import { Coffee, Camera, Umbrella, Footprints, Zap } from 'lucide-react';
import { PlannerTheme } from '@/services/ReplanningService';

interface ThemeSelectorProps {
    onSelect: (theme: PlannerTheme) => void;
    selectedTheme?: PlannerTheme;
}

const THEMES: { id: PlannerTheme; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'cafe', label: '감성 카페', icon: <Coffee size={18} />, desc: '여유로운 커피 타임' },
    { id: 'photo', label: '인생샷', icon: <Camera size={18} />, desc: '사진 찍기 좋은 곳' },
    { id: 'indoor', label: '실내 여행', icon: <Umbrella size={18} />, desc: '비 오는 날 추천' },
    { id: 'walk', label: '힐링 산책', icon: <Footprints size={18} />, desc: '자연 속 걷기' },
    { id: 'activity', label: '액티비티', icon: <Zap size={18} />, desc: '신나는 체험' },
];

export default function ThemeSelector({ onSelect, selectedTheme }: ThemeSelectorProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                    <button
                        key={theme.id}
                        onClick={() => onSelect(theme.id)}
                        className={`
                            relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                            ${isSelected 
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md transform scale-105' 
                                : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200 hover:bg-slate-50'
                            }
                        `}
                    >
                        <div className={`mb-2 p-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-100'}`}>
                            {theme.icon}
                        </div>
                        <span className="font-bold text-sm mb-1">{theme.label}</span>
                        <span className="text-xs opacity-70 break-keep text-center">{theme.desc}</span>
                        
                        {isSelected && (
                            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

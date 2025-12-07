interface ButtonProps {
    text: string;
    active: boolean;
    onClick?: () => void;
}

// Button_type1 컴포넌트: 텍스트와 활성 상태, 클릭 이벤트를 받아 버튼을 렌더링합니다.
export default function Button_type1({ text, active, onClick }: ButtonProps) {
    return (
        <button 
            onClick={onClick}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border whitespace-nowrap ${active ? 'bg-slate-900 text-white scale-105' : 'bg-white text-slate-500 border-slate-200 cursor-pointer'}`}
        >
            {text}
        </button>
    )
}
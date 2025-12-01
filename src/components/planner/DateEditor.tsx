'use client';

import { useState } from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateEditorProps {
    startDate: Date;
    endDate: Date;
    onSave: (start: Date, end: Date) => void;
    onClose: () => void;
}

export default function DateEditor({ startDate, endDate, onSave, onClose }: DateEditorProps) {
    // 임시 상태 (저장 버튼 누르기 전까지 유지)
    const [tempStart, setTempStart] = useState<Date>(startDate);
    const [tempEnd, setTempEnd] = useState<Date>(endDate);
    const [currentMonth, setCurrentMonth] = useState(new Date(startDate));

    // 달력 생성 헬퍼 함수
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        // 범위 선택 로직
        // 1. 시작일과 종료일이 같거나, 이미 범위가 설정된 상태에서 새로 클릭하면 -> 시작일로 설정, 종료일도 시작일로
        if (tempStart.getTime() === tempEnd.getTime() || (tempStart < tempEnd && clickedDate < tempStart)) {
            setTempStart(clickedDate);
            setTempEnd(clickedDate);
        }
        // 2. 클릭한 날짜가 시작일보다 뒤면 -> 종료일로 설정
        else if (clickedDate > tempStart) {
            setTempEnd(clickedDate);
        }
        // 3. 그 외 (시작일보다 앞선 날짜 클릭 등) -> 시작일로 리셋
        else {
            setTempStart(clickedDate);
            setTempEnd(clickedDate);
        }
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // 빈 칸 채우기
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        // 날짜 채우기
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isSelected = date >= tempStart && date <= tempEnd;
            const isStart = date.getTime() === tempStart.getTime();
            const isEnd = date.getTime() === tempEnd.getTime();
            const isRange = isSelected && !isStart && !isEnd;

            let className = "h-10 w-10 flex items-center justify-center text-sm rounded-full transition-all cursor-pointer hover:bg-indigo-50";

            if (isStart || isEnd) {
                className += " bg-indigo-600 text-white font-bold shadow-md transform scale-105";
            } else if (isRange) {
                className += " bg-indigo-100 text-indigo-700 rounded-none";
            } else {
                className += " text-slate-700";
            }

            days.push(
                <div key={day} onClick={() => handleDateClick(day)} className="flex items-center justify-center">
                    <button className={className}>
                        {day}
                    </button>
                </div>
            );
        }

        return days;
    };

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 m-4 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="text-indigo-600" size={24} />
                        일정 선택
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* 달력 헤더 */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-600">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-bold text-slate-800">
                        {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                    </span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-600">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 mb-2 text-center">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="text-xs font-medium text-slate-400 uppercase tracking-wider py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7 gap-y-1 mb-6">
                    {renderCalendar()}
                </div>

                {/* 선택된 날짜 표시 */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6 flex justify-between items-center border border-slate-100">
                    <div className="text-center w-1/2 border-r border-slate-200">
                        <p className="text-xs text-slate-400 mb-1">시작일</p>
                        <p className="font-bold text-indigo-600">{formatDate(tempStart)}</p>
                    </div>
                    <div className="text-center w-1/2">
                        <p className="text-xs text-slate-400 mb-1">종료일</p>
                        <p className="font-bold text-indigo-600">{formatDate(tempEnd)}</p>
                    </div>
                </div>

                <button
                    onClick={() => onSave(tempStart, tempEnd)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                    일정 적용하기
                </button>
            </div>
        </div>
    );
}

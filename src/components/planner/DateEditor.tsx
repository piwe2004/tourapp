'use client';

import { useState } from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface DateEditorProps {
    startDate: Date;
    endDate: Date;
    onSave: (start: Date, end: Date) => void;
    onClose: () => void;
    isInline?: boolean;
}


export default function DateEditor({ startDate, endDate, onSave, onClose, isInline = false }: DateEditorProps) {
    // 임시 상태 (저장 버튼 누르기 전까지 유지)
    // 초기값의 시간을 00:00:00으로 정규화하여 달력 날짜(00:00:00)와 비교가 정확하게 되도록 함
    const [tempStart, setTempStart] = useState<Date>(() => {
        const d = new Date(startDate);
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [tempEnd, setTempEnd] = useState<Date>(() => {
        const d = new Date(endDate);
        d.setHours(0, 0, 0, 0);
        return d;
    });
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

        // 날짜 비교를 위해 시간 초기화 (필요시)
        clickedDate.setHours(0, 0, 0, 0);
        const start = new Date(tempStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(tempEnd);
        end.setHours(0, 0, 0, 0);

        // 범위 선택 로직 개선
        // 1. 이미 범위가 선택된 상태라면 (Start != End) -> 새로운 시작일로 리셋
        if (start.getTime() !== end.getTime()) {
            // Category: 날짜 선택 - 범위 재설정
            setTempStart(clickedDate);
            setTempEnd(clickedDate);
        }
        // 2. 단일 날짜가 선택된 상태라면 (Start == End)
        else {
            // 2-1. 클릭한 날짜가 시작일보다 이전이면 -> 시작일 변경 (새로운 시작점)
            if (clickedDate < start) {
                // Category: 날짜 선택 - 시작일 정정
                setTempStart(clickedDate);
                setTempEnd(clickedDate);
            }
            // 2-2. 클릭한 날짜가 시작일보다 이후면 -> 종료일 설정 (범위 완성)
            else if (clickedDate > start) {
                // Category: 날짜 선택 - 종료일 설정
                setTempEnd(clickedDate);
            }
            // 2-3. 같은 날짜 클릭 -> 변경 없음 (또는 해제 로직이 필요하다면 추가)
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
            days.push(<div key={`empty-${i}`} className="empty-day"></div>);
        }

        // 날짜 채우기
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isSelected = date >= tempStart && date <= tempEnd;
            const isStart = date.getTime() === tempStart.getTime();
            const isEnd = date.getTime() === tempEnd.getTime();
            const isRange = isSelected && !isStart && !isEnd;

            days.push(
                <div key={day} onClick={() => handleDateClick(day)} className="day-wrapper">
                    <button className={clsx(
                        "day-button",
                        (isStart || isEnd) && "day-selected",
                        isRange && "day-range",
                        !isSelected && "day-normal"
                    )}>
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

    const content = (
        <div className={clsx("date-editor-container", !isInline && "is-modal")}>
            {!isInline && (
                <div className="date-editor-header">
                    <h3 className="date-editor-title">
                        <CalendarIcon color="#4f46e5" size={24} />
                        일정 선택
                    </h3>
                    <button onClick={onClose} className="date-editor-close-btn">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* 달력 헤더 */}
            <div className="calendar-controls">
                <button onClick={handlePrevMonth} className="calendar-control-btn">
                    <ChevronLeft size={20} />
                </button>
                <span className="current-month">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                </span>
                <button onClick={handleNextMonth} className="calendar-control-btn">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* 요일 헤더 */}
            <div className="week-days-grid">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className="week-day-label">
                        {day}
                    </div>
                ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="days-grid">
                {renderCalendar()}
            </div>

            {/* 선택된 날짜 표시 */}
            <div className="selected-display">
                <div className={clsx("date-box", "with-border")}>
                    <p className="date-label">시작일</p>
                    <p className="date-value">{formatDate(tempStart)}</p>
                </div>
                <div className="date-box">
                    <p className="date-label">종료일</p>
                    <p className="date-value">{formatDate(tempEnd)}</p>
                </div>
            </div>

            <button
                onClick={() => onSave(tempStart, tempEnd)}
                className="date-save-button"
            >
                일정 적용하기
            </button>
        </div>
    );

    if (isInline) {
        return content;
    }

    return (
        <div className="date-editor-overlay">
             {content}
        </div>
    );
}

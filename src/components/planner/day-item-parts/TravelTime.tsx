interface TravelTimeProps {
    onAddStopClick?: (e: React.MouseEvent) => void;
}

/**
 * @desc 다음 장소로의 이동 시간을 표시하고, 경유지 추가 버튼을 제공하는 컴포넌트
 */
export function TravelTime({ onAddStopClick }: TravelTimeProps) {
    return (
        <div className="travel-time-container">
            <div className="vertical-line-spacer">
                {/* 수직선 효과는 상위 Page CSS에서 처리되지만, 여기 빈 공간 확보 */}
            </div>
            
            <div className="travel-content-wrapper">
                {/* 이동 시간 뱃지 */}
                <span className="travel-time-badge">
                    <i className="fa-solid fa-car text-indigo-400 text-[10px] md:text-[12px]"></i>
                    <span>40분 이동</span>
                </span>

                {/* 경유지 추가(+) 버튼 */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddStopClick?.(e);
                    }}
                    className="add-stop-button"
                    title="경유지 추가"
                >
                    <i className="fa-solid fa-plus text-[12px] md:text-[14px]"></i>
                </button>
            </div>
        </div>
    );
}

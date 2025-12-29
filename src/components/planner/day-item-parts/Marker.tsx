import clsx from 'clsx';

interface MarkerProps {
    index: number;
    selected?: boolean;
}

/**
 * @desc DayItems 왼쪽의 숫자 마커 컴포넌트
 * @param index 순서 번호 (0부터 시작하므로 내부에서 +1 처리)
 * @param selected 아이템이 선택되었는지 여부
 */
export function Marker({ index, selected }: MarkerProps) {
    return (
        <div
            className={clsx(
                "day-marker",
                selected ? "day-marker-selected" : "day-marker-normal"
            )}
        >
            {index + 1}
        </div>
    );
}

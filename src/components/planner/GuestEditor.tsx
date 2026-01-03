import { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';

interface GuestEditorProps {
    initialGuests: number;
    onSave: (guests: number) => void;
    onClose: () => void;
    isModal?: boolean;
}

export default function GuestEditor({ initialGuests, onSave, onClose, isModal = true }: GuestEditorProps) {
    const [count, setCount] = useState(initialGuests);

    useEffect(() => {
        setCount(initialGuests);
    }, [initialGuests]);

    const handleIncrement = () => {
        if (count < 10) setCount(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (count > 1) setCount(prev => prev - 1);
    };

    const handleApply = () => {
        onSave(count);
    };

    return (
        <div className="confirm-modal">
            <div className="modalOverlay" onClick={onClose}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="modalHeader">
                        <h3>인원 수 수정</h3>
                        <button onClick={onClose} className="closeButton">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="modalBody" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <button
                                onClick={handleDecrement}
                                disabled={count <= 1}
                                className="icon-btn"
                                style={{
                                    width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e5e7eb',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: count <= 1 ? '#d1d5db' : '#374151',
                                    cursor: count <= 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <Minus size={20} />
                            </button>

                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', minWidth: '2rem', textAlign: 'center' }}>
                                {count}
                            </span>

                            <button
                                onClick={handleIncrement}
                                disabled={count >= 10}
                                className="icon-btn"
                                style={{
                                    width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e5e7eb',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: count >= 10 ? '#d1d5db' : '#374151',
                                    cursor: count >= 10 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>최대 10명까지 선택 가능합니다.</p>
                    </div>

                    <div className="modalFooter">
                        <button onClick={onClose} className="buttonItem-cancel">취소</button>
                        <button onClick={handleApply} className="buttonItem-confirm">적용</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

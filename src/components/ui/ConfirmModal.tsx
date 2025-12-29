import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    message,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal">
            <div
                className="modalOverlay"
                onClick={onClose}
            >
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                    <div className="body">
                        <div className="iconWrapper">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="title">확인</h3>
                        <p className="message">{message}</p>

                        <div className="buttonGroup">
                            <button
                                onClick={onClose}
                                className="cancelButton"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="confirmButton"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { X, MapPin, Search } from 'lucide-react';
import clsx from 'clsx';

interface DestinationEditorProps {
    destination: string;
    onSave: (destination: string) => void;
    onClose: () => void;
    isInline?: boolean;
}

export default function DestinationEditor({ destination, onSave, onClose, isInline = false }: DestinationEditorProps) {
    const [tempDestination, setTempDestination] = useState(destination || '');

    // 추천 여행지 목록 (임시)
    const recommendedDestinations = ['제주도', '부산', '강릉', '경주', '여수', '전주'];

    const content = (
        <div className={clsx("destination-editor-container", !isInline && "destination-editor-modal")}>
            <div className="destination-editor-header">
                <h3 className="destination-editor-title">
                    <MapPin className="text-indigo-600" size={24} />
                    여행지 선택
                </h3>
                {!isInline && (
                    <button onClick={onClose} className="destination-editor-close-btn">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="destination-editor-search-box">
                <Search className="destination-editor-search-icon" size={20} />
                <input
                    type="text"
                    value={tempDestination}
                    onChange={(e) => setTempDestination(e.target.value)}
                    className="destination-editor-input"
                    placeholder="어디로 떠나시나요?"
                    autoFocus
                />
            </div>

            <div className="destination-editor-recommendation-section">
                <p className="destination-editor-recommendation-label">추천 여행지</p>
                <div className="destination-editor-tags">
                    {recommendedDestinations.map(dest => (
                        <button
                            key={dest}
                            onClick={() => setTempDestination(dest)}
                            className={clsx(
                                "destination-editor-tag-btn",
                                tempDestination === dest ? "destination-editor-tag-active" : "destination-editor-tag-normal"
                            )}
                        >
                            {dest}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={() => onSave(tempDestination)}
                disabled={!tempDestination.trim()}
                className="destination-editor-save-btn"
            >
                여행지 변경하기
            </button>
        </div>
    );

    if (isInline) return content;

    return (
        <div className="destination-editor-overlay">
            {content}
        </div>
    );
}

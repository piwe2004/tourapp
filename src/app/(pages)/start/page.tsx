// StartPageRefactored
'use client';

import TravelInputForm from '@/components/home/TravelInputForm';

export default function StartPage() {
    return (
        <div className="start-page-container">
             {/* Background Decoration */}
             <div className="bgDecoration">
                <div className="blob1"></div>
                <div className="blob2"></div>
            </div>

            <div className="contentWrapper">
                 <div className="header-section">
                    <h1>여행 계획 시작하기</h1>
                    <p>여행 코드를 생성하기 위한 정보를 입력해주세요.</p>
                 </div>
                 
                 <div className="formContainer">
                    <TravelInputForm />
                 </div>
            </div>
        </div>
    );
}

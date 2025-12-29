import { ArrowRight, Sparkles } from "lucide-react";
import Link from 'next/link';


export default function Magzine() {
    return (
        <section className="magzine-section">
            <div className="magzine-card group">
                <div className="magzine-container">
                    <div className="magzine-content">
                        <div className="magzine-badge">
                            <Sparkles size={12} fill="currentColor" />
                            <span>Weekly Pick</span>
                        </div>
                        <h2 className="magzine-title">
                            이번 주말, <br className="br-desktop" />
                            조용한 숲속으로 떠나볼까요?
                        </h2>
                        <p className="magzine-description">
                            도심을 벗어나 온전한 휴식을 즐길 수 있는 <br className="br-desktop" />
                            전국의 숲캉스 숙소를 모았습니다.
                        </p>
                        <Link href="/magzine/1" className="magzine-link group-hover:translate-x-1">
                            보러가기 <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>
                    <div className="magzine-image-section">
                        {/* Decorative circles */}
                        <div className="magzine-circle"></div>
                        <div 
                            className="magzine-bg-image"
                            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80)' }}
                        ></div>
                        <div className="magzine-gradient-overlay"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
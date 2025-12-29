import { DESTINATIONS_DB } from '@/lib/constants';
import Image from 'next/image';

export default function PopularDestinations() {
  return (
    <section className="popular-destinations-section">
      <div className="popular-container">
        
        {/* Header */}
        <div className="popular-header">
            <h2 className="popular-title">이달의 인기 여행지</h2>
        </div>

        {/* Grid */}
        <div className="popular-grid">
            {Object.values(DESTINATIONS_DB).slice(0, 4).map((dest) => (
                <div key={dest.city} className="popular-card group">
                    {/* Image */}
                    <div className="popular-image-wrapper">
                        <Image 
                            src={dest.image} 
                            alt={dest.city} 
                            className="popular-image"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                        <div className="popular-gradient"></div>
                    </div>

                    {/* Content */}
                    <div className="popular-content">
                        <h3 className="popular-card-title">{dest.city}</h3>
                        <p className="popular-card-desc">{dest.desc}</p>
                        
                        <div className="popular-tag-container">
                             {dest.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="popular-tag">
                                    #{tag}
                                </span>
                             ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}

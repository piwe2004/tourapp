import { TRAVEL_TYPES } from '@/lib/constants';

export default function TravelCategories() {
  return (
    <section className="travel-categories-section">
      <div className="categories-container">
        <h2 className="categories-title">여행 테마별 추천</h2>
        <div className="categories-grid">
            {TRAVEL_TYPES.map((category, idx) => (
                <div key={idx} className="category-card group">
                    <div className="category-icon-wrapper">
                        {category.icon}
                    </div>
                    <span className="category-label">{category.label}</span>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}

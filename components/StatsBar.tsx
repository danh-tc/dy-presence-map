import { getStats } from "@/lib/places";

export default function StatsBar() {
  const { countries, provinces, total } = getStats();

  return (
    <div className="rethink-stats">
      <div className="rethink-stats__item">
        <span className="rethink-stats__value">{total}</span>
        <span className="rethink-stats__label">địa điểm</span>
      </div>
      <div className="rethink-stats__divider" />
      <div className="rethink-stats__item">
        <span className="rethink-stats__value">{provinces}</span>
        <span className="rethink-stats__label">Tỉnh</span>
      </div>
      <div className="rethink-stats__divider" />
      <div className="rethink-stats__item">
        <span className="rethink-stats__value">{countries}</span>
        <span className="rethink-stats__label">quốc gia</span>
      </div>
    </div>
  );
}

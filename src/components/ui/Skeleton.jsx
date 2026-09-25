// Skeletons mirror the exact dimensions of the real content so swapping them in causes zero CLS

export function Skeleton({ width = '100%', height = 16, radius = 6, style }) {
  return <span className="skeleton" style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="card product-card" aria-hidden="true">
      <div className="product-card__media">
        <Skeleton height="100%" radius={0} />
      </div>
      <div className="product-card__body">
        <Skeleton width="40%" height={12} />
        <Skeleton width="85%" height={18} />
        <Skeleton width="55%" height={18} />
        <Skeleton height={40} radius={10} />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid" role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="detail" role="status" aria-label="Loading product">
      <div className="detail__gallery">
        <Skeleton height="auto" radius={16} style={{ aspectRatio: '1 / 1' }} />
      </div>
      <div className="detail__info stack">
        <Skeleton width="30%" />
        <Skeleton width="80%" height={34} />
        <Skeleton width="40%" height={28} />
        <Skeleton height={90} />
        <Skeleton width="50%" height={44} radius={10} />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container page" role="status" aria-label="Loading page">
      <Skeleton width="35%" height={36} style={{ marginBottom: 24 }} />
      <GridSkeleton count={4} />
    </div>
  );
}

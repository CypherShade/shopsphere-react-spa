import { memo } from 'react';
import { StarIcon } from './Icons';

function Rating({ value = 0 }) {
  return (
    <span className="rating" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <StarIcon width={14} height={14} />
      {value.toFixed(1)}
    </span>
  );
}

export default memo(Rating);

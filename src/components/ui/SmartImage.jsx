import { memo, useState } from 'react';

/**
 * Performance-aware <img>:
 *  - explicit width/height reserve space (prevents CLS)
 *  - native lazy loading + async decoding for below-the-fold images
 *  - `priority` switches to eager + fetchpriority="high" for the LCP image
 *  - fades in once decoded and shows a neutral placeholder until then
 */
function SmartImage({ src, alt, width, height, priority = false, className = '', ...rest }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchpriority={priority ? 'high' : 'auto'}
      onLoad={() => setLoaded(true)}
      className={`smart-img ${loaded ? 'is-loaded' : ''} ${className}`}
      {...rest}
    />
  );
}

export default memo(SmartImage);

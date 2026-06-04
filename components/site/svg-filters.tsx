/**
 * SvgFilters — renders the SVG <defs> block once, near the hero.
 * Only the `grain` filter is included (greenKey and sharpen are unused in this task).
 * Referenced by .hero-grain via filter:url(#grain).
 */
export function SvgFilters() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
    >
      <defs>
        {/* Grain noise turbulento — atmosfera cinematográfica */}
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .12 0" />
        </filter>
      </defs>
    </svg>
  );
}

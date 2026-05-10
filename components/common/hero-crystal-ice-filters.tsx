/**
 * Filter SVG ringan untuk crystal ice (desktop): turb + displacement saja.
 * Mobile / prefers-reduced-* memakai drop-shadow CSS saja — lihat globals.css.
 */
export function HeroCrystalIceFilters() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={1}
      height={1}
      className="pointer-events-none fixed left-0 top-0 -z-[100] overflow-hidden opacity-0"
      style={{ width: 0, height: 0 }}
      aria-hidden
    >
      <defs>
        <filter
          id="heroCrystalIceRefraction"
          x="-45%"
          y="-45%"
          width="190%"
          height="190%"
          filterUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          {/* Noise multi-scale ≈ variasi es retak / gelembung halus */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.032 0.044"
            numOctaves="3"
            seed="31"
            result="iceNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="iceNoise"
            scale="1.32"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

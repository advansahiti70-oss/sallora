type LogoProps = { className?: string }

/**
 * The Sallora wordmark, drawn from docs/brand/sallora-logo-light.svg.
 * The "o" is a round table seen from above and the saffron arc is its timer. The arc fills once,
 * like a timer: the only animation the brand book allows. Decorative here: the page names Sallora in text.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 280 84" aria-hidden="true" focusable="false">
      <g className="logo__letters" fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M29.19 39.57A12 10 0 1 0 20 56A12 10 0 1 1 10.81 72.43" />
        <circle cx="69" cy="56" r="20" />
        <path d="M89 36V76" />
        <path d="M106 10V76M122 10V76" />
        <circle cx="159" cy="56" r="20" />
        <path d="M196 36V76M196 56A20 20 0 0 1 216 36" />
        <circle cx="251" cy="56" r="20" />
        <path d="M271 36V76" />
      </g>
      <path
        className="logo__timer"
        d="M159 36A20 20 0 0 1 173.14 70.14"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        pathLength={1}
      />
    </svg>
  )
}

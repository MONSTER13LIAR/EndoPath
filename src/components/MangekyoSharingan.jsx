import styles from './MangekyoSharingan.module.css'

// One blade path pointing straight up from near-center.
// The base (y≈78) sits just inside the center black circle (r=24, covers y≤76→124),
// so each blade looks firmly rooted in the center.
const BLADE = "M 94 78 Q 83 48 100 18 Q 117 48 106 78 Q 100 86 94 78 Z"

export default function MangekyoSharingan({ size = 180 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.eye}
    >
      <defs>
        <radialGradient id="mgIris" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#C81010" />
          <stop offset="60%"  stopColor="#8B0000" />
          <stop offset="100%" stopColor="#2e0000" />
        </radialGradient>
        <radialGradient id="mgPupil" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#BB0000" />
          <stop offset="100%" stopColor="#550000" />
        </radialGradient>
      </defs>

      {/* ── Iris ── */}
      <circle cx="100" cy="100" r="92" fill="url(#mgIris)" />

      {/* ── Three static blades, each rotated 120° apart ── */}
      {[0, 120, 240].map((angle) => (
        <g key={angle} transform={`rotate(${angle}, 100, 100)`}>
          {/* main blade */}
          <path d={BLADE} fill="#0c0003" />
          {/* subtle inner ridge for depth */}
          <path
            d="M 99 72 Q 96 48 100 22 Q 104 48 101 72 Z"
            fill="#4a0000"
            opacity="0.45"
          />
        </g>
      ))}

      {/* ── Center disk covers blade bases ── */}
      <circle cx="100" cy="100" r="26" fill="#0c0003" />

      {/* ── Pupil ring ── */}
      <circle cx="100" cy="100" r="18" fill="url(#mgPupil)" />

      {/* ── Core pupil ── */}
      <circle cx="100" cy="100" r="10" fill="#0c0003" />

      {/* ── Outer border ring ── */}
      <circle cx="100" cy="100" r="92"
        fill="none" stroke="#CC0000" strokeWidth="2.5" />

      {/* ── Faint mid ring ── */}
      <circle cx="100" cy="100" r="82"
        fill="none" stroke="#FF2200" strokeWidth="0.8" opacity="0.25" />
    </svg>
  )
}

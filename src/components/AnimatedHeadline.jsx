import styles from './AnimatedHeadline.module.css'

const LINE_SHOW_S = 1.0   // how long all lines hold before expanding
const EXPAND_S    = 1.6   // how long the line → letter expansion takes

export default function AnimatedHeadline({ text, className, initialDelay = 0 }) {
  const lineShowDelay  = initialDelay
  const lineExpandDelay = initialDelay + LINE_SHOW_S

  return (
    <h1
      className={`${styles.headline} ${className || ''}`}
      style={{
        '--line-show-delay':  `${lineShowDelay}s`,
        '--expand-delay':     `${lineExpandDelay}s`,
        '--expand-duration':  `${EXPAND_S}s`,
      }}
    >
      {text.split('').map((char, i) => (
        <span
          key={i}
          className={`${styles.char} ${char === ' ' ? styles.space : ''}`}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  )
}

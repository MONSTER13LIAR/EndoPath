import { useEffect, useRef, useState } from 'react'
import styles from './FadeIn.module.css'

/**
 * FadeIn wrapper.
 * - immediate=true  → triggers on mount after `delay` ms  (hero elements)
 * - immediate=false → triggers when element scrolls into view (below-fold)
 */
export default function FadeIn({
  children,
  delay = 0,
  duration = 700,
  distance = 22,
  immediate = false,
  className = '',
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (immediate) {
      const t = setTimeout(() => setVisible(true), delay)
      return () => clearTimeout(t)
    }

    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => setVisible(true), delay)
          observer.disconnect()
          return () => clearTimeout(t)
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [immediate, delay])

  return (
    <div
      ref={ref}
      className={`${styles.root} ${visible ? styles.visible : ''} ${className}`}
      style={{
        '--duration': `${duration}ms`,
        '--distance': `${distance}px`,
      }}
    >
      {children}
    </div>
  )
}

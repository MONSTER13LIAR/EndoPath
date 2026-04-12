import styles from './GridBackground.module.css'

export default function GridBackground() {
  return (
    <div className={styles.root} aria-hidden="true">
      {/* flowing grid lines */}
      <div className={styles.grid} />
      {/* black vignette around all four edges */}
      <div className={styles.vignette} />
    </div>
  )
}

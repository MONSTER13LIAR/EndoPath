import styles from './FlowingParticles.module.css'

export default function FlowingParticles({ isHero = false }) {
  const count = isHero ? 40 : 20
  const sizeRange = isHero ? 12 : 6
  const baseSize = isHero ? 4 : 2

  return (
    <div className={isHero ? `${styles.particlesContainer} ${styles.heroParticles}` : styles.particlesContainer}>
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className={styles.particle} 
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * sizeRange + baseSize}px`,
            height: `${Math.random() * sizeRange + baseSize}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: isHero ? `${Math.random() * 12 + 8}s` : `${Math.random() * 10 + 10}s`,
            opacity: isHero ? Math.random() * 0.6 + 0.4 : Math.random() * 0.5 + 0.1
          }}
        />
      ))}
    </div>
  )
}

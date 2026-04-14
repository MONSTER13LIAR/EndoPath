import styles from './FlowingParticles.module.css'

export default function FlowingParticles() {
  return (
    <div className={styles.particlesContainer}>
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className={styles.particle} 
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            opacity: Math.random() * 0.5 + 0.1
          }}
        />
      ))}
    </div>
  )
}

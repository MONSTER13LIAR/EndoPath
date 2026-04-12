import styles from './Features.module.css'
import FadeIn from '../components/FadeIn'

const FEATURES = [
  {
    title: 'Predict',
    desc: 'Log your symptoms daily through voice or text — pain intensity, location, cycle patterns, fatigue, and more. Our AI builds a risk score over 2–4 weeks and tells you exactly what to say to your doctor.'
  },
  {
    title: 'Confirm',
    desc: 'Stop being dismissed. EndoPath generates a specialist referral letter in medical language your doctor can\'t ignore. It tracks your appointments, flags dismissive responses, and prepares you for every visit with the right questions.'
  },
  {
    title: 'Understand',
    desc: 'Diagnosed and confused? Get personalized education based on your stage — what it means for your fertility, your pain, and your treatment options. Includes a drug interaction checker and anti-inflammatory lifestyle recommendations.'
  },
  {
    title: 'Manage',
    desc: 'EndoPath predicts your pain flares 48–72 hours in advance based on your cycle and symptom history. When a flare is coming, the app prepares you — medication timing, heat therapy reminders, rest scheduling, and emotional support.'
  },
  {
    title: 'Recover',
    desc: 'Track your post-surgery recovery, monitor your fertility journey, and watch your longitudinal health score over months. See if you\'re getting better — with data, not guesswork.'
  }
]

export default function Features() {
  return (
    <main>
      <section className={styles.hero}>
        <FadeIn immediate delay={300} duration={1000} distance={20}>
          <h1>Advanced Precision</h1>
          <p>Clinical-grade insights designed to empower your endometriosis journey.</p>
        </FadeIn>
      </section>

      <section className={styles.featuresList}>
        {FEATURES.map((f, i) => (
          <div key={f.title} className={styles.featureRow}>
            <div className={styles.featureHeader}>
              <FadeIn delay={150} duration={1500} distance={80}>
                <span className={styles.number}>0{i + 1}</span>
                <span className={styles.label}>Protocol</span>
                <h2 className={styles.featureTitle}>{f.title}</h2>
              </FadeIn>
            </div>
            <div className={styles.featureContent}>
              <FadeIn delay={350} duration={1800} distance={100}>
                <p>{f.desc}</p>
              </FadeIn>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}

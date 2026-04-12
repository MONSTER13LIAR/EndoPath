import styles from './Dashboard.module.css'
import FadeIn from '../components/FadeIn'

const STATS = [
  { label: 'Flare Risk Score', value: 'Low', color: '#10B981', trend: '-12%' },
  { label: 'Days Logged', value: '18/21', color: '#7C3AED', trend: '+4' },
  { label: 'Avg Pain Level', value: '2.4', color: '#F59E0B', trend: '-0.5' },
  { label: 'Next Cycle Prediction', value: '4 days', color: '#EC4899', trend: '--' },
]

const RECENT_LOGS = [
  { time: '2 hours ago', symptom: 'Mild pelvic cramping', intensity: 3 },
  { time: 'Yesterday', symptom: 'Fatigue & lower back pain', intensity: 5 },
  { time: '2 days ago', symptom: 'Log: Anti-inflammatory diet day', intensity: 0 },
  { time: '3 days ago', symptom: 'Heavy flare: High intensity', intensity: 8 },
]

export default function Dashboard() {
  return (
    <main className={styles.dashboard}>
      <div className={styles.container}>
        <FadeIn immediate duration={800}>
          <header className={styles.header}>
            <div className={styles.welcome}>
              <h1>Welcome back, Alex</h1>
              <p>Your health metrics for April 12, 2026</p>
            </div>
            <button className={styles.logBtn}>+ Log Symptom</button>
          </header>
        </FadeIn>

        <section className={styles.statsGrid}>
          {STATS.map((s, i) => (
            <FadeIn key={s.label} delay={i * 100} duration={700} distance={20}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>{s.label}</span>
                <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
                <div className={styles.statTrend}>{s.trend} from last week</div>
              </div>
            </FadeIn>
          ))}
        </section>

        <div className={styles.mainGrid}>
          <FadeIn delay={400} duration={800} distance={30} className={styles.chartArea}>
            <div className={styles.card}>
              <h3>Symptom Timeline (Last 14 Days)</h3>
              <div className={styles.chartPlaceholder}>
                <div className={styles.chartBar} style={{ height: '40%' }}></div>
                <div className={styles.chartBar} style={{ height: '60%' }}></div>
                <div className={styles.chartBar} style={{ height: '30%' }}></div>
                <div className={styles.chartBar} style={{ height: '80%', background: '#EF4444' }}></div>
                <div className={styles.chartBar} style={{ height: '50%' }}></div>
                <div className={styles.chartBar} style={{ height: '20%' }}></div>
                <div className={styles.chartBar} style={{ height: '15%' }}></div>
                <div className={styles.chartBar} style={{ height: '45%' }}></div>
                <div className={styles.chartBar} style={{ height: '55%' }}></div>
                <div className={styles.chartBar} style={{ height: '35%' }}></div>
                <div className={styles.chartBar} style={{ height: '25%' }}></div>
                <div className={styles.chartBar} style={{ height: '10%' }}></div>
                <div className={styles.chartBar} style={{ height: '5%' }}></div>
                <div className={styles.chartBar} style={{ height: '12%' }}></div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={500} duration={800} distance={30}>
            <div className={styles.card}>
              <h3>Recent Activity</h3>
              <div className={styles.activityList}>
                {RECENT_LOGS.map((log, i) => (
                  <div key={i} className={styles.activityItem}>
                    <div className={styles.activityInfo}>
                      <strong>{log.symptom}</strong>
                      <span>{log.time}</span>
                    </div>
                    {log.intensity > 0 && (
                      <div className={styles.intensityTag}>
                        Lvl {log.intensity}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  )
}

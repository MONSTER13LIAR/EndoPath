import { Link } from 'react-router-dom'
import styles from './Home.module.css'
import AnimatedHeadline from '../components/AnimatedHeadline'
import FadeIn from '../components/FadeIn'

const WHY_CARDS = [
  { icon: '📊', title: 'Pattern Recognition',   desc: 'Log symptoms daily and let EndoPath surface trends your doctor can act on.' },
  { icon: '🔒', title: 'Private & Secure',       desc: 'Your data is encrypted and never sold. You choose what to share and with whom.' },
  { icon: '🩺', title: 'Doctor-Ready Reports',   desc: 'Generate clear, exportable summaries that speak your care team\'s language.' },
  { icon: '🌙', title: 'Cycle & Pain Tracking',  desc: 'Track your cycle, pain levels, mood, and triggers in under 60 seconds a day.' },
  { icon: '💬', title: 'Community Support',      desc: 'Connect with others on the same journey in a safe, moderated space.' },
  { icon: '📅', title: 'Appointment Prep',       desc: 'Never forget your symptoms before an appointment — EndoPath remembers.' },
]

const STATS = [
  { num: '190M+',    label: 'People affected worldwide' },
  { num: '7–10 yrs', label: 'Average time to diagnosis' },
  { num: '1 in 10',  label: 'Women & girls affected' },
  { num: 'EndoPath', label: 'Helping change those numbers' },
]

const STEPS = [
  { title: 'Create your account',      desc: 'Sign up with your email in under a minute.' },
  { title: 'Log your daily check-in',  desc: 'Rate pain, note symptoms, and tag triggers in a quick guided form.' },
  { title: 'Discover your patterns',   desc: 'Visual timelines and calendar views reveal what\'s driving your flares.' },
  { title: 'Share with your care team',desc: 'Export a PDF report or give your doctor a secure read-only link.' },
]

/*
  Sequence (all in seconds from page load):
  0.00  – navbar slides down
  0.40  – headline lines appear   (initialDelay=0.4)
  1.40  – headline lines expand   (0.4 + 1.0s lineShow)
  0.70  – subtitle fades up
  1.10  – CTA buttons fade up
*/

export default function Home() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <AnimatedHeadline
          text="They said it was normal. It wasn't."
          className={styles.heroHeadline}
          initialDelay={0.4}
        />

        <FadeIn immediate delay={700} duration={900} distance={18}>
          <p className={styles.heroSub}>
            Log your pain. See the pattern. Walk into your doctor's office with proof.
          </p>
        </FadeIn>

        <FadeIn immediate delay={1100} duration={900} distance={18}>
          <div className={styles.heroCta}>
            <a href="/register" className={`${styles.btn} ${styles.primary} ${styles.lg}`}>
              Get Started
            </a>
            <Link to="/features" className={`${styles.btn} ${styles.ghost} ${styles.lg}`}>
              See How It Works
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Stats ── */}
      <FadeIn distance={16} duration={800}>
        <div className={styles.stats}>
          {STATS.map((s, i) => (
            <FadeIn key={s.num} distance={12} duration={600} delay={i * 120}>
              <div className={styles.stat}>
                <div className={styles.statNum}>{s.num}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      {/* ── Why EndoPath ── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <FadeIn duration={700}>
            <p className={styles.sectionLabel}>Why EndoPath</p>
            <h2 className={styles.sectionTitle}>Built around your experience</h2>
            <p className={styles.sectionSub}>
              Every feature was designed with one goal — to give you more control
              over your health story.
            </p>
          </FadeIn>

          <div className={styles.whyGrid}>
            {WHY_CARDS.map((c, i) => (
              <FadeIn key={c.title} duration={650} delay={i * 90} distance={20}>
                <div className={styles.whyCard}>
                  <div className={styles.whyIcon}>{c.icon}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={`${styles.section} ${styles.surfaceBg}`}>
        <div className={styles.container}>
          <FadeIn duration={700}>
            <p className={styles.sectionLabel}>How It Works</p>
            <h2 className={styles.sectionTitle}>Simple. Consistent. Powerful.</h2>
            <p className={styles.sectionSub}>
              Getting started takes less than two minutes. Building your health
              record takes just seconds each day.
            </p>
          </FadeIn>

          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <FadeIn key={s.title} duration={650} delay={i * 120} distance={16}>
                <div className={styles.step}>
                  <div className={styles.stepNum}>{i + 1}</div>
                  <div className={styles.stepBody}>
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <FadeIn duration={800} distance={28}>
            <div className={styles.ctaBanner}>
              <h2>You deserve answers. We help you find them.</h2>
              <p>Join thousands of people taking control of their endometriosis journey.</p>
              <a href="/register" className={`${styles.btn} ${styles.ctaBtn} ${styles.lg}`}>
                Get Started
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <FadeIn duration={600} distance={10}>
        <footer className={styles.footer}>
          <p>
            &copy; 2026 EndoPath &mdash;{' '}
            <a href="#">Privacy Policy</a> &middot; <a href="#">Terms of Service</a>
          </p>
          <p className={styles.footerRights}>All rights reserved to MONSTER LIAR</p>
        </footer>
      </FadeIn>
    </main>
  )
}

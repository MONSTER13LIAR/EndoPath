import { useEffect, useRef, useState } from 'react'
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

function WhyCard({ card }) {
  const ref = useRef(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFocused(entry.isIntersecting)
      },
      {
        // Adjust these to change when the "focus" happens
        rootMargin: '-25% 0px -45% 0px',
        threshold: 0.1,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${styles.whyCard} ${isFocused ? styles.focused : ''}`}
    >
      <div className={styles.whyIcon}>{card.icon}</div>
      <h3>{card.title}</h3>
      <p>{card.desc}</p>
    </div>
  )
}

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
            AI-powered endometriosis companion. Predict. Confirm. Understand. Manage. Recover.
          </p>
        </FadeIn>

        <FadeIn immediate delay={1100} duration={900} distance={18}>
          <div className={styles.heroCta}>
            <a href="/dashboard" className={`${styles.btn} ${styles.primary} ${styles.lg}`}>
              Try EndoPath
            </a>
            <Link to="/features" className={`${styles.btn} ${styles.ghost} ${styles.lg}`}>
              See How It Works
            </Link>
          </div>
        </FadeIn>

        {/* ── Stats carousel — pinned to bottom of viewport ── */}
        <FadeIn immediate delay={1500} duration={1000} distance={12} className={styles.statsAnchor}>
          <div className={styles.statsCarousel}>
            {/* duplicate items for seamless infinite loop */}
            <div className={styles.statsTrack}>
              {[...STATS, ...STATS, ...STATS].map((s, i) => (
                <div key={i} className={styles.statItem}>
                  <div className={styles.statNum}>{s.num}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Why Endo Path ── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <FadeIn duration={700}>
            <p className={styles.sectionLabel}>Why Endo Path</p>
            <h2 className={styles.sectionTitle}>Built around your experience</h2>
            <p className={styles.sectionSub}>
              Every feature was designed with one goal — to give you more control
              over your health story.
            </p>
          </FadeIn>

          <div className={styles.whyGrid}>
            {WHY_CARDS.map((c) => (
              <WhyCard key={c.title} card={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={`${styles.section} ${styles.ctaSection}`}>
        <div className={styles.container}>
          <FadeIn duration={800} distance={28}>
            <div className={styles.ctaBanner}>
              <h2>Predict to Recover</h2>
              <p>Your full journey : Start now</p>
              <a href="/dashboard" className={`${styles.btn} ${styles.ctaBtn} ${styles.lg}`}>
                Get Started
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p>
          &copy; 2026 EndoPath &mdash;{' '}
          <a href="#">Privacy Policy</a> &middot; <a href="#">Terms of Service</a>
        </p>
        <p className={styles.footerRights}>
          All rights reserved to MONSTER LIAR &middot; Made with ❤️ for Hackathon 2026
        </p>
      </footer>
    </main>
  )
}

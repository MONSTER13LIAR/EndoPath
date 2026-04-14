import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import styles from './Support.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'

export default function Support() {
  const { isLocked } = useOutletContext()
  const [hovered, setHovered] = useState(null)

  return (
    <div className={styles.layout}>
      <FlowingParticles />

      <FadeIn immediate duration={600} style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        <div className={styles.inner}>

          {/* Header */}
          <FadeIn immediate delay={80} duration={700} distance={20}>
            <div className={styles.header}>
              <span className={styles.eyebrow}>Support</span>
              <h1 className={styles.title}>How can we help you?</h1>
              <p className={styles.sub}>
                Choose how you'd like to get support. Our AI is available instantly
                and knows your health data — it's the fastest way to get answers.
              </p>
            </div>
          </FadeIn>

          {/* Cards */}
          <div className={styles.cards}>

            {/* AI Support — recommended */}
            <FadeIn immediate delay={180} duration={700} distance={24}>
              <Link
                to="/puffy-ai"
                className={`${styles.card} ${styles.cardAI} ${hovered === 'ai' ? styles.cardHovered : ''}`}
                onMouseEnter={() => setHovered('ai')}
                onMouseLeave={() => setHovered(null)}
              >
                <div className={styles.recommendedBadge}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                  Recommended
                </div>

                <div className={styles.cardIcon} data-variant="ai">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="16" cy="15" rx="12" ry="11"/>
                    <ellipse cx="5.5" cy="18" rx="4" ry="3.5"/>
                    <ellipse cx="26.5" cy="18" rx="4" ry="3.5"/>
                    <circle cx="12" cy="13" r="1.6" fill="currentColor" stroke="none"/>
                    <circle cx="20" cy="13" r="1.6" fill="currentColor" stroke="none"/>
                    <circle cx="10.5" cy="18.5" r="2" fill="rgba(236,72,153,0.4)" stroke="none"/>
                    <circle cx="21.5" cy="18.5" r="2" fill="rgba(236,72,153,0.4)" stroke="none"/>
                    <ellipse cx="16" cy="20.5" rx="2.2" ry="1.8" strokeWidth="1.5"/>
                  </svg>
                </div>

                <h2>Talk to PuffyAI</h2>

                <div className={styles.responseTime} data-variant="ai">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Responds instantly
                </div>

                <p className={styles.cardDesc}>
                  PuffyAI is our dedicated support assistant. Ask anything about the app —
                  how features work, account questions, or getting the most out of EndoPath.
                </p>

                <ul className={styles.perks}>
                  <li>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    Available 24 / 7 with no wait time
                  </li>
                  <li>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    Personalised to your EndoPath data
                  </li>
                  <li>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    Covers symptoms, cycles, and lifestyle
                  </li>
                </ul>

                <div className={styles.cardCta} data-variant="ai">
                  Start chatting
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </div>
              </Link>
            </FadeIn>

            {/* Human Support */}
            <FadeIn immediate delay={280} duration={700} distance={24}>
              <div
                className={`${styles.card} ${styles.cardHuman} ${hovered === 'human' ? styles.cardHovered : ''}`}
                onMouseEnter={() => setHovered('human')}
                onMouseLeave={() => setHovered(null)}
              >
                <div className={styles.cardIcon} data-variant="human">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>

                <h2>Talk to a Human</h2>

                <div className={styles.responseTime} data-variant="human">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Typically responds in a few minutes
                </div>

                <p className={styles.cardDesc}>
                  Connect with a member of our care team for complex questions, account
                  issues, or anything that needs a human touch.
                </p>

                <ul className={styles.perks}>
                  <li>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    Real care team, Monday – Friday
                  </li>
                  <li>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    Best for account &amp; billing questions
                  </li>
                  <li>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span className={styles.dimText}>Response times may vary</span>
                  </li>
                </ul>

                <button className={styles.cardCta} data-variant="human">
                  Open a ticket
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>

                <p className={styles.nudge}>
                  Not urgent? <Link to="/puffy-ai" className={styles.nudgeLink}>PuffyAI can answer most questions instantly →</Link>
                </p>
              </div>
            </FadeIn>

          </div>
        </div>
      </FadeIn>
    </div>
  )
}

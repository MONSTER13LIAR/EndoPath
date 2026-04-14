import { useOutletContext } from 'react-router-dom'
import styles from './Library.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'

export default function Library() {
  const { isLocked } = useOutletContext()

  return (
    <div className={styles.libraryLayout}>
      <FlowingParticles />
      <FadeIn immediate duration={600} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* ── Page header ── */}
        <FadeIn immediate delay={100} duration={600}>
          <div className={styles.pageHeader}>
            <div className={styles.pageTitleGroup}>
              <span className={styles.eyebrow}>Library</span>
              <h2 className={styles.pageTitle}>Your Health Records</h2>
              <p className={styles.pageSub}>Body maps and chat sessions shared with EndoAI will be stored here.</p>
            </div>
          </div>
        </FadeIn>

        {/* ── Scrollable body ── */}
        <div className={styles.body}>

          {/* Body Maps & Photos */}
          <FadeIn immediate delay={200} duration={700} distance={24}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleRow}>
                  <div className={styles.sectionIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <h3>Body Maps &amp; Photos</h3>
                </div>
                <span className={styles.countBadge}>0 items</span>
              </div>

              {/* Ghost grid — shows the future layout */}
              <div className={styles.mediaGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.mediaGhost}>
                    <div className={styles.mediaGhostIcon}>
                      {i % 2 === 0 ? (
                        /* body diagram ghost */
                        <svg width="28" height="36" viewBox="0 0 22 28" fill="none" stroke="rgba(167,139,250,0.25)" strokeWidth="1.2" strokeLinecap="round">
                          <ellipse cx="11" cy="3.2" rx="2.6" ry="2.6"/>
                          <ellipse cx="11" cy="7" rx="1.2" ry="0.9"/>
                          <ellipse cx="11" cy="9.5" rx="4.8" ry="1.4"/>
                          <ellipse cx="11" cy="13" rx="3.6" ry="3.2"/>
                          <ellipse cx="11" cy="17.5" rx="4" ry="1.6"/>
                          <ellipse cx="5.5" cy="11.5" rx="1.1" ry="2.6" transform="rotate(-10 5.5 11.5)"/>
                          <ellipse cx="4.2" cy="16" rx="0.9" ry="2.4" transform="rotate(8 4.2 16)"/>
                          <ellipse cx="16.5" cy="11.5" rx="1.1" ry="2.6" transform="rotate(10 16.5 11.5)"/>
                          <ellipse cx="17.8" cy="16" rx="0.9" ry="2.4" transform="rotate(-8 17.8 16)"/>
                          <ellipse cx="8.8" cy="21.5" rx="1.5" ry="2.8" transform="rotate(-4 8.8 21.5)"/>
                          <ellipse cx="8.2" cy="26.2" rx="1.1" ry="2" transform="rotate(3 8.2 26.2)"/>
                          <ellipse cx="13.2" cy="21.5" rx="1.5" ry="2.8" transform="rotate(4 13.2 21.5)"/>
                          <ellipse cx="13.8" cy="26.2" rx="1.1" ry="2" transform="rotate(-3 13.8 26.2)"/>
                        </svg>
                      ) : (
                        /* photo ghost */
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.emptyOverlay}>
                <p>Body maps and photos you share in EndoAI will appear here.</p>
              </div>
            </section>
          </FadeIn>

          {/* Chat History */}
          <FadeIn immediate delay={320} duration={700} distance={24}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleRow}>
                  <div className={styles.sectionIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <h3>Chat History</h3>
                </div>
                <span className={styles.countBadge}>0 sessions</span>
              </div>

              {/* Ghost rows — shows the future layout */}
              <div className={styles.historyList}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={styles.historyGhost}>
                    <div className={styles.historyGhostAvatar} />
                    <div className={styles.historyGhostLines}>
                      <div className={styles.historyGhostTitle} style={{ width: `${55 + i * 10}%` }} />
                      <div className={styles.historyGhostSub} style={{ width: `${30 + i * 8}%` }} />
                    </div>
                    <div className={styles.historyGhostDate} />
                  </div>
                ))}
              </div>

              <div className={styles.emptyOverlay}>
                <p>Your EndoAI conversation history will be saved and searchable here.</p>
              </div>
            </section>
          </FadeIn>

        </div>
      </FadeIn>
    </div>
  )
}

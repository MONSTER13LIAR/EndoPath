import { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Library.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'

export default function Library() {
  const { isLocked } = useOutletContext()
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)   // { question, answer }
  const [loading, setLoading] = useState(false)
  const responseRef = useRef(null)

  // Scroll response block to bottom when answer updates
  useEffect(() => {
    if (responseRef.current) responseRef.current.scrollTop = responseRef.current.scrollHeight
  }, [response])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    const question = query.trim()
    setQuery('')
    setLoading(true)
    setResponse({ question, answer: null })

    try {
      const res = await fetch('http://localhost:8000/api/nerdai/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      })
      const data = await res.json()
      setResponse({ question, answer: data.content ?? data.error ?? 'Something went wrong.' })
    } catch {
      setResponse({ question, answer: 'Could not reach the server. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

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

        {/* ── Sticky chat bar + response block ── */}
        <div className={styles.chatBarWrap}>

          {/* NerdAI response block */}
          {response && (
            <div className={styles.nerdBlock}>
              {/* Header */}
              <div className={styles.nerdHeader}>
                <div className={styles.nerdBadge}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  NerdAI
                </div>
                <button
                  type="button"
                  className={styles.nerdClose}
                  onClick={() => setResponse(null)}
                  title="Dismiss"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Question echo */}
              <p className={styles.nerdQuestion}>{response.question}</p>

              {/* Answer */}
              <div className={styles.nerdAnswer} ref={responseRef}>
                {loading
                  ? <span className={styles.nerdLoading}>Thinking…</span>
                  : <span>{response.answer}</span>
                }
              </div>
            </div>
          )}

          {/* Chat bar */}
          <form className={styles.chatBar} onSubmit={handleSend}>
            <button type="button" className={styles.chatBarBtn} title="Voice input">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>

            <input
              type="text"
              className={styles.chatBarInput}
              placeholder="Ask NerdAI anything about your library…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button type="submit" className={styles.chatBarSend} disabled={loading} title="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>

      </FadeIn>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Library.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'
import { useChat } from '../context/ChatContext'

const STAGES = [
  { id: 'predict', label: 'Predict' },
  { id: 'prepare', label: 'Prepare' },
  { id: 'action', label: 'Action' },
  { id: 'manage', label: 'Manage' },
  { id: 'stabilize', label: 'Stabilize' },
  { id: 'recover', label: 'Recover' },
]

export default function Library() {
  const { isLocked } = useOutletContext()
  const { endoMessages, unlockedStages } = useChat()
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)   // { question, answer }
  const [loading, setLoading] = useState(false)
  const responseRef = useRef(null)

  // Chat history state
  const [selectedStage, setSelectedStage] = useState('predict')

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
      const res = await fetch('http://127.0.0.1:8000/api/nerdai/chat/', {
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

  // Filter messages for the selected stage
  const stageMessages = endoMessages ? endoMessages.filter(m => m.stage === selectedStage) : []

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
                          <ellipse cx="11" cy="2.5" rx="2.2" ry="2.5"/>
                          <ellipse cx="11" cy="5.2" rx="1.1" ry="0.8"/>
                          <ellipse cx="11" cy="8.5" rx="5.5" ry="2.2"/>
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

          {/* Chat History Section */}
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
                <span className={styles.countBadge}>{stageMessages.length} messages</span>
              </div>

              {/* Stage Progression Selector */}
              <div className={styles.stageSelector}>
                {STAGES.map((stage) => {
                  const isUnlocked = unlockedStages.includes(stage.id)
                  const isSelected = selectedStage === stage.id
                  return (
                    <button
                      key={stage.id}
                      className={`
                        ${styles.stageBtn} 
                        ${isSelected ? styles.stageBtnActive : ''} 
                        ${!isUnlocked ? styles.stageBtnLocked : ''}
                      `}
                      onClick={() => isUnlocked && setSelectedStage(stage.id)}
                      disabled={!isUnlocked}
                    >
                      {stage.label}
                    </button>
                  )
                })}
              </div>

              <div className={styles.historyContent}>
                {stageMessages.length > 0 ? (
                  <div className={styles.messageList}>
                    {stageMessages.map((msg, i) => (
                      <div key={i} className={`${styles.messageItem} ${styles[msg.role]}`}>
                        <div className={styles.messageBubble}>
                          {msg.content}
                          {msg.image && <img src={msg.image} className={styles.msgImage} alt="Uploaded" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyHistory}>
                    <p>No chat history available for the <strong>{selectedStage.toUpperCase()}</strong> stage.</p>
                  </div>
                )}
              </div>
            </section>
          </FadeIn>

        </div>

        {/* ── Sticky chat bar + response block ── */}
        <div className={styles.chatBarWrap}>
          {response && (
            <div className={styles.nerdBlock}>
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
              <p className={styles.nerdQuestion}>{response.question}</p>
              <div className={styles.nerdAnswer} ref={responseRef}>
                {loading
                  ? <span className={styles.nerdLoading}>Thinking…</span>
                  : <span>{response.answer}</span>
                }
              </div>
            </div>
          )}

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

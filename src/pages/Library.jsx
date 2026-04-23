import { useState, useRef, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './Library.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'
import { useChat } from '../context/ChatContext'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

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
  const { endoMessages, unlockedStages, symptomLogs, keyInsights, referrals } = useChat()
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)   // { question, answer }
  const [loading, setLoading] = useState(false)
  const responseRef = useRef(null)

  // Chat history state
  const [selectedStage, setSelectedStage] = useState('predict')
  const [isMediaRevealed, setIsMediaRevealed] = useState(false)

  // Extract media items (Images and Body Maps) from all endoMessages
  const mediaItems = useMemo(() => {
    if (!endoMessages) return []
    const items = []
    
    endoMessages.forEach((msg, idx) => {
      // 1. Extract Images
      if (msg.image) {
        items.push({
          id: `img-${idx}`,
          type: 'image',
          url: msg.image,
          stage: msg.stage,
          role: msg.role
        })
      }
      
      // 2. Extract Body Maps
      if (msg.bodyParts && msg.bodyParts.length > 0) {
        items.push({
          id: `map-${idx}`,
          type: 'bodymap',
          parts: msg.bodyParts,
          stage: msg.stage,
          role: msg.role
        })
      }
    })
    
    return items.reverse() // Newest first
  }, [endoMessages])

  // Scroll response block to bottom when answer updates
  useEffect(() => {
    if (responseRef.current) responseRef.current.scrollTop = responseRef.current.scrollHeight
  }, [response])

  const generatePDF = () => {
    const doc = new jsPDF()
    const primaryColor = [124, 58, 237] // #7C3AED

    // Title
    doc.setFontSize(22)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text('EndoPath Health Report', 14, 22)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 30)
    
    // Symptom Logs Table
    doc.setFontSize(16)
    doc.setTextColor(0)
    doc.text('Symptom History', 14, 45)
    
    const logData = (symptomLogs || []).map(log => [log.time, log.symptom, `Level ${log.intensity}`])
    if (logData.length > 0) {
      doc.autoTable({
        startY: 50,
        head: [['Time', 'Symptom', 'Intensity']],
        body: logData,
        headStyles: { fillColor: primaryColor },
      })
    } else {
      doc.setFontSize(11)
      doc.text('No symptoms logged yet.', 14, 55)
      doc.lastAutoTable = { finalY: 55 }
    }

    // Key Insights
    let finalY = (doc.lastAutoTable?.finalY || 55) + 15
    doc.setFontSize(16)
    doc.text('Key Insights', 14, finalY)
    doc.setFontSize(11)
    if (keyInsights && keyInsights.length > 0) {
      keyInsights.forEach((insight, i) => {
        doc.text(`• ${insight}`, 14, finalY + 10 + (i * 7))
      })
      finalY = finalY + 10 + (keyInsights.length * 7)
    } else {
      doc.text('No insights generated yet.', 14, finalY + 10)
      finalY = finalY + 20
    }

    // Referrals
    doc.setFontSize(16)
    doc.text('Recommendations', 14, finalY)
    
    const refData = (referrals || []).map(ref => [ref.type, ref.name, ref.urgency, ref.stage])
    if (refData.length > 0) {
      doc.autoTable({
        startY: finalY + 5,
        head: [['Type', 'Recommendation', 'Urgency', 'Stage']],
        body: refData,
        headStyles: { fillColor: primaryColor },
      })
    } else {
      doc.setFontSize(11)
      doc.text('No recommendations yet.', 14, finalY + 15)
    }

    doc.save('EndoPath_Report.pdf')
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    const question = query.trim()
    setQuery('')
    setLoading(true)
    setResponse({ question, answer: null })

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/nerdai/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: question,
          history: endoMessages // Provide full history for analysis
        }),
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

  // Mini Body Mapper component for the library grid
  const MiniBody = ({ parts }) => {
    const g = '#22c55e'
    const dim = 'rgba(255,255,255,0.05)'
    const dimLine = 'rgba(255,255,255,0.1)'
    const ABDOMEN_KEYS = ['Hypochondriac','Lumbar','Iliac','Epigastric','Umbilical','Hypogastric','Abdomen']
    const anyAbdomen = parts.some(p => ABDOMEN_KEYS.some(k => p.includes(k)))
    const anyPelvis = parts.some(p => p.includes('Ovary') || p === 'Uterus' || p.includes('Pelvic'))
    const anyRightArm = parts.some(p => p.includes('Right') && (p.includes('Arm') || p.includes('Forearm')))
    const anyLeftArm = parts.some(p => p.includes('Left') && (p.includes('Arm') || p.includes('Forearm')))
    const anyRightLeg = parts.some(p => p.includes('Right') && (p.includes('Leg') || p.includes('Thigh')))
    const anyLeftLeg = parts.some(p => p.includes('Left') && (p.includes('Leg') || p.includes('Thigh')))
    return (
      <svg viewBox="0 0 22 30" className={styles.miniBodySvg}>
        <ellipse cx="11" cy="2.5" rx="2.2" ry="2.5" fill={parts.includes('Head') ? g : dim} />
        <ellipse cx="11" cy="5.2" rx="1.1" ry="0.8" fill={parts.includes('Neck') ? g : dim} />
        <ellipse cx="11" cy="8.5" rx="5.5" ry="2.2" fill={parts.includes('Chest') ? g : dim} />
        <rect x="6.5" y="11" width="9" height="4.5" rx="0.5" fill={anyAbdomen ? g : dim} />
        <rect x="5.5" y="15.5" width="11" height="3" rx="0.8" fill={anyPelvis ? g : dim} />
        <path d="M5.5 9 L3 16" stroke={anyRightArm ? g : dimLine} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M16.5 9 L19 16" stroke={anyLeftArm ? g : dimLine} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8 18.5 L7.5 29" stroke={anyRightLeg ? g : dimLine} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 18.5 L14.5 29" stroke={anyLeftLeg ? g : dimLine} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
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
              <p className={styles.pageSub}>Body maps and chat sessions shared with EndoAI are stored here.</p>
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
                <span className={styles.countBadge}>{mediaItems.length} items</span>
              </div>

              <div className={`${styles.mediaContainer} ${!isMediaRevealed ? styles.mediaBlurred : ''}`}>
                {mediaItems.length > 0 ? (
                  <div className={styles.mediaGrid}>
                    {mediaItems.map((item) => (
                      <div key={item.id} className={styles.mediaCard}>
                        <div className={styles.mediaPreview}>
                          {item.type === 'image' ? (
                            <img src={item.url} alt="Shared report" className={styles.mediaImg} />
                          ) : (
                            <div className={styles.mediaMapWrap}>
                              <MiniBody parts={item.parts} />
                            </div>
                          )}
                        </div>
                        <div className={styles.mediaInfo}>
                          <span className={styles.mediaStage}>{item.stage.toUpperCase()}</span>
                          <span className={styles.mediaType}>{item.type === 'image' ? 'Photo' : 'Body Map'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className={styles.mediaGrid}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={styles.mediaGhost}>
                          <div className={styles.mediaGhostIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.15)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.emptyOverlay}>
                      <p>Body maps and photos you share in EndoAI will appear here.</p>
                    </div>
                  </>
                )}

                {/* Privacy Reveal Overlay */}
                {!isMediaRevealed && mediaItems.length > 0 && (
                  <div className={styles.revealOverlay}>
                    <button 
                      className={styles.revealBtn}
                      onClick={() => setIsMediaRevealed(true)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Reveal Records
                    </button>
                  </div>
                )}
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
                  const isUnlocked = unlockedStages?.includes(stage.id)
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

import { useState, useRef, useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import aiStyles from './Placeholder.module.css'
import styles from './PuffyAI.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'

export default function PuffyAI() {
  const { isLocked } = useOutletContext()
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hi there! I'm PuffyAI, your EndoPath support assistant. I'm here to help with anything about the app — features, account questions, how things work, or anything else. What can I help you with today?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8000/api/puffyai/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', content: data.content ?? data.error ?? 'Something went wrong.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Could not reach the server. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={aiStyles.chatLayout} style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <FlowingParticles />
      <FadeIn immediate duration={600} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header bar ── */}
        <div className={styles.topBar}>
          <Link to="/support" className={styles.backBtn} title="Back to Support">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Support
          </Link>

          <div className={styles.identity}>
            <div className={styles.avatar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <div className={styles.identityText}>
              <span className={styles.identityName}>PuffyAI</span>
              <span className={styles.identityRole}>Support Assistant</span>
            </div>
          </div>

          <div className={styles.statusBadgeWrap}>
            <div className={aiStyles.statusBadge}>Online</div>
          </div>
        </div>

        {/* ── Chat window ── */}
        <div className={aiStyles.chatWindowFull}>
          <div className={aiStyles.chatMessages}>
            {messages.map((m, i) => (
              <div key={i} className={`${aiStyles.message} ${aiStyles[m.role]}`}>
                {m.role === 'ai' && (
                  <div className={styles.aiAvatar}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                  </div>
                )}
                <div className={aiStyles.messageBubble}>{m.content}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className={aiStyles.chatInputArea}>
            <div className={aiStyles.inputActionsLeft}>
              <button type="button" className={`${aiStyles.actionBtn} ${aiStyles.micBtn}`} title="Voice Input">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask PuffyAI anything about EndoPath..."
              className={aiStyles.chatInput}
            />
            <button type="submit" className={aiStyles.sendBtn} disabled={loading}>
              {loading
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'spin 1s linear infinite'}}><circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              }
            </button>
          </form>
        </div>

      </FadeIn>
    </div>
  )
}

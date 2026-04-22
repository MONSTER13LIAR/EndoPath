import { useState, useRef, useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import aiStyles from './Placeholder.module.css'
import styles from './PuffyAI.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'

export default function PuffyAI() {
  const { isLocked } = useOutletContext()
  const { user } = useAuth()
  const { puffyMessages, setPuffyMessages, currentStage, unlockedStages } = useChat()
  
  const [messages, setMessages] = useState(() => {
    if (puffyMessages) return puffyMessages
    return [
      {
        role: 'ai',
        content: user 
          ? `Hi ${user.name.split(' ')[0]}! I'm PuffyAI, your EndoPath support assistant. I'm here to help with anything about the app — features, account questions, how things work, or anything else. What can I help you with today?`
          : "Hi there! I'm PuffyAI, your EndoPath support assistant. I'm here to help with anything about the app — features, account questions, how things work, or anything else. What can I help you with today?",
      },
    ]
  })

  useEffect(() => {
    setPuffyMessages(messages)
  }, [messages, setPuffyMessages])

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/puffyai/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages,
          context: { currentStage, unlockedStages }
        }),
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
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {/* Puffy wide head */}
                <ellipse cx="16" cy="15" rx="12" ry="11"/>
                {/* Left puffed cheek */}
                <ellipse cx="5.5" cy="18" rx="4" ry="3.5"/>
                {/* Right puffed cheek */}
                <ellipse cx="26.5" cy="18" rx="4" ry="3.5"/>
                {/* Eyes */}
                <circle cx="12" cy="13" r="1.6" fill="currentColor" stroke="none"/>
                <circle cx="20" cy="13" r="1.6" fill="currentColor" stroke="none"/>
                {/* Rosy blush */}
                <circle cx="10.5" cy="18.5" r="2" fill="rgba(236,72,153,0.4)" stroke="none"/>
                <circle cx="21.5" cy="18.5" r="2" fill="rgba(236,72,153,0.4)" stroke="none"/>
                {/* Puckered puffing mouth */}
                <ellipse cx="16" cy="20.5" rx="2.2" ry="1.8" strokeWidth="1.5"/>
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
                    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                )}
                <div className={aiStyles.messageBubble}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className={`${aiStyles.message} ${aiStyles.ai}`}>
                <div className={styles.aiAvatar}>
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                <div className={aiStyles.messageBubble}>
                  <div className={aiStyles.typing}>
                    <div className={aiStyles.dot}></div>
                    <div className={aiStyles.dot}></div>
                    <div className={aiStyles.dot}></div>
                  </div>
                </div>
              </div>
            )}
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

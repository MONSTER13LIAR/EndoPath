import { useState, useRef, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import aiStyles from './Placeholder.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'

const STAGES = [
  { id: 'predict', label: 'Predict', locked: false },
  { id: 'prepare', label: 'Prepare', locked: true },
  { id: 'action', label: 'Action', locked: true },
  { id: 'manage', label: 'Manage', locked: true },
  { id: 'stabilize', label: 'Stabilize', locked: true },
  { id: 'recover', label: 'Recover', locked: true },
]

export default function EndoAI() {
  const { isLocked } = useOutletContext()
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello Alex. I'm EndoAI, your personalized health assistant. I've unlocked the 'Predict' stage based on your recent data. How can I help you prepare for your next cycle?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
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
      const res = await fetch('http://localhost:8000/api/endoai/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          stage: STAGES.find(s => !s.locked)?.id ?? 'predict',
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
        {/* Stages Tracker */}
        <div className={aiStyles.stagesContainerFull}>
          {STAGES.map((stage, i) => (
            <div key={stage.id} className={`${aiStyles.stageCard} ${stage.locked ? aiStyles.stageLocked : aiStyles.stageUnlocked}`}>
              <div className={aiStyles.stageIcon}>
                {stage.locked ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg>
                )}
              </div>
              <span>{stage.label}</span>
              {i < STAGES.length - 1 && <div className={aiStyles.stageLine}></div>}
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className={aiStyles.chatWindowFull}>
          <div className={aiStyles.chatHeader}>
            <h3>EndoAI Assistant</h3>
            <div className={aiStyles.statusBadge}>Online</div>
          </div>
          
          <div className={aiStyles.chatMessages}>
            {messages.map((m, i) => (
              <div key={i} className={`${aiStyles.message} ${aiStyles[m.role]}`}>
                <div className={aiStyles.messageBubble}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className={aiStyles.chatInputArea}>
            <div className={aiStyles.inputActionsLeft}>
              <button type="button" className={`${aiStyles.actionBtn} ${aiStyles.bodyBtn}`} title="Body Map">
                <svg width="22" height="28" viewBox="0 0 22 28" fill="none" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round">
                  {/* Head */}
                  <ellipse cx="11" cy="3.2" rx="2.6" ry="2.6"/>
                  {/* Neck */}
                  <ellipse cx="11" cy="7" rx="1.2" ry="0.9"/>
                  {/* Shoulders */}
                  <ellipse cx="11" cy="9.5" rx="4.8" ry="1.4"/>
                  {/* Torso */}
                  <ellipse cx="11" cy="13" rx="3.6" ry="3.2"/>
                  {/* Pelvis */}
                  <ellipse cx="11" cy="17.5" rx="4" ry="1.6"/>
                  {/* Left upper arm */}
                  <ellipse cx="5.5" cy="11.5" rx="1.1" ry="2.6" transform="rotate(-10 5.5 11.5)"/>
                  {/* Left lower arm */}
                  <ellipse cx="4.2" cy="16" rx="0.9" ry="2.4" transform="rotate(8 4.2 16)"/>
                  {/* Right upper arm */}
                  <ellipse cx="16.5" cy="11.5" rx="1.1" ry="2.6" transform="rotate(10 16.5 11.5)"/>
                  {/* Right lower arm */}
                  <ellipse cx="17.8" cy="16" rx="0.9" ry="2.4" transform="rotate(-8 17.8 16)"/>
                  {/* Left thigh */}
                  <ellipse cx="8.8" cy="21.5" rx="1.5" ry="2.8" transform="rotate(-4 8.8 21.5)"/>
                  {/* Left shin */}
                  <ellipse cx="8.2" cy="26.2" rx="1.1" ry="2" transform="rotate(3 8.2 26.2)"/>
                  {/* Right thigh */}
                  <ellipse cx="13.2" cy="21.5" rx="1.5" ry="2.8" transform="rotate(4 13.2 21.5)"/>
                  {/* Right shin */}
                  <ellipse cx="13.8" cy="26.2" rx="1.1" ry="2" transform="rotate(-3 13.8 26.2)"/>
                </svg>
              </button>
              <button type="button" className={aiStyles.actionBtn} title="Upload Image">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </button>
              <button type="button" className={`${aiStyles.actionBtn} ${aiStyles.micBtn}`} title="Voice Input">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
              </button>
            </div>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask EndoAI anything about your health..."
              className={aiStyles.chatInput}
            />
            <button type="submit" className={aiStyles.sendBtn} disabled={loading}>
              {loading
                ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'spin 1s linear infinite'}}><circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10"/></svg>
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              }
            </button>
          </form>
        </div>
      </FadeIn>
    </div>
  )
}

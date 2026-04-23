import { useState, useRef, useEffect, useCallback } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import aiStyles from './Placeholder.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'

const STAGES = [
  { id: 'predict', label: 'Predict' },
  { id: 'prepare', label: 'Prepare' },
  { id: 'action', label: 'Action' },
  { id: 'manage', label: 'Manage' },
  { id: 'stabilize', label: 'Stabilize' },
  { id: 'recover', label: 'Recover' },
]

export default function EndoAI() {
  const { isLocked } = useOutletContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { 
  endoMessages, setEndoMessages,
  currentStage, setCurrentStage,
  unlockedStages, setUnlockedStages,
  keyInsights, setKeyInsights,
  referrals, setReferrals,
  symptomLogs, setSymptomLogs
  } = useChat()  
  const [viewingStage, setViewingStage] = useState(currentStage)
  
  // Transition logic states
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [probability, setProbability] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)

  // Markers for all stages
  const [canMoveToPrepare, setCanMoveToPrepare] = useState(false)
  const [canMoveToAction, setCanMoveToAction] = useState(false)
  const [canMoveToManage, setCanMoveToManage] = useState(false)
  const [canMoveToStabilize, setCanMoveToStabilize] = useState(false)
  const [canMoveToRecover, setCanMoveToRecover] = useState(false)

  const [messages, setMessages] = useState(() => {
    if (endoMessages && endoMessages.length > 0) return endoMessages
    return [
      { 
        role: 'ai', 
        stage: 'predict',
        content: user 
          ? `Hello ${user.name.split(' ')[0]}. I'm EndoAI, your personalized health assistant. How can I help you today?`
          : "Hello. I'm EndoAI, your personalized health assistant. How can I help you today?"
      }
    ]
  })

  useEffect(() => { setViewingStage(currentStage) }, [currentStage])
  useEffect(() => { setEndoMessages(messages) }, [messages, setEndoMessages])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  const [showBodyModal, setShowBodyModal] = useState(false)
  const [selectedParts, setSelectedParts] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, viewingStage, loading])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleBodyPart = (part) => {
    setSelectedParts(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part])
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if ((!input.trim() && !imagePreview && selectedParts.length === 0) || loading) return

    let finalContent = input
    if (selectedParts.length > 0) {
      const partsStr = `[Body areas selected: ${selectedParts.join(', ')}]`
      finalContent = input.trim() ? `${partsStr} ${input}` : partsStr
    }

    const userMsg = { role: 'user', stage: currentStage, content: finalContent, image: imagePreview, bodyParts: selectedParts.length > 0 ? [...selectedParts] : null }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages); setInput(''); removeImage(); setSelectedParts([]); setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/endoai/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, stage: currentStage }),
      })
      const data = await res.json()
      let aiContent = data.content ?? data.error ?? 'Something went wrong.'
      
      // Parse All Markers
      const probMatch = aiContent.match(/\[PROBABILITY:\s*(\d+)%\]/)
      const isEnoughMessages = updatedMessages.length >= 5
      
      if (probMatch) {
        setProbability(probMatch[1])
        if (parseInt(probMatch[1]) > 40 && isEnoughMessages) setShowConfirmation(true)
      }
      
      if (aiContent.includes('MOVE_TO_PREPARE')) { setCanMoveToPrepare(true); if (isEnoughMessages) setShowConfirmation(true) }
      if (aiContent.includes('MOVE_TO_ACTION')) { setCanMoveToAction(true); if (isEnoughMessages) setShowConfirmation(true) }
      if (aiContent.includes('MOVE_TO_MANAGE')) { setCanMoveToManage(true); if (isEnoughMessages) setShowConfirmation(true) }
      if (aiContent.includes('MOVE_TO_STABILIZE')) { setCanMoveToStabilize(true); if (isEnoughMessages) setShowConfirmation(true) }
      if (aiContent.includes('MOVE_TO_RECOVER')) { setCanMoveToRecover(true); if (isEnoughMessages) setShowConfirmation(true) }

      // Parse Key Insights
      const insightMatch = aiContent.match(/\[KEY_INSIGHT:\s*([^\]]+)\]/)
      if (insightMatch) {
        const newInsight = insightMatch[1].trim()
        setKeyInsights(prev => {
          if (prev.includes(newInsight)) return prev
          return [...prev, newInsight]
        })
      }

      // Parse Symptom Logs
      const logMatch = aiContent.match(/\[SYMPTOM_LOG:\s*([^\]]+)\]/)
      if (logMatch) {
        const parts = logMatch[1].split('|').map(s => s.trim())
        if (parts.length >= 2) {
          const [symptom, intensity] = parts
          setSymptomLogs(prev => [
            { 
              symptom, 
              intensity: parseInt(intensity) || 0, 
              time: 'Just now',
              icon: '🌀' // Default icon
            },
            ...prev
          ])
        }
      }

      // Parse Referrals
      const referralMatches = aiContent.matchAll(/\[REFERRAL:\s*([^\]]+)\]/g)
      for (const match of referralMatches) {
        const parts = match[1].split('|').map(s => s.trim())
        if (parts.length === 3) {
          const [type, name, urgency] = parts
          setReferrals(prev => {
            // Avoid duplicates
            const exists = prev.some(r => r.name === name && r.type === type)
            if (exists) return prev
            return [...prev, { type, name, urgency, date: new Date().toLocaleDateString(), stage: currentStage }]
          })
        }
      }

      const cleanContent = aiContent.replace(/\[[^\]]*\]/g, '').trim()
      setMessages(prev => [...prev, { role: 'ai', stage: currentStage, content: cleanContent }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', stage: currentStage, content: 'Could not reach the server.' }])
    } finally { setLoading(false) }
  }

  // Universal transition handler
  const performTransition = (nextStage, greeting) => {
    setIsTransitioning(true); setShowConfirmation(false)
    setTimeout(() => {
      if (!unlockedStages.includes(nextStage)) setUnlockedStages(prev => [...prev, nextStage])
      setCurrentStage(nextStage); setIsTransitioning(false)
      setMessages(prev => [...prev, { role: 'ai', stage: nextStage, content: greeting }])
    }, 2000)
  }

  const handleNewChat = () => {
    const previousStagesMessages = messages.filter(m => m.stage !== currentStage)
    setMessages([...previousStagesMessages, { role: 'ai', stage: currentStage, content: `Restarted ${currentStage} session. How can I help?` }])
    setShowNewChatModal(false)
  }

  const isViewingActiveStage = viewingStage === currentStage
  const displayedMessages = messages.filter(m => m.stage === viewingStage)

  return (
    <div className={aiStyles.chatLayout} style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <FlowingParticles />
      <FadeIn immediate duration={600} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Stages Tracker */}
        <div className={aiStyles.stagesContainerFull}>
          {STAGES.map((stage, i) => {
            const isUnlocked = unlockedStages.includes(stage.id)
            const isStageViewing = viewingStage === stage.id
            const isStageActive = currentStage === stage.id
            return (
              <div 
                key={stage.id} 
                className={`${aiStyles.stageCard} ${isUnlocked ? aiStyles.stageUnlocked : aiStyles.stageLocked} ${isStageViewing ? aiStyles.stageViewing : ''} ${isStageActive ? aiStyles.stageActiveHighlight : ''}`}
                onClick={() => isUnlocked && setViewingStage(stage.id)}
                style={{ cursor: isUnlocked ? 'pointer' : 'default' }}
              >
                <div className={aiStyles.stageIcon}>
                  {!isUnlocked ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg>}
                </div>
                <span>{stage.label}</span>
                {i < STAGES.length - 1 && <div className={aiStyles.stageLine}></div>}
              </div>
            )
          })}
          {isTransitioning && <div className={`${aiStyles.transitionDot} ${aiStyles['animateTo' + currentStage.charAt(0).toUpperCase() + currentStage.slice(1)]}`}></div>}
        </div>

        {/* Chat Window */}
        <div className={aiStyles.chatWindowFull}>
          <div className={aiStyles.chatHeader}>
            <h3>EndoAI — {viewingStage.toUpperCase()}</h3>
            <div className={aiStyles.headerActions}>
              {isViewingActiveStage && <button type="button" className={aiStyles.newChatBtn} onClick={() => setShowNewChatModal(true)}><span>New Chat</span></button>}
              <div className={aiStyles.statusBadge}>Online</div>
            </div>
          </div>
          
          <div className={aiStyles.chatMessages}>
            {!isViewingActiveStage ? (
              <div className={aiStyles.memoryPlaceholder}>
                <div className={aiStyles.memoryIcon}><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg></div>
                <h2>Memory Saved</h2>
                <p>History for <strong>{viewingStage}</strong> is archived.</p>
                <button className={aiStyles.goToLibraryBtn} onClick={() => navigate('/dashboard/library')}>Go to Library</button>
              </div>
            ) : (
              <>
                {displayedMessages.map((m, i) => (
                  <div key={i} className={`${aiStyles.message} ${aiStyles[m.role]}`}>
                    {m.bodyParts && <div className={aiStyles.messageBodyParts}>{m.bodyParts.map(p => <span key={p} className={aiStyles.partBadge}>{p}</span>)}</div>}
                    {m.image && <img src={m.image} className={aiStyles.messageImage} />}
                    <div className={aiStyles.messageBubble}>{m.content}</div>
                  </div>
                ))}
                {loading && <div className={`${aiStyles.message} ${aiStyles.ai}`}><div className={aiStyles.messageBubble}><div className={aiStyles.typing}><div className={aiStyles.dot}></div><div className={aiStyles.dot}></div><div className={aiStyles.dot}></div></div></div></div>}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {isViewingActiveStage && (
            <form onSubmit={handleSend} className={aiStyles.chatInputArea}>
              <div className={aiStyles.inputRow}>
                <div className={aiStyles.inputActionsLeft}>
                  <button type="button" className={`${aiStyles.actionBtn} ${aiStyles.bodyBtn}`} onClick={() => setShowBodyModal(true)}><svg width="22" height="28" viewBox="0 0 22 28" fill="none" stroke="#22c55e" strokeWidth="1.4"><ellipse cx="11" cy="2.5" rx="2.2" ry="2.5"/><ellipse cx="11" cy="5.2" rx="1.1" ry="0.8"/><ellipse cx="11" cy="8.5" rx="5.5" ry="2.2"/><path d="M5.5 10 L3 17" /><path d="M16.5 10 L19 17" /><path d="M8.5 18 L8 28" /><path d="M13.5 18 L14 28" /></svg></button>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageChange}/>
                  <button type="button" className={aiStyles.actionBtn} onClick={() => fileInputRef.current.click()}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></button>
                </div>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask EndoAI..." className={aiStyles.chatInput}/>
                <button type="submit" className={aiStyles.sendBtn} disabled={loading}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
              </div>
            </form>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className={aiStyles.modalOverlay} onClick={() => setShowConfirmation(false)}>
            <div className={`${aiStyles.modalContent} ${aiStyles.confirmationModal}`} onClick={e => e.stopPropagation()}>
              <h2>Prediction & Next Steps</h2>
              {probability && <div className={aiStyles.probabilitySection}><span className={aiStyles.probLabel}>Probability</span><div className={aiStyles.probValue}>{probability}%</div></div>}
              
              <div className={aiStyles.modalActions}>
                {canMoveToPrepare && currentStage === 'predict' && <button className={aiStyles.moveToPrepareBtn} onClick={() => performTransition('prepare', "Moved to Prepare Stage.")}>Move to Prepare</button>}
                {canMoveToAction && currentStage === 'prepare' && <button className={aiStyles.moveToPrepareBtn} onClick={() => performTransition('action', "Moved to Action Stage.")}>Move to Action</button>}
                {canMoveToManage && currentStage === 'action' && <button className={aiStyles.moveToPrepareBtn} onClick={() => performTransition('manage', "Moved to Manage Stage.")}>Move to Manage</button>}
                {canMoveToStabilize && currentStage === 'manage' && <button className={aiStyles.moveToPrepareBtn} onClick={() => performTransition('stabilize', "Moved to Stabilize Stage.")}>Move to Stabilize</button>}
                {canMoveToRecover && currentStage === 'stabilize' && <button className={aiStyles.moveToPrepareBtn} onClick={() => performTransition('recover', "Moved to Recover Stage.")}>Move to Recover</button>}
                <button className={aiStyles.continueBtn} onClick={() => setShowConfirmation(false)}>Continue</button>
              </div>
            </div>
          </div>
        )}

        {/* Body Diagram Modal */}
        {showBodyModal && (
          <div className={aiStyles.modalOverlay} onClick={() => setShowBodyModal(false)}>
            <div className={`${aiStyles.modalContent} ${aiStyles.bodyModal}`} onClick={e => e.stopPropagation()}>
              <h2>Select Areas of Concern</h2>
              <div className={aiStyles.bodyDiagramContainer}>
                <div className={aiStyles.medicalScanner}></div>
                <svg viewBox="0 0 100 140" className={aiStyles.bodySvg}>
                  {/* Human Silhouette Background */}
                  <path 
                    d="M50,5 C55,5 59,9 59,14 C59,19 55,23 50,23 C45,23 41,19 41,14 C41,9 45,5 50,5 M38,25 C42,23 58,23 62,25 C70,27 75,35 75,45 L75,70 C75,75 72,78 68,78 L65,78 L65,130 C65,135 60,138 55,138 L45,138 C40,138 35,135 35,130 L35,78 L32,78 C28,78 25,75 25,70 L25,45 C25,35 30,27 38,25 Z" 
                    fill="rgba(34, 197, 94, 0.02)" 
                    stroke="rgba(34, 197, 94, 0.15)" 
                    strokeWidth="0.5"
                  />
                  
                  {/* Head & Neck */}
                  <circle cx="50" cy="14" r="8" className={`${aiStyles.bodyPart} ${selectedParts.includes('Head') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Head')} />
                  <rect x="46" cy="22" width="8" height="4" className={`${aiStyles.bodyPart} ${selectedParts.includes('Neck') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Neck')} />
                  
                  {/* Chest */}
                  <path d="M35,30 Q50,25 65,30 L65,45 Q50,50 35,45 Z" className={`${aiStyles.bodyPart} ${selectedParts.includes('Chest') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Chest')} />
                  
                  {/* Abdomen Regions - Grid Style */}
                  <rect x="36" cy="48" width="9" height="9" rx="1" className={`${aiStyles.bodyPart} ${selectedParts.includes('Upper Left Abdomen') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Upper Left Abdomen')} />
                  <rect x="45.5" cy="48" width="9" height="9" rx="1" className={`${aiStyles.bodyPart} ${selectedParts.includes('Upper Center Abdomen') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Upper Center Abdomen')} />
                  <rect x="55" cy="48" width="9" height="9" rx="1" className={`${aiStyles.bodyPart} ${selectedParts.includes('Upper Right Abdomen') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Upper Right Abdomen')} />
                  
                  <rect x="36" cy="57.5" width="9" height="9" rx="1" className={`${aiStyles.bodyPart} ${selectedParts.includes('Lower Left Abdomen') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Lower Left Abdomen')} />
                  <rect x="45.5" cy="57.5" width="9" height="9" rx="1" className={`${aiStyles.bodyPart} ${selectedParts.includes('Lower Center Abdomen') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Lower Center Abdomen')} />
                  <rect x="55" cy="57.5" width="9" height="9" rx="1" className={`${aiStyles.bodyPart} ${selectedParts.includes('Lower Right Abdomen') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Lower Right Abdomen')} />

                  {/* Pelvic Regions */}
                  <path d="M36,68 Q43,72 50,68 Q57,72 64,68 L62,78 Q50,82 38,78 Z" className={`${aiStyles.bodyPart} ${selectedParts.includes('Pelvic Region') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Pelvic Region')} />
                  
                  {/* Arms */}
                  <path d="M25,30 L32,30 L32,70 L25,70 Z" className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Arm') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Left Arm')} />
                  <path d="M68,30 L75,30 L75,70 L68,70 Z" className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Arm') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Right Arm')} />
                  
                  {/* Legs */}
                  <path d="M36,80 L48,80 L48,135 L36,135 Z" className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Leg') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Left Leg')} />
                  <path d="M52,80 L64,80 L64,135 L52,135 Z" className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Leg') ? aiStyles.bodyPartActive : ''}`} onClick={() => toggleBodyPart('Right Leg')} />
                </svg>
              </div>
              <div className={aiStyles.selectedPartsList}>
                {selectedParts.map(part => (
                  <span key={part} className={aiStyles.partBadge}>{part} <button onClick={() => toggleBodyPart(part)}>×</button></span>
                ))}
              </div>
              <div className={aiStyles.modalActions}>
                <button className={aiStyles.continueBtn} style={{ background: 'rgba(255,255,255,0.05)' }} onClick={() => setSelectedParts([])}>Clear All</button>
                <button className={aiStyles.continueBtn} onClick={() => setShowBodyModal(false)}>Done</button>
              </div>
            </div>
          </div>
        )}
      </FadeIn>
    </div>
  )
}

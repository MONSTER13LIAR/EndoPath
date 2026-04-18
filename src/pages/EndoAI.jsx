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
    unlockedStages, setUnlockedStages
  } = useChat()
  
  // Track which stage we are VIEWING (defaults to current active stage)
  const [viewingStage, setViewingStage] = useState(currentStage)
  
  // Local states for UI management
  const [isPinpointed, setIsPinpointed] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [probability, setProbability] = useState(null)
  const [canMoveToPrepare, setCanMoveToPrepare] = useState(false)
  const [canMoveToAction, setCanMoveToAction] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)

  const [messages, setMessages] = useState(() => {
    if (endoMessages && endoMessages.length > 0) return endoMessages
    return [
      { 
        role: 'ai', 
        stage: 'predict',
        content: user 
          ? `Hello ${user.name.split(' ')[0]}. I'm EndoAI, your personalized health assistant. I've unlocked the 'Predict' stage based on your recent data. How can I help you prepare for your next cycle?`
          : "Hello. I'm EndoAI, your personalized health assistant. I'm here to help you manage your endometriosis journey. How can I help you today?"
      }
    ]
  })

  // Keep viewingStage in sync with currentStage when it changes (on transition)
  useEffect(() => {
    setViewingStage(currentStage)
  }, [currentStage])

  // Sync internal state to context
  useEffect(() => {
    setEndoMessages(messages)
  }, [messages, setEndoMessages])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Image states
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)
  
  // Body part states
  const [showBodyModal, setShowBodyModal] = useState(false)
  const [selectedParts, setSelectedParts] = useState([])
  
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, viewingStage, loading])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const toggleBodyPart = (part) => {
    setSelectedParts(prev => 
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    )
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if ((!input.trim() && !selectedImage && selectedParts.length === 0) || loading) return

    let finalContent = input
    if (selectedParts.length > 0) {
      const partsStr = `[Body areas selected: ${selectedParts.join(', ')}]`
      finalContent = input.trim() ? `${partsStr} ${input}` : partsStr
    }

    const userMsg = { 
      role: 'user', 
      stage: currentStage,
      content: finalContent,
      image: imagePreview,
      bodyParts: selectedParts.length > 0 ? [...selectedParts] : null
    }
    
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    removeImage()
    setSelectedParts([])
    setLoading(true)

    try {
      const res = await fetch('http://127.0.0.1:8000/api/endoai/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          stage: currentStage,
          image: userMsg.image
        }),
      })
      const data = await res.json()
      let aiContent = data.content ?? data.error ?? 'Something went wrong.'
      console.log("EndoAI Response:", aiContent)
      
      const probMatch = aiContent.match(/\[PROBABILITY:\s*(\d+)%\]/)
      if (probMatch) {
        const probValue = probMatch[1]
        setProbability(probValue)
        if (aiContent.includes('PHASE: Confirmation') || parseInt(probValue) > 40) {
          setShowConfirmation(true)
        }
      }
      
      if (aiContent.includes('MOVE_TO_PREPARE')) {
        setCanMoveToPrepare(true)
        setShowConfirmation(true)
      }
      
      if (aiContent.includes('MOVE_TO_ACTION')) {
        setCanMoveToAction(true)
        setShowConfirmation(true)
      }

      const cleanContent = aiContent.replace(/\[[^\]]*\]/g, '').trim()
      setMessages(prev => [...prev, { role: 'ai', stage: currentStage, content: cleanContent }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', stage: currentStage, content: 'Could not reach the server. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleMoveToPrepare = () => {
    setIsTransitioning(true)
    setShowConfirmation(false)
    
    setTimeout(() => {
      if (!unlockedStages.includes('prepare')) {
        setUnlockedStages(prev => [...prev, 'prepare'])
      }
      setCurrentStage('prepare')
      setIsTransitioning(false)
      
      const prepareGreeting = {
        role: 'ai',
        stage: 'prepare',
        content: `Now that we've pinpointed your symptoms, we are moving into the 'Prepare' stage. I've noted all our previous conversation for context. How can I help you get ready for your upcoming cycle?`
      }
      setMessages(prev => [...prev, prepareGreeting])
    }, 2000)
  }

  const handleMoveToAction = () => {
    setIsTransitioning(true)
    setShowConfirmation(false)
    
    setTimeout(() => {
      if (!unlockedStages.includes('action')) {
        setUnlockedStages(prev => [...prev, 'action'])
      }
      setCurrentStage('action')
      setIsTransitioning(false)
      
      const actionGreeting = {
        role: 'ai',
        stage: 'action',
        content: `We are now in the 'Action' stage. Based on our preparation, we are ready to implement your immediate relief and treatment strategy. Let's begin.`
      }
      setMessages(prev => [...prev, actionGreeting])
    }, 2000)
  }

  const handleNewChat = () => {
    const previousStagesMessages = messages.filter(m => m.stage !== currentStage)
    
    let newGreeting = ""
    if (currentStage === 'predict') {
       newGreeting = user 
          ? `Hello ${user.name.split(' ')[0]}. I've restarted our 'Predict' session. How can I help you today?`
          : "Hello. I've restarted our 'Predict' session. How can I help you today?"
    } else if (currentStage === 'prepare') {
       newGreeting = "I've started a fresh 'Prepare' session. I still have our notes from the Predict stage. How can I help you get ready?"
    } else {
       newGreeting = `I've started a fresh '${currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}' session. How can we continue?`
    }

    setMessages([...previousStagesMessages, { role: 'ai', stage: currentStage, content: newGreeting }])
    setShowNewChatModal(false)
    
    if (currentStage === 'predict') {
      setIsPinpointed(false)
      setCanMoveToPrepare(false)
      setProbability(null)
    } else if (currentStage === 'prepare') {
      setCanMoveToAction(false)
    }
  }

  // Determine what to show in the chat window
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
                className={`
                  ${aiStyles.stageCard} 
                  ${isUnlocked ? aiStyles.stageUnlocked : aiStyles.stageLocked}
                  ${isStageViewing ? aiStyles.stageViewing : ''}
                  ${isStageActive ? aiStyles.stageActiveHighlight : ''}
                  ${stage.id === 'prepare' && isStageActive ? aiStyles.stagePrepareActive : ''}
                  ${stage.id === 'action' && isStageActive ? aiStyles.stageActionActive : ''}
                `}
                onClick={() => {
                   if (isUnlocked) setViewingStage(stage.id)
                }}
                style={{ cursor: isUnlocked ? 'pointer' : 'default' }}
              >
                <div className={aiStyles.stageIcon}>
                  {!isUnlocked ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"></path></svg>
                  )}
                </div>
                <span>{stage.label}</span>
                {i < STAGES.length - 1 && <div className={aiStyles.stageLine}></div>}
              </div>
            )
          })}
          
          {isTransitioning && (
            <div className={`
              ${aiStyles.transitionDot} 
              ${currentStage === 'predict' ? aiStyles.animateDotToPrepare : aiStyles.animateDotToAction}
            `}></div>
          )}
        </div>

        {/* Chat Window */}
        <div className={aiStyles.chatWindowFull}>
          <div className={aiStyles.chatHeader}>
            <h3>EndoAI Assistant — {viewingStage.charAt(0).toUpperCase() + viewingStage.slice(1)}</h3>
            <div className={aiStyles.headerActions}>
              {isViewingActiveStage && (
                <button 
                  type="button"
                  className={aiStyles.newChatBtn}
                  onClick={() => setShowNewChatModal(true)}
                  title="Start New Chat for this Stage"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  <span>New Chat</span>
                </button>
              )}
              <div className={aiStyles.statusBadge}>Online</div>
            </div>
          </div>
          
          <div className={aiStyles.chatMessages}>
            {!isViewingActiveStage ? (
              /* Memory Saved Placeholder for Previous Stages */
              <div className={aiStyles.memoryPlaceholder}>
                <div className={aiStyles.memoryIcon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <h2>Memory Saved</h2>
                <p>Conversation history for the <strong>{viewingStage.toUpperCase()}</strong> stage has been archived to keep your current workspace clean.</p>
                <button 
                  className={aiStyles.goToLibraryBtn}
                  onClick={() => navigate('/dashboard/library')}
                >
                  Go to Library to see Chat History
                </button>
              </div>
            ) : (
              /* Active Chat Messages */
              <>
                {displayedMessages.map((m, i) => (
                  <div key={i} className={`${aiStyles.message} ${aiStyles[m.role]}`}>
                    {m.bodyParts && (
                      <div className={aiStyles.messageBodyParts}>
                        {m.bodyParts.map(part => (
                          <span key={part} className={aiStyles.partBadge}>{part}</span>
                        ))}
                      </div>
                    )}
                    {m.image && <img src={m.image} alt="User upload" className={aiStyles.messageImage} />}
                    <div className={aiStyles.messageBubble}>{m.content}</div>
                  </div>
                ))}
                {loading && (
                  <div className={`${aiStyles.message} ${aiStyles.ai}`}>
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
              </>
            )}
          </div>

          {isViewingActiveStage && (
            <form onSubmit={handleSend} className={aiStyles.chatInputArea}>
              {(imagePreview || selectedParts.length > 0) && (
                <div className={aiStyles.imagePreviewContainer}>
                  {selectedParts.length > 0 && (
                    <div className={aiStyles.selectedPartsPreview}>
                      {selectedParts.map(part => (
                        <span key={part} className={aiStyles.partBadge} onClick={() => toggleBodyPart(part)} style={{ cursor: 'pointer' }}>
                          {part} ×
                        </span>
                      ))}
                    </div>
                  )}
                  {imagePreview && (
                    <div className={aiStyles.imagePreview}>
                      <img src={imagePreview} alt="Preview" />
                      <button type="button" className={aiStyles.removeImage} onClick={removeImage}>×</button>
                    </div>
                  )}
                </div>
              )}
              
              <div className={aiStyles.inputRow}>
                <div className={aiStyles.inputActionsLeft}>
                  <button 
                    type="button" 
                    className={`${aiStyles.actionBtn} ${aiStyles.bodyBtn}`} 
                    title="Select Body Areas"
                    onClick={() => setShowBodyModal(true)}
                  >
                    <svg width="22" height="28" viewBox="0 0 22 28" fill="none" stroke={selectedParts.length > 0 ? "#fff" : "#22c55e"} strokeWidth="1.4" strokeLinecap="round" style={{ background: selectedParts.length > 0 ? "#22c55e" : "transparent", borderRadius: "4px", padding: "2px" }}>
                      <ellipse cx="11" cy="2.5" rx="2.2" ry="2.5"/>
                      <ellipse cx="11" cy="5.2" rx="1.1" ry="0.8"/>
                      <ellipse cx="11" cy="8.5" rx="5.5" ry="2.2"/>
                      <path d="M5.5 10 L3 17" />
                      <path d="M16.5 10 L19 17" />
                      <path d="M8.5 18 L8 28" />
                      <path d="M13.5 18 L14 28" />
                    </svg>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                    onChange={handleImageChange}
                  />
                  <button 
                    type="button" 
                    className={aiStyles.actionBtn} 
                    title="Upload Image"
                    onClick={() => fileInputRef.current.click()}
                  >
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
              </div>
            </form>
          )}
        </div>

        {/* Body Areas Visual Modal */}
        {showBodyModal && (
          <div className={aiStyles.modalOverlay} onClick={() => setShowBodyModal(false)}>
            <div className={aiStyles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={aiStyles.modalHeader}>
                <h2>Visual Body Mapper</h2>
                <button className={aiStyles.closeModal} onClick={() => setShowBodyModal(false)}>×</button>
              </div>
              
              <div className={aiStyles.bodyVisualContainer}>
                <svg viewBox="0 0 22 28" className={aiStyles.interactiveBody}>
                  {/* Head */}
                  <ellipse 
                    cx="11" cy="2.5" rx="2.2" ry="2.5" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Head') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Head')}
                  />
                  {/* Neck */}
                  <ellipse 
                    cx="11" cy="5.2" rx="1.1" ry="0.8" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Neck') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Neck')}
                  />
                  {/* Chest */}
                  <ellipse 
                    cx="11" cy="8.5" rx="5.5" ry="2.2" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Chest') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Chest')}
                  />
                  
                  {/* ABDOMEN & PELVIS - High Precision Grid */}
                  
                  {/* Row 1: Upper Abdomen */}
                  <ellipse 
                    cx="8.5" cy="11.5" rx="1.8" ry="1.2" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Upper Left Abdomen') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Upper Left Abdomen')}
                  />
                  <ellipse 
                    cx="11" cy="11.5" rx="1.2" ry="1.2" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Upper Center Abdomen') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Upper Center Abdomen')}
                  />
                  <ellipse 
                    cx="13.5" cy="11.5" rx="1.8" ry="1.2" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Upper Right Abdomen') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Upper Right Abdomen')}
                  />

                  {/* Row 2: Mid/Lower Abdomen */}
                  <ellipse 
                    cx="8.2" cy="14.5" rx="2.2" ry="1.5" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Lower Left Abdomen') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Lower Left Abdomen')}
                  />
                  <ellipse 
                    cx="11" cy="14.5" rx="1.5" ry="1.5" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Lower Center Abdomen') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Lower Center Abdomen')}
                  />
                  <ellipse 
                    cx="13.8" cy="14.5" rx="2.2" ry="1.5" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Lower Right Abdomen') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Lower Right Abdomen')}
                  />

                  {/* Row 3: Deep Pelvic / Reproductive Area - Vertically Split */}
                  <ellipse 
                    cx="8.5" cy="18.5" rx="2.5" ry="2" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Pelvic Region') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Left Pelvic Region')}
                  />
                  <ellipse 
                    cx="13.5" cy="18.5" rx="2.5" ry="2" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Pelvic Region') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Right Pelvic Region')}
                  />
                  
                  {/* Arms */}
                  <ellipse 
                    cx="4.5" cy="10.5" rx="1.2" ry="3.5" transform="rotate(-20 4.5 10.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Upper Arm') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Left Upper Arm')}
                  />
                  <ellipse 
                    cx="2.5" cy="16.5" rx="1" ry="3.5" transform="rotate(5 2.5 16.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Lower Arm') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Left Lower Arm')}
                  />
                  
                  <ellipse 
                    cx="17.5" cy="10.5" rx="1.2" ry="3.5" transform="rotate(20 17.5 10.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Upper Arm') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Right Upper Arm')}
                  />
                  <ellipse 
                    cx="19.5" cy="16.5" rx="1" ry="3.5" transform="rotate(-5 19.5 16.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Lower Arm') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Right Lower Arm')}
                  />
                  
                  {/* Legs */}
                  <ellipse 
                    cx="8.5" cy="22.5" rx="1.8" ry="4.5" transform="rotate(-5 8.5 22.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Thigh') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Left Thigh')}
                  />
                  <ellipse 
                    cx="8" cy="28.5" rx="1.4" ry="4" transform="rotate(2 8 28.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Lower Leg') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Left Lower Leg')}
                  />
                  
                  <ellipse 
                    cx="13.5" cy="22.5" rx="1.8" ry="4.5" transform="rotate(5 13.5 22.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Thigh') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Right Thigh')}
                  />
                  <ellipse 
                    cx="14" cy="28.5" rx="1.4" ry="4" transform="rotate(-2 14 28.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Lower Leg') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Right Lower Leg')}
                  />
                </svg>
              </div>

              <div className={aiStyles.selectedPartsList}>
                {selectedParts.map(part => (
                  <span key={part} className={aiStyles.partBadge}>{part}</span>
                ))}
              </div>

              <button 
                className={aiStyles.doneBtn} 
                onClick={() => setShowBodyModal(false)}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className={aiStyles.modalOverlay} onClick={() => setShowConfirmation(false)}>
            <div className={`${aiStyles.modalContent} ${aiStyles.confirmationModal}`} onClick={e => e.stopPropagation()}>
              <div className={aiStyles.modalHeader}>
                <h2>EndoAI Prediction</h2>
                <button className={aiStyles.closeModal} onClick={() => setShowConfirmation(false)}>×</button>
              </div>
              
              <div className={aiStyles.predictionStatus}>
                <div className={aiStyles.aiIconLarge}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <p>I have analyzed your symptoms. To be more certain, I need to ask a few more confirmation questions.</p>
                
                {probability && (
                  <div className={aiStyles.probabilitySection}>
                    <span className={aiStyles.probLabel}>Current Probability</span>
                    <div className={aiStyles.probValue}>{probability}%</div>
                  </div>
                )}
              </div>

              <div className={aiStyles.confirmationPrompt}>
                {messages[messages.length - 1]?.role === 'ai' && (
                  <div className={aiStyles.latestQuestion}>
                    <strong>EndoAI:</strong> {messages[messages.length - 1].content}
                  </div>
                )}
              </div>

              {canMoveToPrepare && parseInt(probability) > 70 && currentStage === 'predict' && (
                <button 
                  className={aiStyles.moveToPrepareBtn} 
                  onClick={handleMoveToPrepare}
                >
                  Move to 'Prepare' Stage
                </button>
              )}

              {canMoveToAction && currentStage === 'prepare' && (
                <button 
                  className={`${aiStyles.moveToPrepareBtn} ${aiStyles.moveToActionBtn}`} 
                  onClick={handleMoveToAction}
                >
                  Move to 'Action' Stage
                </button>
              )}

              <div className={aiStyles.modalActions}>
                <button className={aiStyles.continueBtn} onClick={() => setShowConfirmation(false)}>
                  Continue Chatting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Chat Confirmation Modal */}
        {showNewChatModal && (
          <div className={aiStyles.modalOverlay} onClick={() => setShowNewChatModal(false)}>
            <div className={`${aiStyles.modalContent} ${aiStyles.newChatModal}`} onClick={e => e.stopPropagation()}>
              <div className={aiStyles.modalHeader}>
                <h2>Start New Chat?</h2>
                <button className={aiStyles.closeModal} onClick={() => setShowNewChatModal(false)}>×</button>
              </div>
              
              <div className={aiStyles.warningSection}>
                <div className={aiStyles.warningIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <p>Starting a new chat will clear the conversation history for the current <strong>{currentStage.toUpperCase()}</strong> stage.</p>
                <p className={aiStyles.memoryNote}>EndoAI will still remember context from previous stages (if any).</p>
              </div>

              <div className={aiStyles.modalActions}>
                <button className={aiStyles.confirmNewChatBtn} onClick={handleNewChat}>
                  Clear & Restart
                </button>
                <button className={aiStyles.cancelBtn} onClick={() => setShowNewChatModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </FadeIn>
    </div>
  )
}

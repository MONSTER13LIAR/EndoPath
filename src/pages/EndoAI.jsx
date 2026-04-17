import { useState, useRef, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import aiStyles from './Placeholder.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'

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
  const { user } = useAuth()
  const { endoMessages, setEndoMessages } = useChat()
  
  const [messages, setMessages] = useState(() => {
    if (endoMessages) return endoMessages
    return [
      { 
        role: 'ai', 
        content: user 
          ? `Hello ${user.name.split(' ')[0]}. I'm EndoAI, your personalized health assistant. I've unlocked the 'Predict' stage based on your recent data. How can I help you prepare for your next cycle?`
          : "Hello. I'm EndoAI, your personalized health assistant. I'm here to help you manage your endometriosis journey. How can I help you today?"
      }
    ]
  })

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
  }, [messages, loading])

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
          stage: STAGES.find(s => !s.locked)?.id ?? 'predict',
          image: userMsg.image
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
          </div>

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
                    cx="11" cy="3.2" rx="2.6" ry="2.6" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Head') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Head')}
                  />
                  {/* Neck */}
                  <ellipse 
                    cx="11" cy="7" rx="1.2" ry="0.9" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Neck') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Neck')}
                  />
                  {/* Chest */}
                  <ellipse 
                    cx="11" cy="9.5" rx="4.8" ry="1.4" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Chest') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Chest')}
                  />
                  {/* Upper Abdomen */}
                  <ellipse 
                    cx="11" cy="13" rx="3.6" ry="3.2" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Upper Abdomen') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Upper Abdomen')}
                  />
                  {/* Lower Abdomen / Pelvis */}
                  <ellipse 
                    cx="11" cy="17.5" rx="4" ry="1.6" 
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Lower Abdomen / Pelvis') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Lower Abdomen / Pelvis')}
                  />
                  
                  {/* Arms - Separated segments */}
                  <ellipse 
                    cx="5.5" cy="11.5" rx="1.1" ry="2.6" transform="rotate(-10 5.5 11.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Bicep') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Left Bicep')}
                  />
                  <ellipse 
                    cx="4.2" cy="16" rx="0.9" ry="2.4" transform="rotate(8 4.2 16)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Forearm') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Left Forearm')}
                  />
                  
                  <ellipse 
                    cx="16.5" cy="11.5" rx="1.1" ry="2.6" transform="rotate(10 16.5 11.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Bicep') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Right Bicep')}
                  />
                  <ellipse 
                    cx="17.8" cy="16" rx="0.9" ry="2.4" transform="rotate(-8 17.8 16)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Forearm') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Right Forearm')}
                  />
                  
                  {/* Legs - Separated segments */}
                  <ellipse 
                    cx="8.8" cy="21.5" rx="1.5" ry="2.8" transform="rotate(-4 8.8 21.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Thigh') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Left Thigh')}
                  />
                  <ellipse 
                    cx="8.2" cy="26.2" rx="1.1" ry="2" transform="rotate(3 8.2 26.2)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Left Shin/Foot') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Left Shin/Foot')}
                  />
                  
                  <ellipse 
                    cx="13.2" cy="21.5" rx="1.5" ry="2.8" transform="rotate(4 13.2 21.5)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Thigh') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Right Thigh')}
                  />
                  <ellipse 
                    cx="13.8" cy="26.2" rx="1.1" ry="2" transform="rotate(-3 13.8 26.2)"
                    className={`${aiStyles.bodyPart} ${selectedParts.includes('Right Shin/Foot') ? aiStyles.bodyPartActive : ''}`}
                    onClick={() => toggleBodyPart('Right Shin/Foot')}
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
      </FadeIn>
    </div>
  )
}

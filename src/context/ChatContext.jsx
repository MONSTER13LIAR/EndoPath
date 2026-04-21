import { createContext, useContext, useState, useEffect } from 'react'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [endoMessages, setEndoMessages] = useState(() => {
    const saved = localStorage.getItem('endopath_endo_chat')
    return saved ? JSON.parse(saved) : null
  })

  const [puffyMessages, setPuffyMessages] = useState(() => {
    const saved = localStorage.getItem('endopath_puffy_chat')
    return saved ? JSON.parse(saved) : null
  })

  const [currentStage, setCurrentStage] = useState(() => {
    return localStorage.getItem('endopath_current_stage') || 'predict'
  })

  const [unlockedStages, setUnlockedStages] = useState(() => {
    const saved = localStorage.getItem('endopath_unlocked_stages')
    return saved ? JSON.parse(saved) : ['predict']
  })

  const [keyInsights, setKeyInsights] = useState(() => {
    const saved = localStorage.getItem('endopath_key_insights')
    return saved ? JSON.parse(saved) : []
  })

  const [referrals, setReferrals] = useState(() => {
    const saved = localStorage.getItem('endopath_referrals')
    return saved ? JSON.parse(saved) : []
  })

  const [symptomLogs, setSymptomLogs] = useState(() => {
    const saved = localStorage.getItem('endopath_symptom_logs')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    if (endoMessages) localStorage.setItem('endopath_endo_chat', JSON.stringify(endoMessages))
  }, [endoMessages])

  useEffect(() => {
    if (puffyMessages) localStorage.setItem('endopath_puffy_chat', JSON.stringify(puffyMessages))
  }, [puffyMessages])

  useEffect(() => {
    localStorage.setItem('endopath_current_stage', currentStage)
  }, [currentStage])

  useEffect(() => {
    localStorage.setItem('endopath_unlocked_stages', JSON.stringify(unlockedStages))
  }, [unlockedStages])

  useEffect(() => {
    localStorage.setItem('endopath_key_insights', JSON.stringify(keyInsights))
  }, [keyInsights])

  useEffect(() => {
    localStorage.setItem('endopath_referrals', JSON.stringify(referrals))
  }, [referrals])

  useEffect(() => {
    localStorage.setItem('endopath_symptom_logs', JSON.stringify(symptomLogs))
  }, [symptomLogs])

  return (
    <ChatContext.Provider value={{ 
      endoMessages, setEndoMessages, 
      puffyMessages, setPuffyMessages,
      currentStage, setCurrentStage,
      unlockedStages, setUnlockedStages,
      keyInsights, setKeyInsights,
      referrals, setReferrals,
      symptomLogs, setSymptomLogs
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)

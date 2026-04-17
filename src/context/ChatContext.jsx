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

  useEffect(() => {
    if (endoMessages) localStorage.setItem('endopath_endo_chat', JSON.stringify(endoMessages))
  }, [endoMessages])

  useEffect(() => {
    if (puffyMessages) localStorage.setItem('endopath_puffy_chat', JSON.stringify(puffyMessages))
  }, [puffyMessages])

  return (
    <ChatContext.Provider value={{ 
      endoMessages, setEndoMessages, 
      puffyMessages, setPuffyMessages 
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)

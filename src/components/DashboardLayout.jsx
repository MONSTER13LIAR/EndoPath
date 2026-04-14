import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import styles from '../pages/Dashboard.module.css'

export default function DashboardLayout() {
  const [isLocked, setIsLocked] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={`${styles.dashboard} ${isLocked ? styles.locked : ''}`}>
      <Sidebar
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      {mobileOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setMobileOpen(false)} />
      )}
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div className={styles.content}>
        <Outlet context={{ isLocked }} />
      </div>
    </div>
  )
}

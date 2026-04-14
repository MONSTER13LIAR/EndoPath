import { Link, useLocation } from 'react-router-dom'
import styles from './Sidebar.module.css'

export default function Sidebar({ isLocked, setIsLocked, mobileOpen, setMobileOpen }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`${styles.sidebar} ${isLocked ? styles.sidebarLocked : ''} ${mobileOpen ? styles.sidebarMobileOpen : ''}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>
          <img src="/Logo.png" alt="EndoPath Logo" className={styles.logoImg} />
          <div className={styles.logoText}>Endo<span>Path</span></div>
        </div>
        <button
          className={styles.mobileCloseBtn}
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <button
          className={`${styles.lockBtn} ${isLocked ? styles.lockBtnActive : ''}`}
          onClick={() => setIsLocked(!isLocked)}
          title={isLocked ? "Unlock Sidebar" : "Lock Sidebar"}
        >
          {isLocked ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
          )}
        </button>
      </div>
      <nav className={styles.sideNav}>
        <Link to="/dashboard" className={isActive('/dashboard') ? styles.sideLinkActive : styles.sideLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Overview
        </Link>
        <Link to="/endo-ai" className={isActive('/endo-ai') ? styles.sideLinkActive : styles.sideLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path><path d="M19 3v4"></path><path d="M21 5h-4"></path></svg>
          EndoAI
        </Link>
        <Link to="/referral-tool" className={isActive('/referral-tool') ? styles.sideLinkActive : styles.sideLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
          Referral Tool
        </Link>
        <Link to="/library" className={isActive('/library') ? styles.sideLinkActive : styles.sideLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          Library
        </Link>
        <Link to="#" className={styles.sideLink}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Support
        </Link>
      </nav>
      <div className={styles.sidebarFooter}>
        <Link to="/" className={styles.logoutBtn}>Log out</Link>
      </div>
    </aside>
  )
}

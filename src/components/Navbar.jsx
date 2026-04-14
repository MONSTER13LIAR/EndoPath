import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, triggerLogin, logout } = useAuth()

  return (
    <div className={styles.navWrapper}>
      <nav className={styles.nav}>

        {/* Logo */}
        <NavLink to="/" className={styles.logo_container}>
          <img src="/Logo.png" alt="EndoPath Logo" className={styles.logo_img} />
          <span className={styles.logo_text}>Endo<span>Path</span></span>
        </NavLink>

        {/* Nav links */}
        <ul className={styles.links}>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? styles.active : ''}>
              About Us
            </NavLink>
          </li>
          <li>
            <NavLink to="/features" className={({ isActive }) => isActive ? styles.active : ''}>
              Features
            </NavLink>
          </li>
        </ul>

        {/* Actions */}
        <div className={styles.actions}>
          {user ? (
            <>
              <Link to="/dashboard" className={styles.dashboardBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Dashboard
              </Link>
              <div className={styles.userInfo}>
                {user.picture && (
                  <img src={user.picture} alt={user.name} className={styles.avatar} referrerPolicy="no-referrer" />
                )}
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
              </div>
              <button type="button" onClick={logout} className={styles.loginLink}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => triggerLogin()} className={styles.loginLink}>
                Log In
              </button>
              <button type="button" onClick={() => triggerLogin()} className={styles.ctaBtn}>
                Sign Up
                <span className={styles.ctaArrow}>→</span>
              </button>
            </>
          )}
        </div>

      </nav>
    </div>
  )
}

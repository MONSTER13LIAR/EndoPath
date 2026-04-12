import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
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
          <a href="/login" className={styles.loginLink}>Log In</a>
          <a href="/register" className={styles.ctaBtn}>
            Sign Up
            <span className={styles.ctaArrow}>→</span>
          </a>
        </div>

      </nav>
    </div>
  )
}

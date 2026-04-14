import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import styles from '../pages/Dashboard.module.css'

export default function DashboardLayout() {
  const [isLocked, setIsLocked] = useState(false)

  return (
    <div className={`${styles.dashboard} ${isLocked ? styles.locked : ''}`}>
      <Sidebar isLocked={isLocked} setIsLocked={setIsLocked} />
      <div className={styles.content}>
        <Outlet context={{ isLocked }} />
      </div>
    </div>
  )
}

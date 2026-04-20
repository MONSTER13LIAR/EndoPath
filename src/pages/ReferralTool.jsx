import { useOutletContext } from 'react-router-dom'
import aiStyles from './Placeholder.module.css'
import styles from './ReferralTool.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'
import { useChat } from '../context/ChatContext'

const STAGES = [
  { id: 'predict',   label: 'Predict' },
  { id: 'prepare',   label: 'Prepare' },
  { id: 'action',    label: 'Action' },
  { id: 'manage',    label: 'Manage' },
  { id: 'stabilize', label: 'Stabilize' },
  { id: 'recover',   label: 'Recover' },
]

export default function ReferralTool() {
  const { isLocked } = useOutletContext()
  const { referrals, unlockedStages, currentStage } = useChat()

  const getUrgencyClass = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return styles.urgencyHigh;
      case 'medium': return styles.urgencyMedium;
      case 'low': return styles.urgencyLow;
      default: return '';
    }
  }

  // Group referrals by stage
  const groupedReferrals = STAGES.reduce((acc, stage) => {
    const stageRefs = referrals.filter(r => r.stage === stage.id)
    if (stageRefs.length > 0) acc[stage.id] = stageRefs
    return acc
  }, {})

  return (
    <div className={aiStyles.chatLayout} style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <FlowingParticles />
      <FadeIn immediate duration={600} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* ── Stages Tracker ── */}
        <div className={aiStyles.stagesContainerFull}>
          {STAGES.map((stage, i) => {
            const isUnlocked = unlockedStages.includes(stage.id)
            const isStageActive = currentStage === stage.id
            return (
              <div
                key={stage.id}
                className={`${aiStyles.stageCard} ${isUnlocked ? aiStyles.stageUnlocked : aiStyles.stageLocked} ${isStageActive ? aiStyles.stageActiveHighlight : ''}`}
              >
                <div className={aiStyles.stageIcon}>
                  {!isUnlocked ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </div>
                <span>{stage.label}</span>
                {i < STAGES.length - 1 && <div className={aiStyles.stageLine} />}
              </div>
            )
          })}
        </div>

        {/* ── Main content ── */}
        <div className={styles.body}>
          {referrals && referrals.length > 0 ? (
            <div className={styles.referralList}>
              {STAGES.filter(s => groupedReferrals[s.id]).map((stage) => (
                <div key={stage.id} className={styles.stageSection}>
                  <div className={styles.stageHeader}>
                    <div className={`${styles.stageIndicator} ${unlockedStages.includes(stage.id) ? styles.indicatorUnlocked : ''}`}></div>
                    <h3>{stage.label} Recommendations</h3>
                    <span className={styles.stageCount}>{groupedReferrals[stage.id].length}</span>
                  </div>
                  <div className={styles.referralGrid}>
                    {groupedReferrals[stage.id].map((ref, idx) => (
                      <FadeIn key={idx} delay={idx * 100} duration={500} distance={20}>
                        <div className={styles.referralCard}>
                          <div className={styles.cardHeader}>
                            <span className={styles.typeBadge}>{ref.type}</span>
                            <span className={`${styles.urgencyBadge} ${getUrgencyClass(ref.urgency)}`}>
                              {ref.urgency} Urgency
                            </span>
                          </div>
                          
                          <h3 className={styles.cardTitle}>{ref.name}</h3>
                          
                          <div className={styles.cardMeta}>
                            <div className={styles.metaItem}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                              <span>Recommended</span>
                            </div>
                            <div className={styles.metaItem}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                              <span>{ref.date}</span>
                            </div>
                          </div>

                          <div className={styles.cardActions}>
                            <button className={`${styles.actionBtn} ${styles.primaryAction}`}>
                              {ref.type === 'APPOINTMENT' ? 'Book Now' : ref.type === 'TEST' ? 'Find Clinic' : 'View Schedule'}
                            </button>
                            <button className={`${styles.actionBtn} ${styles.secondaryAction}`}>Save</button>
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyStateContainer}>
              <FadeIn immediate delay={200} duration={700} distance={30}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <polyline points="16 11 18 13 22 9"/>
                    </svg>
                  </div>
                  <h2>No referrals yet</h2>
                  <p>
                    Once EndoAI suggests tests, appointments, or schedules during your chat,
                    they will appear here for you to manage.
                  </p>
                  <div className={styles.lockNotice}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Populates from EndoAI conversations
                  </div>
                </div>
              </FadeIn>
            </div>
          )}
        </div>

      </FadeIn>
    </div>
  )
}

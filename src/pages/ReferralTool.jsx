import { useOutletContext } from 'react-router-dom'
import aiStyles from './Placeholder.module.css'
import styles from './ReferralTool.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'

const STAGES = [
  { id: 'predict',   label: 'Predict',   locked: false },
  { id: 'prepare',   label: 'Prepare',   locked: true  },
  { id: 'action',    label: 'Action',    locked: true  },
  { id: 'manage',    label: 'Manage',    locked: true  },
  { id: 'stabilize', label: 'Stabilize', locked: true  },
  { id: 'recover',   label: 'Recover',   locked: true  },
]

export default function ReferralTool() {
  const { isLocked } = useOutletContext()

  return (
    <div className={aiStyles.chatLayout} style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <FlowingParticles />
      <FadeIn immediate duration={600} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* ── Stages Tracker (identical to EndoAI) ── */}
        <div className={aiStyles.stagesContainerFull}>
          {STAGES.map((stage, i) => (
            <div
              key={stage.id}
              className={`${aiStyles.stageCard} ${stage.locked ? aiStyles.stageLocked : aiStyles.stageUnlocked}`}
            >
              <div className={aiStyles.stageIcon}>
                {stage.locked ? (
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
          ))}
        </div>

        {/* ── Main content ── */}
        <div className={styles.body}>
          <FadeIn immediate delay={200} duration={700} distance={30}>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <polyline points="16 11 18 13 22 9"/>
                </svg>
              </div>
              <h2>No referrals to suggest</h2>
              <p>
                Once your health data builds up across more stages, EndoPath will
                intelligently surface specialist referrals, second-opinion prompts,
                and care-team suggestions here.
              </p>
              <div className={styles.lockNotice}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Unlocks as you progress through the stages
              </div>
            </div>
          </FadeIn>
        </div>

      </FadeIn>
    </div>
  )
}

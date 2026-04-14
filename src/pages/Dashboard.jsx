import { Link, useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'
import FadeIn from '../components/FadeIn'
import FlowingParticles from '../components/FlowingParticles'
import { useAuth } from '../context/AuthContext'

const STATS = [
  {
    label: 'Flare Risk',
    demoValue: 'Low',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.25)',
    demoTrend: '−12% vs last week',
    trendPositive: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    label: 'Days Logged',
    demoValue: '18 / 21',
    color: '#7C3AED',
    bg: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.25)',
    demoTrend: '+4 days this month',
    trendPositive: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: 'Avg Pain Level',
    demoValue: '2.4',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.25)',
    demoTrend: '−0.5 pts improving',
    trendPositive: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    label: 'Next Cycle',
    demoValue: '4 days',
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.08)',
    border: 'rgba(236, 72, 153, 0.25)',
    demoTrend: 'On track',
    trendPositive: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
]

const CHART_DAYS = ['M','T','W','T','F','S','S','M','T','W','T','F','S','T']
const CHART_DATA = [40, 60, 30, 80, 50, 20, 15, 45, 55, 35, 25, 10, 5, 12]

const RECENT_LOGS = [
  { time: '2 hours ago',  symptom: 'Mild pelvic cramping',         intensity: 3, icon: '🌀' },
  { time: 'Yesterday',    symptom: 'Fatigue & lower back pain',     intensity: 5, icon: '😓' },
  { time: '2 days ago',   symptom: 'Anti-inflammatory diet day',    intensity: 0, icon: '🥗' },
  { time: '3 days ago',   symptom: 'Heavy flare — high intensity',  intensity: 8, icon: '🔥' },
]

const UPCOMING = [
  { label: 'Cycle begins',             sub: 'in 4 days', color: '#EC4899' },
  { label: 'Dr. Martinez appointment', sub: 'Apr 18',    color: '#7C3AED' },
  { label: 'Weekly symptom review',    sub: 'Apr 16',    color: '#10B981' },
]

function intensityColor(n) {
  if (n >= 70) return '#EF4444'
  if (n >= 40) return '#F59E0B'
  return 'rgba(167, 139, 250, 0.55)'
}

function intensityTagColor(n) {
  if (n >= 7) return { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' }
  if (n >= 4) return { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' }
  return { bg: 'rgba(16,185,129,0.12)', color: '#10B981' }
}

export default function Dashboard() {
  const { user } = useAuth()
  const isDemo = !user
  const navigate = useNavigate()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className={styles.dashboardContent}>
      <FlowingParticles />
      <div className={styles.dashboardGrid} aria-hidden="true" />
      <div className={styles.container}>

        {/* ── Header ── */}
        <FadeIn immediate duration={800}>
          <header className={styles.header}>
            <div className={styles.welcome}>
              <span className={styles.welcomeEyebrow}>Dashboard</span>
              <h1>
                {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}
              </h1>
              <p>{today}</p>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.healthScore}>
                <svg className={styles.scoreRing} viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="4"/>
                  {isDemo && (
                    <circle cx="22" cy="22" r="18" fill="none" stroke="#7C3AED"
                      strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 18 * 0.74} ${2 * Math.PI * 18 * 0.26}`}
                      strokeDashoffset={2 * Math.PI * 18 * 0.25}
                    />
                  )}
                  <text x="22" y="27" textAnchor="middle" fontSize="11" fontWeight="800" fill={isDemo ? '#fff' : 'rgba(255,255,255,0.3)'}>
                    {isDemo ? '74' : '—'}
                  </text>
                </svg>
                <div className={styles.healthScoreText}>
                  <span className={styles.healthScoreLabel}>Health Score</span>
                  <span className={styles.healthScoreSub}>{isDemo ? 'Good standing' : 'No data yet'}</span>
                </div>
              </div>
              <button className={styles.logBtn} onClick={() => navigate('/endo-ai')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Log Symptom
              </button>
            </div>
          </header>
        </FadeIn>

        {/* ── Demo blur + signup overlay (only in demo mode) ── */}
        {isDemo && (
          <div className={styles.signupOverlay}>
            <div className={styles.signupCard}>
              <div className={styles.signupIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2>Sign up to reveal your dashboard</h2>
              <p>
                You're viewing a demo. Create a free account to unlock your real
                health data, cycle predictions, and personalised EndoAI insights.
              </p>
              <div className={styles.signupActions}>
                <Link to="/" className={styles.signupBtn}>Create free account</Link>
                <Link to="/" className={styles.signupGhost}>Learn more</Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <section className={`${styles.statsGrid} ${isDemo ? styles.blurred : ''}`}>
          {STATS.map((s, i) => (
            <FadeIn key={s.label} delay={i * 80} duration={700} distance={20}>
              <div
                className={styles.statCard}
                style={{ '--c': s.color, '--bg': s.bg, '--bdr': s.border }}
              >
                <div className={styles.statTop}>
                  <div className={styles.statIconWrap}>{s.icon}</div>
                  {s.trendPositive !== null && (
                    <div className={`${styles.trendBadge} ${s.trendPositive ? styles.trendUp : styles.trendDown}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        {s.trendPositive
                          ? <polyline points="18 15 12 9 6 15"/>
                          : <polyline points="6 9 12 15 18 9"/>}
                      </svg>
                    </div>
                  )}
                </div>
                <div className={styles.statValue}>
                  {isDemo ? s.demoValue : '—'}
                </div>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statTrend}>
                  {isDemo ? s.demoTrend : 'No data yet'}
                </div>
              </div>
            </FadeIn>
          ))}
        </section>

        {/* ── Main Grid ── */}
        <div className={`${styles.mainGrid} ${isDemo ? styles.blurred : ''}`}>

          {/* Chart */}
          <FadeIn delay={350} duration={800} distance={25}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Symptom Timeline</h3>
                <span className={styles.cardBadge}>Last 14 days</span>
              </div>
              {isDemo ? (
                <>
                  <div className={styles.chartPlaceholder}>
                    {CHART_DATA.map((h, i) => (
                      <div key={i} className={styles.chartBarWrap}>
                        <div className={styles.chartBar} style={{ height: `${h}%`, background: intensityColor(h) }} />
                        <span className={styles.chartDay}>{CHART_DAYS[i]}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.chartLegend}>
                    <span style={{ color: '#EF4444' }}>● High</span>
                    <span style={{ color: '#F59E0B' }}>● Medium</span>
                    <span style={{ color: 'rgba(167,139,250,0.8)' }}>● Low</span>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState} style={{ minHeight: '160px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  <p>No timeline data yet.<br/>Start logging to see your symptom patterns.</p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Recent Activity */}
          <FadeIn delay={450} duration={800} distance={25}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Recent Activity</h3>
                {isDemo && <span className={styles.viewAll}>View all</span>}
              </div>
              <div className={styles.activityList}>
                {isDemo ? (
                  RECENT_LOGS.map((log, i) => {
                    const tc = intensityTagColor(log.intensity)
                    return (
                      <div key={i} className={styles.activityItem}>
                        <div className={styles.activityEmoji}>{log.icon}</div>
                        <div className={styles.activityInfo}>
                          <strong>{log.symptom}</strong>
                          <span>{log.time}</span>
                        </div>
                        {log.intensity > 0 && (
                          <div className={styles.intensityTag} style={{ background: tc.bg, color: tc.color }}>
                            Lvl {log.intensity}
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className={styles.emptyState}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.3}}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    <p>No symptoms logged yet.<br/>Hit <strong>Log Symptom</strong> to start tracking.</p>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ── Bottom Row ── */}
        <div className={`${styles.bottomGrid} ${isDemo ? styles.blurred : ''}`}>

          {/* AI Insight */}
          <FadeIn delay={550} duration={800} distance={25}>
            <div className={styles.insightCard}>
              <div className={styles.insightIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                  <path d="M19 3v4"/><path d="M21 5h-4"/>
                </svg>
              </div>
              <div className={styles.insightBody}>
                <span className={styles.insightLabel}>EndoAI Insight</span>
                {isDemo ? (
                  <p>Your flare risk has dropped 12% this week. Continuing your anti-inflammatory diet and low-impact movement is making a measurable difference.</p>
                ) : (
                  <p style={{ opacity: 0.5 }}>No insights yet — EndoAI needs a few logs to start recognising your patterns.</p>
                )}
                <Link to="/endo-ai" className={styles.insightLink}>
                  Chat with EndoAI
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Upcoming */}
          <FadeIn delay={650} duration={800} distance={25}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Upcoming</h3>
              </div>
              {isDemo ? (
                <div className={styles.upcomingList}>
                  {UPCOMING.map((u, i) => (
                    <div key={i} className={styles.upcomingItem}>
                      <div className={styles.upcomingDot} style={{ background: u.color, boxShadow: `0 0 8px ${u.color}` }} />
                      <div className={styles.upcomingInfo}>
                        <strong>{u.label}</strong>
                        <span>{u.sub}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <p>Nothing scheduled yet.</p>
                </div>
              )}
            </div>
          </FadeIn>

        </div>
      </div>
    </div>
  )
}

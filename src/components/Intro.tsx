import { useEffect, useState, type FC } from 'react'
import './intro.css'

interface IntroProps {
  onDone: () => void
}

const HOLD_MS = 2600
const FADE_MS = 700

export const Intro: FC<IntroProps> = ({ onDone }) => {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const holdTimer = window.setTimeout(() => setExiting(true), HOLD_MS)
    const doneTimer = window.setTimeout(onDone, HOLD_MS + FADE_MS)
    return () => {
      window.clearTimeout(holdTimer)
      window.clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div className={`intro-root${exiting ? ' intro-exit' : ''}`} role="presentation" aria-hidden="true">
      <div className="intro-vignette" />
      <div className="intro-stage">
        <div className="intro-globe">
          {/* Orbit rings */}
          <span className="intro-ring intro-ring-1" />
          <span className="intro-ring intro-ring-2" />
          <span className="intro-ring intro-ring-3" />

          {/* Globe with meridians */}
          <svg className="intro-sphere" viewBox="0 0 120 120" fill="none">
            <defs>
              <radialGradient id="introOcean" cx="38%" cy="34%" r="72%">
                <stop offset="0%" stopColor="#1c4a70" />
                <stop offset="55%" stopColor="#0e2c49" />
                <stop offset="100%" stopColor="#05121f" />
              </radialGradient>
            </defs>
            <circle className="intro-sphere-body" cx="60" cy="60" r="52" fill="url(#introOcean)" />
            <circle className="intro-line" cx="60" cy="60" r="52" />
            <ellipse className="intro-line" cx="60" cy="60" rx="52" ry="20" />
            <ellipse className="intro-line" cx="60" cy="60" rx="52" ry="40" />
            <ellipse className="intro-line" cx="60" cy="60" rx="20" ry="52" />
            <ellipse className="intro-line" cx="60" cy="60" rx="40" ry="52" />
            <line className="intro-line" x1="60" y1="8" x2="60" y2="112" />
            <line className="intro-line" x1="8" y1="60" x2="112" y2="60" />
          </svg>

          {/* Orbiting satellite */}
          <span className="intro-sat">
            <span className="intro-sat-dot" />
          </span>

          {/* Radar sweep */}
          <span className="intro-sweep" />
        </div>

        <div className="intro-wordmark">
          {'ORBIT'.split('').map((ch, i) => (
            <span key={i} className="intro-char" style={{ animationDelay: `${0.5 + i * 0.09}s` }}>
              {ch}
            </span>
          ))}
        </div>
        <div className="intro-subtitle">GLOBAL INTELLIGENCE CONSOLE</div>

        <div className="intro-progress">
          <span className="intro-progress-fill" />
        </div>
        <div className="intro-status">INITIALIZING TACTICAL UPLINK</div>
      </div>
    </div>
  )
}

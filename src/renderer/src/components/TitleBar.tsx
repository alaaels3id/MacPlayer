import React from 'react'
import { Info, Settings, ArrowLeft } from 'lucide-react'
import { translations, Language } from '../i18n/translations'

interface TitleBarProps {
  title?: string
  isVideoPlaying: boolean
  language: Language
  onBackToHome?: () => void
  onOpenSettings: () => void
  onOpenMediaInfo: () => void
  visible: boolean
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title,
  isVideoPlaying,
  language,
  onBackToHome,
  onOpenSettings,
  onOpenMediaInfo,
  visible
}) => {
  const t = translations[language]

  return (
    <header
      className="app-titlebar"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <div className="titlebar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isVideoPlaying && onBackToHome && (
          <button
            className="player-hud-button no-drag"
            onClick={onBackToHome}
            title={language === 'ar' ? 'الرجوع للقائمة' : 'Back to Library'}
            style={{ padding: '6px 10px', height: '28px' }}
          >
            <ArrowLeft size={14} />
          </button>
        )}
        {!isVideoPlaying && (
          <img
            src="./icon.png"
            alt="MacPlayer"
            style={{ width: '18px', height: '18px', objectFit: 'contain', verticalAlign: 'middle' }}
          />
        )}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '-0.2px',
            color: isVideoPlaying ? 'rgba(255, 255, 255, 0.95)' : 'var(--text-secondary)',
            textShadow: isVideoPlaying ? '0 1px 4px rgba(0, 0, 0, 0.8)' : 'none',
            maxWidth: '400px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {title || t.appName}
        </span>
      </div>

      <div className="titlebar-right no-drag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isVideoPlaying && (
          <button
            className="player-hud-button"
            onClick={onOpenMediaInfo}
            title={t.mediaInfo}
            style={{ padding: '6px 10px', height: '28px' }}
          >
            <Info size={14} />
          </button>
        )}
        <button
          className={isVideoPlaying ? 'player-hud-button' : 'glass-button'}
          onClick={onOpenSettings}
          title={t.settings}
          style={{ padding: '6px 10px', height: '28px' }}
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  )
}

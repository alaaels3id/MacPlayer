import React, { useState, useEffect } from 'react'
import { X, Sliders, Play, Subtitles, Key, Check } from 'lucide-react'
import { UserPreferences } from '@shared/types/settings'
import { translations, Language } from '../../i18n/translations'

interface SettingsModalProps {
  isOpen: boolean
  language: Language
  preferences: UserPreferences
  onClose: () => void
  onSave: (newPrefs: Partial<UserPreferences>) => Promise<void>
}

type TabType = 'general' | 'playback' | 'subtitles' | 'providers'

const SUBTITLE_FONTS = [
  { label: 'Arial (Classic Movie Standard)', value: 'Arial, Helvetica, sans-serif' },
  { label: 'SF Pro (macOS Native)', value: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' },
  { label: 'Trebuchet MS (High Contrast Cinema)', value: '"Trebuchet MS", "Lucida Grande", sans-serif' },
  { label: 'Helvetica Neue', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Verdana (Clean & Legible)', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Impact (Cinema Bold)', value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Geeza Pro (Arabic - جيزة برو)', value: '"Geeza Pro", "SF Pro Arabic", "Damascus", "Al Nile", Arial, sans-serif' },
  { label: 'Cairo / Amiri (Arabic - كايرو / أميري)', value: '"Cairo", "Amiri", "Geeza Pro", sans-serif' },
  { label: 'Apple SD Gothic Neo (Korean - 한국어)', value: '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif' },
  { label: 'Hiragino Sans (Japanese - 日本語)', value: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif' }
]

const COLOR_PRESETS = [
  { name: 'White', color: '#ffffff' },
  { name: 'Yellow', color: '#ffe600' },
  { name: 'Cyan', color: '#00ffff' },
  { name: 'Green', color: '#30d158' }
]

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  language,
  preferences,
  onClose,
  onSave
}) => {
  const t = translations[language]
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setLocalPrefs(preferences)
  }, [preferences, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    await onSave(localPrefs)
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 600)
  }

  // Preview styling calculations
  const style = localPrefs.subtitleStyle
  const bgOpacity = (style.backgroundOpacity ?? 20) / 100
  const bgColor = bgOpacity > 0 ? `rgba(0, 0, 0, ${bgOpacity})` : 'transparent'
  const outlinePx = style.outlineWidth ?? 3
  const outlineColor = style.outlineColor || '#000000'
  const textShadow = outlinePx > 0
    ? `
      -${outlinePx}px -${outlinePx}px 0 ${outlineColor},
       ${outlinePx}px -${outlinePx}px 0 ${outlineColor},
      -${outlinePx}px  ${outlinePx}px 0 ${outlineColor},
       ${outlinePx}px  ${outlinePx}px 0 ${outlineColor},
       0px -${outlinePx}px 0 ${outlineColor},
       0px  ${outlinePx}px 0 ${outlineColor},
       -${outlinePx}px  0px 0 ${outlineColor},
       ${outlinePx}px  0px 0 ${outlineColor},
       0px 3px 6px rgba(0, 0, 0, 0.9)
    `
    : '0px 2px 4px rgba(0, 0, 0, 0.8)'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', height: '86vh' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-glass)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{t.settingsTitle}</h3>
          <button onClick={onClose} className="glass-button" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={15} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '8px 20px',
            gap: '8px',
            borderBottom: '1px solid var(--border-glass-subtle)',
            backgroundColor: 'var(--card-bg)'
          }}
        >
          <button
            className={`glass-button ${activeTab === 'general' ? 'primary' : ''}`}
            onClick={() => setActiveTab('general')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Sliders size={13} />
            {t.tabGeneral}
          </button>
          <button
            className={`glass-button ${activeTab === 'playback' ? 'primary' : ''}`}
            onClick={() => setActiveTab('playback')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Play size={13} />
            {t.tabPlayback}
          </button>
          <button
            className={`glass-button ${activeTab === 'subtitles' ? 'primary' : ''}`}
            onClick={() => setActiveTab('subtitles')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Subtitles size={13} />
            {t.tabSubtitles}
          </button>
          <button
            className={`glass-button ${activeTab === 'providers' ? 'primary' : ''}`}
            onClick={() => setActiveTab('providers')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Key size={13} />
            {t.tabProviders}
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                  {t.appLanguage}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={`glass-button ${localPrefs.language === 'en' ? 'primary' : ''}`}
                    onClick={() => setLocalPrefs({ ...localPrefs, language: 'en' })}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    English
                  </button>
                  <button
                    className={`glass-button ${localPrefs.language === 'ar' ? 'primary' : ''}`}
                    onClick={() => setLocalPrefs({ ...localPrefs, language: 'ar' })}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    العربية (Arabic)
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                  {t.appTheme}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={`glass-button ${localPrefs.theme === 'dark' ? 'primary' : ''}`}
                    onClick={() => setLocalPrefs({ ...localPrefs, theme: 'dark' })}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {t.darkTheme}
                  </button>
                  <button
                    className={`glass-button ${localPrefs.theme === 'light' ? 'primary' : ''}`}
                    onClick={() => setLocalPrefs({ ...localPrefs, theme: 'light' })}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {t.lightTheme}
                  </button>
                  <button
                    className={`glass-button ${localPrefs.theme === 'system' ? 'primary' : ''}`}
                    onClick={() => setLocalPrefs({ ...localPrefs, theme: 'system' })}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    {t.systemTheme}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ fontSize: '13px' }}>{t.rememberPosition}</span>
                <input
                  type="checkbox"
                  checked={localPrefs.rememberLastPosition}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, rememberLastPosition: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>
            </>
          )}

          {/* Playback Tab */}
          {activeTab === 'playback' && (
            <>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{t.defaultVolume}</label>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>
                    {Math.round(localPrefs.defaultVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={localPrefs.defaultVolume}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, defaultVolume: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                  {t.defaultSpeed}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      className={`glass-button ${localPrefs.defaultPlaybackSpeed === speed ? 'primary' : ''}`}
                      onClick={() => setLocalPrefs({ ...localPrefs, defaultPlaybackSpeed: speed })}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Subtitles Tab */}
          {activeTab === 'subtitles' && (
            <>
              {/* Live Preview Card */}
              <div
                style={{
                  position: 'relative',
                  height: '140px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #0d1218 0%, #151d26 50%, #0a0e13 100%)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px'
                }}
              >
                <div
                  style={{
                    fontFamily: `${style.fontFamily}, "Geeza Pro", sans-serif`,
                    fontSize: `${style.fontSize || 28}px`,
                    fontWeight: style.fontWeight || 'bold',
                    color: style.textColor || '#ffffff',
                    backgroundColor: bgColor,
                    padding: bgOpacity > 0 ? '4px 14px' : '0 4px',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center',
                    textShadow,
                    letterSpacing: '0.3px',
                    lineHeight: 1.3
                  }}
                >
                  {localPrefs.language === 'ar'
                    ? 'نموذج لمعاينة مظهر الترجمة العربية والإنجليزية'
                    : 'Sample Movie Subtitle Text Preview'}
                </div>
                <div style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '10px', opacity: 0.5 }}>
                  Live Preview
                </div>
              </div>

              {/* Font Family Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                  {t.fontFamily}
                </label>
                <select
                  value={style.fontFamily}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      subtitleStyle: { ...style, fontFamily: e.target.value }
                    })
                  }
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 10px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  {SUBTITLE_FONTS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Weight & Text Color */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                    {t.fontWeight}
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['normal', 'bold'] as const).map((w) => (
                      <button
                        key={w}
                        className={`glass-button ${(style.fontWeight || 'bold') === w ? 'primary' : ''}`}
                        onClick={() =>
                          setLocalPrefs({
                            ...localPrefs,
                            subtitleStyle: { ...style, fontWeight: w }
                          })
                        }
                        style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                    {t.textColor}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.color}
                        onClick={() =>
                          setLocalPrefs({
                            ...localPrefs,
                            subtitleStyle: { ...style, textColor: p.color }
                          })
                        }
                        title={p.name}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: p.color,
                          border: style.textColor === p.color ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={style.textColor}
                      onChange={(e) =>
                        setLocalPrefs({
                          ...localPrefs,
                          subtitleStyle: { ...style, textColor: e.target.value }
                        })
                      }
                      title="Custom Color"
                      style={{
                        width: '28px',
                        height: '28px',
                        padding: 0,
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        background: 'transparent'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Outline Width */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{t.outlineWidth}</label>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{style.outlineWidth ?? 3}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={style.outlineWidth ?? 3}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      subtitleStyle: { ...style, outlineWidth: parseInt(e.target.value, 10) }
                    })
                  }
                  style={{ width: '100%' }}
                />
              </div>

              {/* Subtitle font size */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{t.fontSize}</label>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{style.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="52"
                  step="2"
                  value={style.fontSize}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      subtitleStyle: { ...style, fontSize: parseInt(e.target.value, 10) }
                    })
                  }
                  style={{ width: '100%' }}
                />
              </div>

              {/* Background Opacity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{t.backgroundOpacity}</label>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{style.backgroundOpacity ?? 20}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={style.backgroundOpacity ?? 20}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      subtitleStyle: { ...style, backgroundOpacity: parseInt(e.target.value, 10) }
                    })
                  }
                  style={{ width: '100%' }}
                />
              </div>

              {/* Vertical Position / Offset */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{t.verticalPosition}</label>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{style.bottomOffset ?? 64}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="220"
                  step="4"
                  value={style.bottomOffset ?? 64}
                  onChange={(e) =>
                    setLocalPrefs({
                      ...localPrefs,
                      subtitleStyle: { ...style, bottomOffset: parseInt(e.target.value, 10) }
                    })
                  }
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
                <span style={{ fontSize: '13px' }}>{t.autoSearchSubtitles}</span>
                <input
                  type="checkbox"
                  checked={localPrefs.autoSearchSubtitles}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, autoSearchSubtitles: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>
            </>
          )}

          {/* Providers Tab */}
          {activeTab === 'providers' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                {t.openSubtitlesKey}
              </label>
              <input
                type="text"
                placeholder="Enter OpenSubtitles API Key..."
                value={localPrefs.openSubtitlesApiKey || ''}
                onChange={(e) => setLocalPrefs({ ...localPrefs, openSubtitlesApiKey: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px', lineHeight: 1.4 }}>
                {t.openSubtitlesKeyHint}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '16px 20px',
            borderTop: '1px solid var(--border-glass)'
          }}
        >
          <button className="glass-button" onClick={onClose}>
            {t.close}
          </button>
          <button className="glass-button primary" onClick={handleSave}>
            {isSaved ? <Check size={14} /> : null}
            {isSaved ? 'Saved!' : t.saveChanges}
          </button>
        </div>
      </div>
    </div>
  )
}

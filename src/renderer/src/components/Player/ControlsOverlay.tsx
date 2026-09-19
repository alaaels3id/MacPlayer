import React, { useState } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Subtitles,
  Maximize,
  Minimize,
  PictureInPicture2,
  Sliders,
  Plus,
  Search,
  Check,
  Music
} from 'lucide-react'
import { ProgressBar } from './ProgressBar'
import { formatTime } from '@shared/utils/subtitleParser'
import { SubtitleTrack } from '@shared/types/subtitle'
import { AudioTrack } from '@shared/types/media'
import { translations, Language } from '../../i18n/translations'

interface ControlsOverlayProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
  isFullscreen: boolean
  visible: boolean
  language: Language
  subtitleTracks: SubtitleTrack[]
  activeSubtitleId: string | null
  audioTracks: AudioTrack[]
  activeAudioTrackId: number
  subtitleDelay: number
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onSeekRelative: (seconds: number) => void
  onVolumeChange: (vol: number) => void
  onToggleMute: () => void
  onPlaybackRateChange: (rate: number) => void
  onToggleFullscreen: () => void
  onTogglePip: () => void
  onSelectSubtitle: (id: string | null) => void
  onOpenAddSubtitle: () => void
  onOpenFindSubtitles: () => void
  onAdjustSubtitleDelay: (delta: number) => void
  onSelectAudioTrack: (id: number) => void
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  visible,
  language,
  subtitleTracks,
  activeSubtitleId,
  audioTracks,
  activeAudioTrackId,
  subtitleDelay,
  onTogglePlay,
  onSeek,
  onSeekRelative,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleFullscreen,
  onTogglePip,
  onSelectSubtitle,
  onOpenAddSubtitle,
  onOpenFindSubtitles,
  onAdjustSubtitleDelay,
  onSelectAudioTrack
}) => {
  const t = translations[language]

  // Popover menus state
  const [showSubMenu, setShowSubMenu] = useState(false)
  const [showAudioMenu, setShowAudioMenu] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

  return (
    <div
      className="player-hud-bar"
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '12px 18px',
        borderRadius: 'var(--radius-xl)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity var(--transition-normal), transform var(--transition-normal)',
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        zIndex: 40
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Progress / Seek bar */}
      <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />

      {/* Main Controls Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        {/* Left Section: Play/Pause, Replay, Forward, Volume, Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Play / Pause */}
          <button
            className="player-hud-button"
            onClick={onTogglePlay}
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.16)'
            }}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
            )}
          </button>

          {/* Seek Backward 10s */}
          <button
            className="player-hud-button"
            onClick={() => onSeekRelative(-10)}
            title={t.seekBackward}
            style={{ padding: '6px', height: '32px' }}
          >
            <RotateCcw size={15} />
          </button>

          {/* Seek Forward 10s */}
          <button
            className="player-hud-button"
            onClick={() => onSeekRelative(10)}
            title={t.seekForward}
            style={{ padding: '6px', height: '32px' }}
          >
            <RotateCw size={15} />
          </button>

          {/* Volume Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
            <button
              className="player-hud-button"
              onClick={onToggleMute}
              title={isMuted ? t.unmute : t.mute}
              style={{ padding: '6px', height: '32px' }}
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              style={{ width: '64px', cursor: 'pointer' }}
            />
          </div>

          {/* Time Display */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.85)',
              marginLeft: '8px',
              letterSpacing: '0.2px'
            }}
          >
            <span style={{ color: '#ffffff' }}>{formatTime(currentTime)}</span>
            <span style={{ margin: '0 4px', opacity: 0.45 }}>/</span>
            <span style={{ opacity: 0.8 }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Section: Speed, Audio, Subtitles, PiP, Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          {/* Speed Selector */}
          <div style={{ position: 'relative' }}>
            <button
              className="player-hud-button"
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu)
                setShowSubMenu(false)
                setShowAudioMenu(false)
              }}
              style={{ padding: '6px 10px', height: '32px', fontSize: '12px', fontWeight: 600 }}
            >
              {playbackRate}x
            </button>

            {showSpeedMenu && (
              <div
                className="player-hud-menu"
                style={{
                  position: 'absolute',
                  bottom: '42px',
                  right: 0,
                  borderRadius: 'var(--radius-md)',
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '90px',
                  zIndex: 60
                }}
              >
                {speedOptions.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      onPlaybackRateChange(rate)
                      setShowSpeedMenu(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: rate === playbackRate ? 'var(--accent)' : 'transparent',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{rate}x</span>
                    {rate === playbackRate && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio Tracks Popover */}
          {audioTracks.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button
                className="player-hud-button"
                onClick={() => {
                  setShowAudioMenu(!showAudioMenu)
                  setShowSubMenu(false)
                  setShowSpeedMenu(false)
                }}
                title={t.audioTracks}
                style={{ padding: '6px 10px', height: '32px' }}
              >
                <Music size={15} />
              </button>

              {showAudioMenu && (
                <div
                  className="player-hud-menu"
                  style={{
                    position: 'absolute',
                    bottom: '42px',
                    right: 0,
                    borderRadius: 'var(--radius-md)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    minWidth: '180px',
                    zIndex: 60
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.65)', padding: '4px 8px' }}>
                    {t.audioTracks}
                  </div>
                  {audioTracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => {
                        onSelectAudioTrack(track.id)
                        setShowAudioMenu(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: track.id === activeAudioTrackId ? 'rgba(255,255,255,0.15)' : 'transparent',
                        color: track.id === activeAudioTrackId ? 'var(--accent)' : '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {track.title} ({track.language.toUpperCase()})
                      </span>
                      {track.id === activeAudioTrackId && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subtitles Popover */}
          <div style={{ position: 'relative' }}>
            <button
              className={`player-hud-button ${activeSubtitleId ? 'primary' : ''}`}
              onClick={() => {
                setShowSubMenu(!showSubMenu)
                setShowAudioMenu(false)
                setShowSpeedMenu(false)
              }}
              title={t.subtitles}
              style={{
                padding: '6px 10px',
                height: '32px',
                backgroundColor: activeSubtitleId ? 'var(--accent)' : undefined
              }}
            >
              <Subtitles size={15} />
            </button>

            {showSubMenu && (
              <div
                className="player-hud-menu"
                style={{
                  position: 'absolute',
                  bottom: '42px',
                  right: 0,
                  borderRadius: 'var(--radius-lg)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '220px',
                  zIndex: 60
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                    paddingBottom: '6px'
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)' }}>
                    {t.subtitles}
                  </span>
                  {activeSubtitleId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => onAdjustSubtitleDelay(-0.5)}
                        title="Delay -0.5s (G)"
                        style={{
                          background: 'rgba(255,255,255,0.12)',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        -0.5s
                      </button>
                      <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600 }}>
                        {subtitleDelay >= 0 ? `+${subtitleDelay.toFixed(1)}` : subtitleDelay.toFixed(1)}s
                      </span>
                      <button
                        onClick={() => onAdjustSubtitleDelay(0.5)}
                        title="Delay +0.5s (H)"
                        style={{
                          background: 'rgba(255,255,255,0.12)',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        +0.5s
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtitles Off */}
                <button
                  onClick={() => {
                    onSelectSubtitle(null)
                    setShowSubMenu(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: activeSubtitleId === null ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: activeSubtitleId === null ? 'var(--accent)' : '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <span>{t.subtitlesOff}</span>
                  {activeSubtitleId === null && <Check size={12} />}
                </button>

                {/* Available Subtitle Tracks */}
                {subtitleTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      onSelectSubtitle(track.id)
                      setShowSubMenu(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: activeSubtitleId === track.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: activeSubtitleId === track.id ? 'var(--accent)' : '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 8px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                      {track.title}
                    </span>
                    {activeSubtitleId === track.id && <Check size={12} />}
                  </button>
                ))}

                <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.12)', margin: '4px 0' }} />

                {/* Actions: Add Subtitle, Find Subtitles */}
                <button
                  onClick={() => {
                    setShowSubMenu(false)
                    onOpenAddSubtitle()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} />
                  <span>{t.addSubtitle}</span>
                </button>

                <button
                  onClick={() => {
                    setShowSubMenu(false)
                    onOpenFindSubtitles()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    color: 'var(--accent)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <Search size={14} />
                  <span>{t.findSubtitles}</span>
                </button>
              </div>
            )}
          </div>

          {/* Picture in Picture */}
          <button
            className="player-hud-button"
            onClick={onTogglePip}
            title={t.pip}
            style={{ padding: '6px 10px', height: '32px' }}
          >
            <PictureInPicture2 size={15} />
          </button>

          {/* Fullscreen */}
          <button
            className="player-hud-button"
            onClick={onToggleFullscreen}
            title={t.fullscreen}
            style={{ padding: '6px 10px', height: '32px' }}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}

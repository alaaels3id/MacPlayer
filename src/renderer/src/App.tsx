import React, { useState, useEffect, useRef, useCallback } from 'react'
import { TitleBar } from './components/TitleBar'
import { EmptyState } from './components/EmptyState'
import { VideoSurface } from './components/Player/VideoSurface'
import { SubtitleOverlay } from './components/Player/SubtitleOverlay'
import { ControlsOverlay } from './components/Player/ControlsOverlay'
import { SyncToast } from './components/Player/SyncToast'
import { SubtitleSearchModal } from './components/Modals/SubtitleSearchModal'
import { MediaInfoModal } from './components/Modals/MediaInfoModal'
import { SettingsModal } from './components/Modals/SettingsModal'

import { MediaMetadata, RecentVideo, AudioTrack } from '@shared/types/media'
import { SubtitleTrack } from '@shared/types/subtitle'
import { UserPreferences, DEFAULT_PREFERENCES } from '@shared/types/settings'
import { ParsedMediaName } from '@shared/utils/filenameParser'
import { parseSubtitleContent } from '@shared/utils/subtitleParser'
import { getLanguageName } from '@shared/utils/languageCodes'

export const App: React.FC = () => {
  // Preferences & App state
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([])

  // Video Media State
  const [videoPath, setVideoPath] = useState<string | null>(null)
  const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata | null>(null)
  const [parsedMedia, setParsedMedia] = useState<ParsedMediaName | null>(null)

  // Player Playback State
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [volume, setVolume] = useState<number>(DEFAULT_PREFERENCES.defaultVolume)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [playbackRate, setPlaybackRate] = useState<number>(DEFAULT_PREFERENCES.defaultPlaybackSpeed)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [activeAudioTrackId, setActiveAudioTrackId] = useState<number>(0)

  // Subtitle State
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([])
  const [activeSubtitleId, setActiveSubtitleId] = useState<string | null>(null)
  const [subtitleDelay, setSubtitleDelay] = useState<number>(0)
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Inactivity / Controls visibility
  const [controlsVisible, setControlsVisible] = useState<boolean>(true)
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Modals
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false)
  const [isMediaInfoModalOpen, setIsMediaInfoModalOpen] = useState<boolean>(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false)

  // Load preferences and recents on initial mount
  useEffect(() => {
    if (window.macPlayer) {
      const platform = window.macPlayer.platform || 'darwin'
      document.body.dataset.platform = platform
      document.body.classList.add(`platform-${platform}`)

      window.macPlayer.getSettings().then((prefs) => {
        if (prefs) {
          setPreferences(prefs)
          setVolume(prefs.defaultVolume)
          setPlaybackRate(prefs.defaultPlaybackSpeed)
          setSubtitleDelay(prefs.defaultSubtitleDelay)
        }
      })

      window.macPlayer.getRecents().then((recents) => {
        if (recents) setRecentVideos(recents)
      })

      // Check for file passed on launch (Finder "Open With" or double-click)
      window.macPlayer.getInitialFile().then((filePath) => {
        if (filePath) {
          handleOpenVideoByPath(filePath)
        }
      })
    }
  }, [])

  // Listen for files opened while app is already running
  useEffect(() => {
    if (!window.macPlayer) return
    const unsub = window.macPlayer.onFileOpened((filePath) => {
      if (filePath) {
        handleOpenVideoByPath(filePath)
      }
    })
    return () => unsub()
  }, [])

  // Sync RTL and theme with DOM
  useEffect(() => {
    document.documentElement.dir = preferences.language === 'ar' ? 'rtl' : 'ltr'

    const updateTheme = () => {
      if (preferences.theme === 'system') {
        const isSystemLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
        document.documentElement.setAttribute('data-theme', isSystemLight ? 'light' : 'dark')
      } else {
        document.documentElement.setAttribute('data-theme', preferences.theme)
      }
    }

    updateTheme()

    if (preferences.theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
      const handler = () => updateTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [preferences.language, preferences.theme])

  // Native Menu Listeners
  useEffect(() => {
    if (!window.macPlayer) return

    const unsubOpen = window.macPlayer.onMenuEvent('menu:openVideo', () => {
      handleOpenVideoDialog()
    })
    const unsubSub = window.macPlayer.onMenuEvent('menu:addSubtitle', () => {
      handleAddSubtitleDialog()
    })
    const unsubPlay = window.macPlayer.onMenuEvent('menu:togglePlay', () => {
      handleTogglePlay()
    })
    const unsubDelay = window.macPlayer.onMenuEvent('menu:adjustDelay', (delta: number) => {
      handleAdjustSubtitleDelay(delta)
    })

    return () => {
      unsubOpen()
      unsubSub()
      unsubPlay()
      unsubDelay()
    }
  }, [isPlaying, subtitleDelay, videoPath])

  // Mouse inactivity timer for auto-hiding controls
  const resetInactivityTimer = useCallback(() => {
    setControlsVisible(true)
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current)
    }

    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setControlsVisible(false)
      }, 2500)
    }
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true)
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current)
      }
    } else {
      resetInactivityTimer()
    }
  }, [isPlaying, resetInactivityTimer])

  // Toast HUD helper
  const showSyncToast = (msg: string) => {
    setSyncToastMessage(msg)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => {
      setSyncToastMessage(null)
    }, 1800)
  }

  // Adjust subtitle delay
  const handleAdjustSubtitleDelay = (delta: number) => {
    const newDelay = Math.round((subtitleDelay + delta) * 10) / 10
    setSubtitleDelay(newDelay)
    const sign = newDelay > 0 ? `+${newDelay.toFixed(1)}s` : `${newDelay.toFixed(1)}s`
    showSyncToast(`Subtitle Delay: ${sign}`)
  }

  // Open Video Dialog
  const handleOpenVideoDialog = async () => {
    if (!window.macPlayer) return
    const result = await window.macPlayer.openVideoDialog()
    if (result) {
      loadVideoFile(result.filePath, result.metadata, result.parsed)
    }
  }

  // Open Video by Path (drag & drop or recents)
  const handleOpenVideoByPath = async (filePath: string) => {
    if (!window.macPlayer) return
    const result = await window.macPlayer.probeFile(filePath)
    if (result) {
      loadVideoFile(result.filePath, result.metadata, result.parsed)
    }
  }

  // Load Video Core Logic
  const loadVideoFile = async (
    path: string,
    metadata: MediaMetadata,
    parsed: ParsedMediaName
  ) => {
    setVideoPath(path)
    setMediaMetadata(metadata)
    setParsedMedia(parsed)
    setCurrentTime(0)
    setSubtitleTracks([])
    setActiveSubtitleId(null)
    setSubtitleDelay(preferences.defaultSubtitleDelay)

    // Check adjacent subtitle files in directory
    try {
      const adjacent = await window.macPlayer.findAdjacentSubtitles(path)
      const loadedTracks: SubtitleTrack[] = []

      for (const track of adjacent) {
        if (track.filePath) {
          const subFile = await window.macPlayer.readSubtitleFile(track.filePath)
          const cues = parseSubtitleContent(subFile.content, subFile.filename)
          loadedTracks.push({
            ...track,
            cues
          })
        }
      }

      setSubtitleTracks(loadedTracks)

      // Auto-select first matching preferred language subtitle if found
      if (loadedTracks.length > 0) {
        const preferred = loadedTracks.find((t) =>
          preferences.preferredLanguages.includes(t.languageCode)
        )
        setActiveSubtitleId(preferred ? preferred.id : loadedTracks[0].id)
      } else if (preferences.autoSearchSubtitles) {
        // Automatically open search modal if no local subtitles found
        setIsSearchModalOpen(true)
      }
    } catch (err) {
      console.warn('Error loading adjacent subtitles:', err)
    }

    // Refresh recents list
    window.macPlayer.getRecents().then((r) => setRecentVideos(r))
  }

  // Add Subtitle Dialog
  const handleAddSubtitleDialog = async () => {
    if (!window.macPlayer) return
    const result = await window.macPlayer.openSubtitleDialog()
    if (result) {
      attachSubtitleContent(result.filename, result.content, result.filePath)
    }
  }

  // Attach Subtitle Content to Tracks
  const attachSubtitleContent = (filename: string, content: string, filePath?: string) => {
    const cues = parseSubtitleContent(content, filename)
    const trackId = `manual-${Date.now()}`
    const newTrack: SubtitleTrack = {
      id: trackId,
      title: filename,
      language: getLanguageName('und'),
      languageCode: 'und',
      source: 'local',
      filePath,
      cues,
      delay: 0
    }

    setSubtitleTracks((prev) => [...prev, newTrack])
    setActiveSubtitleId(trackId)
    showSyncToast(`Loaded Subtitle: ${filename}`)
  }

  // Subtitle Download & Load from Provider
  const handleDownloadAndLoadSubtitle = async (providerId: string, resultId: string) => {
    if (!window.macPlayer) return
    const downloaded = await window.macPlayer.downloadSubtitle(providerId, resultId)
    attachSubtitleContent(downloaded.filename, downloaded.content, downloaded.filePath)
  }

  // Playback Controls
  const handleTogglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(console.error)
    }
  }

  const handleSeek = (time: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = time
    setCurrentTime(time)
    if (videoPath && preferences.rememberLastPosition) {
      window.macPlayer?.updatePosition(videoPath, time)
    }
  }

  const handleSeekRelative = (seconds: number) => {
    if (!videoRef.current) return
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration))
    handleSeek(newTime)
  }

  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = newVol
    setVolume(newVol)
    setIsMuted(newVol === 0)
  }

  const handleToggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
      videoRef.current.volume = volume > 0 ? volume : 0.8
    } else {
      videoRef.current.muted = true
      setIsMuted(true)
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error)
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(console.error)
      setIsFullscreen(false)
    }
  }

  const handleTogglePip = () => {
    if (!videoRef.current) return
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(console.error)
    } else if (document.pictureInPictureEnabled) {
      videoRef.current.requestPictureInPicture().catch(console.error)
    }
  }

  // Keyboard Shortcuts per PRD §46
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        handleTogglePlay()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleSeekRelative(-10)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleSeekRelative(10)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleVolumeChange(Math.min(1, volume + 0.1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleVolumeChange(Math.max(0, volume - 0.1))
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        handleToggleFullscreen()
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        handleToggleMute()
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        handleAdjustSubtitleDelay(-0.5)
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault()
        handleAdjustSubtitleDelay(0.5)
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        setIsSearchModalOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, volume, isMuted, duration, subtitleDelay, videoPath])

  // Save Settings
  const handleSavePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!window.macPlayer) return
    const updated = await window.macPlayer.saveSettings(newPrefs)
    setPreferences(updated)
  }

  // Active Subtitle Track Cues
  const activeTrack = subtitleTracks.find((t) => t.id === activeSubtitleId)

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden',
        cursor: controlsVisible || !isPlaying ? 'default' : 'none'
      }}
      onMouseMove={resetInactivityTimer}
    >
      {/* Title Bar */}
      <TitleBar
        title={parsedMedia?.cleanTitle || mediaMetadata?.filename}
        isVideoPlaying={Boolean(videoPath)}
        language={preferences.language}
        visible={controlsVisible || !isPlaying}
        onBackToHome={() => {
          setVideoPath(null)
          setIsPlaying(false)
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenMediaInfo={() => setIsMediaInfoModalOpen(true)}
      />

      {/* Sync Toast HUD */}
      <SyncToast message={syncToastMessage} />

      {/* Video Player or Empty State */}
      {videoPath ? (
        <>
          <VideoSurface
            ref={videoRef}
            src={videoPath}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => {
              const el = e.currentTarget
              setCurrentTime(el.currentTime)
            }}
            onLoadedMetadata={(e) => {
              const el = e.currentTarget
              setDuration(el.duration)
              el.volume = volume
              el.playbackRate = playbackRate
              el.play().catch(console.error)
            }}
            onEnded={() => setIsPlaying(false)}
            onTogglePlay={handleTogglePlay}
            onToggleFullscreen={handleToggleFullscreen}
            onDropSubtitle={(filePath) => {
              window.macPlayer?.readSubtitleFile(filePath).then((res) => {
                attachSubtitleContent(res.filename, res.content, res.filePath)
              })
            }}
          />

          {/* Subtitle Overlay */}
          <SubtitleOverlay
            cues={activeTrack?.cues}
            currentTime={currentTime}
            delay={subtitleDelay}
            style={preferences.subtitleStyle}
            isControlsVisible={controlsVisible}
          />

          {/* Floating Controls Overlay */}
          <ControlsOverlay
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            playbackRate={playbackRate}
            isFullscreen={isFullscreen}
            visible={controlsVisible}
            language={preferences.language}
            subtitleTracks={subtitleTracks}
            activeSubtitleId={activeSubtitleId}
            audioTracks={mediaMetadata?.audioTracks || []}
            activeAudioTrackId={activeAudioTrackId}
            subtitleDelay={subtitleDelay}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            onSeekRelative={handleSeekRelative}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onPlaybackRateChange={handlePlaybackRateChange}
            onToggleFullscreen={handleToggleFullscreen}
            onTogglePip={handleTogglePip}
            onSelectSubtitle={(id) => setActiveSubtitleId(id)}
            onOpenAddSubtitle={handleAddSubtitleDialog}
            onOpenFindSubtitles={() => setIsSearchModalOpen(true)}
            onAdjustSubtitleDelay={handleAdjustSubtitleDelay}
            onSelectAudioTrack={(id) => setActiveAudioTrackId(id)}
          />
        </>
      ) : (
        <EmptyState
          language={preferences.language}
          recentVideos={recentVideos}
          onOpenVideo={handleOpenVideoDialog}
          onSelectRecent={handleOpenVideoByPath}
          onRemoveRecent={(path) => {
            window.macPlayer?.removeRecent(path).then((r) => setRecentVideos(r))
          }}
          onClearRecents={() => {
            window.macPlayer?.clearRecents().then((r) => setRecentVideos(r))
          }}
          onFileDrop={handleOpenVideoByPath}
        />
      )}

      {/* Modals */}
      <SubtitleSearchModal
        isOpen={isSearchModalOpen}
        language={preferences.language}
        preferredLanguage={preferences.preferredLanguages[0] || 'en'}
        parsedMedia={parsedMedia}
        onClose={() => setIsSearchModalOpen(false)}
        onDownloadAndLoad={handleDownloadAndLoadSubtitle}
      />

      <MediaInfoModal
        isOpen={isMediaInfoModalOpen}
        language={preferences.language}
        metadata={mediaMetadata}
        onClose={() => setIsMediaInfoModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        language={preferences.language}
        preferences={preferences}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSavePreferences}
      />
    </div>
  )
}

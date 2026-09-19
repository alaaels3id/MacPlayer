import React, { useState } from 'react'
import { Film, UploadCloud, FolderOpen, Clock, Trash2, Play } from 'lucide-react'
import { RecentVideo } from '@shared/types/media'
import { translations, Language } from '../i18n/translations'
import { formatTime } from '@shared/utils/subtitleParser'

interface EmptyStateProps {
  language: Language
  recentVideos: RecentVideo[]
  onOpenVideo: () => void
  onSelectRecent: (filePath: string) => void
  onRemoveRecent: (filePath: string) => void
  onClearRecents: () => void
  onFileDrop: (filePath: string) => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  language,
  recentVideos,
  onOpenVideo,
  onSelectRecent,
  onRemoveRecent,
  onClearRecents,
  onFileDrop
}) => {
  const t = translations[language]
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      // In Electron webPreferences without sandbox, File object has .path property
      const filePath = (file as any).path
      if (filePath) {
        onFileDrop(filePath)
      }
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 32px 32px 32px',
        overflowY: 'auto',
        background: 'radial-gradient(circle at 50% 20%, rgba(10, 132, 255, 0.08) 0%, transparent 70%)'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Box */}
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--border-glass)'}`,
          backgroundColor: isDragOver ? 'rgba(10, 132, 255, 0.08)' : 'var(--card-bg)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px',
          transition: 'all var(--transition-normal)',
          boxShadow: isDragOver ? '0 0 30px var(--accent-glow)' : 'none'
        }}
      >
        <div
          style={{
            width: '76px',
            height: '76px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isDragOver ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform var(--transition-normal)'
          }}
        >
          <img
            src="./icon.png"
            alt="MacPlayer"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 22px rgba(0, 0, 0, 0.25)) drop-shadow(0 0 16px rgba(10, 132, 255, 0.25))'
            }}
          />
        </div>

        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {t.dropVideoHere}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            MP4, MKV, MOV, WebM, AVI, TS
          </p>
        </div>

        <button
          className="glass-button primary"
          onClick={onOpenVideo}
          style={{
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: 'var(--radius-pill)',
            marginTop: '8px'
          }}
        >
          <FolderOpen size={16} />
          {t.openVideo}
          <span style={{ opacity: 0.6, fontSize: '11px', marginLeft: '6px' }}>⌘O</span>
        </button>
      </div>

      {/* Recents Section */}
      <div style={{ width: '100%', maxWidth: '640px', marginTop: '36px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '0 4px'
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} />
            {t.recentFiles}
          </span>
          {recentVideos.length > 0 && (
            <button
              onClick={onClearRecents}
              className="glass-button"
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                color: 'var(--danger)',
                borderColor: 'transparent',
                background: 'transparent'
              }}
            >
              <Trash2 size={12} />
              {t.clearRecents}
            </button>
          )}
        </div>

        {recentVideos.length === 0 ? (
          <div
            style={{
              padding: '28px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '13px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-glass-subtle)',
              background: 'var(--card-bg)'
            }}
          >
            {t.noRecentFiles}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentVideos.map((video) => {
              const progressPct = video.duration > 0 ? (video.lastPosition / video.duration) * 100 : 0

              return (
                <div
                  key={video.filePath}
                  onClick={() => onSelectRecent(video.filePath)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--border-glass-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  className="recent-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-glass)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-glass-subtle)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--btn-glass-bg)',
                        border: '1px solid var(--border-glass-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        flexShrink: 0
                      }}
                    >
                      <Play size={16} fill="currentColor" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {video.title || video.filename}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '2px'
                        }}
                      >
                        <span>{video.duration ? formatTime(video.duration) : '--:--'}</span>
                        {progressPct > 0 && <span>• {Math.round(progressPct)}% watched</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveRecent(video.filePath)
                    }}
                    title="Remove from recents"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

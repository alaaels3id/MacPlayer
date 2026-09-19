import React from 'react'
import { X, Film, Music, Subtitles } from 'lucide-react'
import { MediaMetadata } from '@shared/types/media'
import { translations, Language } from '../../i18n/translations'
import { formatTime } from '@shared/utils/subtitleParser'

interface MediaInfoModalProps {
  isOpen: boolean
  language: Language
  metadata: MediaMetadata | null
  onClose: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const MediaInfoModal: React.FC<MediaInfoModalProps> = ({
  isOpen,
  language,
  metadata,
  onClose
}) => {
  const t = translations[language]

  if (!isOpen || !metadata) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{t.mediaInfoTitle}</h3>
          </div>
          <button onClick={onClose} className="glass-button" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{t.file}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
              {metadata.filename}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-all' }}>
              {metadata.filePath}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              backgroundColor: 'var(--card-bg)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-glass-subtle)'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>{t.resolution}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {metadata.width} × {metadata.height}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>{t.frameRate}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{metadata.fps} fps</span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>{t.videoCodec}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                {metadata.videoCodec}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>{t.audioCodec}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                {metadata.audioCodec}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>{t.fileSize}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{formatFileSize(metadata.fileSize)}</span>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>{t.container}</span>
              <span style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                {metadata.formatName}
              </span>
            </div>
          </div>

          {/* Audio Tracks */}
          {metadata.audioTracks && metadata.audioTracks.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Music size={14} />
                {t.audioTracks} ({metadata.audioTracks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {metadata.audioTracks.map((track) => (
                  <div
                    key={track.id}
                    style={{
                      fontSize: '12px',
                      padding: '6px 10px',
                      backgroundColor: 'var(--btn-glass-bg)',
                      border: '1px solid var(--border-glass-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span>{track.title}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      {track.codec.toUpperCase()} • {track.language.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Embedded Subtitles */}
          {metadata.embeddedSubtitles && metadata.embeddedSubtitles.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Subtitles size={14} />
                {t.embeddedSubtitlesCount} ({metadata.embeddedSubtitles.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {metadata.embeddedSubtitles.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      fontSize: '12px',
                      padding: '6px 10px',
                      backgroundColor: 'var(--btn-glass-bg)',
                      border: '1px solid var(--border-glass-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span>{sub.title}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      {sub.codec.toUpperCase()} • {sub.language.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

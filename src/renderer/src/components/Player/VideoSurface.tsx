import React, { forwardRef, useState } from 'react'

interface VideoSurfaceProps {
  src: string
  onTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => void
  onLoadedMetadata: (e: React.SyntheticEvent<HTMLVideoElement>) => void
  onEnded: () => void
  onPlay: () => void
  onPause: () => void
  onTogglePlay: () => void
  onToggleFullscreen: () => void
  onDropSubtitle: (filePath: string) => void
}

export const VideoSurface = forwardRef<HTMLVideoElement, VideoSurfaceProps>(
  (
    {
      src,
      onTimeUpdate,
      onLoadedMetadata,
      onEnded,
      onPlay,
      onPause,
      onTogglePlay,
      onToggleFullscreen,
      onDropSubtitle
    },
    ref
  ) => {
    const [isDragOver, setIsDragOver] = useState(false)

    // Convert local filepath to file:// URL safely
    const videoUrl = src.startsWith('file://') || src.startsWith('blob:') || src.startsWith('http')
      ? src
      : `file://${encodeURI(src).replace(/#/g, '%23')}`

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
        const filePath = (file as any).path
        if (filePath) {
          onDropSubtitle(filePath)
        }
      }
    }

    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
        onClick={onTogglePlay}
        onDoubleClick={onToggleFullscreen}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <video
          ref={ref}
          src={videoUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            outline: 'none'
          }}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget
            try {
              if (video.textTracks) {
                for (let i = 0; i < video.textTracks.length; i++) {
                  video.textTracks[i].mode = 'disabled'
                }
              }
            } catch (err) {
              console.warn('Could not disable native textTracks:', err)
            }
            onLoadedMetadata(e)
          }}
          onEnded={onEnded}
          onPlay={onPlay}
          onPause={onPause}
        />

        {isDragOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(10, 132, 255, 0.25)',
              border: '4px dashed var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 600,
              zIndex: 20,
              backdropFilter: 'blur(8px)',
              pointerEvents: 'none'
            }}
          >
            Drop Subtitle (.srt / .vtt) to Load
          </div>
        )}
      </div>
    )
  }
)

VideoSurface.displayName = 'VideoSurface'

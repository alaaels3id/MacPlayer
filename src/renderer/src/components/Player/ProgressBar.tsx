import React, { useState, useRef } from 'react'
import { formatTime } from '@shared/utils/subtitleParser'

interface ProgressBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverX, setHoverX] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const calculateTimeFromEvent = (e: React.MouseEvent | MouseEvent): number => {
    if (!containerRef.current || duration <= 0) return 0
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const ratio = x / rect.width
    return ratio * duration
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || duration <= 0) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    setHoverX(x)
    setHoverTime((x / rect.width) * duration)
  }

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHoverTime(null)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    const newTime = calculateTimeFromEvent(e)
    onSeek(newTime)

    const handleWindowMouseMove = (moveEvent: MouseEvent) => {
      const time = calculateTimeFromEvent(moveEvent)
      onSeek(time)
    }

    const handleWindowMouseUp = () => {
      setIsDragging(false)
      setHoverTime(null)
      window.removeEventListener('mousemove', handleWindowMouseMove)
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }

    window.addEventListener('mousemove', handleWindowMouseMove)
    window.addEventListener('mouseup', handleWindowMouseUp)
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
    >
      {/* Tooltip on Hover */}
      {hoverTime !== null && (
        <div
          style={{
            position: 'absolute',
            top: '-28px',
            left: `${hoverX}px`,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(20, 22, 28, 0.92)',
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontWeight: 600,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {formatTime(hoverTime)}
        </div>
      )}

      {/* Progress Track Background */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.22)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
          transition: 'height var(--transition-fast)'
        }}
        className="progress-track"
      >
        {/* Active Fill */}
        <div
          style={{
            width: `${Math.min(100, Math.max(0, progressPercent))}%`,
            height: '100%',
            backgroundColor: 'var(--accent)',
            borderRadius: 'var(--radius-pill)'
          }}
        />
      </div>

      {/* Scrubber Knob */}
      <div
        style={{
          position: 'absolute',
          left: `${Math.min(100, Math.max(0, progressPercent))}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: isDragging ? '14px' : '10px',
          height: isDragging ? '14px' : '10px',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
          transition: 'all var(--transition-fast)',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

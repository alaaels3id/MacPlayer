import React, { useMemo } from 'react'
import { SubtitleCue, SubtitleStyle } from '@shared/types/subtitle'

interface SubtitleOverlayProps {
  cues?: SubtitleCue[]
  currentTime: number
  delay: number // in seconds
  style: SubtitleStyle
  isControlsVisible?: boolean
}

/**
 * Clean and format subtitle HTML text safely
 */
function formatCueHtml(rawText: string): string {
  // Convert newlines to breaks
  let formatted = rawText.replace(/\n/g, '<br />')
  // Allow simple tags: <i>, <b>, <u>
  // Strip any other tags or scripts
  formatted = formatted.replace(/<(?!(\/?(i|b|u|br))\b)[^>]+>/gi, '')
  return formatted
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  cues = [],
  currentTime,
  delay,
  style,
  isControlsVisible = false
}) => {
  const adjustedTime = currentTime + delay

  // Find all active cues at current adjusted timestamp
  const activeCues = useMemo(() => {
    if (!cues || cues.length === 0) return []
    return cues.filter((cue) => cue.startTime <= adjustedTime && cue.endTime >= adjustedTime)
  }, [cues, adjustedTime])

  if (activeCues.length === 0) return null

  // Background color with opacity
  const bgOpacity = (style.backgroundOpacity ?? 20) / 100
  const bgColor = bgOpacity > 0 ? `rgba(0, 0, 0, ${bgOpacity})` : 'transparent'

  // Text outline via multiple text-shadows for movie-standard readability
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

  // Controls bar is at bottom: 24px and has a height of ~92px (top edge at ~116px).
  // Subtitle must always float comfortably above the controls bar when visible.
  const baseOffset = style.bottomOffset ?? 64
  const controlsLift = 96
  const bottomPosition = isControlsVisible
    ? Math.max(baseOffset + controlsLift, 148)
    : baseOffset

  // Full font-family stack ensuring Arabic, Latin and CJK glyphs render beautifully
  const resolvedFontFamily = style.fontFamily
    ? `${style.fontFamily}, "Geeza Pro", "SF Pro Arabic", "Apple SD Gothic Neo", sans-serif`
    : 'Arial, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Geeza Pro", "SF Pro Arabic", sans-serif'

  return (
    <div
      style={{
        position: 'absolute',
        bottom: `${bottomPosition}px`,
        left: '4%',
        right: '4%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 35,
        transition: 'bottom 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {activeCues.map((cue) => (
        <div
          key={cue.id}
          dir="auto"
          style={{
            fontFamily: resolvedFontFamily,
            fontSize: `${style.fontSize || 28}px`,
            fontWeight: style.fontWeight || 'bold',
            color: style.textColor || '#ffffff',
            backgroundColor: bgColor,
            padding: bgOpacity > 0 ? '6px 16px' : '2px 8px',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
            textShadow,
            lineHeight: 1.45,
            maxWidth: '90%',
            marginBottom: '4px',
            letterSpacing: 'normal',
            unicodeBidi: 'plaintext',
            WebkitFontSmoothing: 'antialiased'
          }}
          dangerouslySetInnerHTML={{ __html: formatCueHtml(cue.text) }}
        />
      ))}
    </div>
  )
}

import { SubtitleCue } from '../types/subtitle'

/**
 * Parses timestamp supporting Unicode marks, Arabic-Indic digits, and varied separators
 */
export function parseTimestamp(timeString: string): number {
  if (!timeString) return 0

  // 1. Strip all Unicode directional marks (LRM \u200E, RLM \u200F, isolates, BOM, NBSP)
  const clean = timeString
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF\u00A0]/g, '')
    .trim()

  // 2. Convert Arabic-Indic (٠-٩) and Eastern Persian digits (۰-۹) to standard ASCII 0-9
  const ascii = clean.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0)
    if (code >= 1632 && code <= 1641) return String(code - 1632)
    if (code >= 1776 && code <= 1785) return String(code - 1776)
    return d
  })

  // 3. Match HH:MM:SS,mmm or HH:MM:SS.mmm
  const match3 = ascii.match(/(\d{1,3}):(\d{1,2}):(\d{1,2})(?:[.,](\d{1,3}))?/)
  if (match3) {
    const hours = parseInt(match3[1], 10)
    const minutes = parseInt(match3[2], 10)
    const seconds = parseInt(match3[3], 10)
    const ms = match3[4] ? parseInt(match3[4].padEnd(3, '0').slice(0, 3), 10) : 0
    return hours * 3600 + minutes * 60 + seconds + ms / 1000
  }

  // 4. Match MM:SS,mmm or MM:SS.mmm
  const match2 = ascii.match(/(\d{1,2}):(\d{1,2})(?:[.,](\d{1,3}))?/)
  if (match2) {
    const minutes = parseInt(match2[1], 10)
    const seconds = parseInt(match2[2], 10)
    const ms = match2[3] ? parseInt(match2[3].padEnd(3, '0').slice(0, 3), 10) : 0
    return minutes * 60 + seconds + ms / 1000
  }

  return parseFloat(ascii) || 0
}

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
export function formatTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

/**
 * Line-by-line state-machine parser for SRT subtitles.
 * Highly robust against irregular line endings, Arabic bidi marks, and spacing quirks.
 */
export function parseSRT(content: string): SubtitleCue[] {
  if (!content) return []

  // Strip BOM and normalize line endings
  const cleanContent = content
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  const lines = cleanContent.split('\n')
  const cues: SubtitleCue[] = []

  let currentStartTime = -1
  let currentEndTime = -1
  let currentTextLines: string[] = []
  let cueIdCounter = 1

  const commitCue = () => {
    if (currentStartTime >= 0 && currentEndTime >= 0 && currentTextLines.length > 0) {
      const rawText = currentTextLines.join('\n').trim()
      // Clean ASS overrides and font tags while preserving simple tags
      const text = rawText
        .replace(/<font[^>]*>/gi, '')
        .replace(/<\/font>/gi, '')
        .replace(/{\\an\d}/gi, '')
        .replace(/{\\[^}]+}/gi, '')
        .trim()

      if (text) {
        cues.push({
          id: `cue-${cueIdCounter++}`,
          startTime: currentStartTime,
          endTime: currentEndTime,
          text
        })
      }
    }
    currentStartTime = -1
    currentEndTime = -1
    currentTextLines = []
  }

  // Regex to detect timestamp lines, allowing any Unicode bidi marks and spaces
  const timeRegex = /([0-9٠-٩]+:[0-9٠-٩]+:[0-9٠-٩]+.*?)\s*-->\s*([0-9٠-٩]+:[0-9٠-٩]+:[0-9٠-٩]+.*)/

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim()

    // Strip invisible characters to test if line has content
    const cleanLine = rawLine
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF\u00A0]/g, '')
      .trim()

    if (!cleanLine) {
      if (currentTextLines.length > 0) {
        commitCue()
      }
      continue
    }

    const timeMatch = cleanLine.match(timeRegex)
    if (timeMatch) {
      // If a previous cue wasn't committed, commit it now
      if (currentStartTime >= 0) {
        commitCue()
      }
      currentStartTime = parseTimestamp(timeMatch[1])
      currentEndTime = parseTimestamp(timeMatch[2].split(' ')[0]) // ignore optional vtt cue settings
    } else if (currentStartTime >= 0) {
      // Collect subtitle text line
      currentTextLines.push(rawLine)
    }
  }

  commitCue()
  return cues.sort((a, b) => a.startTime - b.startTime)
}

/**
 * Parse WebVTT formatted content into normalized SubtitleCue[]
 */
export function parseVTT(content: string): SubtitleCue[] {
  // Remove WEBVTT header and comments
  const stripped = content.replace(/^WEBVTT[^\n]*\n+/i, '')
  return parseSRT(stripped)
}

/**
 * Generic subtitle parser detecting format from extension or content
 */
export function parseSubtitleContent(content: string, filename?: string): SubtitleCue[] {
  const ext = filename ? filename.split('.').pop()?.toLowerCase() : ''
  if (ext === 'vtt' || content.startsWith('WEBVTT')) {
    return parseVTT(content)
  }
  return parseSRT(content)
}

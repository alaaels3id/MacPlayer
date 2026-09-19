export interface SubtitleCue {
  id: string
  startTime: number // in seconds
  endTime: number // in seconds
  text: string
}

export type SubtitleSource = 'local' | 'adjacent' | 'provider' | 'embedded'

export interface SubtitleTrack {
  id: string
  title: string
  language: string
  languageCode: string
  source: SubtitleSource
  filePath?: string
  cues?: SubtitleCue[]
  delay: number // in seconds (e.g. +1.5 or -0.5)
}

export interface SubtitleSearchRequest {
  filename: string
  title: string
  year?: number
  season?: number
  episode?: number
  language?: string
}

export interface SubtitleSearchResult {
  id: string
  providerId: string
  title: string
  language: string
  languageCode: string
  releaseName: string
  matchScore: number // 0 - 100
  rating?: number
  downloadUrl?: string
  format: 'srt' | 'vtt' | 'ass'
}

export interface SubtitleStyle {
  fontFamily: string
  fontSize: number // px
  fontWeight?: 'normal' | 'bold' | '600' | '700'
  textColor: string
  backgroundColor: string
  backgroundOpacity: number // 0 - 100
  outlineColor: string
  outlineWidth: number // px
  bottomOffset: number // px
}

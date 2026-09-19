import { SubtitleStyle } from './subtitle'

export type AppTheme = 'system' | 'light' | 'dark'
export type AppLanguage = 'en' | 'ar'

export interface UserPreferences {
  theme: AppTheme
  language: AppLanguage
  defaultVolume: number // 0 - 1
  defaultPlaybackSpeed: number
  rememberLastPosition: boolean
  preferredLanguages: string[] // e.g. ['ar', 'en']
  autoSearchSubtitles: boolean
  autoDownloadSubtitles: boolean
  defaultSubtitleDelay: number
  subtitleStyle: SubtitleStyle
  openSubtitlesApiKey?: string
  downloadDirectory?: string
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  language: 'en',
  defaultVolume: 0.8,
  defaultPlaybackSpeed: 1.0,
  rememberLastPosition: true,
  preferredLanguages: ['ar', 'en'],
  autoSearchSubtitles: true,
  autoDownloadSubtitles: false,
  defaultSubtitleDelay: 0,
  subtitleStyle: {
    fontFamily: 'Arial, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
    fontSize: 28,
    fontWeight: 'bold',
    textColor: '#ffffff',
    backgroundColor: '#000000',
    backgroundOpacity: 20,
    outlineColor: '#000000',
    outlineWidth: 3,
    bottomOffset: 56
  }
}

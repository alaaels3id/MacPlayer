import { MediaMetadata, RecentVideo } from '../shared/types/media'
import { SubtitleSearchRequest, SubtitleSearchResult, SubtitleTrack } from '../shared/types/subtitle'
import { UserPreferences } from '../shared/types/settings'
import { ParsedMediaName } from '../shared/utils/filenameParser'

export interface MacPlayerAPI {
  openVideoDialog: () => Promise<{ filePath: string; metadata: MediaMetadata; parsed: ParsedMediaName } | null>
  probeFile: (filePath: string) => Promise<{ filePath: string; metadata: MediaMetadata; parsed: ParsedMediaName }>
  getRecents: () => Promise<RecentVideo[]>
  updatePosition: (filePath: string, position: number) => Promise<void>
  removeRecent: (filePath: string) => Promise<RecentVideo[]>
  clearRecents: () => Promise<RecentVideo[]>

  openSubtitleDialog: () => Promise<{ filePath: string; filename: string; content: string } | null>
  findAdjacentSubtitles: (videoFilePath: string) => Promise<SubtitleTrack[]>
  readSubtitleFile: (filePath: string) => Promise<{ filePath: string; filename: string; content: string }>
  searchSubtitles: (request: SubtitleSearchRequest) => Promise<SubtitleSearchResult[]>
  downloadSubtitle: (
    providerId: string,
    resultId: string,
    customDir?: string
  ) => Promise<{ filePath: string; filename: string; content: string }>

  getSettings: () => Promise<UserPreferences>
  saveSettings: (newPrefs: Partial<UserPreferences>) => Promise<UserPreferences>
  getInitialFile: () => Promise<string | null>
  onFileOpened: (callback: (filePath: string) => void) => () => void
  onMenuEvent: (channel: string, callback: (...args: any[]) => void) => () => void
  platform?: string
}

declare global {
  interface Window {
    macPlayer: MacPlayerAPI
  }
}

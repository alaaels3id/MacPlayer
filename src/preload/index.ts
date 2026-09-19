import { contextBridge, ipcRenderer } from 'electron'
import { MediaMetadata, RecentVideo } from '../shared/types/media'
import { SubtitleSearchRequest, SubtitleSearchResult, SubtitleTrack } from '../shared/types/subtitle'
import { UserPreferences } from '../shared/types/settings'
import { ParsedMediaName } from '../shared/utils/filenameParser'

const api = {
  // Media APIs
  openVideoDialog: (): Promise<{ filePath: string; metadata: MediaMetadata; parsed: ParsedMediaName } | null> =>
    ipcRenderer.invoke('media:openDialog'),

  probeFile: (filePath: string): Promise<{ filePath: string; metadata: MediaMetadata; parsed: ParsedMediaName }> =>
    ipcRenderer.invoke('media:probeFile', filePath),

  getRecents: (): Promise<RecentVideo[]> =>
    ipcRenderer.invoke('media:getRecents'),

  updatePosition: (filePath: string, position: number): Promise<void> =>
    ipcRenderer.invoke('media:updatePosition', filePath, position),

  removeRecent: (filePath: string): Promise<RecentVideo[]> =>
    ipcRenderer.invoke('media:removeRecent', filePath),

  clearRecents: (): Promise<RecentVideo[]> =>
    ipcRenderer.invoke('media:clearRecents'),

  // Subtitle APIs
  openSubtitleDialog: (): Promise<{ filePath: string; filename: string; content: string } | null> =>
    ipcRenderer.invoke('subtitle:openDialog'),

  findAdjacentSubtitles: (videoFilePath: string): Promise<SubtitleTrack[]> =>
    ipcRenderer.invoke('subtitle:findAdjacent', videoFilePath),

  readSubtitleFile: (filePath: string): Promise<{ filePath: string; filename: string; content: string }> =>
    ipcRenderer.invoke('subtitle:readFile', filePath),

  searchSubtitles: (request: SubtitleSearchRequest): Promise<SubtitleSearchResult[]> =>
    ipcRenderer.invoke('subtitle:search', request),

  downloadSubtitle: (
    providerId: string,
    resultId: string,
    customDir?: string
  ): Promise<{ filePath: string; filename: string; content: string }> =>
    ipcRenderer.invoke('subtitle:download', providerId, resultId, customDir),

  // Settings APIs
  getSettings: (): Promise<UserPreferences> =>
    ipcRenderer.invoke('settings:get'),

  saveSettings: (newPrefs: Partial<UserPreferences>): Promise<UserPreferences> =>
    ipcRenderer.invoke('settings:set', newPrefs),

  // File association / Open With APIs
  getInitialFile: (): Promise<string | null> =>
    ipcRenderer.invoke('app:getInitialFile'),

  onFileOpened: (callback: (filePath: string) => void) => {
    const subscription = (_event: any, filePath: string) => callback(filePath)
    ipcRenderer.on('app:openFile', subscription)
    return () => ipcRenderer.removeListener('app:openFile', subscription)
  },

  // Menu / Accelerator listener
  onMenuEvent: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      'menu:openVideo',
      'menu:addSubtitle',
      'menu:togglePlay',
      'menu:adjustDelay'
    ]
    if (validChannels.includes(channel)) {
      const subscription = (_event: any, ...args: any[]) => callback(...args)
      ipcRenderer.on(channel, subscription)
      return () => ipcRenderer.removeListener(channel, subscription)
    }
    return () => {}
  },

  // Operating system platform ('darwin' | 'win32' | 'linux')
  platform: process.platform
}

try {
  contextBridge.exposeInMainWorld('macPlayer', api)
} catch (error) {
  console.error('Failed to expose macPlayer in main world:', error)
}

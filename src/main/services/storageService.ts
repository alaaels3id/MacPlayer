import { app } from 'electron'
import * as fs from 'fs'
import path from 'path'
import { UserPreferences, DEFAULT_PREFERENCES } from '../../shared/types/settings'
import { RecentVideo } from '../../shared/types/media'

interface AppStorageData {
  preferences: UserPreferences
  recentVideos: RecentVideo[]
}

class StorageService {
  private configPath: string
  private data: AppStorageData

  constructor() {
    const userDataPath = app?.getPath ? app.getPath('userData') : process.cwd()
    this.configPath = path.join(userDataPath, 'macplayer-data.json')
    this.data = this.load()
  }

  private load(): AppStorageData {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf-8')
        const parsed = JSON.parse(raw)
        return {
          preferences: { ...DEFAULT_PREFERENCES, ...(parsed.preferences || {}) },
          recentVideos: parsed.recentVideos || []
        }
      }
    } catch (err) {
      console.warn('Failed to load storage data, using defaults:', err)
    }

    return {
      preferences: { ...DEFAULT_PREFERENCES },
      recentVideos: []
    }
  }

  private save(): void {
    try {
      const dir = path.dirname(this.configPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (err) {
      console.error('Failed to write storage data:', err)
    }
  }

  public getPreferences(): UserPreferences {
    return this.data.preferences
  }

  public setPreferences(newPrefs: Partial<UserPreferences>): UserPreferences {
    this.data.preferences = {
      ...this.data.preferences,
      ...newPrefs,
      subtitleStyle: {
        ...this.data.preferences.subtitleStyle,
        ...(newPrefs.subtitleStyle || {})
      }
    }
    this.save()
    return this.data.preferences
  }

  public getRecentVideos(): RecentVideo[] {
    return this.data.recentVideos
  }

  public addRecentVideo(video: RecentVideo): RecentVideo[] {
    // Deduplicate by filePath and keep max 20
    const filtered = this.data.recentVideos.filter((v) => v.filePath !== video.filePath)
    this.data.recentVideos = [video, ...filtered].slice(0, 20)
    this.save()
    return this.data.recentVideos
  }

  public updateRecentVideoPosition(filePath: string, lastPosition: number): void {
    const item = this.data.recentVideos.find((v) => v.filePath === filePath)
    if (item) {
      item.lastPosition = lastPosition
      item.lastPlayedAt = Date.now()
      this.save()
    }
  }

  public removeRecentVideo(filePath: string): RecentVideo[] {
    this.data.recentVideos = this.data.recentVideos.filter((v) => v.filePath !== filePath)
    this.save()
    return this.data.recentVideos
  }

  public clearRecentVideos(): RecentVideo[] {
    this.data.recentVideos = []
    this.save()
    return this.data.recentVideos
  }
}

export const storageService = new StorageService()

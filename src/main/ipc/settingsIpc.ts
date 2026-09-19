import { ipcMain } from 'electron'
import { storageService } from '../services/storageService'
import { UserPreferences } from '../../shared/types/settings'
import { ProviderManager } from '../providers/providerManager'

export function registerSettingsIpc(providerManager: ProviderManager): void {
  ipcMain.handle('settings:get', () => {
    return storageService.getPreferences()
  })

  ipcMain.handle('settings:set', (_, newPrefs: Partial<UserPreferences>) => {
    const updated = storageService.setPreferences(newPrefs)
    if (newPrefs.openSubtitlesApiKey !== undefined) {
      providerManager.updateOpenSubtitlesKey(newPrefs.openSubtitlesApiKey)
    }
    return updated
  })
}

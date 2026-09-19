import { ipcMain, dialog, app, BrowserWindow } from 'electron'
import path from 'path'
import { findAdjacentSubtitles, readSubtitleFile, saveSubtitleFile } from '../services/localSubtitleService'
import { ProviderManager } from '../providers/providerManager'
import { SubtitleSearchRequest } from '../../shared/types/subtitle'
import { storageService } from '../services/storageService'

export function registerSubtitleIpc(mainWindow: BrowserWindow, providerManager: ProviderManager): void {
  // Open Native Subtitle Picker
  ipcMain.handle('subtitle:openDialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Subtitle File',
      properties: ['openFile'],
      filters: [
        { name: 'Subtitle Files', extensions: ['srt', 'vtt', 'ass', 'ssa'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (canceled || filePaths.length === 0) {
      return null
    }

    const filePath = filePaths[0]
    const content = await readSubtitleFile(filePath)
    return {
      filePath,
      filename: path.basename(filePath),
      content
    }
  })

  // Find adjacent subtitles beside video file
  ipcMain.handle('subtitle:findAdjacent', async (_, videoFilePath: string) => {
    return await findAdjacentSubtitles(videoFilePath)
  })

  // Read subtitle content by file path (e.g. adjacent or drag & drop)
  ipcMain.handle('subtitle:readFile', async (_, filePath: string) => {
    const content = await readSubtitleFile(filePath)
    return {
      filePath,
      filename: path.basename(filePath),
      content
    }
  })

  // Search subtitles via Provider Manager
  ipcMain.handle('subtitle:search', async (_, request: SubtitleSearchRequest) => {
    return await providerManager.searchAll(request)
  })

  // Download subtitle from provider
  ipcMain.handle(
    'subtitle:download',
    async (_, providerId: string, resultId: string, customDir?: string) => {
      const prefs = storageService.getPreferences()
      const downloadDir =
        customDir ||
        prefs.downloadDirectory ||
        path.join(app.getPath('downloads'), 'MacPlayer', 'Subtitles')

      const { filePath, content } = await providerManager.downloadSubtitle(
        providerId,
        resultId,
        downloadDir
      )

      return {
        filePath,
        filename: path.basename(filePath),
        content
      }
    }
  )
}

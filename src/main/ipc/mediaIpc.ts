import { ipcMain, dialog, BrowserWindow } from 'electron'
import { probeMediaFile } from '../services/ffprobeService'
import { storageService } from '../services/storageService'
import { parseMediaFilename } from '../../shared/utils/filenameParser'
import path from 'path'

export function registerMediaIpc(mainWindow: BrowserWindow): void {
  // Open Native Video File Picker
  ipcMain.handle('media:openDialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Open Video File',
      properties: ['openFile'],
      filters: [
        {
          name: 'Video Files',
          extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'm4v', 'mpg', 'mpeg', 'ts', 'm2ts']
        },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (canceled || filePaths.length === 0) {
      return null
    }

    const filePath = filePaths[0]
    const metadata = await probeMediaFile(filePath)
    const parsed = parseMediaFilename(path.basename(filePath))

    // Record in Recents
    storageService.addRecentVideo({
      id: Buffer.from(filePath).toString('base64'),
      filePath,
      filename: path.basename(filePath),
      title: parsed.cleanTitle,
      duration: metadata.duration,
      lastPosition: 0,
      lastPlayedAt: Date.now(),
      fileSize: metadata.fileSize
    })

    return { filePath, metadata, parsed }
  })

  // Probe a specific file path directly (e.g. from drag & drop or recents)
  ipcMain.handle('media:probeFile', async (_, filePath: string) => {
    const metadata = await probeMediaFile(filePath)
    const parsed = parseMediaFilename(path.basename(filePath))

    storageService.addRecentVideo({
      id: Buffer.from(filePath).toString('base64'),
      filePath,
      filename: path.basename(filePath),
      title: parsed.cleanTitle,
      duration: metadata.duration,
      lastPosition: 0,
      lastPlayedAt: Date.now(),
      fileSize: metadata.fileSize
    })

    return { filePath, metadata, parsed }
  })

  // Recents management
  ipcMain.handle('media:getRecents', () => {
    return storageService.getRecentVideos()
  })

  ipcMain.handle('media:updatePosition', (_, filePath: string, position: number) => {
    storageService.updateRecentVideoPosition(filePath, position)
  })

  ipcMain.handle('media:removeRecent', (_, filePath: string) => {
    return storageService.removeRecentVideo(filePath)
  })

  ipcMain.handle('media:clearRecents', () => {
    return storageService.clearRecentVideos()
  })
}

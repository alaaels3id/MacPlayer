import { app, BrowserWindow, Menu, MenuItemConstructorOptions, ipcMain } from 'electron'
import path from 'path'
import * as fs from 'fs'
import { createMainWindow } from './windows/mainWindow'
import { registerMediaIpc } from './ipc/mediaIpc'
import { registerSubtitleIpc } from './ipc/subtitleIpc'
import { registerSettingsIpc } from './ipc/settingsIpc'
import { ProviderManager } from './providers/providerManager'
import { storageService } from './services/storageService'

let mainWindow: BrowserWindow | null = null
let providerManager: ProviderManager
let pendingFileToOpen: string | null = null

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.m4v', '.webm', '.ts']

function isVideoFile(filePath: string): boolean {
  if (!filePath) return false
  const ext = path.extname(filePath).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext)
}

function dispatchFileToOpen(filePath: string): void {
  if (!isVideoFile(filePath)) return

  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents && !mainWindow.webContents.isLoading()) {
    mainWindow.webContents.send('app:openFile', filePath)
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  } else {
    pendingFileToOpen = filePath
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    const potentialFile = commandLine.slice(1).find((arg) => !arg.startsWith('--') && isVideoFile(arg))
    if (potentialFile) {
      dispatchFileToOpen(path.resolve(potentialFile))
    }
  })

  // macOS 'open-file' event (Finder "Open With", double-clicking associated file, or drag-and-drop to Dock icon)
  app.on('open-file', (event, filePath) => {
    event.preventDefault()
    dispatchFileToOpen(filePath)
  })
}

function buildNativeMenu(): void {
  const isMac = process.platform === 'darwin'
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Video...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu:openVideo')
          }
        },
        {
          label: 'Add Subtitle...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('menu:addSubtitle')
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' as const } : { role: 'quit' as const }
      ]
    },
    {
      label: 'Playback',
      submenu: [
        {
          label: 'Play / Pause',
          accelerator: 'Space',
          click: () => {
            mainWindow?.webContents.send('menu:togglePlay')
          }
        },
        {
          label: 'Increase Subtitle Delay (+0.5s)',
          accelerator: 'H',
          click: () => {
            mainWindow?.webContents.send('menu:adjustDelay', 0.5)
          }
        },
        {
          label: 'Decrease Subtitle Delay (-0.5s)',
          accelerator: 'G',
          click: () => {
            mainWindow?.webContents.send('menu:adjustDelay', -0.5)
          }
        },
        { type: 'separator' },
        { role: 'togglefullscreen' as const }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'zoom' as const },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const },
              { type: 'separator' as const },
              { role: 'window' as const }
            ]
          : [])
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  // Check CLI arguments for video file passed directly on launch
  const potentialFile = process.argv.slice(1).find((arg) => !arg.startsWith('--') && isVideoFile(arg))
  if (potentialFile && !pendingFileToOpen) {
    pendingFileToOpen = path.resolve(potentialFile)
  }

  // Allow renderer to query any initial file queued at startup
  ipcMain.handle('app:getInitialFile', () => {
    const file = pendingFileToOpen
    pendingFileToOpen = null
    return file
  })

  // Set macOS Dock Icon
  if (process.platform === 'darwin' && app.dock) {
    const dockIconPath = path.join(app.getAppPath(), 'resources/icon-dock.png')
    const iconPath = path.join(app.getAppPath(), 'resources/icon.png')
    if (fs.existsSync(dockIconPath)) {
      app.dock.setIcon(dockIconPath)
    } else if (fs.existsSync(iconPath)) {
      app.dock.setIcon(iconPath)
    }
  }

  // Initialize provider manager with saved api key if available
  const prefs = storageService.getPreferences()
  providerManager = new ProviderManager(prefs.openSubtitlesApiKey)

  mainWindow = createMainWindow()

  // Register IPC channels
  registerMediaIpc(mainWindow)
  registerSubtitleIpc(mainWindow, providerManager)
  registerSettingsIpc(providerManager)

  buildNativeMenu()

  mainWindow.webContents.on('did-finish-load', () => {
    if (pendingFileToOpen) {
      mainWindow?.webContents.send('app:openFile', pendingFileToOpen)
      pendingFileToOpen = null
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

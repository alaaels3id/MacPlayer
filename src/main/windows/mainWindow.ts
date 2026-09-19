import { BrowserWindow, shell, app } from 'electron'
import { join } from 'path'

export function createMainWindow(): BrowserWindow {
  const isMac = process.platform === 'darwin'
  const isWin = process.platform === 'win32'

  const mainWindow = new BrowserWindow({
    width: 1140,
    height: 740,
    minWidth: 860,
    minHeight: 540,
    show: false,
    autoHideMenuBar: true,
    ...(isMac
      ? {
          titleBarStyle: 'hiddenInset',
          trafficLightPosition: { x: 16, y: 16 },
          vibrancy: 'under-window',
          visualEffectState: 'active'
        }
      : {
          titleBarStyle: 'hidden',
          titleBarOverlay: {
            color: '#0c0d0f',
            symbolColor: '#ffffff',
            height: 44
          }
        }),
    icon: join(app.getAppPath(), isWin ? 'resources/icon.ico' : 'resources/icon.png'),
    backgroundColor: '#0c0d0f',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // allow loading local file:// video/subtitle URLs smoothly
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the remote URL for development or the local html file for production.
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

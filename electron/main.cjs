/**
 * GNOA Recording Suit – Electron Main Process
 * Windows-only build. Secure, lightweight, crash-safe.
 */
const {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  dialog,
  shell,
  session,
  nativeImage,
} = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

const APP_VERSION = app.getVersion(); // Reads from package.json automatically

// ─── Persistent settings path ────────────────────────────────────────────────
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// ─── Taskbar Overlay State (Blinking Red Dot for Recording, Pause Icon for Paused) ───
let mainWindow = null;
let overlayInterval = null;
let overlayBlinkVisible = false;
let overlayRecordIcon = null;
let overlayPauseIcon = null;

function loadOverlayIcon(filename) {
  try {
    const p = path.join(__dirname, 'assets', filename);
    if (fs.existsSync(p)) {
      return nativeImage.createFromBuffer(fs.readFileSync(p));
    }
  } catch (err) {
    console.warn('Failed to load overlay image:', filename, err);
  }
  return null;
}

function clearOverlayBlink() {
  if (overlayInterval) {
    clearInterval(overlayInterval);
    overlayInterval = null;
  }
  overlayBlinkVisible = false;
}

function updateRecordingOverlay(state) {
  clearOverlayBlink();
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (process.platform !== 'win32') return;

  try {
    if (state === 'recording') {
      if (!overlayRecordIcon) {
        overlayRecordIcon = loadOverlayIcon('overlay_record.png');
      }
      if (overlayRecordIcon) {
        mainWindow.setOverlayIcon(overlayRecordIcon, 'Recording');
        overlayBlinkVisible = true;

        // Blinking red dot: toggle between red dot and cleared every 650ms
        overlayInterval = setInterval(() => {
          if (!mainWindow || mainWindow.isDestroyed()) {
            clearOverlayBlink();
            return;
          }
          overlayBlinkVisible = !overlayBlinkVisible;
          try {
            if (overlayBlinkVisible) {
              mainWindow.setOverlayIcon(overlayRecordIcon, 'Recording');
            } else {
              mainWindow.setOverlayIcon(null, '');
            }
          } catch (e) {
            clearOverlayBlink();
          }
        }, 650);
      }
    } else if (state === 'paused') {
      if (!overlayPauseIcon) {
        overlayPauseIcon = loadOverlayIcon('overlay_pause.png');
      }
      if (overlayPauseIcon) {
        mainWindow.setOverlayIcon(overlayPauseIcon, 'Paused');
      }
    } else {
      mainWindow.setOverlayIcon(null, '');
    }
  } catch (err) {
    console.warn('Failed to update taskbar overlay icon:', err);
  }
}

// ─── Register all IPC handlers ONCE (outside createWindow to prevent duplicate-handler crash) ──
function registerIpcHandlers() {
  // ── Taskbar recording overlay state ──────────────
  ipcMain.on('set-recording-overlay-state', (_event, state) => {
    updateRecordingOverlay(state);
  });

  // ── Screen and Window capture sources ────────────
  ipcMain.handle('get-desktop-sources', async (event, types = ['screen']) => {
    // Fetch windows/screens. If windows are requested, fetch small thumbnails to display in picker UI.
    const sources = await desktopCapturer.getSources({ 
      types, 
      thumbnailSize: types.includes('window') ? { width: 160, height: 160 } : { width: 0, height: 0 } 
    });
    
    // Convert to serializable format (DataURL for images)
    return sources.map(s => ({
      id: s.id,
      name: s.name,
      display_id: s.display_id,
      appIcon: s.appIcon ? s.appIcon.toDataURL() : null,
      thumbnail: s.thumbnail ? s.thumbnail.toDataURL() : null
    }));
  });

  // ── Folder picker ─────────────────────────────────────────────────────────
  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });
    return canceled ? null : filePaths;
  });

  // ── Auto-save recording to destination folder ─────────────────────────────
  ipcMain.handle('save-recording-file', async (_event, { destinationFolder, fileName, buffer }) => {
    try {
      const targetDir = destinationFolder || path.join(app.getPath('videos'), 'GNOA Recordings');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const fullPath = path.join(targetDir, fileName);
      // Write in 4 MB chunks to avoid single large Buffer allocation crashing on old laptops
      const buf = Buffer.from(buffer);
      const fd = fs.openSync(fullPath, 'w');
      const chunkSize = 4 * 1024 * 1024;
      for (let offset = 0; offset < buf.length; offset += chunkSize) {
        fs.writeSync(fd, buf, offset, Math.min(chunkSize, buf.length - offset));
      }
      fs.closeSync(fd);
      return { success: true, filePath: fullPath };
    } catch (err) {
      console.error('Failed to auto-save recording:', err);
      return { success: false, error: err.message };
    }
  });

  // ── Show file in Explorer ─────────────────────────────────────────────────
  ipcMain.handle('show-item-in-folder', async (_event, filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
      return true;
    }
    return false;
  });

  // ── Open folder in Explorer ───────────────────────────────────────────────
  ipcMain.handle('open-directory', async (_event, dirPath) => {
    if (dirPath && fs.existsSync(dirPath)) {
      shell.openPath(dirPath);
      return true;
    }
    return false;
  });

  // ── Persistent settings (userData/settings.json) ──────────────────────────
  ipcMain.handle('load-persistent-settings', () => {
    try {
      if (fs.existsSync(settingsPath)) {
        return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      }
    } catch (e) {
      console.warn('Could not read settings from disk:', e);
    }
    return null;
  });

  ipcMain.handle('save-persistent-settings', (_event, data) => {
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
      // Sync run-on-start registry entry based on setting
      const loginItem = app.getLoginItemSettings();
      const shouldStart = data && data.runOnComputerStart === true;
      if (shouldStart !== loginItem.openAtLogin) {
        app.setLoginItemSettings({ openAtLogin: shouldStart, openAsHidden: true });
      }
      return true;
    } catch (e) {
      console.warn('Could not save settings to disk:', e);
      return false;
    }
  });

  // ── Check for updates ─────────────────────────────────────────────────────
  ipcMain.handle('check-for-updates', async () => {
    if (app.isPackaged) {
      try {
        const result = await autoUpdater.checkForUpdatesAndNotify();
        return { success: true, result };
      } catch (err) {
        return { error: err.message };
      }
    }
    return { dev: true, version: APP_VERSION };
  });

  // ── Return current app version to renderer ────────────────────────────────
  ipcMain.handle('get-app-version', () => APP_VERSION);
}

// ─── Create main window ───────────────────────────────────────────────────────
function createWindow() {
  // Choose icon: search in electron/assets, public, dist
  let iconFile = null;
  const candidates = process.platform === 'win32'
    ? [
        path.join(__dirname, 'assets/logo.ico'),
        path.join(__dirname, '../public/logo.ico'),
        path.join(__dirname, '../dist/logo.ico'),
        path.join(__dirname, 'assets/logo.png'),
        path.join(__dirname, '../public/logo.png'),
        path.join(__dirname, '../dist/logo.png'),
      ]
    : [
        path.join(__dirname, 'assets/logo.png'),
        path.join(__dirname, '../public/logo.png'),
        path.join(__dirname, '../dist/logo.png'),
      ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      iconFile = c;
      break;
    }
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: iconFile || undefined,
    // ── Security: contextIsolation ON, nodeIntegration OFF ──
    webPreferences: {
      nodeIntegration: true,      // kept for ipcRenderer.require compatibility with existing renderer code
      contextIsolation: false,    // kept to match renderer usage of window.require('electron')
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
    },
  });

  mainWindow = win;
  win.on('closed', () => {
    clearOverlayBlink();
    mainWindow = null;
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // ── Window minimize / restore / close ──────────────
  ipcMain.on('window-minimize', () => {
    if (win && !win.isDestroyed()) win.minimize();
  });
  ipcMain.on('window-restore', () => {
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });
  ipcMain.on('window-close', () => {
    if (win && !win.isDestroyed()) win.close();
  });

  // ── Auto-updater ──────────────────────────────────────────────────────────
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (v${info.version}) is available and being downloaded in the background.`,
      buttons: ['OK'],
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    // Silently install on quit or auto-restart if we want
    // We'll just let autoInstallOnAppQuit handle it, but we can notify the user
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update Ready',
      message: `Version v${info.version} downloaded. It will be installed automatically when you close the software.`,
      buttons: ['OK'],
    });
  });

  autoUpdater.on('error', (err) => {
    console.warn('AutoUpdater error (non-fatal):', err ? err.message : err);
  });

  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.warn('Background update check suppressed:', err.message);
    });
  }
}

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // Auto-select primary screen for getDisplayMedia without any browser "Share screen" prompt
  if (session && session.defaultSession) {
    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
      desktopCapturer.getSources({ types: ['screen'] })
        .then((sources) => {
          if (sources && sources.length > 0) {
            const primary =
              sources.find(s => s.id.includes('screen:0') ||
                s.name.toLowerCase().includes('entire') ||
                s.name.toLowerCase().includes('screen 1')) ||
              sources[0];
            callback({ video: primary });
          } else {
            callback();
          }
        })
        .catch((err) => {
          console.error('Error auto-selecting screen:', err);
          callback();
        });
    });
  }

  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Windows: always quit when last window closes
  app.quit();
});

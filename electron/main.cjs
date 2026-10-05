const { app, BrowserWindow, systemPreferences, desktopCapturer, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const { autoUpdater } = require('electron-updater');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle screen recording permissions and sources
  ipcMain.handle('get-desktop-sources', async () => {
    return await desktopCapturer.getSources({ types: ['window', 'screen'] });
  });

  // Handle native folder selection
  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    if (canceled) {
      return null;
    } else {
      return filePaths;
    }
  });

  // Window minimize and restore for auto-minimize during recording
  ipcMain.on('window-minimize', () => {
    win.minimize();
  });

  ipcMain.on('window-restore', () => {
    if (win.isMinimized()) {
      win.restore();
    }
    win.show();
    win.focus();
  });

  // Save recording file directly to chosen destination folder
  ipcMain.handle('save-recording-file', async (event, { destinationFolder, fileName, buffer }) => {
    try {
      const targetDir = destinationFolder || path.join(app.getPath('videos'), 'GNOA Recordings');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const fullPath = path.join(targetDir, fileName);
      fs.writeFileSync(fullPath, Buffer.from(buffer));
      return { success: true, filePath: fullPath };
    } catch (err) {
      console.error('Failed to auto-save recording:', err);
      return { success: false, error: err.message };
    }
  });

  // Show item in Windows Explorer folder
  ipcMain.handle('show-item-in-folder', async (event, filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
      return true;
    }
    return false;
  });

  // Open directory in Windows Explorer
  ipcMain.handle('open-directory', async (event, dirPath) => {
    if (dirPath && fs.existsSync(dirPath)) {
      shell.openPath(dirPath);
      return true;
    }
    return false;
  });

  // Persistent settings storage in userData
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  ipcMain.handle('load-persistent-settings', () => {
    try {
      if (fs.existsSync(settingsPath)) {
        const raw = fs.readFileSync(settingsPath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read settings from disk:', e);
    }
    return null;
  });

  ipcMain.handle('save-persistent-settings', (event, data) => {
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.warn('Could not save settings to disk:', e);
      return false;
    }
  });

  // Handle application update checking
  ipcMain.handle('check-for-updates', async () => {
    if (app.isPackaged) {
      try {
        const updateCheckResult = await autoUpdater.checkForUpdatesAndNotify();
        return { success: true, result: updateCheckResult };
      } catch (err) {
        return { error: err.message };
      }
    } else {
      return { dev: true, message: 'Running in development mode.' };
    }
  });

  // Auto-updater event notifications for user
  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (v${info.version}) is available. It is being downloaded automatically in the background.`,
      buttons: ['OK']
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Update Ready to Install',
      message: `Version v${info.version} has been downloaded. Restart Recording Software now to apply the update?`,
      buttons: ['Restart and Install', 'Later']
    }).then((choice) => {
      if (choice.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('No update available:', info ? info.version : 'current is latest');
  });

  autoUpdater.on('error', (err) => {
    console.warn('AutoUpdater warning:', err ? err.message : err);
  });

  // Check for updates automatically in the background on startup (packaged build only)
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.warn('Initial update check suppressed:', err.message);
    });
  }
}

// Request necessary permissions
async function requestPermissions() {
    try {
        if (process.platform === 'darwin') {
            await systemPreferences.askForMediaAccess('microphone');
            await systemPreferences.askForMediaAccess('camera');
        }
    } catch (error) {
        console.error('Permission request failed:', error);
    }
}

app.whenReady().then(async () => {
  await requestPermissions();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

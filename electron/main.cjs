const { app, BrowserWindow, systemPreferences, desktopCapturer, ipcMain, dialog } = require('electron');
const path = require('path');

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

  // Check for updates automatically in the background on startup (packaged build only)
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
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

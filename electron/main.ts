
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import Store from 'electron-store';
import process from 'process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const store = new Store();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    backgroundColor: '#0f0f0f',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.removeMenu();
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('maximized-state-changed', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('maximized-state-changed', false);
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.handle('electron-store-get', async (event, key) => {
    return store.get(key);
  });
  ipcMain.handle('electron-store-set', async (event, key, val) => {
    store.set(key, val);
  });
  
  ipcMain.handle('open-external-link', async (event, url) => {
      if (url && (url.startsWith('http:') || url.startsWith('https:'))) {
          await shell.openExternal(url);
      }
  });
  
  ipcMain.on('minimize-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.minimize();
  });

  ipcMain.on('maximize-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.close();
  });

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
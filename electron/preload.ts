
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getStore: (key: string) => ipcRenderer.invoke('electron-store-get', key),
  setStore: (key: string, val: any) => ipcRenderer.invoke('electron-store-set', key, val),

  openExternalLink: (url: string) => ipcRenderer.invoke('open-external-link', url),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  onMaximizedStateChanged: (callback: (isMaximized: boolean) => void) =>
    ipcRenderer.on('maximized-state-changed', (_event, isMaximized) => callback(isMaximized)),
  removeMaximizedStateListener: () => ipcRenderer.removeAllListeners('maximized-state-changed'),
});
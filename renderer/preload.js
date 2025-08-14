const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Servidor
  getServerUrl: () => ipcRenderer.invoke('get-server-url'),
  
  // Archivos
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  
  // Diálogos
  showMessage: (options) => ipcRenderer.invoke('show-message', options),
  
  // Almacenamiento
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  
  // Eventos del servidor
  onServerReady: (callback) => ipcRenderer.on('server-ready', callback),
  onNewSession: (callback) => ipcRenderer.on('new-session', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onServerStatus: (callback) => ipcRenderer.on('server-status', callback),
  
  // Remover listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Configuración global para la aplicación
contextBridge.exposeInMainWorld('appConfig', {
  isElectron: true,
  version: '3.0.0',
  platform: process.platform
});

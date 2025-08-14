// Configuración para la aplicación Electron
const config = {
  // Configuración del servidor
  server: {
    port: 3000,
    baseUrl: 'http://127.0.0.1:3000',
    timeout: 30000
  },

  // Configuración de la aplicación
  app: {
    name: 'WhatsApp Bimcat',
    version: '3.0.0',
    isElectron: true
  },

  // Configuración de WhatsApp
  whatsapp: {
    webUrl: 'https://web.whatsapp.com',
    qrTimeout: 60000,
    sessionTimeout: 300000
  },

  // Configuración de archivos
  files: {
    allowedTypes: ['.xlsx', '.xls', '.csv'],
    maxSize: 10 * 1024 * 1024, // 10MB
    uploadPath: 'uploads/'
  },

  // Configuración de mensajes
  messages: {
    defaultDelay: 10000, // 10 segundos
    maxRetries: 3,
    batchSize: 50
  },

  // Configuración de UI
  ui: {
    theme: 'light',
    language: 'es',
    autoSave: true
  },

  // Configuración de desarrollo
  development: {
    debug: false,
    logLevel: 'info'
  }
};

// Función para obtener la URL del servidor
async function getServerUrl() {
  if (window.electronAPI) {
    try {
      return await window.electronAPI.getServerUrl();
    } catch (error) {
      console.error('Error al obtener URL del servidor:', error);
      return config.server.baseUrl;
    }
  }
  return config.server.baseUrl;
}

// Función para obtener configuración del almacenamiento
async function getStoredConfig(key) {
  if (window.electronAPI) {
    try {
      return await window.electronAPI.getStoreValue(key);
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      return null;
    }
  }
  return null;
}

// Función para guardar configuración
async function setStoredConfig(key, value) {
  if (window.electronAPI) {
    try {
      await window.electronAPI.setStoreValue(key, value);
      return true;
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      return false;
    }
  }
  return false;
}

// Exportar configuración y funciones
window.appConfig = {
  ...config,
  getServerUrl,
  getStoredConfig,
  setStoredConfig
};


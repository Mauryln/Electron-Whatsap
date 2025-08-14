// Inicialización específica para Electron
class ElectronApp {
  constructor() {
    this.serverUrl = null;
    this.isServerReady = false;
    this.init();
  }

  async init() {
    console.log('Inicializando aplicación Electron...');
    
    // Configurar listeners de Electron
    this.setupElectronListeners();
    
    // Esperar a que el servidor esté listo
    await this.waitForServer();
    
    // Inicializar la aplicación
    this.initializeApp();
  }

  setupElectronListeners() {
    if (!window.electronAPI) {
      console.warn('APIs de Electron no disponibles');
      return;
    }

    // Escuchar cuando el servidor esté listo
    window.electronAPI.onServerReady((event, data) => {
      console.log('Servidor listo:', data);
      this.serverUrl = data.url;
      window.API_URL = data.url;
      this.isServerReady = true;
      this.onServerReady();
    });

    // Configurar reintentos si el servidor no está listo después de un tiempo
    setTimeout(() => {
      if (!this.isServerReady) {
        console.log('Servidor no está listo después de 10 segundos, intentando conexión directa...');
        this.retryServerConnection();
      }
    }, 10000);

    // Configurar listeners del menú
    this.setupMenuListeners();
  }

  async retryServerConnection() {
    try {
      const response = await fetch('http://127.0.0.1:3000/health');
      if (response.ok) {
        console.log('Conexión directa exitosa');
        this.serverUrl = 'http://127.0.0.1:3000';
        window.API_URL = 'http://127.0.0.1:3000';
        this.isServerReady = true;
        this.onServerReady();
      }
    } catch (error) {
      console.log('Conexión directa fallida:', error.message);
    }
  }

  // Escuchar eventos del menú
  setupMenuListeners() {
    if (!window.electronAPI) return;
    
    window.electronAPI.onNewSession(() => {
      this.handleNewSession();
    });

    window.electronAPI.onOpenSettings(() => {
      this.handleOpenSettings();
    });

    window.electronAPI.onServerStatus(() => {
      this.handleServerStatus();
    });
  }

  async waitForServer() {
    // Intentar obtener la URL del servidor
    try {
      this.serverUrl = await window.electronAPI.getServerUrl();
      window.API_URL = this.serverUrl;
      console.log('URL del servidor obtenida:', this.serverUrl);
    } catch (error) {
      console.error('Error al obtener URL del servidor:', error);
      this.serverUrl = 'http://127.0.0.1:3000';
      window.API_URL = 'http://127.0.0.1:3000';
    }

    // Esperar a que el servidor esté disponible
    let attempts = 0;
    const maxAttempts = 60; // 60 segundos (aumentado)

    console.log('Esperando a que el servidor esté disponible...');

    while (attempts < maxAttempts) {
      try {
        console.log(`Intento ${attempts + 1}/${maxAttempts}: Verificando servidor en ${this.serverUrl}/health`);
        
        const response = await fetch(`${this.serverUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          // Agregar timeout para evitar esperas muy largas
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const healthData = await response.json();
          console.log('Servidor está listo:', healthData);
          this.isServerReady = true;
          break;
        } else {
          console.log(`Servidor respondió con status: ${response.status}`);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log(`Intento ${attempts + 1}/${maxAttempts}: Timeout - Servidor no responde`);
        } else {
          console.log(`Intento ${attempts + 1}/${maxAttempts}: Error de conexión - ${error.message}`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!this.isServerReady) {
      console.error('No se pudo conectar al servidor después de 60 segundos');
      this.showServerError();
    }
  }

  onServerReady() {
    // Actualizar la interfaz para mostrar que el servidor está listo
    const statusIndicator = document.getElementById('session-status-indicator');
    const statusText = document.getElementById('session-status-text');
    
    if (statusIndicator && statusText) {
      statusIndicator.classList.add('connected');
      statusText.textContent = 'Servidor conectado';
    }

    // Habilitar botones que requieren el servidor
    this.enableServerDependentFeatures();
  }

  enableServerDependentFeatures() {
    // Habilitar selectores de etiquetas
    const labelSelectors = document.querySelectorAll('#labelSelector, #report-label-selector');
    labelSelectors.forEach(selector => {
      selector.disabled = false;
      selector.innerHTML = '<option value="">Seleccionar etiqueta...</option>';
    });

    // Cargar etiquetas disponibles
    this.loadLabels();
  }

  async loadLabels() {
    try {
      const response = await fetch(`${this.serverUrl}/labels`);
      if (response.ok) {
        const labels = await response.json();
        this.populateLabelSelectors(labels);
      }
    } catch (error) {
      console.error('Error al cargar etiquetas:', error);
    }
  }

  populateLabelSelectors(labels) {
    const selectors = document.querySelectorAll('#labelSelector, #report-label-selector');
    
    selectors.forEach(selector => {
      selector.innerHTML = '<option value="">Seleccionar etiqueta...</option>';
      
      labels.forEach(label => {
        const option = document.createElement('option');
        option.value = label.id;
        option.textContent = label.name;
        selector.appendChild(option);
      });
    });
  }

  handleNewSession() {
    // Limpiar sesión actual
    this.clearSession();
    
    // Mostrar modal de QR
    this.showQRModal();
  }

  handleOpenSettings() {
    // Mostrar configuración de la aplicación
    this.showSettings();
  }

  handleServerStatus() {
    // Mostrar estado del servidor
    this.showServerStatus();
  }

  clearSession() {
    // Limpiar datos de sesión
    localStorage.removeItem('whatsapp-session');
    
    // Actualizar interfaz
    const statusIndicator = document.getElementById('session-status-indicator');
    const statusText = document.getElementById('session-status-text');
    
    if (statusIndicator && statusText) {
      statusIndicator.classList.remove('connected');
      statusText.textContent = 'No conectado';
    }
  }

  showQRModal() {
    const qrModal = document.getElementById('qr-modal');
    if (qrModal) {
      qrModal.style.display = 'block';
      this.generateQR();
    }
  }

  async generateQR() {
    try {
      const response = await fetch(`${this.serverUrl}/get-qr`);
      if (response.ok) {
        const qrData = await response.json();
        this.displayQR(qrData.qr);
      }
    } catch (error) {
      console.error('Error al generar QR:', error);
    }
  }

  displayQR(qrCode) {
    const qrContainer = document.getElementById('qr-container');
    if (qrContainer) {
      qrContainer.innerHTML = `<img src="${qrCode}" alt="QR Code" />`;
    }
  }

  showSettings() {
    // Implementar configuración de la aplicación
    console.log('Mostrando configuración...');
  }

  showServerStatus() {
    // Mostrar estado del servidor
    const status = this.isServerReady ? 'Conectado' : 'Desconectado';
    console.log(`Estado del servidor: ${status}`);
  }

  showServerError() {
    // Mostrar error de conexión al servidor
    if (window.electronAPI) {
      window.electronAPI.showMessage({
        type: 'error',
        title: 'Error de Conexión al Servidor',
        message: 'No se pudo conectar al servidor interno después de 60 segundos.',
        detail: 'Posibles soluciones:\n\n1. Verificar que no haya otra aplicación usando el puerto 3000\n2. Reiniciar la aplicación\n3. Verificar que el firewall no esté bloqueando la conexión\n4. Revisar los logs de la aplicación para más detalles'
      });
    } else {
      // Fallback si no hay APIs de Electron disponibles
      alert('Error: No se pudo conectar al servidor interno. Por favor, reinicia la aplicación.');
    }
    
    // Actualizar la interfaz para mostrar el error
    const statusIndicator = document.getElementById('session-status-indicator');
    const statusText = document.getElementById('session-status-text');
    
    if (statusIndicator && statusText) {
      statusIndicator.classList.remove('connected');
      statusIndicator.classList.add('error');
      statusText.textContent = 'Error de conexión';
    }
  }

  initializeApp() {
    console.log('Aplicación Electron inicializada');
    
    // Cargar configuración guardada
    this.loadSavedConfig();
    
    // Configurar tema
    this.setupTheme();
    
    // Configurar eventos de la interfaz
    this.setupUIEvents();
  }

  async loadSavedConfig() {
    if (window.electronAPI) {
      try {
        const theme = await window.electronAPI.getStoreValue('theme');
        if (theme) {
          // El tema se maneja en animations.js para evitar duplicación
          console.log('Tema cargado desde configuración:', theme);
        }
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    }
  }

  setupTheme() {
    // El manejo del tema se hace en animations.js para evitar conflictos
    console.log('Manejo del tema delegado a animations.js');
  }

  setupUIEvents() {
    // Configurar eventos de la interfaz existente
    // Estos eventos ya están configurados en los otros archivos JS
    console.log('Eventos de UI configurados');
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.electronApp = new ElectronApp();
});
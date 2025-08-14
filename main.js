const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const isDev = process.argv.includes('--dev');
const Store = require('electron-store');

// Configuración de almacenamiento
const store = new Store();

// Mantener referencia global del objeto de ventana
let mainWindow;
let serverProcess = null;

// Configuración del servidor
const SERVER_PORT = 3000;
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`;

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false,
    autoHideMenuBar: true
  });

  // Cargar la interfaz principal
  mainWindow.loadFile('renderer/index.html');

  // Mostrar la ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Iniciar el servidor después de que la ventana esté lista
    setTimeout(() => {
      startServer();
    }, 1000);
  });

  // Manejar el cierre de la ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Abrir enlaces externos en el navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Crear menú de la aplicación
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nueva Sesión',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-session');
          }
        },
        {
          label: 'Abrir WhatsApp Web',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            shell.openExternal('https://web.whatsapp.com');
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Configuración',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        {
          label: 'Estado del Servidor',
          click: () => {
            mainWindow.webContents.send('server-status');
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de WhatsApp Bimcat',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de WhatsApp Bimcat',
              message: 'WhatsApp Bimcat v3.0.0',
              detail: 'Aplicación de automatización para WhatsApp\nDesarrollado por Bimcat Team'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function startServer() {
  try {
    console.log('🚀 Iniciando servidor desde Electron...');
    
    // Usar un enfoque más robusto para iniciar el servidor
    const { spawn } = require('child_process');
    const path = require('path');
    
    // Crear un proceso separado para el servidor
    const serverProcess = spawn('node', ['server/index.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });
    
    console.log('📡 Proceso del servidor iniciado con PID:', serverProcess.pid);
    
    // Capturar logs del servidor
    serverProcess.stdout.on('data', (data) => {
      console.log('📤 Servidor stdout:', data.toString().trim());
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.log('⚠️  Servidor stderr:', data.toString().trim());
    });
    
    // Manejar el cierre del proceso del servidor
    serverProcess.on('close', (code) => {
      console.log('🔴 Proceso del servidor cerrado con código:', code);
    });
    
    serverProcess.on('error', (error) => {
      console.error('❌ Error en el proceso del servidor:', error);
      dialog.showErrorBox('Error del Servidor', 'Error al iniciar el proceso del servidor: ' + error.message);
    });
    
    // Esperar a que el servidor se inicialice
    setTimeout(() => {
      console.log('🔍 Verificando que el servidor esté listo...');
      
             // Verificar que el servidor esté funcionando
       const http = require('http');
       const req = http.request({
         hostname: '127.0.0.1', // Usar 127.0.0.1 para conexión explícita
         port: SERVER_PORT,
         path: '/health',
         method: 'GET',
         timeout: 10000
       }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('✅ Servidor está funcionando correctamente');
            console.log('   Status:', response.status);
            console.log('   Uptime:', response.uptime, 'segundos');
            
            // Notificar al renderer que el servidor está listo
            if (mainWindow) {
              mainWindow.webContents.send('server-ready', { port: SERVER_PORT, url: SERVER_URL });
            }
          } catch (error) {
            console.error('❌ Error al parsear respuesta del servidor:', error);
            dialog.showErrorBox('Error del Servidor', 'El servidor respondió pero con un formato inesperado');
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Error al verificar servidor:', error.message);
        
                 // Intentar una vez más después de un delay
         setTimeout(() => {
           console.log('🔄 Reintentando conexión al servidor...');
           const retryReq = http.request({
             hostname: '127.0.0.1', // Usar 127.0.0.1 para conexión explícita
             port: SERVER_PORT,
             path: '/health',
             method: 'GET',
             timeout: 5000
           }, (res) => {
            if (res.statusCode === 200) {
              console.log('✅ Servidor conectado en el segundo intento');
              if (mainWindow) {
                mainWindow.webContents.send('server-ready', { port: SERVER_PORT, url: SERVER_URL });
              }
            }
          });
          
          retryReq.on('error', (retryError) => {
            console.error('❌ Error en el segundo intento:', retryError.message);
            dialog.showErrorBox('Error del Servidor', 'No se pudo conectar al servidor después de múltiples intentos. Por favor, reinicia la aplicación.');
          });
          
          retryReq.end();
        }, 3000);
      });
      
      req.on('timeout', () => {
        console.error('❌ Timeout al verificar servidor');
        req.destroy();
        dialog.showErrorBox('Error del Servidor', 'Timeout al verificar el servidor. El servidor puede no estar funcionando correctamente.');
      });
      
      req.end();
      
    }, 5000); // Esperar 5 segundos para que el servidor se inicialice
    
    // Guardar referencia al proceso para poder cerrarlo más tarde
    global.serverProcess = serverProcess;
    
  } catch (error) {
    console.error('❌ Error general al iniciar el servidor:', error);
    dialog.showErrorBox('Error del Servidor', 'Error general al iniciar el servidor: ' + error.message);
  }
}

// Eventos de la aplicación
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Cerrar el proceso del servidor si existe
  if (global.serverProcess) {
    console.log('🔄 Cerrando proceso del servidor...');
    global.serverProcess.kill('SIGTERM');
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Eventos IPC para comunicación con el renderer
ipcMain.handle('get-server-url', () => {
  return SERVER_URL;
});

ipcMain.handle('select-file', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('save-file', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-message', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
  return true;
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  if (mainWindow) {
    dialog.showErrorBox('Error de la Aplicación', error.message);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});

// Manejar el cierre de la aplicación
app.on('before-quit', () => {
  if (global.serverProcess) {
    console.log('🔄 Cerrando proceso del servidor antes de salir...');
    global.serverProcess.kill('SIGTERM');
  }
});

// Manejar señales del sistema
process.on('SIGINT', () => {
  if (global.serverProcess) {
    console.log('🔄 Cerrando proceso del servidor por SIGINT...');
    global.serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (global.serverProcess) {
    console.log('🔄 Cerrando proceso del servidor por SIGTERM...');
    global.serverProcess.kill('SIGTERM');
  }
  process.exit(0);
});
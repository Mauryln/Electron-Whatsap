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
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

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
    startServer();
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
    // Importar y iniciar el servidor
    const server = require('./server/index');
    
    // El servidor ya se inicia automáticamente en server/index.js
    console.log('Servidor iniciado en puerto:', SERVER_PORT);
    
    // Notificar al renderer que el servidor está listo
    if (mainWindow) {
      mainWindow.webContents.send('server-ready', { port: SERVER_PORT, url: SERVER_URL });
    }
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    dialog.showErrorBox('Error del Servidor', 'No se pudo iniciar el servidor interno.');
  }
}

// Eventos de la aplicación
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
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

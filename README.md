# WhatsApp Bimcat - Aplicación Electron

Esta es la versión migrada de la extensión de Chrome WhatsApp Bimcat a una aplicación Electron independiente.

## Características

- ✅ **Aplicación de escritorio independiente** - No requiere Chrome
- ✅ **Servidor integrado** - Todo funciona localmente
- ✅ **Interfaz mejorada** - Ventana completa con menús nativos
- ✅ **Almacenamiento persistente** - Configuración guardada localmente
- ✅ **Múltiples plataformas** - Windows, macOS y Linux

## Instalación

### Requisitos previos

- Node.js 18.0.0 o superior
- npm o yarn

### Pasos de instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone <url-del-repositorio>
   cd whatsapp-bimcat-electron
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Construir la aplicación**
   ```bash
   # Para Windows
   npm run build:win
   
   # Para macOS
   npm run build:mac
   
   # Para Linux
   npm run build:linux
   ```

## Estructura del proyecto

```
whatsapp-bimcat-electron/
├── main.js                 # Proceso principal de Electron
├── preload.js              # Script de precarga seguro
├── package.json            # Configuración del proyecto
├── renderer/               # Interfaz de usuario
│   ├── index.html          # Página principal
│   ├── config.js           # Configuración adaptada
│   ├── electron-init.js    # Inicialización de Electron
│   ├── *.js                # Scripts de la aplicación
│   └── *.css               # Estilos
├── server/                 # Servidor Node.js integrado
│   ├── index.js            # Servidor principal
│   ├── config.js           # Configuración del servidor
│   └── utils/              # Utilidades del servidor
└── assets/                 # Recursos (iconos, etc.)
```

## Uso

### Iniciar la aplicación

1. **Modo desarrollo**: `npm run dev`
2. **Modo producción**: `npm start`

### Funcionalidades principales

1. **Conexión a WhatsApp**
   - La aplicación inicia automáticamente el servidor interno
   - Escanea el código QR para conectar WhatsApp Web
   - Las sesiones se guardan automáticamente

2. **Extracción de números**
   - Extraer números de grupos de WhatsApp
   - Cargar números desde archivos Excel
   - Agregar números manualmente

3. **Envío de mensajes**
   - Componer mensajes con editor rico
   - Enviar mensajes masivos con intervalos
   - Adjuntar archivos multimedia

4. **Reportes**
   - Generar reportes de mensajes enviados
   - Exportar datos a Excel

### Menús de la aplicación

- **Archivo**: Nueva sesión, abrir WhatsApp Web, salir
- **Editar**: Cortar, copiar, pegar, seleccionar todo
- **Ver**: Recargar, herramientas de desarrollo, zoom
- **Herramientas**: Configuración, estado del servidor
- **Ayuda**: Acerca de la aplicación

## Configuración

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
NODE_ENV=development
PORT=3000
```

### Configuración del servidor

Editar `server/config.js` para personalizar:

- Puerto del servidor
- Límites de archivos
- Configuración de seguridad
- Logging

## Desarrollo

### Estructura de archivos principales

#### `main.js`
- Maneja la ventana principal de Electron
- Inicia el servidor integrado
- Configura menús y eventos del sistema

#### `preload.js`
- Expone APIs seguras al renderer process
- Maneja comunicación entre procesos
- Proporciona acceso a funcionalidades del sistema

#### `renderer/electron-init.js`
- Inicializa la aplicación en el renderer
- Maneja la comunicación con el servidor
- Configura eventos específicos de Electron

### Agregar nuevas funcionalidades

1. **Nuevas APIs de Electron**
   - Agregar en `preload.js`
   - Implementar en `main.js`
   - Usar en `renderer/`

2. **Nuevas rutas del servidor**
   - Agregar en `server/index.js`
   - Documentar en README

3. **Nuevas características de UI**
   - Modificar archivos en `renderer/`
   - Actualizar estilos en `renderer/*.css`

## Solución de problemas

### El servidor no inicia

1. Verificar que el puerto 3000 esté libre
2. Revisar logs en la consola de Electron
3. Verificar dependencias: `npm install`

### Error de conexión

1. Verificar que WhatsApp Web esté abierto
2. Revisar la conexión a internet
3. Reiniciar la aplicación

### Problemas de archivos

1. Verificar permisos de escritura
2. Comprobar que las carpetas existan
3. Revisar configuración de rutas

## Construcción para distribución

### Windows
```bash
npm run build:win
```
Genera un instalador `.exe` en `dist/`

### macOS
```bash
npm run build:mac
```
Genera un archivo `.dmg` en `dist/`

### Linux
```bash
npm run build:linux
```
Genera un archivo `.AppImage` en `dist/`

## Migración desde la extensión de Chrome

### Cambios principales

1. **Arquitectura**: De extensión a aplicación de escritorio
2. **Servidor**: Integrado en lugar de externo
3. **Almacenamiento**: Local en lugar de Chrome Storage
4. **Interfaz**: Ventana completa en lugar de popup

### Archivos migrados

- `popup.html` → `renderer/index.html`
- `background.js` → Funcionalidad integrada en `main.js`
- `content.js` → Mantenido para extracción de datos
- `server/` → Integrado en la aplicación

### Configuración adaptada

- `manifest.json` → `package.json` y configuración de Electron
- `config.js` → Adaptado para Electron
- APIs de Chrome → APIs de Electron

## Licencia

ISC License - Ver archivo LICENSE para más detalles.

## Soporte

Para reportar bugs o solicitar características:

1. Crear un issue en el repositorio
2. Incluir información del sistema operativo
3. Adjuntar logs de error si es posible

## Changelog

### v3.0.0
- Migración completa a Electron
- Servidor integrado
- Interfaz mejorada
- Soporte multiplataforma
- Almacenamiento persistente

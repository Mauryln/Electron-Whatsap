# Guía de Solución de Problemas - WhatsApp Bimcat Electron

## Problemas Comunes y Soluciones

### 1. Error al conectar al servidor

**Síntomas:**
- La aplicación se abre pero muestra "Error de conexión"
- No se puede iniciar sesión de WhatsApp
- El indicador de estado muestra "Error de conexión"

**Soluciones:**

#### A. Verificar que el puerto 3000 esté libre
```bash
# En Windows (PowerShell)
netstat -ano | findstr :3000

# En macOS/Linux
lsof -i :3000
```

Si el puerto está en uso, cierra la aplicación que lo esté usando o cambia el puerto.

#### B. Ejecutar el script de prueba del servidor
```bash
npm run test-server
```

#### C. Verificar logs de la aplicación
1. Abre las herramientas de desarrollo (Ctrl+Shift+I)
2. Ve a la pestaña Console
3. Busca mensajes de error relacionados con el servidor

#### D. Reiniciar la aplicación
1. Cierra completamente la aplicación
2. Espera 5 segundos
3. Vuelve a abrir la aplicación

### 2. El servidor no inicia

**Síntomas:**
- Error "No se pudo iniciar el servidor interno"
- La aplicación se cierra inmediatamente

**Soluciones:**

#### A. Verificar dependencias
```bash
npm install
```

#### B. Verificar Node.js
```bash
node --version
# Debe ser 18.0.0 o superior
```

#### C. Verificar permisos
- Asegúrate de tener permisos de escritura en la carpeta del proyecto
- En Windows, ejecuta como administrador si es necesario

### 3. Error al escanear código QR

**Síntomas:**
- El código QR no aparece
- Error al generar QR
- WhatsApp Web no se conecta

**Soluciones:**

#### A. Verificar conexión a internet
- Asegúrate de tener conexión a internet estable
- Verifica que puedas acceder a web.whatsapp.com

#### B. Limpiar caché de sesión
1. Cierra la aplicación
2. Elimina la carpeta `.wwebjs_auth` si existe
3. Reinicia la aplicación

#### C. Verificar WhatsApp Web
- Abre web.whatsapp.com en tu navegador
- Asegúrate de que funcione correctamente

### 4. Problemas de rendimiento

**Síntomas:**
- La aplicación es lenta
- Alto uso de memoria
- Crashes frecuentes

**Soluciones:**

#### A. Optimizar configuración
- Cierra otras aplicaciones que usen mucha memoria
- Reinicia la aplicación periódicamente

#### B. Verificar configuración de Puppeteer
- El servidor está configurado para usar poca memoria
- Si tienes problemas, puedes ajustar la configuración en `server/config.js`

### 5. Problemas de archivos

**Síntomas:**
- No se pueden cargar archivos Excel
- Error al guardar reportes
- Problemas con adjuntos

**Soluciones:**

#### A. Verificar permisos de archivos
- Asegúrate de tener permisos de lectura/escritura
- Verifica que las carpetas `uploads/` y `dist/` existan

#### B. Verificar formato de archivos
- Los archivos Excel deben ser .xlsx o .xls
- Tamaño máximo: 10MB

### 6. Problemas de construcción

**Síntomas:**
- Error al construir la aplicación
- El instalador no se genera

**Soluciones:**

#### A. Verificar electron-builder
```bash
npm install electron-builder --save-dev
```

#### B. Limpiar caché
```bash
npm run postinstall
```

#### C. Verificar iconos
- Asegúrate de que los archivos de iconos existan en `assets/`
- Formatos: .ico (Windows), .icns (macOS), .png (Linux)

## Comandos de Diagnóstico

### Verificar estado del servidor
```bash
npm run test-server
```

### Verificar dependencias
```bash
npm audit
npm outdated
```

### Limpiar instalación
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Verificar logs
```bash
# En Windows
type logs\app.log

# En macOS/Linux
cat logs/app.log
```

## Configuración Avanzada

### Cambiar puerto del servidor
1. Edita `server/config.js`
2. Cambia `port: process.env.PORT || 3000`
3. O crea un archivo `.env` con `PORT=3001`

### Ajustar límites de memoria
1. Edita `server/config.js`
2. Modifica los argumentos de Puppeteer
3. Ajusta `max_old_space_size` según tu RAM

### Configurar logging
1. Edita `server/config.js`
2. Cambia `LOG_LEVEL` a 'debug' para más información
3. Verifica `LOG_FILE` para la ubicación de logs

## Contacto y Soporte

Si los problemas persisten:

1. **Recopila información:**
   - Versión de Node.js
   - Sistema operativo
   - Logs de error
   - Pasos para reproducir el problema

2. **Verifica la documentación:**
   - README.md
   - Archivos de configuración
   - Logs de la aplicación

3. **Reporta el problema:**
   - Incluye toda la información recopilada
   - Describe los pasos exactos
   - Adjunta capturas de pantalla si es necesario

## Logs Útiles

### Ubicación de logs
- **Aplicación:** Consola de herramientas de desarrollo
- **Servidor:** `logs/app.log` (si está configurado)
- **Electron:** Consola del sistema

### Niveles de logging
- `error`: Solo errores críticos
- `warn`: Advertencias y errores
- `info`: Información general (por defecto)
- `debug`: Información detallada para desarrollo

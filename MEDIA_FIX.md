# Corrección de Problema con Archivos de Media - WhatsApp Bimcat

## Problema Identificado

**Error**: `ENOENT: no such file or directory, open 'D:\Proyectos\Bimcat\local\uploads\media-1755200492800-743923618.jpg'`

**Causa**: La configuración de multer estaba usando rutas relativas incorrectas. El servidor buscaba archivos en el directorio de trabajo actual en lugar del directorio del servidor, causando que los archivos se guardaran en una ubicación diferente a donde se intentaban leer.

## Soluciones Implementadas

### 1. Corrección de Rutas de Archivos
- Cambiada configuración de multer para usar rutas absolutas relativas al directorio del servidor
- Uso de `path.join(__dirname, 'uploads')` para asegurar rutas correctas
- Creación automática del directorio de uploads si no existe
- Logging de la ruta de uploads para verificación

### 2. Verificación de Existencia de Archivos
- Agregada verificación `fs.existsSync()` antes de intentar leer archivos
- Mejorado logging para rastrear el estado de los archivos
- Agregada información de tamaño y ruta en los logs

### 3. Función Helper para Limpieza de Archivos
- Creada función `cleanupMediaFile()` para centralizar la limpieza
- Manejo robusto de errores en la eliminación de archivos
- Logging detallado para cada operación de limpieza

### 4. Mejorado Manejo de Errores
- Eliminación de archivos solo cuando es seguro hacerlo
- Verificación de existencia antes de eliminar
- Logging contextual para cada punto de limpieza

### 5. Logging Mejorado
- Información detallada sobre archivos de media al inicio del proceso
- Logging de tamaño de archivo y ruta
- Contexto específico para cada operación de limpieza

## Cambios en el Código

### server/index.js

#### Configuración Corregida de Multer
```javascript
const uploadPath = path.join(__dirname, 'uploads');
// Crear el directorio si no existe
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    logger.info('Upload directory created', { path: uploadPath });
} else {
    logger.info('Upload directory exists', { path: uploadPath });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
```

#### Nueva Función Helper
```javascript
function cleanupMediaFile(mediaFile, context = '') {
    if (mediaFile) {
        try {
            if (fs.existsSync(mediaFile.path)) {
                fs.unlinkSync(mediaFile.path);
                logger.info('Media file cleaned up', { context, filename: mediaFile.originalname });
            }
        } catch (cleanupError) {
            logger.error('Error deleting media file', { context, error: cleanupError.message, path: mediaFile.path });
        }
    }
}
```

#### Verificación Mejorada de Archivos
```javascript
if (mediaFile) {
    try {
        // Verificar que el archivo existe antes de procesarlo
        if (!fs.existsSync(mediaFile.path)) {
            logger.error('Media file not found', { userId, path: mediaFile.path });
            throw new Error(`Archivo no encontrado: ${mediaFile.originalname}`);
        }

        const fileContent = fs.readFileSync(mediaFile.path);
        media = new MessageMedia(
            mediaFile.mimetype,
            fileContent.toString('base64'),
            mediaFile.originalname
        );
        logger.info('Media file processed', { userId, filename: mediaFile.originalname, size: fileContent.length });
    } catch (mediaError) {
        logger.error('Error processing media file', { userId, error: mediaError.message, path: mediaFile.path });
        media = null;
    }
}
```

#### Logging Mejorado
```javascript
logger.info('Starting message send process', { 
    userId, 
    hasMedia: !!mediaFile, 
    mediaPath: mediaFile?.path,
    mediaSize: mediaFile?.size,
    messageLength: message?.length || 0
});
```

## Puntos de Limpieza Mejorados

1. **Validación de userId**: `cleanupMediaFile(mediaFile, 'userId validation')`
2. **Validación de sesión**: `cleanupMediaFile(mediaFile, 'session validation')`
3. **Validación de lock**: `cleanupMediaFile(mediaFile, 'lock validation')`
4. **Validación de JSON**: `cleanupMediaFile(mediaFile, 'JSON validation')`
5. **Validación de mensaje**: `cleanupMediaFile(mediaFile, 'message validation')`
6. **Validación de números**: `cleanupMediaFile(mediaFile, 'numbers validation')`
7. **Completado exitoso**: `cleanupMediaFile(mediaFile, 'success completion')`
8. **Manejo de errores**: `cleanupMediaFile(mediaFile, 'error handling')`

## Beneficios

1. **Robustez**: Verificación de existencia antes de operaciones de archivo
2. **Trazabilidad**: Logging detallado para diagnóstico de problemas
3. **Mantenibilidad**: Código centralizado para limpieza de archivos
4. **Seguridad**: Eliminación de archivos solo cuando es seguro
5. **Debugging**: Información contextual para cada operación

## Resultado Esperado

- ✅ Corrección de rutas de archivos para usar directorio del servidor
- ✅ Eliminación del error `ENOENT` al procesar archivos de media
- ✅ Mejor manejo de archivos temporales
- ✅ Logging detallado para diagnóstico
- ✅ Proceso de envío de mensajes con archivos más robusto
- ✅ Limpieza automática y segura de archivos temporales
- ✅ Creación automática del directorio de uploads si no existe

## Notas Importantes

1. **Rutas de archivos**: Ahora se usan rutas absolutas relativas al directorio del servidor
2. **Directorio de uploads**: Se crea automáticamente si no existe
3. **Verificación de archivos**: Los archivos se verifican antes de cualquier operación
4. **Limpieza segura**: La limpieza se realiza de forma segura con manejo de errores
5. **Logging detallado**: Se mantiene logging detallado para monitoreo
6. **Robustez**: El proceso es más robusto ante fallos de archivo

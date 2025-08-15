#!/usr/bin/env node

// Script para iniciar el servidor de manera robusta
const path = require('path');
const fs = require('fs');

// Determinar la ruta del servidor usando rutas relativas
let serverPath;

// Si estamos en un entorno empaquetado, usar rutas relativas al directorio de la aplicación
if (process.env.NODE_ENV === 'production' || process.resourcesPath) {
  // En producción, buscar en el directorio de recursos de la aplicación
  const appPath = process.resourcesPath || __dirname;
  const possiblePaths = [
    path.join(appPath, 'app.asar.unpacked', 'server', 'index.js'),
    path.join(appPath, 'app', 'server', 'index.js'),
    path.join(__dirname, 'server', 'index.js')
  ];
  
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      serverPath = possiblePath;
      break;
    }
  }
} else {
  // En desarrollo, usar ruta relativa normal
  serverPath = path.join(__dirname, 'server', 'index.js');
}

// Verificar que el archivo del servidor existe
if (!fs.existsSync(serverPath)) {
  console.error('❌ No se pudo encontrar el archivo del servidor en:', serverPath);
  console.error('📁 Directorio actual:', __dirname);
  console.error('📁 Recursos:', process.resourcesPath);
  process.exit(1);
}

console.log('🚀 Iniciando servidor desde:', serverPath);

// Cargar y ejecutar el servidor
try {
  require(serverPath);
  console.log('✅ Servidor iniciado correctamente');
} catch (error) {
  console.error('❌ Error al iniciar el servidor:', error.message);
  process.exit(1);
}

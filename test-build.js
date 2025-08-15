const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando pruebas de construcción...');

// Función para verificar archivo
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description}: ${filePath} - NO ENCONTRADO`);
    return false;
  }
}

// Función para verificar directorio
function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    const files = fs.readdirSync(dirPath);
    console.log(`✅ ${description}: ${dirPath} (${files.length} archivos)`);
    return true;
  } else {
    console.log(`❌ ${description}: ${dirPath} - NO ENCONTRADO`);
    return false;
  }
}

// Verificar archivos críticos del proyecto
console.log('\n📋 Verificando archivos críticos del proyecto...');
const projectFiles = [
  { path: 'package.json', desc: 'Package.json' },
  { path: 'main.js', desc: 'Archivo principal de Electron' },
  { path: 'server-inline.js', desc: 'Servidor inline' },
  { path: 'node-finder.js', desc: 'Buscador de Node.js' },
  { path: 'electron-builder-config.js', desc: 'Configuración de electron-builder' }
];

let projectFilesOk = true;
for (const file of projectFiles) {
  if (!checkFile(file.path, file.desc)) {
    projectFilesOk = false;
  }
}

// Verificar dependencias
console.log('\n📦 Verificando dependencias...');
const dependencies = [
  { path: 'node_modules/electron', desc: 'Electron' },
  { path: 'node_modules/electron-builder', desc: 'Electron Builder' },
  { path: 'node_modules/express', desc: 'Express' },
  { path: 'node_modules/whatsapp-web.js', desc: 'WhatsApp Web.js' }
];

let dependenciesOk = true;
for (const dep of dependencies) {
  if (!checkDirectory(dep.path, dep.desc)) {
    dependenciesOk = false;
  }
}

// Verificar estructura de directorios
console.log('\n📁 Verificando estructura de directorios...');
const directories = [
  { path: 'renderer', desc: 'Directorio renderer' },
  { path: 'server', desc: 'Directorio server' },
  { path: 'assets', desc: 'Directorio assets' }
];

let directoriesOk = true;
for (const dir of directories) {
  if (!checkDirectory(dir.path, dir.desc)) {
    directoriesOk = false;
  }
}

// Verificar si dist existe
console.log('\n📦 Verificando directorio de distribución...');
let distExists = false;
if (fs.existsSync('dist')) {
  distExists = true;
  checkDirectory('dist', 'Directorio dist');
  
  // Verificar archivos en dist
  const distFiles = fs.readdirSync('dist');
  console.log('📋 Archivos en dist:');
  distFiles.forEach(file => {
    const filePath = path.join('dist', file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      checkDirectory(filePath, `  - ${file} (directorio)`);
    } else {
      checkFile(filePath, `  - ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
    }
  });
} else {
  console.log('⚠️  Directorio dist no existe - ejecuta la construcción primero');
}

// Resumen
console.log('\n📊 RESUMEN DE VERIFICACIÓN:');
console.log(`📋 Archivos del proyecto: ${projectFilesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
console.log(`📦 Dependencias: ${dependenciesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
console.log(`📁 Estructura de directorios: ${directoriesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
console.log(`📦 Distribución: ${distExists ? '✅ EXISTE' : '⚠️  NO EXISTE'}`);

if (!projectFilesOk || !dependenciesOk || !directoriesOk) {
  console.log('\n❌ PROBLEMAS DETECTADOS:');
  console.log('Ejecuta estos comandos para solucionarlos:');
  console.log('1. npm install');
  console.log('2. npm run build:improved');
  process.exit(1);
} else {
  console.log('\n✅ TODAS LAS VERIFICACIONES PASARON');
  console.log('La aplicación está lista para construir.');
  
  if (!distExists) {
    console.log('\n🚀 Para construir la aplicación, ejecuta:');
    console.log('npm run build:improved');
  }
}

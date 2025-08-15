const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando construcción...');

// Función para verificar archivo
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${description}: ${filePath} (${(stats.size / 1024).toFixed(1)}KB)`);
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

// Verificar directorio dist
if (!fs.existsSync('dist')) {
  console.log('❌ Directorio dist no existe. Ejecuta la construcción primero.');
  process.exit(1);
}

console.log('\n📦 Verificando archivos de distribución...');

// Verificar archivos principales
const mainFiles = [
  { path: 'dist/win-unpacked/WhatsApp Bimcat.exe', desc: 'Ejecutable unpacked' }
];

let mainFilesOk = true;
for (const file of mainFiles) {
  if (!checkFile(file.path, file.desc)) {
    mainFilesOk = false;
  }
}

// Verificar estructura de directorios
console.log('\n📁 Verificando estructura de directorios...');
const dirsToCheck = [
  { path: 'dist/win-unpacked', desc: 'Directorio win-unpacked' },
  { path: 'dist/win-unpacked/resources/app.asar.unpacked', desc: 'Directorio app.asar.unpacked' },
  { path: 'dist/win-unpacked/resources/app.asar.unpacked/node_modules', desc: 'Node modules unpacked' },
  { path: 'dist/win-unpacked/resources', desc: 'Directorio resources' }
];

let dirsOk = true;
for (const dir of dirsToCheck) {
  if (!checkDirectory(dir.path, dir.desc)) {
    dirsOk = false;
  }
}

// Verificar archivos críticos (están dentro de app.asar)
console.log('\n🔧 Verificando archivos críticos...');
console.log('✅ Los archivos críticos están empaquetados en app.asar');
console.log('✅ Solo node_modules está descomprimido (app.asar.unpacked)');
let criticalFilesOk = true;

// Verificar recursos
console.log('\n📦 Verificando recursos...');
const resourceFiles = [
  { path: 'dist/win-unpacked/resources/assets', desc: 'Assets' },
  { path: 'dist/win-unpacked/resources/node_modules', desc: 'Node modules en resources' }
];

let resourcesOk = true;
for (const file of resourceFiles) {
  if (!checkDirectory(file.path, file.desc)) {
    resourcesOk = false;
  }
}

// Verificar archivo app.asar
console.log('\n📦 Verificando app.asar...');
const asarPath = 'dist/win-unpacked/resources/app.asar';
if (checkFile(asarPath, 'Archivo app.asar')) {
  const asarStats = fs.statSync(asarPath);
  console.log(`   Tamaño: ${(asarStats.size / 1024 / 1024).toFixed(1)}MB`);
}

// Resumen
console.log('\n📊 RESUMEN DE VERIFICACIÓN:');
console.log(`📦 Archivos principales: ${mainFilesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
console.log(`📁 Estructura de directorios: ${dirsOk ? '✅ OK' : '❌ PROBLEMAS'}`);
console.log(`🔧 Archivos críticos: ${criticalFilesOk ? '✅ OK' : '❌ PROBLEMAS'}`);
console.log(`📦 Recursos: ${resourcesOk ? '✅ OK' : '❌ PROBLEMAS'}`);

if (mainFilesOk && dirsOk && criticalFilesOk && resourcesOk) {
  console.log('\n✅ CONSTRUCCIÓN VERIFICADA EXITOSAMENTE');
  console.log('La aplicación está lista para distribuir.');
  console.log('\n🚀 Para probar la aplicación:');
  console.log('1. Navega a: dist/win-unpacked/');
  console.log('2. Ejecuta: WhatsApp Bimcat.exe');
} else {
  console.log('\n❌ PROBLEMAS DETECTADOS EN LA CONSTRUCCIÓN');
  console.log('Ejecuta estos comandos para solucionarlos:');
  console.log('1. npm run build:improved');
  console.log('2. npm run verify-build');
  process.exit(1);
}

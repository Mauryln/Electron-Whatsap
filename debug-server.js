const path = require('path');

console.log('🔍 Iniciando depuración del servidor...\n');

// 1. Verificar que el archivo del servidor existe
const serverPath = path.join(__dirname, 'server', 'index.js');
console.log('1. Verificando archivo del servidor...');
console.log('   Ruta:', serverPath);

try {
  const fs = require('fs');
  if (fs.existsSync(serverPath)) {
    console.log('   ✅ Archivo del servidor encontrado');
  } else {
    console.log('   ❌ Archivo del servidor NO encontrado');
    process.exit(1);
  }
} catch (error) {
  console.log('   ❌ Error al verificar archivo:', error.message);
  process.exit(1);
}

// 2. Verificar configuración
console.log('\n2. Verificando configuración...');
try {
  const config = require('./server/config');
  console.log('   ✅ Configuración cargada correctamente');
  console.log('   Puerto:', config.port);
  console.log('   IP:', config.ipAddress);
  console.log('   Entorno:', config.nodeEnv);
} catch (error) {
  console.log('   ❌ Error al cargar configuración:', error.message);
  process.exit(1);
}

// 3. Verificar dependencias del servidor
console.log('\n3. Verificando dependencias...');
const requiredModules = [
  'express',
  'cors',
  'helmet',
  'compression',
  'multer',
  'whatsapp-web.js',
  'winston'
];

for (const module of requiredModules) {
  try {
    require(module);
    console.log(`   ✅ ${module} disponible`);
  } catch (error) {
    console.log(`   ❌ ${module} NO disponible:`, error.message);
  }
}

// 4. Intentar iniciar el servidor
console.log('\n4. Intentando iniciar el servidor...');
try {
  console.log('   Importando servidor...');
  const server = require('./server/index');
  console.log('   ✅ Servidor importado correctamente');
  
  // Esperar un momento para que el servidor se inicialice
  setTimeout(() => {
    console.log('\n5. Verificando que el servidor esté funcionando...');
    
    const http = require('http');
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET',
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('   ✅ Servidor está funcionando correctamente');
          console.log('   Status:', response.status);
          console.log('   Uptime:', response.uptime, 'segundos');
          console.log('   Memoria:', response.memory);
          console.log('\n🎉 ¡El servidor está funcionando perfectamente!');
        } catch (error) {
          console.log('   ⚠️  Servidor responde pero con formato inesperado');
          console.log('   Respuesta:', data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('   ❌ Error al conectar al servidor:', error.message);
      console.log('\n🔧 Posibles soluciones:');
      console.log('   1. Verificar que no haya otro proceso usando el puerto 3000');
      console.log('   2. Revisar los logs del servidor para errores específicos');
      console.log('   3. Verificar que todas las dependencias estén instaladas');
    });
    
    req.on('timeout', () => {
      console.log('   ❌ Timeout al conectar al servidor');
      req.destroy();
    });
    
    req.end();
    
  }, 5000);
  
} catch (error) {
  console.log('   ❌ Error al importar el servidor:', error.message);
  console.log('   Stack trace:', error.stack);
  
  console.log('\n🔧 Posibles soluciones:');
  console.log('   1. Verificar que todas las dependencias estén instaladas: npm install');
  console.log('   2. Verificar que Node.js sea versión 18 o superior');
  console.log('   3. Revisar que no haya errores de sintaxis en server/index.js');
  console.log('   4. Verificar permisos de archivos');
}

// 5. Verificar puerto
console.log('\n6. Verificando disponibilidad del puerto...');
const net = require('net');
const testServer = net.createServer();

testServer.listen(3000, () => {
  testServer.close();
  console.log('   ✅ Puerto 3000 está disponible');
});

testServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('   ❌ Puerto 3000 ya está en uso');
    console.log('   🔧 Solución: Cierra otras aplicaciones que usen el puerto 3000');
  } else {
    console.log('   ❌ Error al verificar puerto:', err.message);
  }
});

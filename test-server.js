const http = require('http');

// Función para probar la conexión al servidor
function testServerConnection() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Servidor responde correctamente:');
          console.log('Status:', response.status);
          console.log('Uptime:', response.uptime, 'segundos');
          console.log('Memoria:', response.memory);
          console.log('Sesiones:', response.sessions);
          resolve(response);
        } catch (error) {
          console.log('❌ Error al parsear respuesta:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Error de conexión:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.log('❌ Timeout - El servidor no responde');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Función para verificar si el puerto está en uso
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close();
      console.log(`✅ Puerto ${port} está disponible`);
      resolve(true);
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Puerto ${port} ya está en uso`);
        resolve(false);
      } else {
        console.log(`❌ Error al verificar puerto ${port}:`, err.message);
        resolve(false);
      }
    });
  });
}

// Función principal de prueba
async function runTests() {
  console.log('🔍 Iniciando pruebas del servidor...\n');
  
  // Verificar puerto
  console.log('1. Verificando disponibilidad del puerto 3000...');
  const portAvailable = await checkPort(3000);
  
  if (!portAvailable) {
    console.log('\n❌ El puerto 3000 está en uso. Por favor:');
    console.log('   - Cierra otras aplicaciones que puedan estar usando este puerto');
    console.log('   - O cambia el puerto en la configuración');
    return;
  }
  
  console.log('\n2. Probando conexión al servidor...');
  try {
    await testServerConnection();
    console.log('\n✅ Todas las pruebas pasaron correctamente');
  } catch (error) {
    console.log('\n❌ Error en las pruebas:', error.message);
    console.log('\nPosibles soluciones:');
    console.log('1. Asegúrate de que el servidor esté ejecutándose');
    console.log('2. Verifica que no haya errores en los logs del servidor');
    console.log('3. Revisa la configuración del servidor');
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testServerConnection, checkPort, runTests };

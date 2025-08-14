const http = require('http');

console.log('🔍 Probando conexión al servidor...\n');

function testConnection(hostname, port, description) {
  return new Promise((resolve, reject) => {
    console.log(`📡 Probando ${description}...`);
    
    const req = http.request({
      hostname: hostname,
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ ${description} - CONECTADO`);
          console.log(`   Status: ${response.status}`);
          console.log(`   Uptime: ${response.uptime} segundos`);
          resolve(response);
        } catch (error) {
          console.log(`⚠️  ${description} - Respuesta inesperada:`, data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${description} - Error: ${error.message}`);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.log(`⏰ ${description} - Timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

async function runTests() {
  const tests = [
    { hostname: '127.0.0.1', port: 3000, description: 'IPv4 (127.0.0.1)' },
    { hostname: 'localhost', port: 3000, description: 'localhost' },
    { hostname: '::1', port: 3000, description: 'IPv6 (::1)' }
  ];
  
  for (const test of tests) {
    try {
      await testConnection(test.hostname, test.port, test.description);
      console.log(''); // Línea en blanco
    } catch (error) {
      console.log(''); // Línea en blanco
    }
  }
  
  console.log('🎯 Resumen:');
  console.log('- Usa 127.0.0.1 para conexiones IPv4');
  console.log('- Usa localhost para conexiones automáticas');
  console.log('- Evita ::1 si hay problemas de IPv6');
}

runTests().catch(console.error);

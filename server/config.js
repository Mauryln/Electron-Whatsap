require('dotenv').config();

const config = {
    // Configuración del servidor
    port: process.env.PORT || 3000,
    ipAddress: process.env.NODE_ENV === 'production' ? '0.0.0.0' : (process.env.IP_ADDRESS || '127.0.0.1'),
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Límites de rate limiting
    //rateLimit: {
    //    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    //    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    //},
    
    // Configuración de sesiones
    sessions: {
        maxSessions: parseInt(process.env.MAX_SESSIONS) || 50,
        cleanupIntervalMinutes: parseInt(process.env.CLEANUP_INTERVAL_MINUTES) || 15, // 15 minutos
        timeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 60, // 1 hora
    },
    
    // Configuración de Puppeteer diferenciada por entorno
    puppeteer: {
        headless: true,
        args: process.env.NODE_ENV === 'production' ? [
            // Configuración optimizada para producción (2GB RAM)
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-features=VizDisplayCompositor',
            '--single-process',
            '--no-zygote',
            '--renderer-process-limit=1',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-default-apps',
            '--disable-domain-reliability',
            '--disable-extensions',
            '--disable-hang-monitor',
            '--disable-ipc-flooding-protection',
            '--disable-notifications',
            '--disable-offer-store-unmasked-wallet-cards',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-renderer-backgrounding',
            '--disable-sync',
            '--force-color-profile=srgb',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-crash-upload',
            '--no-pings',
            '--password-store=basic',
            '--use-gl=swiftshader',
            '--use-mock-keychain',
            '--disable-software-rasterizer',
            '--memory-pressure-off',
            '--max_old_space_size=1024',
            '--js-flags=--max-old-space-size=1024'
        ] : [
            // Configuración básica para desarrollo
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-crash-upload',
            '--disable-default-apps',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection'
        ],
    },
    
    // Configuración de logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.NODE_ENV === 'production' ? 'json' : 'simple',
    },
    
    // Configuración de archivos
    uploads: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mp3', 'application/pdf'],
    },
    
    // Configuración de mensajes
    messages: {
        defaultDelay: 8000,
        maxConcurrentSends: 1000,
        retryAttempts: 3,
    }
};

module.exports = config; 
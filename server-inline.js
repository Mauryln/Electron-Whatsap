const express = require('express');
const { MessageMedia } = require('whatsapp-web.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

// Importar módulos locales desde la carpeta del servidor
const config = require('./server/config');
const logger = require('./server/utils/logger');
const sessionManager = require('./server/utils/sessionManager');

let server = null;

function startServer(port = 3000) {
    if (server) {
        return server;
    }

    const app = express();
    const ipAddress = '127.0.0.1';

    app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
    app.use(compression());
    app.use(cors({ origin: true, credentials: true }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    const uploadPath = path.join(__dirname, 'server', 'uploads');
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadPath),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
    const upload = multer({ storage: storage });

    // --- ALL ENDPOINTS ---

    app.get('/health', (req, res) => res.json({ success: true, status: 'healthy' }));

    app.post('/start-session', express.json(), async (req, res) => {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });
        try {
            const result = await sessionManager.createSession(userId);
            res.json(result);
        } catch (e) { res.status(500).json({ success: false, error: e.message }) }
    });

    app.get('/session-status/:userId', (req, res) => {
        const { userId } = req.params;
        const status = sessionManager.getSessionStatus(userId);
        res.json({ success: true, status: status || 'no_session' });
    });

    app.get('/get-qr/:userId', (req, res) => {
        const { userId } = req.params;
        const qr = sessionManager.getQRCode(userId);
        const status = sessionManager.getSessionStatus(userId);
        if (status === 'ready') return res.json({ success: true, qrCode: null, status: 'ready' });
        if (qr && status === 'needs_scan') return res.json({ success: true, qrCode: qr, status: 'needs_scan' });
        res.status(404).json({ success: false, error: 'QR not available' });
    });

    app.post('/close-session', express.json(), async (req, res) => {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });
        try {
            await sessionManager.destroySession(userId);
            res.json({ success: true, message: 'Session closed' });
        } catch (e) { res.status(500).json({ success: false, error: e.message }) }
    });

    app.get('/labels/:userId/all-chats', async (req, res) => {
        const { userId } = req.params;
        const client = sessionManager.getSession(userId);
        if (!client || sessionManager.getSessionStatus(userId) !== 'ready') return res.status(400).json({ success: false, error: 'Session not ready' });
        try {
            const labels = await client.getLabels();
            if (!labels.length) return res.json({ success: true, labels: [] });
            const result = [];
            for (const label of labels) {
                const chats = await client.getChatsByLabelId(label.id);
                result.push({ id: label.id, name: label.name, numbers: chats.map(c => c.id.user) });
            }
            res.json({ success: true, labels: result });
        } catch (e) { res.status(500).json({ success: false, error: e.message }) }
    });

    app.get('/groups/:userId', async (req, res) => {
        const { userId } = req.params;
        const client = sessionManager.getSession(userId);
        if (!client || sessionManager.getSessionStatus(userId) !== 'ready') return res.status(400).json({ success: false, error: 'Session not ready' });
        try {
            const chats = await client.getChats();
            const groups = chats.filter(c => c.isGroup).map(c => ({ id: c.id._serialized, name: c.name }));
            res.json({ success: true, groups });
        } catch (e) { res.status(500).json({ success: false, error: e.message }) }
    });

    app.get('/groups/:userId/:groupId/participants', async (req, res) => {
        const { userId, groupId } = req.params;
        const client = sessionManager.getSession(userId);
        if (!client || sessionManager.getSessionStatus(userId) !== 'ready') return res.status(400).json({ success: false, error: 'Session not ready' });
        try {
            const groupChat = await client.getChatById(groupId);
            if (!groupChat || !groupChat.isGroup) return res.status(404).json({ success: false, error: 'Group not found' });
            const numbers = groupChat.participants.map(p => p.id.user);
            res.json({ success: true, numbers });
        } catch (e) { res.status(500).json({ success: false, error: e.message }) }
    });

    app.post('/send-messages', upload.single('media'), async (req, res) => {
        const { userId, message, delay, numbers: numbersJson } = req.body;
        const mediaFile = req.file;
        if (!userId) {
            if (mediaFile) fs.unlinkSync(mediaFile.path);
            return res.status(400).json({ success: false, error: 'Missing userId' });
        }
        const client = sessionManager.getSession(userId);
        if (!client || sessionManager.getSessionStatus(userId) !== 'ready') {
            if (mediaFile) fs.unlinkSync(mediaFile.path);
            return res.status(400).json({ success: false, error: 'WhatsApp session not ready.' });
        }
        try {
            const numbers = JSON.parse(numbersJson || '[]');
            if (numbers.length === 0) {
                if (mediaFile) fs.unlinkSync(mediaFile.path);
                return res.status(400).json({ success: false, error: 'No numbers provided.' });
            }
            let media = null;
            if (mediaFile) {
                const fileContent = fs.readFileSync(mediaFile.path);
                media = new MessageMedia(
                    mediaFile.mimetype,
                    fileContent.toString('base64'),
                    mediaFile.originalname
                );
            }
            for (let i = 0; i < numbers.length; i++) {
                const number = numbers[i];
                const chatId = `${number}@c.us`;
                await client.sendMessage(chatId, media || message);
                if (i < numbers.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, parseInt(delay, 10) || 1000));
                }
            }
            if (mediaFile) fs.unlinkSync(mediaFile.path);
            res.json({ success: true, message: 'Messages sent successfully.' });
        } catch (e) {
            if (mediaFile) fs.unlinkSync(mediaFile.path);
            res.status(500).json({ success: false, error: e.message });
        }
    });

    // Start server
    server = app.listen(port, ipAddress, () => {
        console.log(`✅ Servidor inline completo iniciado en http://${ipAddress}:${port}`);
    });

    return server;
}

function stopServer() {
    if (server) {
        server.close(() => {
            console.log('🛑 Servidor inline detenido');
            server = null;
        });
    }
}

module.exports = {
    startServer,
    stopServer
};
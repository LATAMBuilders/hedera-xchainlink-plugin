const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const HederaService = require('./hederaService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar servicio de Hedera
const hederaService = new HederaService();
let isHederaReady = false;

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de health check para Render
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    hedera: isHederaReady,
    topicId: hederaService.getTopicId() 
  });
});

// WebSocket para el chat
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Enviar el topic ID al cliente
  socket.emit('topicId', hederaService.getTopicId());

  // Recibir mensaje del cliente
  socket.on('chatMessage', async (data) => {
    try {
      const { username, message } = data;
      console.log(`💬 ${username}: ${message}`);

      // Enviar mensaje a Hedera
      await hederaService.sendMessage(username, message);

      // El mensaje se reenviará a todos los clientes cuando se reciba del topic
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', 'Error al enviar mensaje');
    }
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Initializing Hedera Chat Server...');
    
    // Inicializar Hedera
    await hederaService.initialize();
    isHederaReady = true;

    // Suscribirse a mensajes del topic
    hederaService.subscribeToMessages((messageData) => {
      console.log('📨 Received from Hedera:', messageData);
      // Emitir mensaje a todos los clientes conectados
      io.emit('newMessage', messageData);
    });

    // Iniciar servidor Express
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Open http://localhost:${PORT} in your browser`);
      console.log(`📝 Topic ID: ${hederaService.getTopicId()}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

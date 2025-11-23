const express = require('express');
const cors = require('cors');
const path = require('path');
const HederaService = require('./hederaService');
const AIAgent = require('./aiAgent');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar servicios
const hederaService = new HederaService();
const aiAgent = new AIAgent();
let isHederaReady = false;
let isAIReady = false;

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de health check para Render
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    hedera: isHederaReady,
    ai: isAIReady,
    topicId: hederaService.getTopicId() 
  });
});

// API endpoint para enviar mensajes y obtener respuesta del AI
app.post('/api/chat', async (req, res) => {
  try {
    const { username, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`💬 ${username || 'Usuario'}: ${message}`);

    // Guardar mensaje del usuario en Hedera
    await hederaService.sendMessage(username || 'Usuario', message);

    if (!isAIReady) {
      return res.json({
        userMessage: { username: username || 'Usuario', message, timestamp: new Date().toISOString() },
        aiResponse: { 
          username: 'AI Agent 🤖', 
          message: '⚠️ AI Agent no está disponible. Verifica tu GROQ_API_KEY.', 
          timestamp: new Date().toISOString() 
        }
      });
    }

    // Procesar con AI Agent
    console.log(`🤖 Processing with AI Agent...`);
    const aiResponse = await aiAgent.processMessage(message);
    
    // Guardar respuesta del AI en Hedera
    await hederaService.sendMessage('AI Agent 🤖', aiResponse);

    res.json({
      userMessage: { username: username || 'Usuario', message, timestamp: new Date().toISOString() },
      aiResponse: { username: 'AI Agent 🤖', message: aiResponse, timestamp: new Date().toISOString() }
    });

  } catch (error) {
    console.error('❌ Error in chat endpoint:', error);
    
    // Enviar error como respuesta del AI
    const errorMessage = error.message || 'Error procesando tu mensaje';
    
    res.json({
      userMessage: { username: username || 'Usuario', message: req.body.message, timestamp: new Date().toISOString() },
      aiResponse: { 
        username: 'AI Agent 🤖', 
        message: `❌ ${errorMessage}`, 
        timestamp: new Date().toISOString() 
      }
    });
  }
});

// API endpoint para obtener historial de mensajes del topic
app.get('/api/messages', async (req, res) => {
  try {
    res.json({
      topicId: hederaService.getTopicId(),
      message: 'Para ver el historial completo, consulta el topic en Hedera Mirror Node'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log('🚀 Initializing Hedera Chat Server...');
    
    // Inicializar Hedera
    await hederaService.initialize();
    isHederaReady = true;

    // Inicializar AI Agent (opcional - no falla si no hay Groq key)
    try {
      if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
        await aiAgent.initialize();
        isAIReady = true;
        console.log('✅ AI Agent is ready');
      } else {
        console.log('⚠️  Groq API key not configured. AI features disabled.');
      }
    } catch (aiError) {
      console.error('⚠️  AI Agent initialization failed:', aiError.message);
      console.log('💬 Chat will work without AI features');
    }

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Open http://localhost:${PORT} in your browser`);
      console.log(`📝 Topic ID: ${hederaService.getTopicId()}`);
      console.log(`🤖 AI Agent: ${isAIReady ? 'Enabled' : 'Disabled'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

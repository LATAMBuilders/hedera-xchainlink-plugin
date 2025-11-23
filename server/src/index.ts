import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { HederaService } from './services/HederaService';
import { AIAgent } from './services/AIAgent';
import {
  ChatResponse,
  ChatRequest,
  HealthCheckResponse,
  MessagesResponse,
  ErrorResponse,
} from './types';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Inicializar servicios
const hederaService: HederaService = new HederaService();
const aiAgent: AIAgent = new AIAgent();
let isHederaReady: boolean = false;
let isAIReady: boolean = false;

// Ruta principal
app.get('/', (req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Ruta de health check
app.get('/health', (req: Request, res: Response): void => {
  const healthResponse: HealthCheckResponse = {
    status: 'ok',
    hedera: isHederaReady,
    ai: isAIReady,
    topicId: hederaService.getTopicId(),
    timestamp: new Date().toISOString(),
  };
  res.json(healthResponse);
});

// API endpoint para chat
app.post('/api/chat', async (req: Request<{}, {}, ChatRequest>, res: Response<ChatResponse>): Promise<void> => {
  try {
    const { username, message }: ChatRequest = req.body;

    if (!message) {
      res.status(400).json({
        userMessage: {
          username: username || 'Usuario',
          message: '',
          timestamp: new Date().toISOString(),
        },
        aiResponse: {
          username: 'AI Agent 🤖',
          message: '❌ Message is required',
          timestamp: new Date().toISOString(),
        },
      } as ChatResponse);
      return;
    }

    console.log(`💬 ${username || 'Usuario'}: ${message}`);

    // Guardar mensaje del usuario en Hedera
    await hederaService.sendMessage(username || 'Usuario', message);

    if (!isAIReady) {
      const response: ChatResponse = {
        userMessage: {
          username: username || 'Usuario',
          message,
          timestamp: new Date().toISOString(),
        },
        aiResponse: {
          username: 'AI Agent 🤖',
          message: '⚠️ AI Agent no está disponible. Verifica tu GROQ_API_KEY.',
          timestamp: new Date().toISOString(),
        },
      };
      res.json(response);
      return;
    }

    // Procesar con AI Agent
    console.log(`🤖 Processing with AI Agent...`);
    const aiResponse: string = await aiAgent.processMessage(message);

    // Guardar respuesta del AI en Hedera
    await hederaService.sendMessage('AI Agent 🤖', aiResponse);

    const response: ChatResponse = {
      userMessage: {
        username: username || 'Usuario',
        message,
        timestamp: new Date().toISOString(),
      },
      aiResponse: {
        username: 'AI Agent 🤖',
        message: aiResponse,
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error: unknown) {
    console.error('❌ Error in chat endpoint:', error);

    const errorMessage: string = error instanceof Error ? error.message : 'Error procesando tu mensaje';

    const response: ChatResponse = {
      userMessage: {
        username: req.body.username || 'Usuario',
        message: req.body.message || '',
        timestamp: new Date().toISOString(),
      },
      aiResponse: {
        username: 'AI Agent 🤖',
        message: `❌ ${errorMessage}`,
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  }
});

// API endpoint para obtener historial
app.get('/api/messages', async (req: Request, res: Response<MessagesResponse | ErrorResponse>): Promise<void> => {
  try {
    const response: MessagesResponse = {
      topicId: hederaService.getTopicId(),
      message: 'Para ver el historial completo, consulta el topic en Hedera Mirror Node',
    };
    res.json(response);
  } catch (error: unknown) {
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Middleware de manejo de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message,
  } as ErrorResponse);
});

// Iniciar servidor
const PORT: number = parseInt(process.env.PORT || '3000', 10);

async function startServer(): Promise<void> {
  try {
    console.log('🚀 Initializing Hedera Chat Server...');

    // Inicializar Hedera
    await hederaService.initialize();
    isHederaReady = true;

    // Inicializar AI Agent (opcional)
    try {
      if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
        await aiAgent.initialize();
        isAIReady = true;
        console.log('✅ AI Agent is ready');
      } else {
        console.log('⚠️  Groq API key not configured. AI features disabled.');
      }
    } catch (aiError: unknown) {
      const errorMessage: string = aiError instanceof Error ? aiError.message : 'Unknown error';
      console.error('⚠️  AI Agent initialization failed:', errorMessage);
      console.log('💬 Chat will work without AI features');
    }

    // Iniciar servidor Express
    app.listen(PORT, (): void => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Open http://localhost:${PORT} in your browser`);
      console.log(`📝 Topic ID: ${hederaService.getTopicId()}`);
      console.log(`🤖 AI Agent: ${isAIReady ? 'Enabled' : 'Disabled'}`);
    });
  } catch (error: unknown) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

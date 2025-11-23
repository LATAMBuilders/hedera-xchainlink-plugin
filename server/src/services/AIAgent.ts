import {
  AgentMode,
  HederaLangchainToolkit,
  coreAccountPlugin,
  coreConsensusPlugin,
  coreTokenPlugin,
  coreQueriesPlugin,
} from 'hedera-agent-kit';
import { chainlinkPlugin } from '../plugins/chainlink-plugin';
import { ChatGroq } from '@langchain/groq';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { Client, PrivateKey } from '@hashgraph/sdk';
import { StructuredTool } from '@langchain/core/tools';
import { config } from 'dotenv';
import { IAIAgent, AgentResponse, ToolUsageStep } from '../types';

config();

export class AIAgent implements IAIAgent {
  public agentExecutor: AgentExecutor | null = null;
  public isInitialized: boolean = false;
  private accountId: string;

  constructor() {
    if (!process.env.ACCOUNT_ID) {
      throw new Error('ACCOUNT_ID must be set in .env file');
    }
    this.accountId = process.env.ACCOUNT_ID;
  }

  async initialize(): Promise<boolean> {
    try {
      if (!process.env.GROQ_API_KEY || !process.env.PRIVATE_KEY) {
        throw new Error('GROQ_API_KEY and PRIVATE_KEY must be set in .env file');
      }

      // Inicializar Groq LLM con configuración optimizada para conversación y velocidad
      const llm = new ChatGroq({
        model: 'llama-3.3-70b-versatile',
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0.7, // Balanceado entre creatividad y precisión
        maxTokens: 2048, // Optimizado para respuestas rápidas
        topP: 0.9, // Diversidad en las respuestas
      });

      // Hedera client setup
      const client: Client = Client.forTestnet().setOperator(
        this.accountId,
        PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY)
      );

      // Preparar Hedera toolkit con plugins completos + Chainlink
      const hederaAgentToolkit = new HederaLangchainToolkit({
        client,
        configuration: {
          plugins: [
            coreAccountPlugin,
            coreConsensusPlugin,
            coreTokenPlugin,
            coreQueriesPlugin,
            chainlinkPlugin, // 🔗 Plugin de Chainlink integrado
          ],
          context: {
            mode: AgentMode.AUTONOMOUS,
          },
        },
      });

      // Prompt para el agente
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `Eres un asistente experto y amigable en Hedera blockchain. Tu nombre es Hedera Assistant.

Tu wallet es: ${this.accountId}

PERSONALIDAD:
- Habla de forma natural y conversacional
- Sé amigable y servicial
- Responde de manera clara y concisa
- Usa emojis ocasionalmente para ser más amigable
- Responde en español

CAPACIDADES:
Puedes ayudar con estas operaciones en Hedera:

💰 Consultas:
- Ver saldo de HBAR
- Consultar información de cuentas
- Ver balances de tokens

💸 Transacciones:
- Transferir HBAR a otras cuentas
- Crear nuevas cuentas
- Crear tokens fungibles

📝 Consensus Service (HCS):
- Crear topics para mensajería
- Enviar mensajes a topics

📊 Precios de Chainlink (Oráculos en Tiempo Real):
- Consultar precio de BTC, ETH, HBAR, LINK, USDC, USDT, DAI
- Ver todos los precios disponibles
- Información actualizada desde contratos Chainlink en Hedera

EJEMPLOS DE COMANDOS QUE PUEDES USAR:

🔍 Consultas de Blockchain:
- "cuál es mi saldo"
- "mi balance de HBAR"
- "información de la cuenta 0.0.7307100"
- "balance de tokens"

💸 Transacciones:
- "transfiere 5 HBAR a 0.0.1234"
- "envía 10 HBAR a la cuenta 0.0.5678"
- "crea una nueva cuenta"
- "crea un token llamado MiToken con símbolo MTK"

📝 Mensajería:
- "crea un topic"
- "envía el mensaje 'Hola mundo'"
- "publica un mensaje en el topic"

📊 Precios de Chainlink:
- "precio de bitcoin" o "cuánto vale BTC"
- "precio de ethereum" o "cotización de ETH"
- "precio de HBAR"
- "cuánto vale LINK"
- "precio del DAI"
- "todos los precios" o "lista de precios"
- "precios disponibles"

❓ Ayuda:
- "ayuda" o "qué puedes hacer"
- "comandos disponibles"

INSTRUCCIONES IMPORTANTES:
- Cuando pregunten "qué necesitas para X", explica claramente los parámetros requeridos
- Para transferencias: necesitas la cuenta destino y el monto en HBAR
- Para crear tokens: necesitas nombre, símbolo y supply inicial
- Para crear topics: opcionalmente un memo descriptivo
- SIEMPRE usa las herramientas disponibles, no inventes datos
- Si no tienes toda la información, pregúntale al usuario

EJEMPLOS DE RESPUESTAS:
Usuario: "qué necesitas para hacer una transacción?"
Tú: "Para hacer una transferencia de HBAR necesito dos cosas:
1. 📍 La cuenta de destino (ejemplo: 0.0.1234)
2. 💵 El monto a transferir en HBAR (ejemplo: 10 HBAR)

¿A qué cuenta te gustaría enviar y cuánto?"

Usuario: "transfiere 5 HBAR a 0.0.1234"
Tú: [usas TRANSFER_HBAR_TOOL y reportas el resultado]`,
        ],
        ['human', '{input}'],
        ['placeholder', '{agent_scratchpad}'],
      ]);

      // Obtener herramientas
      const tools: StructuredTool[] = hederaAgentToolkit.getTools();

      // Crear agente
      const agent = await createToolCallingAgent({
        llm,
        tools,
        prompt,
      });

      // Ejecutor del agente (optimizado para velocidad)
      this.agentExecutor = new AgentExecutor({
        agent,
        tools,
        returnIntermediateSteps: true,
        maxIterations: 2, // Optimizado para respuestas rápidas
        verbose: false, // Desactivado para mejor performance
      });

      this.isInitialized = true;
      console.log('🤖 AI Agent initialized with Hedera tools (Groq - Llama 3.3 70B)');
      console.log(`📋 Available tools: ${tools.map((t) => t.name).join(', ')}`);
      console.log(`👤 User Account ID: ${this.accountId}`);

      return true;
    } catch (error) {
      console.error('❌ Error initializing AI Agent:', error);
      throw error;
    }
  }

  async processMessage(userMessage: string): Promise<string> {
    if (!this.isInitialized || !this.agentExecutor) {
      throw new Error('AI Agent not initialized');
    }

    try {

      console.log(`\n🤔 Processing: "${userMessage}"`);

      const response = (await this.agentExecutor.invoke({
        input: userMessage,
      })) as AgentResponse;

      // Log simplificado (no bloquea la respuesta)
      if (response.intermediateSteps && response.intermediateSteps.length > 0) {
        const toolsUsed = response.intermediateSteps.map((s: ToolUsageStep) => s.action.tool).join(', ');
        console.log(`✅ Response ready (tools: ${toolsUsed})`);
      }

      return response?.output || String(response);
    } catch (error: unknown) {
      console.error('❌ Error processing message:', error);

      // Manejo específico de errores comunes
      if (error instanceof Error) {
        if (error.message?.includes('rate_limit') || error.message?.includes('429')) {
          throw new Error('⚠️ Rate limit alcanzado. Por favor espera un momento e intenta de nuevo.');
        } else if (error.message?.includes('insufficient_quota')) {
          throw new Error('⚠️ Sin créditos. Verifica tu cuenta.');
        } else if (error.message?.includes('invalid_api_key')) {
          throw new Error('⚠️ API Key inválida. Verifica tu configuración.');
        }
      }

      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

import {
  AgentMode,
  HederaLangchainToolkit,
  coreAccountPlugin,
  coreConsensusPlugin,
  coreTokenPlugin,
  coreQueriesPlugin,
} from 'hedera-agent-kit';
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

      // Inicializar Groq LLM con configuración optimizada para conversación
      const llm = new ChatGroq({
        model: 'llama-3.3-70b-versatile',
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0.8, // Más creativo y natural
        maxTokens: 4096, // Mayor espacio para respuestas detalladas
        topP: 0.9, // Diversidad en las respuestas
      });

      // Hedera client setup
      const client: Client = Client.forTestnet().setOperator(
        this.accountId,
        PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY)
      );

      // Preparar Hedera toolkit con plugins completos
      const hederaAgentToolkit = new HederaLangchainToolkit({
        client,
        configuration: {
          plugins: [
            coreAccountPlugin,
            coreConsensusPlugin,
            coreTokenPlugin,
            coreQueriesPlugin,
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

      // Ejecutor del agente
      this.agentExecutor = new AgentExecutor({
        agent,
        tools,
        returnIntermediateSteps: true,
        maxIterations: 3, // Reducir para evitar loops
        verbose: true,
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

      // Log intermediate steps para debugging
      if (response.intermediateSteps && response.intermediateSteps.length > 0) {
        console.log('🔧 Tools used:');
        response.intermediateSteps.forEach((step: ToolUsageStep, i: number) => {
          console.log(`  ${i + 1}. ${step.action.tool}: ${JSON.stringify(step.action.toolInput)}`);
          console.log(`     Result: ${JSON.stringify(step.observation).substring(0, 200)}...`);
        });
      } else {
        console.log('⚠️ No tools were used - Agent may be hallucinating!');
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

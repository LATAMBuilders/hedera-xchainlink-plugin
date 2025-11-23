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
import { chainlinkService } from './ChainlinkService';

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
      // Interceptar consultas de precios de Chainlink
      const priceResponse = await this.handlePriceQuery(userMessage);
      if (priceResponse) {
        return priceResponse;
      }

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

  private async handlePriceQuery(message: string): Promise<string | null> {
    const lowerMsg = message.toLowerCase();
    
    // Detectar palabras clave de consultas de precios (ampliado)
    const priceKeywords = [
      'precio', 'cotiza', 'vale', 'cuesta', 'cuánto', 'cuanto',
      'dame', 'dime', 'consulta', 'muestra', 'ver', 'busca',
      'cotización', 'valor', 'cost', 'price'
    ];
    const isPriceQuery = priceKeywords.some(keyword => lowerMsg.includes(keyword));
    
    if (!isPriceQuery) {
      return null;
    }

    try {
      // Mapeo mejorado de palabras clave a pares
      const cryptoMap: Record<string, 'BTC/USD' | 'ETH/USD' | 'HBAR/USD' | 'LINK/USD' | 'USDC/USD' | 'USDT/USD' | 'DAI/USD'> = {
        // Bitcoin
        'btc': 'BTC/USD',
        'bitcoin': 'BTC/USD',
        'bit': 'BTC/USD',
        
        // Ethereum
        'eth': 'ETH/USD',
        'ethereum': 'ETH/USD',
        'ether': 'ETH/USD',
        
        // Hedera
        'hbar': 'HBAR/USD',
        'hedera': 'HBAR/USD',
        
        // Chainlink
        'link': 'LINK/USD',
        'chainlink': 'LINK/USD',
        
        // Stablecoins
        'usdc': 'USDC/USD',
        'usd coin': 'USDC/USD',
        'usdt': 'USDT/USD',
        'tether': 'USDT/USD',
        'dai': 'DAI/USD'
      };

      // Buscar coincidencia en el mensaje
      for (const [keyword, pair] of Object.entries(cryptoMap)) {
        if (lowerMsg.includes(keyword)) {
          const price = await chainlinkService.getPriceFeed(pair);
          
          // Iconos personalizados
          const icons: Record<string, string> = {
            'BTC/USD': '₿',
            'ETH/USD': 'Ξ',
            'HBAR/USD': 'ℏ',
            'LINK/USD': '🔗',
            'USDC/USD': '💵',
            'USDT/USD': '💵',
            'DAI/USD': '💵'
          };
          
          const icon = icons[pair];
          const cryptoName = pair.split('/')[0];
          
          let additionalInfo = '';
          if (['USDC/USD', 'USDT/USD', 'DAI/USD'].includes(pair)) {
            additionalInfo = '\n💡 Stablecoin vinculado al dólar';
          } else {
            additionalInfo = `\n\n💡 Prueba también: "todos los precios", "precio de ${cryptoName === 'BTC' ? 'ETH' : 'BTC'}"`;
          }
          
          return `${icon} **${pair.replace('/', ' / ')}**\n💵 Precio actual: **$${price.formattedPrice}**\n🕐 Actualizado: ${new Date(price.updatedAt).toLocaleString('es-ES')}\n📍 Fuente: Chainlink Oracle en Hedera Testnet${additionalInfo}`;
        }
      }

      // Todos los precios
      if (lowerMsg.includes('todos') || lowerMsg.includes('lista') || lowerMsg.includes('disponible')) {
        const prices = await chainlinkService.getAllPrices();
        let response = '📊 **Precios en Tiempo Real (Chainlink - Hedera Testnet)**\n\n';
        
        prices.forEach((price: any) => {
          const icon = price.pair.includes('BTC') ? '₿' :
                      price.pair.includes('ETH') ? 'Ξ' :
                      price.pair.includes('HBAR') ? 'ℏ' :
                      price.pair.includes('LINK') ? '🔗' : '💵';
          response += `${icon} **${price.pair}**: $${price.formattedPrice}\n`;
        });
        
        response += `\n🕐 Actualizado: ${new Date().toLocaleString('es-ES')}`;
        response += `\n\n💡 Tip: Visita http://localhost:3000/prices para la interfaz completa`;
        return response;
      }

      // Si menciona precio pero no especifica cuál
      return '📊 Puedo consultar precios en tiempo real de:\n\n' +
             '₿ BTC (Bitcoin)\n' +
             'Ξ ETH (Ethereum)\n' +
             'ℏ HBAR (Hedera)\n' +
             '🔗 LINK (Chainlink)\n' +
             '💵 USDC, USDT, DAI (Stablecoins)\n\n' +
             '¿Cuál te interesa? También puedes decir "todos los precios" 😊';
      
    } catch (error) {
      console.error('❌ Error fetching Chainlink price:', error);
      return '❌ Error al consultar el precio desde Chainlink. Por favor intenta de nuevo.';
    }
  }
}

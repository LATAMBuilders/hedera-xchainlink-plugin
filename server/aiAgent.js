const {
  AgentMode,
  HederaLangchainToolkit,
  coreAccountPlugin,
  coreConsensusPlugin,
  coreTokenPlugin,
  coreQueriesPlugin,
} = require('hedera-agent-kit');
const { ChatGroq } = require('@langchain/groq');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { createToolCallingAgent, AgentExecutor } = require('langchain/agents');
const { Client, PrivateKey } = require('@hashgraph/sdk');
require('dotenv').config();

class AIAgent {
  constructor() {
    this.agentExecutor = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Inicializar Groq LLM
      const llm = new ChatGroq({
        model: 'llama-3.3-70b-versatile',
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0.7,
        maxTokens: 2048,
      });

      // Hedera client setup
      const client = Client.forTestnet().setOperator(
        process.env.ACCOUNT_ID,
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
          `Eres un asistente experto en Hedera blockchain.

CUENTA DEL USUARIO: ${process.env.ACCOUNT_ID}

INSTRUCCIONES CRÍTICAS:
- SIEMPRE usa las herramientas disponibles cuando el usuario solicite información o acciones
- NUNCA inventes datos, siempre consulta con las herramientas
- Para consultar el saldo, usa GET_HBAR_BALANCE_QUERY_TOOL con accountId: "${process.env.ACCOUNT_ID}"
- Responde en español de manera concisa y clara
- Después de usar una herramienta, reporta directamente el resultado sin repetir la llamada

Herramientas disponibles:
- GET_HBAR_BALANCE_QUERY_TOOL: Consulta el balance de HBAR
- GET_ACCOUNT_QUERY_TOOL: Información de cuenta
- TRANSFER_HBAR_TOOL: Transfiere HBAR
- CREATE_ACCOUNT_TOOL: Crea cuentas
- CREATE_FUNGIBLE_TOKEN_TOOL: Crea tokens
- CREATE_TOPIC_TOOL: Crea topics
- SUBMIT_TOPIC_MESSAGE_TOOL: Envía mensajes a topics`,
        ],
        ['human', '{input}'],
        ['placeholder', '{agent_scratchpad}'],
      ]);

      // Obtener herramientas
      const tools = hederaAgentToolkit.getTools();

      // Crear agente
      const agent = createToolCallingAgent({
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
      console.log(`📋 Available tools: ${tools.map(t => t.name).join(', ')}`);
      console.log(`👤 User Account ID: ${process.env.ACCOUNT_ID}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing AI Agent:', error);
      throw error;
    }
  }

  async processMessage(userMessage) {
    if (!this.isInitialized) {
      throw new Error('AI Agent not initialized');
    }

    try {
      console.log(`\n🤔 Processing: "${userMessage}"`);
      
      const response = await this.agentExecutor.invoke({ 
        input: userMessage 
      });
      
      // Log intermediate steps para debugging
      if (response.intermediateSteps && response.intermediateSteps.length > 0) {
        console.log('🔧 Tools used:');
        response.intermediateSteps.forEach((step, i) => {
          console.log(`  ${i + 1}. ${step.action.tool}: ${JSON.stringify(step.action.toolInput)}`);
          console.log(`     Result: ${JSON.stringify(step.observation).substring(0, 200)}...`);
        });
      } else {
        console.log('⚠️ No tools were used - Agent may be hallucinating!');
      }
      
      return response?.output || response;
    } catch (error) {
      console.error('❌ Error processing message:', error);
      
      // Manejo específico de errores comunes
      if (error.message?.includes('rate_limit') || error.message?.includes('429')) {
        throw new Error('⚠️ Rate limit alcanzado. Por favor espera un momento e intenta de nuevo.');
      } else if (error.message?.includes('insufficient_quota')) {
        throw new Error('⚠️ Sin créditos. Verifica tu cuenta.');
      } else if (error.message?.includes('invalid_api_key')) {
        throw new Error('⚠️ API Key inválida. Verifica tu configuración.');
      }
      
      throw error;
    }
  }

  isReady() {
    return this.isInitialized;
  }
}

module.exports = AIAgent;

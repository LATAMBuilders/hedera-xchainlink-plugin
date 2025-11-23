const {
  AgentMode,
  coreAccountPluginToolNames,
  coreAccountQueryPluginToolNames,
  coreConsensusPluginToolNames,
  coreConsensusQueryPluginToolNames,
  coreTokenPluginToolNames,
  coreTokenQueryPluginToolNames,
  HederaLangchainToolkit,
} = require('hedera-agent-kit');
const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { createToolCallingAgent, AgentExecutor } = require('langchain/agents');
const { BufferMemory } = require('langchain/memory');
const { Client, PrivateKey } = require('@hashgraph/sdk');
require('dotenv').config();

class AIAgent {
  constructor() {
    this.agentExecutor = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Inicializar OpenAI LLM
      const llm = new ChatOpenAI({
        model: 'gpt-4o-mini',
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Hedera client setup
      const client = Client.forTestnet().setOperator(
        process.env.ACCOUNT_ID,
        PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY)
      );

      // Herramientas disponibles
      const {
        TRANSFER_HBAR_TOOL,
        CREATE_ACCOUNT_TOOL,
        GET_HBAR_BALANCE_QUERY_TOOL,
        GET_ACCOUNT_QUERY_TOOL,
      } = coreAccountPluginToolNames;

      const { CREATE_TOPIC_TOOL, SUBMIT_TOPIC_MESSAGE_TOOL } = coreConsensusPluginToolNames;
      
      const { CREATE_FUNGIBLE_TOKEN_TOOL } = coreTokenPluginToolNames;

      // Preparar Hedera toolkit
      const hederaAgentToolkit = new HederaLangchainToolkit({
        client,
        configuration: {
          tools: [
            TRANSFER_HBAR_TOOL,
            CREATE_ACCOUNT_TOOL,
            GET_HBAR_BALANCE_QUERY_TOOL,
            GET_ACCOUNT_QUERY_TOOL,
            CREATE_TOPIC_TOOL,
            SUBMIT_TOPIC_MESSAGE_TOOL,
            CREATE_FUNGIBLE_TOKEN_TOOL,
          ],
          plugins: [],
          context: {
            mode: AgentMode.AUTONOMOUS,
          },
        },
      });

      // Prompt para el agente
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `Eres un asistente experto en Hedera blockchain. Puedes ayudar a los usuarios a:
- Consultar balances de HBAR
- Transferir HBAR entre cuentas
- Crear cuentas nuevas
- Crear tokens fungibles
- Crear topics de consenso
- Enviar mensajes a topics

Responde de manera concisa y amigable. Si no puedes hacer algo, explica por qué.
Cuando hagas transacciones, siempre confirma los resultados al usuario.`,
        ],
        ['placeholder', '{chat_history}'],
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

      // Memoria para conversación
      const memory = new BufferMemory({
        memoryKey: 'chat_history',
        inputKey: 'input',
        outputKey: 'output',
        returnMessages: true,
      });

      // Ejecutor del agente
      this.agentExecutor = new AgentExecutor({
        agent,
        tools,
        memory,
        returnIntermediateSteps: false,
        maxIterations: 5,
      });

      this.isInitialized = true;
      console.log('🤖 AI Agent initialized with Hedera tools');
      
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
      const response = await this.agentExecutor.invoke({ 
        input: userMessage 
      });
      
      return response?.output || response;
    } catch (error) {
      console.error('❌ Error processing message:', error);
      throw error;
    }
  }

  isReady() {
    return this.isInitialized;
  }
}

module.exports = AIAgent;

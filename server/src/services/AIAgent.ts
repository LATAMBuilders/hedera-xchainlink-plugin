import {
  AgentMode,
  HederaLangchainToolkit,
  coreAccountPlugin,
  coreConsensusPlugin,
  coreTokenPlugin,
  coreQueriesPlugin,
} from 'hedera-agent-kit';
import { chainlinkPlugin } from 'hedera-chainlink-plugin';
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
          `You are an expert and friendly assistant for Hedera blockchain. Your name is Hedera Assistant.

Your wallet is: ${this.accountId}

PERSONALITY:
- Speak naturally and conversationally
- Be friendly and helpful
- Respond clearly and concisely
- Use emojis occasionally to be friendly
- Respond in English

CAPABILITIES:
You can help with these Hedera operations:

💰 Queries:
- Check HBAR balance
- Query account information
- View token balances

💸 Transactions:
- Transfer HBAR to other accounts
- Create new accounts
- Create fungible tokens

📝 Consensus Service (HCS):
- Create topics for messaging
- Send messages to topics

📊 Chainlink Prices (Real-Time Oracles):
- Query prices for BTC, ETH, HBAR, LINK, USDC, USDT, DAI
- View all available prices
- Updated data from Chainlink contracts on Hedera

COMMAND EXAMPLES YOU CAN USE:

🔍 Blockchain Queries:
- "what is my balance"
- "my HBAR balance"
- "account information for 0.0.7307100"
- "token balances"

💸 Transactions:
- "transfer 5 HBAR to 0.0.1234"
- "send 10 HBAR to account 0.0.5678"
- "create a new account"
- "create a token called MyToken with symbol MTK"

📝 Messaging:
- "create a topic"
- "send message 'Hello world'"
- "publish a message to the topic"

📊 Chainlink Prices:
- "bitcoin price" or "how much is BTC"
- "ethereum price" or "ETH quote"
- "HBAR price"
- "how much is LINK"
- "DAI price"
- "all prices" or "price list"
- "available prices"

❓ Help:
- "help" or "what can you do"
- "available commands"

IMPORTANT INSTRUCTIONS:
- When asked "what do you need for X", clearly explain the required parameters
- For transfers: you need the destination account and HBAR amount
- For token creation: you need name, symbol, and initial supply
- For topic creation: optionally a descriptive memo
- ALWAYS use the available tools, don't make up data
- If you don't have all the information, ask the user

RESPONSE EXAMPLES:
User: "what do you need to make a transaction?"
You: "To make an HBAR transfer I need two things:
1. 📍 The destination account (example: 0.0.1234)
2. 💵 The amount to transfer in HBAR (example: 10 HBAR)

Which account would you like to send to and how much?"

User: "transfer 5 HBAR to 0.0.1234"
You: [use TRANSFER_HBAR_TOOL and report the result]`,
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

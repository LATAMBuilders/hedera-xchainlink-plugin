import { Client, AccountId, TopicId } from '@hashgraph/sdk';
import { AgentExecutor } from 'langchain/agents';
import { BaseMessage } from '@langchain/core/messages';
import { ChainValues } from '@langchain/core/utils/types';

// ==================== Hedera Types ====================

export interface HederaConfig {
  accountId: string;
  privateKey: string;
  network?: 'testnet' | 'mainnet' | 'previewnet';
}

export interface TopicMessage {
  sequenceNumber: number;
  contents: Uint8Array;
  consensusTimestamp: Date;
  runningHash: Uint8Array;
}

// ==================== AI Agent Types ====================

export interface AIAgentConfig {
  model?: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ToolUsageStep {
  action: {
    tool: string;
    toolInput: Record<string, any>;
  };
  observation: any;
}

export interface AgentResponse extends ChainValues {
  output: string;
  intermediateSteps?: ToolUsageStep[];
}

// ==================== Chat Types ====================

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

export interface ChatResponse {
  userMessage: ChatMessage;
  aiResponse: ChatMessage;
}

export interface ChatRequest {
  username?: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

// ==================== Service Interfaces ====================

export interface IHederaService {
  client: Client | null;
  topicId: string | null;
  initialize(): Promise<boolean>;
  createTopic(): Promise<string>;
  sendMessage(username: string, message: string): Promise<boolean>;
  subscribeToMessages(callback: (message: ChatMessage) => void): Promise<void>;
  getTopicId(): string | null;
}

export interface IAIAgent {
  agentExecutor: AgentExecutor | null;
  isInitialized: boolean;
  initialize(): Promise<boolean>;
  processMessage(userMessage: string): Promise<string>;
  isReady(): boolean;
}

// ==================== Server Types ====================

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  hedera: boolean;
  ai: boolean;
  topicId: string | null;
  timestamp?: string;
}

export interface MessagesResponse {
  topicId: string | null;
  message: string;
}

// ==================== Chainlink Types ====================

export interface PriceFeedData {
  pair: string;
  address: string;
  price: number;
  formattedPrice: string;
  decimals: number;
  roundId: string;
  updatedAt: string;
}

export interface PricesResponse {
  success: boolean;
  data?: PriceFeedData[];
  error?: string;
  timestamp: string;
}

// ==================== Utility Types ====================

export type NetworkType = 'testnet' | 'mainnet' | 'previewnet';

export type AgentStatus = 'initializing' | 'ready' | 'error' | 'processing';

// Re-export common types
export type { Client, AccountId, TopicId } from '@hashgraph/sdk';
export type { AgentExecutor } from 'langchain/agents';
export type { BaseMessage } from '@langchain/core/messages';

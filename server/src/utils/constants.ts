// Constantes del proyecto con tipos estrictos

export const DEFAULT_PORT = 3000 as const;

export const DEFAULT_NETWORK = 'testnet' as const;

export const AI_MODELS = {
  GROQ_LLAMA_70B: 'llama-3.3-70b-versatile',
  GROQ_LLAMA_8B: 'llama-3.1-8b-instant',
} as const;

export const DEFAULT_AI_CONFIG = {
  temperature: 0.7,
  maxTokens: 2048,
  maxIterations: 3,
} as const;

export const RETRY_CONFIG = {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 5000,
} as const;

export const TOPIC_PROPAGATION_DELAY = 3000 as const; // 3 seconds

export const MESSAGE_SUBSCRIPTION_WINDOW = 30 as const; // 30 seconds

export const ERROR_MESSAGES = {
  HEDERA_NOT_INITIALIZED: 'Hedera service not initialized',
  AI_NOT_INITIALIZED: 'AI Agent not initialized',
  CLIENT_NOT_INITIALIZED: 'Hedera client not initialized',
  TOPIC_NOT_CREATED: 'Failed to create topic: No topic ID in receipt',
  MISSING_ENV_VAR: (varName: string) => `${varName} must be set in .env file`,
  RATE_LIMIT: '⚠️ Rate limit alcanzado. Por favor espera un momento e intenta de nuevo.',
  INSUFFICIENT_QUOTA: '⚠️ Sin créditos. Verifica tu cuenta.',
  INVALID_API_KEY: '⚠️ API Key inválida. Verifica tu configuración.',
} as const;

export const SUCCESS_MESSAGES = {
  HEDERA_INITIALIZED: '✅ Hedera client initialized',
  AI_INITIALIZED: '✅ AI Agent is ready',
  TOPIC_CREATED: (topicId: string) => `✅ New topic created: ${topicId}`,
  TOPIC_USING_EXISTING: (topicId: string) => `📌 Using existing topic: ${topicId}`,
  SERVER_RUNNING: (port: number) => `✅ Server running on port ${port}`,
  MESSAGE_SENT: (topicId: string) => `📤 Message sent to topic ${topicId}`,
  SUBSCRIBED: (topicId: string) => `👂 Successfully subscribed to topic ${topicId}`,
} as const;

export const LOG_EMOJIS = {
  ROCKET: '🚀',
  CHECK: '✅',
  WARNING: '⚠️',
  ERROR: '❌',
  INFO: 'ℹ️',
  ROBOT: '🤖',
  MESSAGE: '💬',
  SEND: '📤',
  RECEIVE: '📥',
  THINKING: '🤔',
  TOOL: '🔧',
  EAR: '👂',
  HOURGLASS: '⏳',
  PIN: '📌',
  MEMO: '📝',
  GLOBE: '🌐',
} as const;

// Tipos derivados de las constantes
export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];
export type NetworkType = typeof DEFAULT_NETWORK;
export type LogEmoji = (typeof LOG_EMOJIS)[keyof typeof LOG_EMOJIS];

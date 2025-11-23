// Extensiones de tipos globales y utilidades

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Hedera
      ACCOUNT_ID: string;
      PRIVATE_KEY: string;
      TOPIC_ID?: string;

      // AI
      GROQ_API_KEY: string;

      // Server
      PORT?: string;
      NODE_ENV?: 'development' | 'production' | 'test';
    }
  }
}

export {};

// Definiciones de tipos para hedera-agent-kit
// Ya que no tiene tipos oficiales de TypeScript

declare module 'hedera-agent-kit' {
  import { Client } from '@hashgraph/sdk';
  import { StructuredTool } from '@langchain/core/tools';

  export enum AgentMode {
    AUTONOMOUS = 'AUTONOMOUS',
    RETURN_BYTE = 'RETURN_BYTE',
  }

  export interface HederaToolkitConfig {
    client: Client;
    configuration: {
      plugins?: any[];
      tools?: string[];
      context?: {
        mode?: AgentMode;
        [key: string]: any;
      };
    };
  }

  export class HederaLangchainToolkit {
    constructor(config: HederaToolkitConfig);
    getTools(): StructuredTool[];
  }

  // Core Plugins
  export const coreAccountPlugin: any;
  export const coreConsensusPlugin: any;
  export const coreTokenPlugin: any;
  export const coreQueriesPlugin: any;

  // Tool Names
  export const coreAccountPluginToolNames: {
    TRANSFER_HBAR_TOOL: string;
    CREATE_ACCOUNT_TOOL: string;
    GET_HBAR_BALANCE_QUERY_TOOL: string;
    GET_ACCOUNT_QUERY_TOOL: string;
  };

  export const coreConsensusPluginToolNames: {
    CREATE_TOPIC_TOOL: string;
    SUBMIT_TOPIC_MESSAGE_TOOL: string;
  };

  export const coreTokenPluginToolNames: {
    CREATE_FUNGIBLE_TOKEN_TOOL: string;
    CREATE_NON_FUNGIBLE_TOKEN_TOOL: string;
    AIRDROP_FUNGIBLE_TOKENS_TOOL: string;
  };

  export const coreQueriesPluginToolNames: {
    GET_ACCOUNT_QUERY_TOOL: string;
    GET_HBAR_BALANCE_QUERY_TOOL: string;
    GET_ACCOUNT_TOKEN_BALANCES_QUERY_TOOL: string;
    GET_TOPIC_MESSAGES_QUERY_TOOL: string;
  };
}

import { z } from "zod";
import { Client } from "@hashgraph/sdk";

// Context for plugin execution
export interface Context {
  mode?: "AUTONOMOUS" | "RETURN_BYTES";
  [key: string]: any;
}

// Tool interface that all plugin tools must implement
export interface Tool {
  method: string;
  name: string;
  description: string;
  parameters: z.ZodObject<any, any>;
  execute: (client: Client, context: Context, params: any) => Promise<any>;
}

// Plugin interface
export interface Plugin {
  name: string;
  version?: string;
  description?: string;
  tools: (context: Context) => Tool[];
}

// Chainlink Price Feed ABI
export const AGGREGATOR_V3_INTERFACE_ABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
    name: "getRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Available price feeds on Hedera Testnet
export const PRICE_FEEDS: Record<string, string> = {
  "BTC/USD": "0xf600dc7e996d555dc44ff7c21f329f4b21e29aa3",
  "ETH/USD": "0x9e7557be8c25d4a498c42cd92b870c46a3e23ba2",
  "HBAR/USD": "0xfad570b8b7d4e10ae7e75068c0043ba9e0e14fcc",
  "LINK/USD": "0xeb93a53c648e3e89bc0fc327d36a37619b1cf0cd",
  "USDC/USD": "0x0d0f7f9a8864e20f8147ba793b6f58a54e9f2c83",
  "USDT/USD": "0x4a1298f88a6cc06e61b2cd8a3f7a40f3d6168b47",
  "DAI/USD": "0xb7546c6ebfc0b6b4fe68909734d7e2c1c5a3ffdf",
};
